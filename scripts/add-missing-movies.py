#!/usr/bin/env python3
"""Add missing movies to the database by fetching from TMDB"""
import requests
import json
import re
import sys
from datetime import datetime

POSTGREST = "http://localhost:3001"
TMDB_API_KEY = "46300aaf372203a94763f1f46846e843"
TMDB_BASE = "https://api.themoviedb.org/3"

def generate_slug(title, year=None):
    if not title:
        return "untitled"
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    if year:
        slug = f"{slug}-{year}"
    return slug

def get_movie_from_tmdb(tmdb_id):
    try:
        resp = requests.get(
            f"{TMDB_BASE}/movie/{tmdb_id}",
            params={"api_key": TMDB_API_KEY},
            timeout=10
        )
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    return None

def add_movie_to_db(movie_data):
    release_date = movie_data.get("release_date") or ""
    year = release_date[:4] if len(release_date) >= 4 else None
    title = movie_data.get("title", "")

    payload = {
        "tmdb_id": movie_data["id"],
        "title": title,
        "slug": generate_slug(title, year),
        "original_title": movie_data.get("original_title", ""),
        "overview": movie_data.get("overview", ""),
        "release_date": movie_data.get("release_date") or None,
        "year": int(year) if year else None,
        "poster_path": movie_data.get("poster_path"),
        "backdrop_path": movie_data.get("backdrop_path"),
        "vote_average": movie_data.get("vote_average", 0),
        "vote_count": movie_data.get("vote_count", 0),
        "popularity": movie_data.get("popularity", 0),
        "runtime": movie_data.get("runtime"),
        "status": movie_data.get("status"),
        "tagline": movie_data.get("tagline"),
        "original_language": movie_data.get("original_language"),
        "has_downloads": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    payload = {k: v for k, v in payload.items() if v is not None}

    try:
        resp = requests.post(
            f"{POSTGREST}/movies",
            json=payload,
            headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
            timeout=10
        )
        return resp.status_code in [200, 201, 204]
    except:
        return False

def main():
    batch_size = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    
    print("Fetching download_links content_ids...", flush=True)
    resp = requests.get(f"{POSTGREST}/download_links?content_type=eq.movie&select=content_id")
    link_ids = set(l["content_id"] for l in resp.json())
    print(f"Found {len(link_ids)} unique movie content_ids in download_links", flush=True)

    print("Fetching existing movies...", flush=True)
    resp = requests.get(f"{POSTGREST}/movies?select=tmdb_id")
    existing_ids = set(m["tmdb_id"] for m in resp.json())
    print(f"Found {len(existing_ids)} existing movies", flush=True)

    missing_ids = link_ids - existing_ids
    print(f"Missing movies: {len(missing_ids)}", flush=True)

    if not missing_ids:
        print("No missing movies!", flush=True)
        return

    missing_list = sorted(list(missing_ids))[:batch_size]
    print(f"\nAdding {len(missing_list)} missing movies...", flush=True)

    added = 0
    failed = 0
    for i, tmdb_id in enumerate(missing_list):
        if i % 100 == 0:
            print(f"[{i}/{len(missing_list)}] Processing... (added {added}, failed {failed})", flush=True)

        movie = get_movie_from_tmdb(tmdb_id)
        if not movie:
            failed += 1
            continue

        if add_movie_to_db(movie):
            added += 1
        else:
            failed += 1

    print(f"\nDone! Added {added}, Failed {failed}, Remaining: {len(missing_ids) - added}", flush=True)

if __name__ == "__main__":
    main()
