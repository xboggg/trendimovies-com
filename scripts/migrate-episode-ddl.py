#!/usr/bin/env python3
"""
Migrate Episode DDLs from Telegram SQLite to PostgREST download_links
=====================================================================
For every episode in the PostgreSQL episodes table, finds the best
720p + 1080p file from the Telegram SQLite and inserts into download_links.

File Selection Algorithm (per episode):
  1. Group files by (series_name, season, episode)
  2. Bucket by quality (720p / 1080p)
  3. Score by variant: BluRay=1000 > WEBRip=800 > WEB-DL=700 > HDTV=500
  4. Tiebreaker: SMALLEST file size wins (user requirement)
  5. Max 2 files per episode

Usage:
  python3 migrate-episode-ddl.py                        # dry-run (default)
  python3 migrate-episode-ddl.py --limit 100            # first 100 series only
  python3 migrate-episode-ddl.py --live                 # execute for real
  python3 migrate-episode-ddl.py --live --clear          # clear existing episode links first
  python3 migrate-episode-ddl.py --series "Breaking Bad" # single series debug

Author: Evans Agyemang (xboggg)
"""

import sqlite3
import sys
import os
import re
import time
import argparse
from collections import defaultdict

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    print("WARNING: requests not installed. Install with: pip install requests")

# ============================================================
# CONFIGURATION
# ============================================================

SQLITE_DB = os.environ.get("SQLITE_DB", "/opt/trendimovies/bot/database/movies.db")
POSTGREST_URL = os.environ.get("POSTGREST_URL", "http://localhost:3001")
TELEGRAM_STREAM_BASE = "https://trendimovies.com/tgstream"

# Variant priority (higher = better)
VARIANT_PRIORITY = {
    "bluray": 1000,
    "webrip": 800,
    "webdl": 700,
    "hdtv": 500,
    "hdrip": 400,
    "other": 100,
}

# Codec bonus
CODEC_PRIORITY = {
    "x265": 200, "hevc": 200, "h265": 200,
    "x264": 100, "h264": 100, "avc": 100,
}

# Release group bonus
RELEASE_GROUP_BONUS = {
    "psa": 30, "bone": 20, "rmteam": 15, "yts": 10, "rarbg": 10,
}

# Non-English language keywords
NON_ENGLISH_KEYWORDS = [
    "tamil", "hindi", "telugu", "kannada", "malayalam", "bengali",
    "korean", "japanese", "chinese", "mandarin", "cantonese",
    "arabic", "turkish", "thai", "vietnamese", "indonesian",
    "french", "spanish", "portuguese", "german", "italian",
    "russian", "polish", "dutch", "swedish", "danish", "norwegian",
    "finnish", "czech", "hungarian", "romanian", "greek",
    "persian", "farsi", "urdu", "punjabi", "marathi", "gujarati",
    "dual.audio", "multi.audio", "dubbed",
]


# ============================================================
# UTILITY FUNCTIONS (from migrate_telegram_to_supabase.py)
# ============================================================

def format_file_size(size_bytes: int) -> str:
    if not size_bytes or size_bytes <= 0:
        return ""
    size_mb = size_bytes / (1024 * 1024)
    if size_mb >= 1024:
        return f"{size_mb / 1024:.2f} GB"
    else:
        return f"{size_mb:.0f} MB"


def detect_variant(file_name: str) -> str:
    fn = file_name.lower()
    if "bluray" in fn or "blu-ray" in fn or "bdrip" in fn or "brrip" in fn:
        return "bluray"
    if "web-dl" in fn or "webdl" in fn or "web.dl" in fn or "web dl" in fn:
        return "webdl"
    if re.search(r'\b(amzn|amazn|amazon)\b', fn) or re.search(r'\bNF\b', file_name) or \
       re.search(r'\b(dsnp|dnsp|disney)\b', fn) or re.search(r'\b(hmax|hbo)\b', fn) or \
       re.search(r'\b(atvp|apple)\b', fn) or re.search(r'\b(pcok|peacock)\b', fn) or \
       re.search(r'\b(pmtp|paramount)\b', fn):
        return "webdl"
    if "webrip" in fn or "web-rip" in fn or "web.rip" in fn:
        return "webrip"
    if "hdtv" in fn:
        return "hdtv"
    if "hdrip" in fn or "web-hd" in fn or "webhd" in fn or "web.hd" in fn or "dvdrip" in fn:
        return "hdrip"
    return "other"


def detect_codec(file_name: str) -> str:
    fn = file_name.lower()
    for codec in ["x265", "hevc", "h.265", "h265"]:
        if codec in fn:
            return "x265"
    for codec in ["x264", "h.264", "h264", "avc"]:
        if codec in fn:
            return "x264"
    return ""


def detect_release_group(file_name: str) -> int:
    fn = file_name.lower()
    for group, bonus in RELEASE_GROUP_BONUS.items():
        if fn.endswith(group) or f"-{group}" in fn or f".{group}" in fn or f"[{group}]" in fn:
            return bonus
    return 0


def score_episode_file(file_name: str, file_size: int) -> float:
    """
    Score an episode file. Higher = better quality.
    DIFFERENCE from movie scoring: file size tiebreaker is INVERTED
    (smaller file wins, since episode quality is consistent).
    """
    variant = detect_variant(file_name)
    variant_score = VARIANT_PRIORITY.get(variant, VARIANT_PRIORITY["other"])

    codec = detect_codec(file_name)
    codec_score = CODEC_PRIORITY.get(codec, 0)

    group_score = detect_release_group(file_name)

    # INVERTED size tiebreaker: smaller files preferred (0 to -0.99)
    # Subtract a small fraction so that among same quality, smaller wins
    size_penalty = min(file_size / (5 * 1024 * 1024 * 1024), 0.99) if file_size else 0

    return variant_score + codec_score + group_score - size_penalty


def normalize_quality(quality_str: str, resolution_str: str, file_name: str = "") -> str:
    if resolution_str:
        res = resolution_str.strip().lower()
        if res in ("720p", "1080p", "2160p"):
            return res

    if quality_str:
        match = re.search(r'(\d{3,4}p)', quality_str.lower())
        if match:
            q = match.group(1)
            if q in ("720p", "1080p", "2160p"):
                return q

    if file_name:
        match = re.search(r'[.\-_ ](\d{3,4}p)[.\-_ ]', file_name.lower())
        if match:
            q = match.group(1)
            if q in ("720p", "1080p", "2160p"):
                return q

    return ""


def is_non_english(file_name: str) -> bool:
    fn = file_name.lower()
    for keyword in NON_ENGLISH_KEYWORDS:
        if keyword in fn:
            return True
        pattern = r'[.\-_\s\[\(]' + re.escape(keyword) + r'[.\-_\s\]\),]'
        if re.search(pattern, fn):
            return True
        if fn.startswith(keyword + ".") or fn.startswith(keyword + " "):
            return True
    return False


def parse_episode_info(file_name: str):
    """Parse series name, season number, episode number from filename."""
    match = re.search(r'[. _-]S(\d{1,2})E(\d{1,3})', file_name, re.IGNORECASE)
    if not match:
        return None, None, None

    season = int(match.group(1))
    episode = int(match.group(2))

    # Series name = everything before S##E##
    series_part = file_name[:match.start()]
    series_name = re.sub(r'[._-]', ' ', series_part).strip()
    series_name = re.sub(r'\b(19|20)\d{2}\b', '', series_name).strip()
    series_name = re.sub(r'\s+', ' ', series_name).strip()

    return series_name, season, episode


def normalize_series_name(name: str) -> str:
    """Normalize series name for matching."""
    if not name:
        return ""
    n = name.lower().strip()
    n = re.sub(r'[^a-z0-9\s]', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n


def postgrest_headers() -> dict:
    return {
        "Content-Profile": "public",
        "Accept-Profile": "public",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


# ============================================================
# DATABASE FUNCTIONS
# ============================================================

def fetch_episode_files(db_path: str) -> list[dict]:
    """Fetch all series episode files from SQLite."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            m.id as sqlite_id,
            m.file_name,
            m.file_size,
            m.quality,
            m.source as file_source,
            m.resolution,
            mm.tmdb_id,
            mm.title as meta_title
        FROM movies m
        LEFT JOIN movie_metadata mm ON m.id = mm.movie_id
        WHERE m.is_series = 1
          AND m.file_size >= 52428800
          AND m.file_name NOT LIKE '%.srt'
          AND m.file_name NOT LIKE '%.sub'
          AND m.file_name NOT LIKE '%.ass'
          AND m.file_name NOT LIKE '%.ssa'
          AND m.file_name NOT LIKE '%.idx'
          AND m.file_name NOT LIKE '%.txt'
          AND m.file_name NOT LIKE '%.nfo'
          AND m.file_name NOT LIKE '%.vtt'
          AND m.file_name NOT LIKE '%.jpg'
          AND m.file_name NOT LIKE '%.jpeg'
          AND m.file_name NOT LIKE '%.png'
          AND m.file_name NOT LIKE '%.pdf'
          AND m.file_name NOT LIKE '%.zip'
          AND m.file_name NOT LIKE '%.rar'
          AND m.file_name NOT LIKE '%.7z'
        ORDER BY m.id
    """)

    raw_rows = [dict(row) for row in cursor.fetchall()]
    conn.close()

    # Filter non-English
    filtered = []
    skipped_non_english = 0
    skipped_unparseable = 0

    for row in raw_rows:
        fname = row.get("file_name", "")

        if is_non_english(fname):
            skipped_non_english += 1
            continue

        # Parse episode info
        series_name, season, episode = parse_episode_info(fname)
        if not series_name:
            skipped_unparseable += 1
            continue

        row["parsed_series"] = series_name
        row["parsed_season"] = season
        row["parsed_episode"] = episode
        row["normalized_series"] = normalize_series_name(series_name)

        filtered.append(row)

    if skipped_non_english > 0:
        print(f"  Filtered out {skipped_non_english:,} non-English files")
    if skipped_unparseable > 0:
        print(f"  Filtered out {skipped_unparseable:,} unparseable files (no S##E## pattern)")

    return filtered


def group_episodes(rows: list[dict]) -> dict:
    """Group files by (normalized_series, season, episode)."""
    groups = defaultdict(list)
    for row in rows:
        key = (row["normalized_series"], row["parsed_season"], row["parsed_episode"])
        groups[key].append(row)
    return dict(groups)


def pick_best_episode_files(files: list[dict]) -> dict:
    """
    Pick best 720p + 1080p file for an episode.
    Returns dict like {"720p": {...}, "1080p": {...}} or subset.
    """
    by_quality = defaultdict(list)

    for f in files:
        q = normalize_quality(
            f.get("quality", ""),
            f.get("resolution", ""),
            f.get("file_name", ""),
        )
        if q in ("720p", "1080p"):
            by_quality[q].append(f)

    picks = {}
    for quality, candidates in by_quality.items():
        # Score each candidate, sort descending
        candidates.sort(
            key=lambda c: score_episode_file(c.get("file_name", ""), c.get("file_size", 0)),
            reverse=True
        )
        best = candidates[0]
        picks[quality] = {
            "sqlite_id": best["sqlite_id"],
            "file_name": best["file_name"],
            "file_size": best["file_size"],
            "quality": quality,
            "variant": detect_variant(best.get("file_name", "")),
            "codec": detect_codec(best.get("file_name", "")),
            "tmdb_id": best.get("tmdb_id"),
            "meta_title": best.get("meta_title", ""),
            "score": score_episode_file(best.get("file_name", ""), best.get("file_size", 0)),
        }

    return picks


# ============================================================
# POSTGREST LOAD FUNCTIONS
# ============================================================

def load_all_series() -> tuple[dict, dict]:
    """Load all series from PostgreSQL. Returns (by_tmdb_id, by_normalized_title)."""
    print("  Loading all series from PostgreSQL...")

    all_series = []
    offset = 0
    batch_size = 1000

    while True:
        resp = requests.get(
            f"{POSTGREST_URL}/series",
            params={"select": "id,tmdb_id,title", "limit": str(batch_size), "offset": str(offset)},
            headers=postgrest_headers(),
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"  Error loading series: {resp.status_code}")
            break
        batch = resp.json()
        if not batch:
            break
        all_series.extend(batch)
        offset += batch_size

    by_tmdb = {}
    by_title = {}
    for s in all_series:
        if s.get("tmdb_id"):
            by_tmdb[s["tmdb_id"]] = s
        norm = normalize_series_name(s.get("title", ""))
        if norm:
            by_title[norm] = s

    print(f"  Loaded {len(all_series):,} series ({len(by_tmdb):,} with TMDB IDs)")
    return by_tmdb, by_title


def load_all_episodes() -> dict:
    """Load all episodes with season info. Returns {(series_id, season_num, episode_num): episode}."""
    print("  Loading all seasons from PostgreSQL...")

    all_seasons = []
    offset = 0
    while True:
        resp = requests.get(
            f"{POSTGREST_URL}/seasons",
            params={"select": "id,series_id,season_number", "limit": "5000", "offset": str(offset)},
            headers=postgrest_headers(),
            timeout=30,
        )
        if resp.status_code != 200:
            break
        batch = resp.json()
        if not batch:
            break
        all_seasons.extend(batch)
        offset += 5000

    season_map = {}  # season.id -> {series_id, season_number}
    for s in all_seasons:
        season_map[s["id"]] = s

    print(f"  Loaded {len(all_seasons):,} seasons")

    print("  Loading all episodes from PostgreSQL...")
    all_episodes = []
    offset = 0
    while True:
        resp = requests.get(
            f"{POSTGREST_URL}/episodes",
            params={"select": "id,season_id,series_id,episode_number", "limit": "10000", "offset": str(offset)},
            headers=postgrest_headers(),
            timeout=30,
        )
        if resp.status_code != 200:
            break
        batch = resp.json()
        if not batch:
            break
        all_episodes.extend(batch)
        offset += 10000

    print(f"  Loaded {len(all_episodes):,} episodes")

    # Build lookup: (series_id, season_number, episode_number) -> episode
    ep_lookup = {}
    for ep in all_episodes:
        season_info = season_map.get(ep["season_id"])
        if season_info:
            key = (ep["series_id"], season_info["season_number"], ep["episode_number"])
            ep_lookup[key] = ep

    return ep_lookup


# ============================================================
# POSTGREST INSERT FUNCTIONS
# ============================================================

def clear_episode_links(live: bool = False) -> int:
    if not live:
        try:
            resp = requests.get(
                f"{POSTGREST_URL}/download_links",
                params={"content_type": "eq.episode", "source": "eq.telegram", "select": "id"},
                headers=postgrest_headers(),
                timeout=10,
            )
            if resp.status_code == 200:
                count = len(resp.json())
                print(f"  Would delete {count} existing episode Telegram links (dry-run)")
                return count
        except Exception as e:
            print(f"  Error counting: {e}")
        return 0

    try:
        resp = requests.delete(
            f"{POSTGREST_URL}/download_links",
            params={"content_type": "eq.episode", "source": "eq.telegram"},
            headers=postgrest_headers(),
            timeout=60,
        )
        if resp.status_code in (200, 204):
            deleted = len(resp.json()) if resp.text else 0
            print(f"  Cleared {deleted} existing episode Telegram links")
            return deleted
        else:
            print(f"  Delete error: {resp.status_code} {resp.text[:200]}")
    except Exception as e:
        print(f"  Delete exception: {e}")
    return 0


def batch_insert_links(rows: list[dict], live: bool = False) -> int:
    if not rows:
        return 0
    if not live:
        return len(rows)

    try:
        resp = requests.post(
            f"{POSTGREST_URL}/download_links",
            json=rows,
            headers=postgrest_headers(),
            timeout=30,
        )
        if resp.status_code in (200, 201):
            result = resp.json()
            return len(result) if isinstance(result, list) else 1
        else:
            print(f"  Batch insert error: {resp.status_code} {resp.text[:300]}")
            return 0
    except Exception as e:
        print(f"  Batch insert exception: {e}")
        return 0


def update_has_downloads(episode_ids: list[int], live: bool = False) -> int:
    """Set has_downloads = true for matched episodes."""
    if not episode_ids or not live:
        return len(episode_ids)

    updated = 0
    batch_size = 200
    for i in range(0, len(episode_ids), batch_size):
        batch = episode_ids[i:i + batch_size]
        ids_str = ",".join(str(eid) for eid in batch)
        try:
            resp = requests.patch(
                f"{POSTGREST_URL}/episodes",
                params={"id": f"in.({ids_str})"},
                json={"has_downloads": True},
                headers=postgrest_headers(),
                timeout=30,
            )
            if resp.status_code in (200, 204):
                updated += len(batch)
            else:
                print(f"  Update has_downloads error: {resp.status_code}")
        except Exception as e:
            print(f"  Update exception: {e}")

    return updated


# ============================================================
# MAIN MIGRATION
# ============================================================

def migrate(args):
    start_time = time.time()

    print("=" * 70)
    print("  Episode DDL Migration (Telegram SQLite → PostgREST)")
    print(f"  Mode: {'LIVE' if args.live else 'DRY-RUN'}")
    if args.limit:
        print(f"  Limit: {args.limit} series")
    if args.series:
        print(f"  Series filter: \"{args.series}\"")
    print(f"  Batch size: {args.batch_size}")
    print(f"  SQLite DB: {SQLITE_DB}")
    print(f"  PostgREST: {POSTGREST_URL}")
    print("=" * 70)
    print()

    # Step 1: Load episode files from SQLite
    print("[1/6] Loading episode files from SQLite...")
    rows = fetch_episode_files(SQLITE_DB)
    print(f"  Found {len(rows):,} valid episode files")

    # Step 2: Group by (series, season, episode)
    print("[2/6] Grouping by episode...")
    episode_groups = group_episodes(rows)

    # Get unique series from the groups
    series_in_sqlite = defaultdict(set)
    for (norm_series, season, episode) in episode_groups.keys():
        series_in_sqlite[norm_series].add((season, episode))

    print(f"  {len(series_in_sqlite):,} unique series")
    print(f"  {len(episode_groups):,} unique episodes")

    # Apply series filter
    if args.series:
        filter_norm = normalize_series_name(args.series)
        episode_groups = {k: v for k, v in episode_groups.items() if k[0] == filter_norm}
        print(f"  Filtered to \"{args.series}\": {len(episode_groups)} episodes")
        if not episode_groups:
            # Try fuzzy match
            matching = [k for k in series_in_sqlite.keys() if filter_norm in k]
            print(f"  Fuzzy matches: {matching[:10]}")
            return

    # Step 3: Load PostgreSQL data for matching
    print("[3/6] Loading PostgreSQL data for matching...")
    series_by_tmdb, series_by_title = load_all_series()
    ep_lookup = load_all_episodes()

    # Step 4: Clear existing (if requested)
    if args.clear:
        print("[4/6] Clearing existing episode Telegram links...")
        clear_episode_links(live=args.live)
    else:
        print("[4/6] Skipping clear (use --clear to remove existing)")

    # Step 5: Pick best files and match to PostgreSQL episodes
    print("[5/6] Matching episodes and picking best files...")

    all_inserts = []
    matched_episode_ids = set()
    stats = {
        "total_episode_groups": len(episode_groups),
        "series_matched": 0,
        "series_unmatched": 0,
        "episodes_matched": 0,
        "episodes_unmatched": 0,
        "with_720p": 0,
        "with_1080p": 0,
        "with_both": 0,
    }

    unmatched_series = set()
    unmatched_episodes = []
    processed_series = set()
    series_limit_counter = 0

    for i, ((norm_series, season, episode_num), files) in enumerate(episode_groups.items()):
        # Track unique series
        if norm_series not in processed_series:
            processed_series.add(norm_series)
            series_limit_counter += 1

            if args.limit and series_limit_counter > args.limit:
                break

        # Match series to PostgreSQL
        pg_series = None

        # Try TMDB ID match first
        tmdb_id = files[0].get("tmdb_id")
        if tmdb_id and tmdb_id in series_by_tmdb:
            pg_series = series_by_tmdb[tmdb_id]

        # Fall back to title match
        if not pg_series:
            pg_series = series_by_title.get(norm_series)

        # Try partial matching if exact fails
        if not pg_series:
            for title_key, series_data in series_by_title.items():
                if norm_series in title_key or title_key in norm_series:
                    pg_series = series_data
                    break

        if not pg_series:
            if norm_series not in unmatched_series:
                unmatched_series.add(norm_series)
                stats["series_unmatched"] += 1
            continue

        if norm_series not in unmatched_series:
            stats["series_matched"] += 1

        # Match episode in PostgreSQL
        ep_key = (pg_series["id"], season, episode_num)
        pg_episode = ep_lookup.get(ep_key)

        if not pg_episode:
            stats["episodes_unmatched"] += 1
            unmatched_episodes.append({
                "series": norm_series,
                "series_id": pg_series["id"],
                "season": season,
                "episode": episode_num,
            })
            continue

        stats["episodes_matched"] += 1

        # Pick best files for this episode
        picks = pick_best_episode_files(files)
        if not picks:
            continue

        has_720 = "720p" in picks
        has_1080 = "1080p" in picks
        if has_720:
            stats["with_720p"] += 1
        if has_1080:
            stats["with_1080p"] += 1
        if has_720 and has_1080:
            stats["with_both"] += 1

        matched_episode_ids.add(pg_episode["id"])

        for quality, pick in picks.items():
            row = {
                "content_type": "episode",
                "content_id": pg_episode["id"],
                "source": "telegram",
                "quality": quality,
                "file_size": format_file_size(pick["file_size"]),
                "url": f"{TELEGRAM_STREAM_BASE}/stream/{pick['sqlite_id']}",
                "telegram_file_id": str(pick["sqlite_id"]),
                "variant": pick["variant"],
                "is_active": True,
                "click_count": 0,
            }
            all_inserts.append(row)

        # Progress logging
        if (i + 1) % 5000 == 0:
            print(f"  Processed {i + 1:,}/{len(episode_groups):,} episodes ({len(all_inserts):,} links)")

    print(f"  Done: {stats['episodes_matched']:,} matched → {len(all_inserts):,} download links")
    print()

    # Show sample
    print("  Sample entries:")
    for entry in all_inserts[:6]:
        print(f"    ep_id:{entry['content_id']} | {entry['quality']} {entry['variant']:7} | {entry['file_size']:>8}")
    if len(all_inserts) > 6:
        print(f"    ... and {len(all_inserts) - 6:,} more")
    print()

    # Step 6: Batch insert
    print(f"[6/6] {'Inserting' if args.live else 'Would insert'} {len(all_inserts):,} rows...")
    inserted = 0
    batch_size = args.batch_size

    for batch_start in range(0, len(all_inserts), batch_size):
        batch = all_inserts[batch_start:batch_start + batch_size]
        count = batch_insert_links(batch, live=args.live)
        inserted += count

        if args.live and (batch_start + batch_size) % (batch_size * 10) == 0:
            print(f"  Inserted {inserted:,}/{len(all_inserts):,} rows...")

    # Update has_downloads flags
    if matched_episode_ids:
        print(f"\n  Updating has_downloads for {len(matched_episode_ids):,} episodes...")
        update_has_downloads(list(matched_episode_ids), live=args.live)

    elapsed = time.time() - start_time

    # Summary
    print()
    print("=" * 70)
    print("  EPISODE DDL MIGRATION SUMMARY")
    print("=" * 70)
    print(f"  Mode:                {'LIVE' if args.live else 'DRY-RUN'}")
    print(f"  Total files:         {len(rows):,}")
    print(f"  Total episode groups:{stats['total_episode_groups']:,}")
    print(f"  Series matched:      {stats['series_matched']:,}")
    print(f"  Series unmatched:    {stats['series_unmatched']:,}")
    print(f"  Episodes matched:    {stats['episodes_matched']:,}")
    print(f"  Episodes unmatched:  {stats['episodes_unmatched']:,}")
    print(f"  With 720p:           {stats['with_720p']:,}")
    print(f"  With 1080p:          {stats['with_1080p']:,}")
    print(f"  With both:           {stats['with_both']:,}")
    print(f"  Links created:       {inserted:,}")
    print(f"  has_downloads set:   {len(matched_episode_ids):,}")
    print(f"  Time elapsed:        {elapsed:.1f}s")
    print("=" * 70)

    if unmatched_series:
        print(f"\n  Top 20 unmatched series (of {len(unmatched_series)}):")
        # Sort by how many episodes they had
        unmatched_counts = defaultdict(int)
        for (ns, s, e) in episode_groups.keys():
            if ns in unmatched_series:
                unmatched_counts[ns] += 1
        for name, count in sorted(unmatched_counts.items(), key=lambda x: -x[1])[:20]:
            print(f"    {name:40} ({count} episodes)")

    if not args.live:
        print()
        print("  This was a DRY-RUN. To actually insert, add --live flag.")
        print(f"  Example: python3 {sys.argv[0]} --live")


def main():
    parser = argparse.ArgumentParser(description="Migrate Episode DDLs to PostgREST")
    parser.add_argument("--live", action="store_true", help="Actually write to PostgREST (default: dry-run)")
    parser.add_argument("--clear", action="store_true", help="Clear existing episode links before inserting")
    parser.add_argument("--limit", type=int, default=0, help="Only process first N unique series (0 = all)")
    parser.add_argument("--batch-size", type=int, default=500, help="PostgREST bulk insert batch size")
    parser.add_argument("--series", type=str, default="", help="Filter to a single series name for debugging")
    args = parser.parse_args()

    if not HAS_REQUESTS:
        print("ERROR: 'requests' package required. Install: pip install requests")
        sys.exit(1)

    if not os.path.exists(SQLITE_DB):
        print(f"ERROR: SQLite DB not found at {SQLITE_DB}")
        sys.exit(1)

    migrate(args)


if __name__ == "__main__":
    main()
