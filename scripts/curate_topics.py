#!/usr/bin/env python3
"""
Movie Guides — topic curation.

Engines per topic:
  - 'ai'     : ask Claude for a ranked list of films + intro (knowledge-based;
               best for "best of / mood / genre" lists). Resolved to TMDB.
  - 'live'   : pull from TMDB live endpoints (popular / trending / now_playing /
               top_rated / upcoming) — real CURRENT data, ideal for
               "popular right now / trending this week" lists.
  - 'filter' : TMDB discover with explicit filters (decade/genre rules).

Every film is matched to a real TMDB movie (poster required). Results go to
movie_topics / movie_topic_items. Films are auto-linked to our catalogue at
render time by tmdb_id, so no extra ownership column is needed here.

Modes (CLI):
  (no args)                 re-curate the built-in TOPICS list (legacy weekly cron)
  --draft   '<topic json>'  curate ONE topic, print {intro,films} as JSON, DO NOT save
  --save    '<topic json>'  curate/accept ONE topic and WRITE it (publish)
  --refresh-live            re-curate only the live/time-sensitive published topics
                            (weekly cron to keep "right now" lists fresh)

Topic JSON shape (for --draft / --save):
  {
    "slug": "...", "title": "...", "category": "best-of",
    "emoji": "🔥", "color": "#dc2626", "sort_order": 100,
    "source": "ai" | "live" | "filter",        # optional; auto-detected from title if absent
    "prompt": "...",                            # for ai (defaults to title)
    "live_kind": "popular|trending|now_playing|top_rated|upcoming",  # for live (auto)
    "filter": {...},                            # for filter
    "films": [ {tmdb_id,title,year,blurb,poster_path,backdrop_path}, ... ]  # for --save edited list
  }

Runs on server 144 as the postgres user (psql + the API keys live there).
"""
import os, re, json, sys, time
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

# ── built-in topic set (legacy weekly run) ────────────────────────────────────
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
def call_claude(system, user, max_tokens=2500):
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

def tmdb_list(endpoint, pages=2):
    """Pull a TMDB list endpoint (e.g. movie/popular, trending/movie/week)."""
    out = []
    for page in range(1, pages + 1):
        try:
            d = requests.get(f"{TMDB}/{endpoint}", params={"api_key": TMDB_KEY, "page": page}, timeout=15).json()
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

def _item_from_tmdb(m, blurb=""):
    return {"tmdb_id": m["id"], "title": m.get("title") or m.get("name"),
            "year": int((m.get("release_date") or "0")[:4] or 0), "blurb": blurb,
            "poster_path": m.get("poster_path"), "backdrop_path": m.get("backdrop_path")}

# ── engine auto-detection ─────────────────────────────────────────────────────
LIVE_HINTS = ("right now", "trending", "this week", "this month", "popular now",
              "now playing", "in theaters", "in theatres", "currently", "today",
              "latest", "upcoming", "new releases", "box office")

def detect_engine(topic):
    if topic.get("source"):
        return topic["source"]
    t = (topic.get("title", "") + " " + topic.get("prompt", "")).lower()
    if any(h in t for h in LIVE_HINTS):
        return "live"
    return "ai"

def detect_live_kind(topic):
    if topic.get("live_kind"):
        return topic["live_kind"]
    t = topic.get("title", "").lower()
    if "trending" in t or "this week" in t or "right now" in t:
        return "trending"
    if "now playing" in t or "in theat" in t:
        return "now_playing"
    if "upcoming" in t or "coming soon" in t:
        return "upcoming"
    if "top rated" in t or "best rated" in t or "highest rated" in t:
        return "top_rated"
    return "popular"

# ── curation engines ──────────────────────────────────────────────────────────
AI_SYSTEM = ("You are a film curator. Return ONLY valid JSON, no prose. "
             "Schema: {\"intro\": \"<2 punchy sentences introducing the list, no markdown>\", "
             "\"films\": [{\"title\": \"<exact movie title>\", \"year\": <release year int>, "
             "\"blurb\": \"<one short sentence on why it belongs>\"}]}. Real, well-known films only.")

def curate_ai(topic):
    prompt = topic.get("prompt") or topic.get("title")
    user = f"Make a list of: {prompt}. Give 18-20 real films, ranked best first."
    raw = call_claude(AI_SYSTEM, user, max_tokens=2500)
    m = re.search(r"\{.*\}", raw, re.S)
    data = json.loads(m.group(0)) if m else {"intro": "", "films": []}
    intro = (data.get("intro") or "").strip()
    items, seen = [], set()
    for f in data.get("films", []):
        hit = tmdb_search(f.get("title", ""), f.get("year"))
        if not hit or not hit.get("poster_path") or hit["id"] in seen:
            continue
        seen.add(hit["id"])
        it = _item_from_tmdb(hit, (f.get("blurb") or "").strip())
        if not it["title"]:
            it["title"] = f.get("title")
        items.append(it)
        time.sleep(0.08)
    return intro, items

LIVE_ENDPOINT = {
    "popular": "movie/popular",
    "now_playing": "movie/now_playing",
    "upcoming": "movie/upcoming",
    "top_rated": "movie/top_rated",
    "trending": "trending/movie/week",
}

def curate_live(topic):
    kind = detect_live_kind(topic)
    rows = tmdb_list(LIVE_ENDPOINT.get(kind, "movie/popular"))
    items, seen = [], set()
    for m in rows:
        if not m.get("poster_path") or m["id"] in seen:
            continue
        seen.add(m["id"])
        items.append(_item_from_tmdb(m))
        if len(items) >= 20:
            break
    intro = (topic.get("intro") or "").strip()
    return intro, items

def curate_filter(topic):
    rows = tmdb_discover(topic["filter"])
    items, seen = [], set()
    for m in rows:
        if not m.get("poster_path") or m["id"] in seen:
            continue
        seen.add(m["id"])
        items.append(_item_from_tmdb(m))
        if len(items) >= 20:
            break
    return (topic.get("intro") or "").strip(), items

def curate(topic):
    """Dispatch to the right engine. Returns (engine, intro, items)."""
    engine = detect_engine(topic)
    if engine == "live":
        intro, items = curate_live(topic)
    elif engine == "filter":
        intro, items = curate_filter(topic)
    else:
        engine = "ai"
        intro, items = curate_ai(topic)
    return engine, intro, items

# ── slug helper ───────────────────────────────────────────────────────────────
def slugify(title):
    s = re.sub(r"[^a-z0-9\s-]", "", (title or "").lower())
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "guide"

# ── DB write ──────────────────────────────────────────────────────────────────
def upsert_topic(cur, topic, engine, intro, items):
    cur.execute("""
        INSERT INTO movie_topics (slug, title, category, intro, emoji, color, source, is_published, sort_order, updated_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, now())
        ON CONFLICT (slug) DO UPDATE SET
          title=EXCLUDED.title, category=EXCLUDED.category, intro=EXCLUDED.intro,
          emoji=EXCLUDED.emoji, color=EXCLUDED.color, source=EXCLUDED.source,
          sort_order=EXCLUDED.sort_order, updated_at=now()
        RETURNING id;
    """, (topic["slug"], topic["title"], topic.get("category") or "best-of", intro or None,
          topic.get("emoji") or "🎬", topic.get("color") or "#7c3aed", engine,
          topic.get("is_published", True), topic.get("sort_order") or 100))
    tid = cur.fetchone()[0]
    cur.execute("DELETE FROM movie_topic_items WHERE topic_id=%s", (tid,))
    for pos, it in enumerate(items):
        cur.execute("""INSERT INTO movie_topic_items (topic_id, tmdb_id, title, year, blurb, position, poster_path, backdrop_path)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (tid, it["tmdb_id"], it["title"], it.get("year") or None,
                     (it.get("blurb") or None), pos, it.get("poster_path"), it.get("backdrop_path")))
    return tid, len(items)

# ── modes ─────────────────────────────────────────────────────────────────────
def mode_draft(topic_json):
    """Curate one topic, print JSON, do NOT save. Used by the admin 'preview' step."""
    topic = json.loads(topic_json)
    engine, intro, items = curate(topic)
    print(json.dumps({"ok": True, "engine": engine, "intro": intro, "films": items}, ensure_ascii=False))

def mode_save(topic_json):
    """Save a topic. If 'films' provided (edited list), use it as-is; else curate fresh."""
    topic = json.loads(topic_json)
    if not topic.get("slug"):
        topic["slug"] = slugify(topic.get("title"))
    films = topic.get("films")
    if films:
        engine = topic.get("source") or detect_engine(topic)
        intro = (topic.get("intro") or "").strip()
        # normalise the edited list to the item shape
        items = []
        for f in films:
            if not f.get("tmdb_id") or not f.get("poster_path"):
                continue
            items.append({"tmdb_id": f["tmdb_id"], "title": f.get("title"),
                          "year": f.get("year"), "blurb": (f.get("blurb") or "").strip(),
                          "poster_path": f.get("poster_path"), "backdrop_path": f.get("backdrop_path")})
    else:
        engine, intro, items = curate(topic)
    conn = psycopg2.connect(DB_DSN); conn.autocommit = False
    cur = conn.cursor()
    try:
        tid, n = upsert_topic(cur, topic, engine, intro, items)
        conn.commit()
        cur.execute("NOTIFY pgrst, 'reload schema'"); conn.commit()
        print(json.dumps({"ok": True, "id": tid, "slug": topic["slug"], "engine": engine, "count": n}, ensure_ascii=False))
    except Exception as e:
        conn.rollback()
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
    finally:
        cur.close(); conn.close()

def mode_refresh_live():
    """Weekly cron: re-curate every published topic whose source is 'live'."""
    conn = psycopg2.connect(DB_DSN); conn.autocommit = False
    cur = conn.cursor()
    # intro must be selected too -- curate_live() only ever passes through
    # whatever intro is already on the topic (it never regenerates one), so
    # omitting it here made every weekly refresh blank the stored intro text.
    cur.execute("SELECT slug, title, category, emoji, color, source, sort_order, intro FROM movie_topics WHERE source='live' AND is_published=true")
    rows = cur.fetchall()
    done = 0
    for (slug, title, category, emoji, color, source, sort_order, intro) in rows:
        topic = {"slug": slug, "title": title, "category": category, "emoji": emoji,
                 "color": color, "source": "live", "sort_order": sort_order, "intro": intro}
        try:
            engine, intro, items = curate(topic)
            upsert_topic(cur, topic, "live", intro, items)
            conn.commit()
            done += 1
            print(f"  ✓ refreshed {slug}: {len(items)} films")
        except Exception as e:
            conn.rollback()
            print(f"  ✗ {slug}: {e}")
    if done:
        cur.execute("NOTIFY pgrst, 'reload schema'"); conn.commit()
    cur.close(); conn.close()
    print(f"refreshed {done} live topics.")

def mode_builtin():
    assert ANTHROPIC_KEY and TMDB_KEY, "missing keys"
    conn = psycopg2.connect(DB_DSN); conn.autocommit = False
    cur = conn.cursor()
    for t in TOPICS:
        try:
            engine, intro, items = curate(t)
            tid, n = upsert_topic(cur, t, engine, intro, items)
            conn.commit()
            print(f"  ✓ {t['slug']}: {n} films (id {tid})")
        except Exception as e:
            conn.rollback()
            print(f"  ✗ {t['slug']}: {e}")
    cur.execute("NOTIFY pgrst, 'reload schema'"); conn.commit()
    cur.close(); conn.close()
    print("done.")

def main():
    assert TMDB_KEY, "missing TMDB key"
    args = sys.argv[1:]
    if not args:
        mode_builtin()
    elif args[0] == "--draft" and len(args) > 1:
        mode_draft(args[1])
    elif args[0] == "--save" and len(args) > 1:
        mode_save(args[1])
    elif args[0] == "--refresh-live":
        mode_refresh_live()
    else:
        print(json.dumps({"ok": False, "error": "usage: --draft <json> | --save <json> | --refresh-live"}))
        sys.exit(2)

if __name__ == "__main__":
    main()
