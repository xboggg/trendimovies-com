# -*- coding: utf-8 -*-
"""READ ONLY. For each film: every candidate file in the catalogue, probed for real resolution, running time and audio languages."""
import json
import re
import sys

sys.path.insert(0, "/opt/trendimovies/bot")
import trendimovies_cron as c
import file_probe as FP

FILMS = {
    "Snow White and the Seven Dwarfs (1937)": dict(tmdb=408, rx=r"snow[\W_]*white[\W_]*(and|&)?[\W_]*(the)?[\W_]*(7|seven)[\W_]*dwarfs", bad=r"samurai|bears|bradys|\bs\d\de\d", years=("1937", "1938")),
    "101 Dalmatians (1961)": dict(tmdb=None, title_like="dalmatians", rx=r"(101|one[\W_]*hundred[\W_]*and[\W_]*one)[\W_]*dalmatians", bad=r"street|\bs\d\de\d|1996|2000|2003|2021|tamil", years=("1961",)),
    "Monster (2023)": dict(tmdb=None, title_like="monster", rx=r"monster", bad=r"\bs\d\de\d|high|inside|hunt|hotel|\bs\d\d\b|pocket|house|lumberjack|beast|trucks|\bep\d|island|\bu\.?s\b|inc|sea", years=("2023",)),
    "Witness for the Prosecution (1957)": dict(tmdb=37257, rx=r"witness[\W_]*for[\W_]*the[\W_]*prosecution", bad=r"castle|\bs\d\de\d", years=("1957",)),
    "Death Note Relight 1": dict(tmdb=None, title_like="relight", rx=r"relight|death[\W_]*note", bad=r"\bs\d\de\d|\be\d{2}\b", years=()),
    "WALL-E (2008)": dict(tmdb=10681, rx=r"wall[\W_]*e", bad=r"\bs\d\de\d", years=("2008",)),
}

only = sys.argv[1] if len(sys.argv) > 1 else None
for film, spec in FILMS.items():
    if only and only.lower() not in film.lower():
        continue
    print("=" * 100)
    print(film)
    key = re.sub(r"[^a-z0-9]", "", spec["rx"][:0]) or ""
    like = spec.get("title_like") or {"Snow White and the Seven Dwarfs (1937)": "dwarfs", "Witness for the Prosecution (1957)": "prosecution", "WALL-E (2008)": "wall"}.get(film, "dalmatians")
    rows = c.run_sqlite("SELECT id, file_name, file_size, quality FROM movies WHERE is_deleted=0 AND lower(file_name) LIKE '%%%s%%' AND file_name NOT LIKE '%%.srt' AND file_name NOT LIKE '%%.sub' ORDER BY id" % like)
    seen = 0
    for r in rows:
        n = r["file_name"]
        if not re.search(spec["rx"], n, re.I) or (spec.get("bad") and re.search(spec["bad"], n, re.I)):
            continue
        if spec["years"] and not any(y in n for y in spec["years"]) and film not in ("Death Note Relight 1",):
            continue
        seen += 1
        try:
            f = FP.probe_facts(str(r["id"]))
        except Exception as e:  # noqa: BLE001
            f = {"width": None, "height": None, "duration_s": None, "audio_langs": [], "tier": None, "how": "ERR %s" % str(e)[:40]}
        print("  %-9s %5d MB  name-q=%-6s probe=%sx%s %-5s %4s min  audio=%-18s %s" % (
            r["id"], round(int(r["file_size"] or 0) / 1e6), c.extract_quality_from_filename(n) or "-", f["width"], f["height"], f["tier"] or "-",
            round(f["duration_s"] / 60) if f["duration_s"] else "?", ",".join(f["audio_langs"])[:18], n[:70]))
    print("  candidates:", seen)
