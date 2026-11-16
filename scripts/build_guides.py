#!/usr/bin/env python3
"""
Hand-picked headline guides.  Usage (as the postgres user):
  build_guides.py <data.py>            check every film against TMDB and print a report (saves nothing)
  build_guides.py <data.py> --save     the same, then save the guides as HIDDEN drafts (is_published = false)

Every film must match TMDB on title AND year, have a poster, and pass the guide's rules:
  min_votes   : at least this many TMDB votes (keeps out obscure or wrong matches)
  max_runtime : runtime in minutes must not be longer
  country     : ISO country code must be among the film's production countries
No AI is used, so there is no per-guide cost.
"""
import importlib.util
import re
import sys
import time

import psycopg2
import requests

spec = importlib.util.spec_from_file_location("ct", "/opt/trendimovies/topics/curate_topics.py")
ct = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ct)
TMDB, KEY = ct.TMDB, ct.TMDB_KEY


def norm(t):
    t = (t or "").lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]+", " ", t).strip()


def get(path, **params):
    params["api_key"] = KEY
    for _ in range(3):
        try:
            r = requests.get(f"{TMDB}{path}", params=params, timeout=15)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        time.sleep(0.4)
    return {}


def resolve(title, year):
    """Best TMDB match with the same title and a release year within 1 of the one given."""
    seen, cands = set(), []
    for params in ({"primary_release_year": year}, {"primary_release_year": year - 1},
                   {"primary_release_year": year + 1}, {}):
        for m in get("/search/movie", query=title, **params).get("results", []):
            if m["id"] in seen:
                continue
            seen.add(m["id"])
            y = int((m.get("release_date") or "0")[:4] or 0)
            if abs(y - year) > 1:
                continue
            names = {norm(m.get("title")), norm(m.get("original_title"))}
            if norm(title) in names:
                cands.append((m.get("vote_count") or 0, m))
        if cands:
            break
    if not cands:
        return None
    cands.sort(key=lambda x: -x[0])
    return cands[0][1]


def lead_number(title, default=20):
    m = re.match(r"\s*(\d+)\s", title)
    return int(m.group(1)) if m else default


def check(guide):
    rules = guide.get("rules", {})
    want = lead_number(guide["title"])
    kept, dropped = [], []
    for (title, year, blurb) in guide["films"]:
        m = resolve(title, year)
        if not m:
            dropped.append((title, year, "no TMDB match with that title and year"))
            continue
        d = get(f"/movie/{m['id']}")
        why = None
        votes = d.get("vote_count") or 0
        runtime = d.get("runtime") or 0
        countries = [c.get("iso_3166_1") for c in d.get("production_countries", [])]
        if not d.get("poster_path"):
            why = "no poster"
        elif d.get("adult"):
            why = "adult"
        elif votes < rules.get("min_votes", 300):
            why = f"only {votes} votes"
        elif rules.get("max_runtime") and (not runtime or runtime > rules["max_runtime"]):
            why = f"runtime {runtime} min is over {rules['max_runtime']}"
        elif rules.get("country") and rules["country"] not in countries:
            why = f"not made in {rules['country']} (countries: {','.join(countries) or '-'})"
        if why:
            dropped.append((title, year, why))
            continue
        kept.append({"tmdb_id": d["id"], "title": d.get("title"), "year": int((d.get("release_date") or "0")[:4] or 0),
                     "blurb": blurb, "poster_path": d.get("poster_path"), "backdrop_path": d.get("backdrop_path"),
                     "_runtime": runtime, "_votes": votes, "_avg": d.get("vote_average"), "_asked": title})
        time.sleep(0.05)
    return want, kept, dropped


def main():
    data_path = sys.argv[1]
    save = "--save" in sys.argv
    s = importlib.util.spec_from_file_location("data", data_path)
    data = importlib.util.module_from_spec(s)
    s.loader.exec_module(data)

    conn = psycopg2.connect(ct.DB_DSN) if save else None
    for g in data.GUIDES:
        want, kept, dropped = check(g)
        final = kept[:want]
        print("=" * 78)
        print(f"{g['title']}   [{g['slug']}]   keep {len(final)} of {want} wanted")
        for i, k in enumerate(final, 1):
            flag = "" if norm(k["title"]) == norm(k["_asked"]) else f"   <-- matched as '{k['title']}'"
            print(f"  {i:2d}. {k['title']} ({k['year']})  {k['_runtime']}min  {k['_votes']} votes  {k['_avg']:.1f}{flag}")
        extra = kept[want:]
        if extra:
            print("  spare (not used): " + "; ".join(f"{k['title']} ({k['year']})" for k in extra))
        if dropped:
            print("  DROPPED:")
            for (t, y, why) in dropped:
                print(f"     - {t} ({y}): {why}")
        if len(final) < min(want, 12):
            print("  !! TOO FEW FILMS, not saved")
            continue
        if save:
            cur = conn.cursor()
            cur.execute("SELECT is_published FROM movie_topics WHERE slug=%s", (g["slug"],))
            row = cur.fetchone()
            if row and row[0]:
                print("  (already published, left alone)")
                continue
            topic = {"slug": g["slug"], "title": g["title"], "category": g["category"], "emoji": g["emoji"],
                     "color": g["color"], "sort_order": g["sort_order"], "is_published": False}
            items = [{k2: v for k2, v in it.items() if not k2.startswith("_")} for it in final]
            ct.upsert_topic(cur, topic, "manual", g["intro"], items)
            conn.commit()
            print("  saved as hidden draft")
    if conn:
        cur = conn.cursor()
        cur.execute("NOTIFY pgrst, 'reload schema'")
        conn.commit()


if __name__ == "__main__":
    main()
