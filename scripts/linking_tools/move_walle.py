# -*- coding: utf-8 -*-
"""WALL-E (2008): the site's links sit on movie 32200 = TMDB 1631542, a DUPLICATE TMDB entry of the same film. Move them to the real
film (TMDB 10681). Each file is probed first (running time must be 90-105 min = WALL-E's 98 min; audio recorded in the file is printed).
Old link rows are switched off (is_active=false), never deleted; a CSV backup is written first.

    python3 move_walle.py plan | run
"""
import csv
import re
import sys

sys.path.insert(0, "/opt/trendimovies/bot")
import trendimovies_cron as c
import file_probe as FP

DO = (sys.argv[1] if len(sys.argv) > 1 else "plan") == "run"
WRONG, TMDB_ID = 32200, 10681

links = c.run_postgres("SELECT id, quality, language, language_tag, file_size, url FROM download_links WHERE content_type='movie' AND content_id=%d AND is_active ORDER BY quality" % WRONG)
print("active links on the duplicate entry:", len(links))
todo = []
for l in links:
    lid, q, lang, tag, size, url = (l.split("|") + [""] * 6)[:6]
    m = re.search(r"/stream/(\d+)", url)
    if not m:
        print("  cannot read file id from", url)
        sys.exit(1)
    fid = int(m.group(1))
    row = c.run_sqlite("SELECT file_name, file_size FROM movies WHERE id=%d" % fid)[0]
    size = int(row["file_size"] or 0)            # real size in bytes from the catalogue (the link row stores text like "779 MB")
    f = FP.probe_facts(str(fid))
    dur = round(f["duration_s"] / 60) if f["duration_s"] else None
    ok = bool(dur and 90 <= dur <= 105)
    print("  link %s %-6s file %s %s  probe %sx%s %s min audio=%s  -> %s" % (lid, q, fid, row["file_name"][:60], f["width"], f["height"], dur, ",".join(f["audio_langs"]), "WALL-E confirmed" if ok else "NOT CONFIRMED"))
    if not ok:
        print("STOP: a file is not confirmed as WALL-E")
        sys.exit(1)
    todo.append((int(lid), fid, q, lang, (tag or None), size))

if not DO:
    print("plan only: would create TMDB %d if missing, link these %d files to it, switch off the %d old links" % (TMDB_ID, len(todo), len(todo)))
    sys.exit(0)

with open("/root/logo_v2/wall_e_links_before.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["link_id", "quality", "language", "language_tag", "file_size", "file_id"])
    for t in todo:
        w.writerow([t[0], t[2], t[3], t[4] or "", t[5], t[1]])
print("backup written: /root/logo_v2/wall_e_links_before.csv")

r = c.run_postgres_single("SELECT id FROM movies WHERE tmdb_id=%d" % TMDB_ID)
if r:
    mid = int(r)
else:
    orig = c.tmdb_search_movie
    c.tmdb_search_movie = lambda *a, _i=TMDB_ID, **k: {"id": _i}
    try:
        mid = int(c.auto_add_movie_from_tmdb("WALL-E", 2008))
    finally:
        c.tmdb_search_movie = orig
print("real WALL-E row id:", mid)
for lid, fid, q, lang, tag, size in todo:
    ok = c.insert_download_link("movie", mid, fid, size, q, lang, tag)
    print("  inserted %s file %s: %s" % (q, fid, ok))
    if ok:
        c.run_postgres("UPDATE download_links SET is_active=false WHERE id=%d AND content_id=%d" % (lid, WRONG))
left = c.run_postgres_single("SELECT count(*) FROM download_links WHERE content_type='movie' AND content_id=%d AND is_active" % WRONG)
if left == "0":
    c.run_postgres("UPDATE movies SET has_downloads=false WHERE id=%d" % WRONG)
c.update_has_downloads("movie", [mid])
print("links left on the duplicate:", left, "| real film has_downloads:", c.run_postgres_single("SELECT has_downloads FROM movies WHERE id=%d" % mid))
