# -*- coding: utf-8 -*-
"""Link verified files to the right film, using the SAME rules as the site's movie assign (trendimovies_cron.auto_assign_movies):
one best file per tier (720p / 1080p / 2160p), English-only first, then English-blend, same validation and the same insert function.
Everything is pinned to a TMDB id and to a list of sqlite file ids that were identified by running time + audio + name (evidence.py).
When a file name has no resolution, the REAL resolution read from the file (file_probe) is used. Nothing is guessed.

    python3 assign_pinned.py plan      # show exactly what would be linked, change nothing
    python3 assign_pinned.py run       # do it
"""
import re
import sys

sys.path.insert(0, "/opt/trendimovies/bot")
import trendimovies_cron as c
import file_probe as FP

MODE = sys.argv[1] if len(sys.argv) > 1 else "plan"
DO = MODE == "run"

MONSTER_IDS = [371633, 395895, 395899, 395900, 395902, 412263, 412264, 420064, 453976, 454668, 454669, 454670, 454671,
               455862, 455863, 455866, 455868, 1118284, 1118285, 1305385]
SNOW_IDS = [4147, 367239, 367240, 367244, 367245, 387613, 387660, 387662, 387663, 398247, 398330, 910244, 973789, 979161, 1166061, 1258821]

JOBS = [
    # label, tmdb_id, title for a new row, year for a new row, [sqlite file ids]
    ("Snow White and the Seven Dwarfs", 408, "Snow White and the Seven Dwarfs", 1938, SNOW_IDS),
    ("One Hundred and One Dalmatians", 12230, "One Hundred and One Dalmatians", 1961, [550882, 864073]),
    ("Monster (2023, Kore-eda)", 1050035, "Monster", 2023, MONSTER_IDS),
    ("Witness for the Prosecution", 37257, "Witness for the Prosecution", 1957, [1021989]),
    ("Death Note Relight 1: Visions of a God", 51482, "Death Note Relight 1: Visions of a God", 2007, [625572]),
]


def walle_ids():
    """Every WALL-E (2008) file in the catalogue whose real running time is 90-105 min (WALL-E = 98 min)."""
    ids = []
    for r in c.run_sqlite("SELECT id, file_name FROM movies WHERE is_deleted=0 AND lower(file_name) LIKE '%wall%' AND file_name NOT LIKE '%.srt' AND file_name NOT LIKE '%.sub'"):
        n = r["file_name"]
        if not re.search(r"wall[^a-z0-9]*e", n, re.I) or "2008" not in n or re.search(r"s\d\de\d", n, re.I):
            continue
        f = FP.probe_facts(str(r["id"]))
        d = round(f["duration_s"] / 60) if f.get("duration_s") else None
        if d and 90 <= d <= 105:
            ids.append(r["id"])
        else:
            print("  skipped (not confirmed as WALL-E: %s min): %s" % (d, n[:70]))
    return ids


if len(sys.argv) > 2 and sys.argv[2] == "walle":
    JOBS = [("WALL-E (2008)", 10681, "WALL-E", 2008, walle_ids())]


def movie_row(tmdb_id, title, year):
    r = c.run_postgres_single("SELECT id FROM movies WHERE tmdb_id=%d" % tmdb_id)
    if r:
        return int(r), False
    if not DO:
        return None, True
    orig = c.tmdb_search_movie
    c.tmdb_search_movie = lambda *a, _i=tmdb_id, **k: {"id": _i}
    try:
        mid = c.auto_add_movie_from_tmdb(title, year)
    finally:
        c.tmdb_search_movie = orig
    return (int(mid) if mid else None), True


_FACTS = {}


def facts(row):
    if row["id"] not in _FACTS:
        _FACTS[row["id"]] = FP.probe_facts(str(row["id"]))
    return _FACTS[row["id"]]


def tier_of(row):
    n = row["file_name"]
    q = c.extract_quality_from_filename(n)
    if q:
        return q, "name"
    f = facts(row)
    return f.get("tier"), "probe %sx%s" % (f.get("width"), f.get("height"))


ISO = {"en": "eng", "ja": "jpn", "ko": "kor", "hi": "hin", "es": "spa", "fr": "fre"}
PREFIXED = re.compile(r"^\s*(?:@\w+|\[[^\]]{1,30}\]|[^\x00-\x7f]+\w*[._ -])")


def audio_class(langs, movie_lang):
    """A = only the film's own language (or unknown); B = has the film's language plus others; None = a dub without the original."""
    S = set(langs or []) or {"und"}
    L = ISO.get(movie_lang, movie_lang)
    if S <= {L, "und"}:
        return "A"
    if L in S:
        return "B"
    return None


def choose(files, quality, movie_lang):
    """One best file for a tier. Real audio decides (not the cut-short name): class A (original language only) beats class B
    (original + other languages); a dub without the original is never used. Same file checks and preference score as the engine."""
    best, bk = None, None
    for f in files:
        if f["quality"] != quality:
            continue
        n = f["file_name"]
        low = n.lower()
        if c.is_subtitle_file(n) or c.is_part_file(n) or "hdrip" in low or PREFIXED.match(n):
            continue
        if any(i in low for i in ['hdcam', 'camrip', 'cam-rip', 'telesync', 'hdts', 'telecine', 'screener', '.scr.', '-scr-']):
            continue
        if low.endswith(('.rar', '.zip', '.7z', '.tar', '.gz')):
            continue
        k = audio_class(f["langs"], movie_lang)
        if k is None:
            continue
        known = bool(f["langs"]) and "und" not in f["langs"]          # audio language really recorded in the file
        rank = 0 if (k == "A" and known) else 1 if k == "A" else 2      # verified original-only, then unknown-language, then multi-language
        key = (rank, -c.calculate_file_preference_score(n))
        if bk is None or key < bk:
            best, bk = f, key
    return best, (bk is not None and bk[0] == 2)


for label, tmdb_id, title, year, ids in JOBS:
    print("=" * 96)
    print(label, "| TMDB", tmdb_id)
    mid, will_create = movie_row(tmdb_id, title, year)
    print("  movie row:", ("EXISTS id=%s" % mid) if not will_create else ("will be created" if not DO else "created id=%s" % mid))
    rows = c.run_sqlite("SELECT id, file_name, file_size FROM movies WHERE id IN (%s) AND is_deleted=0" % ",".join(map(str, ids)))
    files = []
    for r in rows:
        q, how = tier_of(r)
        files.append({"id": r["id"], "file_name": r["file_name"], "file_size": int(r["file_size"] or 0), "quality": q, "how": how,
                      "langs": facts(r).get("audio_langs") or []})
    movie_lang = (c.run_postgres_single("SELECT COALESCE(original_language,'en') FROM movies WHERE id=%s" % mid) if mid else None) or {"Monster (2023, Kore-eda)": "ja", "Death Note Relight 1: Visions of a God": "ja"}.get(label, "en")
    print("  original language:", movie_lang, "| files considered:", len(files))
    for q in ("720p", "1080p", "2160p"):
        if mid and c.check_existing_link("movie", mid, q):
            print("  %-6s already linked, skipped" % q)
            continue
        best, blend = choose(files, q, movie_lang)
        if not best:
            print("  %-6s no valid file" % q)
            continue
        print("  %-6s -> %s  (%s, %d MB, audio %s%s)  [%s]" % (q, best["file_name"][:70], best["id"], round(best["file_size"] / 1e6), ",".join(best["langs"]) or "?", ", multi-language" if blend else "", best["how"]))
        if DO and mid:
            lang_code = "multi" if blend else movie_lang
            raw = c.extract_language_tag(best["file_name"])
            tag = raw if raw != "ENG" else None
            ok = c.insert_download_link("movie", mid, best["id"], best["file_size"], q, lang_code, tag)
            print("         inserted:", ok)
    if DO and mid:
        c.update_has_downloads("movie", [mid])
        print("  has_downloads now:", c.run_postgres_single("SELECT has_downloads FROM movies WHERE id=%s" % mid))
