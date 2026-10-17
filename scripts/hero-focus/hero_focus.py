# -*- coding: utf-8 -*-
"""Phone crop focus for homepage hero backdrops (2026-10-17).

On a phone the hero shows a landscape backdrop with object-fit: cover in a
tall box, i.e. only ~25% of the picture's width. With a centred crop the
people in Practical Magic 2, Carrie, Crystal Lake, VisionQuest... fell
outside the window. This finds the people and stores, per backdrop, the
horizontal crop position that keeps them in frame.

Detection, on the w780 backdrop:
  1. faces  -- OpenCV YuNet (face_detection_yunet_2023mar.onnx), score>=0.8
  2. bodies -- OpenCV HOG people detector, only when no face is found
  3. nothing found -> no entry; the slide keeps its centred crop
Choice: the window (WINDOW = visible fraction of the width on a phone) that
covers the most face/body area (weighted by score), then centred on the
weighted centre of what it covers, clamped to the image. When two people
cannot both fit (Practical Magic 2), the larger/clearer one wins.

Hero list: what index.astro builds -- top 8 trending movies + top 4
trending series (TMDB, week) -- taking a few extra so slides that rotate
in during the day are already done, plus any /images/ backdrop override
from our DB for those ids. Results accumulate in OUT (keyed by backdrop
path); existing entries are not recomputed.

  --preview  also writes crop previews to /root/logo_v2/hero_focus_preview/
"""
import io
import json
import os
import re
import sys
import time
import urllib.request

import cv2
import numpy as np

HERE = "/opt/trendimovies/hero-focus"
OUT = "/var/www/trendimovies/.cache/hero-focus.json"
MODEL = os.path.join(HERE, "face_detection_yunet_2023mar.onnx")
YOLOX_MODEL = os.path.join(HERE, "yolox_s.onnx")      # opencv_zoo object_detection_yolox_2022nov
VERSION = 2   # 1 = faces + HOG; 2 = + YOLOX people. Older entries are recomputed.
sys.path.insert(0, HERE)
import yolox_people  # noqa: E402
PREVIEW = "/root/logo_v2/hero_focus_preview"
WINDOW = 412 / 915 / (16 / 9)        # visible fraction of width on a 412x915 phone (~0.25)
POSTGREST = "http://127.0.0.1:3001"
KEEP_CENTRE_SHARE = 0.5   # a "main" face is at least half the weight of the biggest one
K = re.search(r"[a-f0-9]{32}", open("/opt/trendimovies/bot/trendimovies_cron.py").read()).group(0)


def get_json(url):
    return json.load(urllib.request.urlopen(url, timeout=20))


def hero_candidates():
    m = get_json("https://api.themoviedb.org/3/trending/movie/week?api_key=%s" % K)["results"][:12]
    t = get_json("https://api.themoviedb.org/3/trending/tv/week?api_key=%s" % K)["results"][:6]
    out = [(x["id"], x.get("title"), x.get("backdrop_path")) for x in m] + \
          [(x["id"], x.get("name"), x.get("backdrop_path")) for x in t]
    try:   # same override rule as index.astro (movies table, /images/ paths)
        ids = ",".join(str(i) for i, _, _ in out)
        for r in get_json("%s/movies?tmdb_id=in.(%s)&backdrop_path=like./images/*&select=tmdb_id,backdrop_path"
                          % (POSTGREST, ids)):
            title = next((n for i, n, _ in out if i == r["tmdb_id"]), "")
            out.append((r["tmdb_id"], title + " [override]", r["backdrop_path"]))
    except Exception as e:  # noqa: BLE001
        print("override lookup failed:", e)
    return [(i, n, p) for i, n, p in out if p]


def load_image(path):
    url = ("https://trendimovies.com" + path) if path.startswith("/images/") else \
          "https://image.tmdb.org/t/p/w780" + path
    req = urllib.request.Request(url, headers={"User-Agent": "TrendiOps-Monitor/1.0 (b0c1ef67b9618b2b)"})
    data = np.frombuffer(urllib.request.urlopen(req, timeout=30).read(), np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def detect(img):
    """[(x_centre_frac, width_frac, weight)], method"""
    h, w = img.shape[:2]
    det = cv2.FaceDetectorYN.create(MODEL, "", (w, h), score_threshold=0.8)
    _, faces = det.detect(img)
    boxes = []
    if faces is not None:
        for f in faces:
            x, y, bw, bh, score = f[0], f[1], f[2], f[3], f[-1]
            if bw * bh < (w * h) * 0.0004:     # ignore specks
                continue
            boxes.append(((x + bw / 2) / w, bw / w, float(bw * bh * score)))
    if boxes:
        return boxes, "faces"
    # Masked/turned-away people have no detectable face (Spider-Man): find
    # whole PEOPLE with YOLOX. A body is usually wider than the phone window,
    # so it is represented by its central core (at most 60% of the window).
    try:
        for x1, y1, x2, y2, score in yolox_people.people(img, YOLOX_MODEL, conf=0.5):
            bw = (x2 - x1) / w
            if (y2 - y1) < h * 0.25:            # only sizeable people, not crowds in the distance
                continue
            boxes.append((((x1 + x2) / 2) / w, min(bw, WINDOW * 0.6), float(bw * (y2 - y1) / h * score)))
    except Exception as e:  # noqa: BLE001
        print("    yolox failed:", e)
    if boxes:
        return boxes, "people"
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    rects, weights = hog.detectMultiScale(img, winStride=(8, 8), padding=(8, 8), scale=1.05)
    for (x, y, bw, bh), wt in zip(rects, np.ravel(weights) if len(rects) else []):
        if wt < 0.5 or bh < h * 0.25:          # only clear, sizeable people
            continue
        boxes.append(((x + bw / 2) / w, bw / w, float(bw * bh * wt)))
    return boxes, ("bodies" if boxes else "none")


def choose_centre(boxes):
    half = WINDOW / 2

    def covered(c):
        tot, cx = 0.0, 0.0
        for xc, bw, wt in boxes:
            lo, hi = max(xc - bw / 2, c - half), min(xc + bw / 2, c + half)
            frac = max(0.0, hi - lo) / bw if bw > 0 else 0.0
            tot += wt * frac
            cx += wt * frac * xc
        return tot, (cx / tot if tot else c)

    cands = {min(max(xc, half), 1 - half) for xc, _, _ in boxes}
    for a in boxes:
        for b in boxes:
            cands.add(min(max((a[0] + b[0]) / 2, half), 1 - half))
    best = max(cands, key=lambda c: (covered(c)[0], -abs(c - 0.5)))
    # Don't move a slide that already works: if the centred crop already shows
    # a WHOLE main face (one at least half the size of the biggest), keep it.
    # Tenzing and Street Fighter have people across the frame and keep their
    # centre; Crystal Lake's centre cuts the face in half, so it moves.
    biggest = max(wt for _, _, wt in boxes)
    for xc, bw, wt in boxes:
        if wt >= KEEP_CENTRE_SHARE * biggest and xc - bw / 2 >= 0.5 - half and xc + bw / 2 <= 0.5 + half:
            return None
    centre = covered(best)[1]
    return min(max(centre, half), 1 - half)


def to_object_position(centre):
    """object-position x% for a window centred at `centre` (fraction of width)."""
    return round(float((centre - WINDOW / 2) / (1 - WINDOW) * 100), 1)


def main():
    preview = "--preview" in sys.argv
    cache = {}
    if os.path.exists(OUT):
        try:
            cache = json.load(open(OUT))
        except Exception:  # noqa: BLE001
            cache = {}
    if preview:
        os.makedirs(PREVIEW, exist_ok=True)
    changed = False
    for tid, title, path in hero_candidates():
        if path in cache and cache[path].get("v", 1) >= VERSION and not preview:
            continue
        try:
            img = load_image(path)
        except Exception as e:  # noqa: BLE001
            print("  skip %s %s: %s" % (tid, title, e))
            continue
        boxes, method = detect(img)
        entry = {"tmdb_id": tid, "title": title, "method": method, "n": len(boxes), "v": VERSION,
                 "computed": time.strftime("%Y-%m-%d %H:%M")}
        if boxes:
            c = choose_centre(boxes)
            if c is not None:
                entry["x"] = to_object_position(c)
            else:
                entry["kept"] = "centre already shows them"
        cache[path] = entry
        changed = True
        print("  %-8s %-34s %-6s n=%-2d x=%s" % (tid, (title or "")[:34], method, len(boxes), entry.get("x", "centre")))
        if preview:
            h, w = img.shape[:2]
            c = (entry["x"] / 100 * (1 - WINDOW) + WINDOW / 2) if "x" in entry else 0.5
            for xc, bw, _ in boxes:
                cv2.rectangle(img, (int((xc - bw / 2) * w), 5), (int((xc + bw / 2) * w), h - 5), (0, 255, 255), 1)
            x0 = int((0.5 - WINDOW / 2) * w)
            cv2.rectangle(img, (x0, 0), (x0 + int(WINDOW * w), h - 1), (0, 0, 255), 2)        # old: red
            x1 = int((c - WINDOW / 2) * w)
            cv2.rectangle(img, (x1, 2), (x1 + int(WINDOW * w), h - 3), (0, 255, 0), 3)        # new: green
            name = re.sub(r"[^A-Za-z0-9]+", "_", title or str(tid))[:30]
            cv2.imwrite(os.path.join(PREVIEW, "%s.jpg" % name), img, [cv2.IMWRITE_JPEG_QUALITY, 80])
    if changed:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        tmp = OUT + ".tmp"
        json.dump(cache, open(tmp, "w"), indent=1)
        os.replace(tmp, OUT)
        print("written", OUT, len(cache), "entries")
    else:
        print("nothing new")


if __name__ == "__main__":
    main()
