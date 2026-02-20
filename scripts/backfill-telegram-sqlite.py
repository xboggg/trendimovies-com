#!/usr/bin/env python3
"""
Backfill older Telegram channel messages into SQLite database
Deploy this to 38.242.195.0 and run to index messages before message_id 57635

The SQLite database currently starts at message_id 57,635
This script fetches messages from 1 to 57,634 and inserts them

Requirements:
  pip install telethon aiosqlite

Usage:
  python3 backfill-telegram-sqlite.py --check      # Check status only
  python3 backfill-telegram-sqlite.py --dry-run    # Show what would be indexed
  python3 backfill-telegram-sqlite.py --live       # Actually index

Deploy to: /opt/trendimovies/bot/backfill-telegram-sqlite.py
"""

import os
import sys
import asyncio
import sqlite3
import argparse
import re
from datetime import datetime
from pathlib import Path

# Configuration - UPDATE THESE VALUES
SQLITE_DB = '/opt/trendimovies/bot/database/movies.db'
CHANNEL_ID = -1001234567890  # UPDATE: Your Telegram channel ID
API_ID = 12345678            # UPDATE: Your Telegram API ID
API_HASH = 'your_api_hash'   # UPDATE: Your Telegram API hash

# File patterns to index
VIDEO_EXTENSIONS = {'.mkv', '.mp4', '.avi', '.webm', '.mov', '.wmv', '.flv'}
SUBTITLE_EXTENSIONS = {'.srt', '.sub', '.ass', '.ssa', '.vtt'}

def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)

def extract_quality(filename):
    """Extract quality from filename"""
    lower = filename.lower()
    if '2160p' in lower or '4k' in lower:
        return '2160p'
    if '1080p' in lower:
        return '1080p'
    if '720p' in lower:
        return '720p'
    if 'hdrip' in lower:
        return 'hdrip'
    if 'bdrip' in lower or 'bluray' in lower:
        return 'bluray'
    if 'webrip' in lower or 'web-dl' in lower:
        return 'webrip'
    return ''

def extract_year(filename):
    """Extract year from filename"""
    # Look for year in common patterns like Movie.Title.2024.Quality
    match = re.search(r'[.\-_\s](19|20\d{2})[.\-_\s]', filename)
    if match:
        year = int(match.group(1) + match.group(0)[-3:-1])
        if 1900 <= year <= 2030:
            return year
    return None

def is_series(filename):
    """Check if file is a TV series episode"""
    lower = filename.lower()
    # Common series patterns: S01E01, Season 1 Episode 1, 1x01
    patterns = [
        r's\d{1,2}e\d{1,2}',
        r'season\s*\d+',
        r'\d{1,2}x\d{1,2}',
        r'episode\s*\d+',
        r'ep\s*\d+',
    ]
    for pattern in patterns:
        if re.search(pattern, lower):
            return 1
    return 0

def get_db_status(db_path):
    """Get current database status"""
    if not os.path.exists(db_path):
        return None

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM movies')
    total = cursor.fetchone()[0]

    cursor.execute('SELECT MIN(message_id), MAX(message_id) FROM movies')
    min_id, max_id = cursor.fetchone()

    conn.close()
    return {'total': total, 'min_id': min_id or 0, 'max_id': max_id or 0}

def search_movie(db_path, title):
    """Search for a movie in the database"""
    if not os.path.exists(db_path):
        return []

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    search_term = f'%{title}%'
    cursor.execute(
        'SELECT message_id, file_name, quality, file_size FROM movies WHERE file_name LIKE ? ORDER BY message_id LIMIT 10',
        (search_term,)
    )
    results = cursor.fetchall()
    conn.close()
    return results

async def backfill_messages(args):
    """Main backfill function"""
    try:
        from telethon import TelegramClient
        from telethon.tl.types import MessageMediaDocument
    except ImportError:
        log("ERROR: telethon not installed. Run: pip install telethon")
        sys.exit(1)

    status = get_db_status(SQLITE_DB)
    if not status:
        log(f"ERROR: Database not found at {SQLITE_DB}")
        sys.exit(1)

    log(f"Current database status:")
    log(f"  Total files: {status['total']:,}")
    log(f"  Message ID range: {status['min_id']:,} to {status['max_id']:,}")
    log(f"  Missing: 1 to {status['min_id'] - 1:,}")

    # Search for "Let Us Prey"
    log("")
    log("Searching for 'Let Us Prey':")
    results = search_movie(SQLITE_DB, 'Let Us Prey')
    if results:
        for r in results:
            log(f"  [{r[0]}] {r[1]} ({r[2]}, {r[3]} bytes)")
    else:
        log("  Not found in database")

    if args.check:
        log("")
        log("Check complete. Run with --live to backfill.")
        return

    min_id = status['min_id']
    target_start = 1
    target_end = min_id - 1

    if target_end <= 0:
        log("No messages to backfill - database already starts at 1")
        return

    log("")
    log(f"Will fetch messages {target_start:,} to {target_end:,} ({target_end:,} messages)")

    if args.dry_run:
        log("")
        log("DRY RUN - No changes will be made")
        log("Run with --live to actually backfill")
        return

    # Connect to Telegram
    log("")
    log("Connecting to Telegram...")

    session_path = Path(SQLITE_DB).parent / 'backfill_session'
    client = TelegramClient(str(session_path), API_ID, API_HASH)

    await client.start()
    log("Connected!")

    # Get channel entity
    try:
        channel = await client.get_entity(CHANNEL_ID)
        log(f"Channel: {channel.title}")
    except Exception as e:
        log(f"ERROR: Could not get channel: {e}")
        log("Make sure CHANNEL_ID is correct")
        await client.disconnect()
        return

    # Open database connection
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()

    # Process messages in batches
    indexed = 0
    skipped = 0
    batch_size = 100

    log("")
    log(f"Fetching messages from {target_start} to {target_end}...")

    try:
        # Iterate through messages starting from oldest
        async for message in client.iter_messages(
            channel,
            min_id=target_start - 1,  # inclusive
            max_id=target_end + 1,    # inclusive
            reverse=True              # oldest first
        ):
            if not message.media or not hasattr(message.media, 'document'):
                continue

            doc = message.media.document
            if not doc:
                continue

            # Get filename from attributes
            filename = None
            for attr in doc.attributes:
                if hasattr(attr, 'file_name'):
                    filename = attr.file_name
                    break

            if not filename:
                skipped += 1
                continue

            # Check if it's a video or subtitle
            ext = Path(filename).suffix.lower()
            if ext not in VIDEO_EXTENSIONS and ext not in SUBTITLE_EXTENSIONS:
                skipped += 1
                continue

            # Prepare data for insertion
            file_data = {
                'message_id': message.id,
                'file_id': str(doc.id),
                'file_name': filename,
                'file_size': doc.size,
                'quality': extract_quality(filename),
                'year': extract_year(filename),
                'is_series': is_series(filename),
                'created_at': message.date.isoformat() if message.date else None,
            }

            # Insert into database
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO movies
                    (message_id, file_id, file_name, file_size, quality, year, is_series, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    file_data['message_id'],
                    file_data['file_id'],
                    file_data['file_name'],
                    file_data['file_size'],
                    file_data['quality'],
                    file_data['year'],
                    file_data['is_series'],
                    file_data['created_at'],
                ))
                indexed += 1
            except sqlite3.IntegrityError:
                skipped += 1  # Already exists

            # Progress log
            if indexed % batch_size == 0:
                conn.commit()
                log(f"  Progress: {indexed:,} indexed, {skipped:,} skipped (at msg {message.id})")

    except Exception as e:
        log(f"ERROR during backfill: {e}")

    # Final commit
    conn.commit()
    conn.close()

    await client.disconnect()

    log("")
    log("=== BACKFILL COMPLETE ===")
    log(f"Indexed: {indexed:,}")
    log(f"Skipped: {skipped:,}")

    # Check new status
    new_status = get_db_status(SQLITE_DB)
    log("")
    log("New database status:")
    log(f"  Total files: {new_status['total']:,}")
    log(f"  Message ID range: {new_status['min_id']:,} to {new_status['max_id']:,}")

def main():
    parser = argparse.ArgumentParser(description='Backfill older Telegram messages into SQLite')
    parser.add_argument('--check', action='store_true', help='Check status only')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done')
    parser.add_argument('--live', action='store_true', help='Actually backfill')
    args = parser.parse_args()

    if not args.check and not args.dry_run and not args.live:
        parser.print_help()
        log("")
        log("Please specify --check, --dry-run, or --live")
        sys.exit(1)

    log("Telegram SQLite Backfill Script")
    log(f"Mode: {'CHECK' if args.check else 'DRY-RUN' if args.dry_run else 'LIVE'}")
    log("")

    # Check configuration
    if CHANNEL_ID == -1001234567890 or API_ID == 12345678:
        log("WARNING: Default configuration detected!")
        log("Please update CHANNEL_ID, API_ID, and API_HASH in the script")
        if args.live:
            log("Cannot run in LIVE mode with default configuration")
            sys.exit(1)

    asyncio.run(backfill_messages(args))

if __name__ == '__main__':
    main()
