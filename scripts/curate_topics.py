#!/usr/bin/env python3
"""
Movie Guides — topic curation.

For each topic:
  - 'ai'     topics: ask Claude for a ranked list of films + a short intro,
             then resolve each film to a real TMDB movie.
  - 'filter' topics: query TMDB discover directly.
Every film is matched against our `movies` table to mark owned (has a slug we
can link to) vs un-owned. Results are written to movie_topics / movie_topic_items.

Runs on server 144 as root (psql + the API keys live there).
"""
import os, re, json, sys, time, html
import requests
import psycopg2

# ── config / secrets ──────────────────────────────────────────────────────────
def _read_env(path, key):
    try:
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    except Exception:
        pass
    return ""

ANTHROPIC_KEY = _read_env("/opt/tech-news/.env", "ANTHROPIC_API_KEY")
TMDB_KEY      = _read_env("/var/www/trendimovies/.env", "TMDB_API_KEY")
CLAUDE_MODEL  = "claude-sonnet-4-6"
TMDB          = "https://api.themoviedb.org/3"
DB_DSN        = "dbname=trendimovies user=postgres"

# ── topic definitions (the pilot set) ─────────────────────────────────────────
TOPICS = [
    # AI-curated mood topics
    {"slug": "movies-that-make-you-cry", "title": "15 Movies That Will Make You Cry",
     "category": "mood", "emoji": "😢", "color": "#7c3aed", "source": "ai", "sort_order": 10,
     "prompt": "the most emotionally devastating, tear-jerking movies that reliably make viewers cry — a mix of acclaimed dramas, tragic romances and true stories"},
    {"slug": "feel-good-movies", "title": "20 Feel-Good Movies to Lift Your Spirits",
     "category": "mood", "emoji": "😊", "color": "#f59e0b", "source": "ai", "sort_order": 20,
     "prompt": "the best feel-good, heartwarming, uplifting movies that leave you happy — comedies, sports underdog stories and crowd-pleasers"},
    {"slug": "mind-bending-movies", "title": "18 Mind-Bending Movies With Crazy Twists",
     "category": "mood", "emoji": "🤯", "color": "#0d9488", "source": "ai", "sort_order": 30,
     "prompt": "the most mind-bending, reality-questioning movies with shocking plot twists and endings that make you rewatch — psychological thrillers and sci-fi"},
    # filter topics
    {"slug": "best-horror-movies-80s", "title": "Best Horror Movies of the 80s",
     "category": "decade", "emoji": "🔪", "color": "#dc2626", "source": "filter", "sort_order": 40,
     "filter": {"with_genres": "27", "primary_release_date.gte": "1980-01-01",
                "primary_release_date.lte": "1989-12-31", "sort_by": "vote_average.desc", "vote_count.gte": "200"}},
    {"slug": "best-sci-fi-2010s", "title": "Best Sci-Fi Movies of the 2010s",
     "category": "decade", "emoji": "🚀", "color": "#2563eb", "source": "filter", "sort_order": 50,
     "filter": {"with_genres": "878", "primary_release_date.gte": "2010-01-01",
                "primary_release_date.lte": "2019-12-31", "sort_by": "vote_average.desc", "vote_count.gte": "500"}},
    # semi-auto hidden gems: well-rated but low popularity
    {"slug": "hidden-gem-thrillers", "title": "Hidden Gem Thrillers You Probably Missed",
     "category": "hidden", "emoji": "🕵️", "color": "#475569", "source": "filter", "sort_order": 60,
     "filter": {"with_genres": "53", "sort_by": "vote_average.desc", "vote_count.gte": "150",
                "vote_count.lte": "1200", "primary_release_date.gte": "2005-01-01"}},
]

# ── helpers ───────────────────────────────────────────────────────────────────
def call_claude(system, user, max_tokens=2000):
    r = requests.post("https://api.anthropic.com/v1/messages",
        headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
        json={"model": CLAUDE_MODEL, "max_tokens": max_tokens, "system": system,
              "messages": [{"role": "user", "content": user}]},
        timeout=120)
    r.raise_for_status()
    return r.json()["content"][0]["text"]

def tmdb_discover(params):
    p = {"api_key": TMDB_KEY, "page": 1, **params}
    out = []
    for page in (1, 2):
        p["page"] = page
        try:
            d = requests.get(f"{TMDB}/discover/movie", params=p, timeout=15).json()
            out += d.get("results", [])
        except Exception:
            pass
    return out

def tmdb_search(title, year=None):
    p = {"api_key": TMDB_KEY, "query": title}
    if year:
        p["year"] = year
    try:
        d = requests.get(f"{TMDB}/search/movie", params=p, timeout=12).json()
        res = d.get("results", [])
        return res[0] if res else None
    except Exception:
        return None

# ── curation ──────────────────────────────────────────────────────────────────
AI_SYSTEM = ("You are a film curator. Return ONLY valid JSON, no prose. "
             "Schema: {\"intro\": \"<2 punchy sentences introducing the list, no markdown>\", "
             "\"films\": [{\"title\": \"<exact movie title>\", \"year\": <release year int>, "
             "\"blurb\": \"<one short sentence on why it belongs>\"}]}. Real, well-known films only.")

def curate_ai(topic):
    user = f"Make a list of the best {topic['prompt']}. Give 18-20 films, ranked best first."
    raw = call_claude(AI_SYSTEM, user, max_tokens=2500)
    m = re.search(r"\{.*\}", raw, re.S)
    data = json.loads(m.group(0)) if m else {"intro": "", "films": []}
    intro = data.get("intro", "").strip()
    items = []
    for f in data.get("films", []):
        hit = tmdb_search(f.get("title", ""), f.get("year"))
        if not hit or not hit.get("poster_path"):
            continue
        items.append({"tmdb_id": hit["id"], "title": hit.get("title") or f.get("title"),
                      "year": int((hit.get("release_date") or "0")[:4] or 0) or f.get("year"),
                      "blurb": (f.get("blurb") or "").strip(),
                      "poster_path": hit.get("poster_path"), "backdrop_path": hit.get("backdrop_path")})
        time.sleep(0.08)
    return intro, items

def curate_filter(topic):
    rows = tmdb_discover(topic["filter"])
    items = []
    seen = set()
    for m in rows:
        if not m.get("poster_path") or m["id"] in seen:
            continue
        seen.add(m["id"])
        items.append({"tmdb_id": m["id"], "title": m.get("title"),
                      "year": int((m.get("release_date") or "0")[:4] or 0), "blurb": "",
                      "poster_path": m.get("poster_path"), "backdrop_path": m.get("backdrop_path")})
        if len(items) >= 20:
            break
    # short auto-intro
    intro = ""
    return intro, items

# ── DB write ──────────────────────────────────────────────────────────────────
def upsert_topic(cur, topic, intro, items):
    cur.execute("""
        INSERT INTO movie_topics (slug, title, category, intro, emoji, color, source, sort_order, updated_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s, now())
        ON CONFLICT (slug) DO UPDATE SET
          title=EXCLUDED.title, category=EXCLUDED.category, intro=EXCLUDED.intro,
          emoji=EXCLUDED.emoji, color=EXCLUDED.color, source=EXCLUDED.source,
          sort_order=EXCLUDED.sort_order, updated_at=now()
        RETURNING id;
    """, (topic["slug"], topic["title"], topic["category"], intro or None,
          topic["emoji"], topic["color"], topic["source"], topic["sort_order"]))
    tid = cur.fetchone()[0]
    cur.execute("DELETE FROM movie_topic_items WHERE topic_id=%s", (tid,))
    for pos, it in enumerate(items):
        cur.execute("""INSERT INTO movie_topic_items (topic_id, tmdb_id, title, year, blurb, position, poster_path, backdrop_path)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (tid, it["tmdb_id"], it["title"], it["year"], it["blurb"] or None, pos,
                     it.get("poster_path"), it.get("backdrop_path")))
    return tid, len(items)

def main():
    assert ANTHROPIC_KEY and TMDB_KEY, "missing keys"
    conn = psycopg2.connect(DB_DSN)
    conn.autocommit = False
    cur = conn.cursor()
    for t in TOPICS:
        try:
            if t["source"] == "ai":
                intro, items = curate_ai(t)
            else:
                intro, items = curate_filter(t)
            tid, n = upsert_topic(cur, t, intro, items)
            conn.commit()
            print(f"  ✓ {t['slug']}: {n} films (id {tid})")
        except Exception as e:
            conn.rollback()
            print(f"  ✗ {t['slug']}: {e}")
    cur.close(); conn.close()
    print("done.")

if __name__ == "__main__":
    main()
