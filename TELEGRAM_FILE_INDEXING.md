# TrendiMovies Telegram File Indexing System

## Overview

This document explains how files uploaded to Telegram become searchable in the TrendiMovies admin panel, with detailed scenarios and step-by-step explanations.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER WORKFLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Upload File to Telegram                                                │
│  ─────────────────────────────────                                              │
│  User uploads "A.Fathers.Miracle.2026.1080p.WEBRip.x264.mp4" to Telegram       │
│  Channel: TM2 File Database 1A (ID: -1002271215725)                            │
│  Time: INSTANT                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Auto-Indexer Detects New File (Server: 38.242.195.0)                  │
│  ─────────────────────────────────────────────────────────────                  │
│  Location: /opt/trendimovies/bot/auto_indexer.py                               │
│  Process: Polls Telegram channel every 30 seconds                               │
│  Action: Detects new message_id, extracts file metadata                        │
│  Time: 0-30 SECONDS (depends on poll timing)                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Metadata Extraction & Database Insert (Server: 38.242.195.0)          │
│  ─────────────────────────────────────────────────────────────────────          │
│  Database: /opt/trendimovies/bot/database/movies.db (SQLite)                   │
│                                                                                 │
│  Extracted Data:                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │ message_id:       1063088                                       │           │
│  │ file_name:        A.Fathers.Miracle.2026.1080p.WEBRip.x264.mp4 │           │
│  │ file_size:        2000412215 (1.86 GB)                         │           │
│  │ quality:          1080p                                         │           │
│  │ source:           WEBRip                                        │           │
│  │ year:             2026                                          │           │
│  │ clean_title:      A Fathers Miracle                             │           │
│  │ normalized_title: a fathers miracle                             │           │
│  │ added_date:       2026-02-20 05:32:28                          │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│  Time: ~1 SECOND                                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Admin Searches for File (Server: 144.91.71.106)                       │
│  ───────────────────────────────────────────────────────                        │
│  User goes to: https://trendimovies.com/admin/manual-assign                    │
│  User types: "a fathers miracle" in Telegram search box                        │
│  User clicks: Search button                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: API Endpoint Receives Request (Server: 144.91.71.106)                 │
│  ─────────────────────────────────────────────────────────────                  │
│  Endpoint: /api/admin/assign/search-telegram                                   │
│  File: /var/www/trendimovies/src/pages/api/admin/assign/search-telegram.ts    │
│  Request: GET /api/admin/assign/search-telegram?query=a%20fathers%20miracle   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: SSH Query to 38 Server (144 → 38)                                     │
│  ─────────────────────────────────────────                                      │
│  144 server executes SSH command to query 38 server's SQLite directly:         │
│                                                                                 │
│  Command:                                                                       │
│  ssh -p 2222 root@38.242.195.0 "sqlite3 -json                                    │
│      /opt/trendimovies/bot/database/movies.db                                  │
│      \"SELECT id, message_id, file_name, file_size, quality, year              │
│        FROM movies                                                              │
│        WHERE normalized_title LIKE '%a%fathers%miracle%'                       │
│        ORDER BY message_id DESC LIMIT 50\""                                    │
│                                                                                 │
│  Time: ~1-2 SECONDS (network latency)                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Results Returned to Admin UI                                          │
│  ────────────────────────────────────                                           │
│  JSON Response:                                                                 │
│  {                                                                              │
│    "files": [                                                                   │
│      {                                                                          │
│        "id": 1063088,                                                          │
│        "message_id": 1063088,                                                  │
│        "file_name": "A.Fathers.Miracle.2026.1080p.WEBRip.x264.mp4",           │
│        "file_size": "1.86 GB",                                                 │
│        "quality": "1080p",                                                     │
│        "year": 2026                                                            │
│      },                                                                         │
│      {                                                                          │
│        "id": 1063087,                                                          │
│        "message_id": 1063087,                                                  │
│        "file_name": "A.Fathers.Miracle.2026.720p.WEBRip.x264.mp4",            │
│        "file_size": "958 MB",                                                  │
│        "quality": "720p",                                                      │
│        "year": 2026                                                            │
│      }                                                                          │
│    ],                                                                           │
│    "source": "live"                                                            │
│  }                                                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 8: User Selects File and Assigns to Movie                                │
│  ──────────────────────────────────────────────                                 │
│  User selects the 1080p file from results                                      │
│  User searches TMDB for "A Father's Miracle"                                   │
│  User clicks "Assign Download Link"                                            │
│  Download link created in PostgreSQL database                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Servers & Their Roles

### Server 38.242.195.0 (Telegram Indexer Server)

| Property | Value |
|----------|-------|
| **SSH Port** | 2222 |
| **Primary Role** | Index files from Telegram into SQLite |
| **Database** | `/opt/trendimovies/bot/database/movies.db` |
| **Size** | ~900 MB, 800,000+ files |
| **Indexer Script** | `/opt/trendimovies/bot/auto_indexer.py` |
| **Poll Interval** | 30 seconds |
| **Process Manager** | PM2 |

**What runs on this server:**
```
┌────────────────────────────────────────────────────────────────┐
│  auto_indexer.py                                               │
│  ├── Connects to Telegram via Pyrogram (MTProto)              │
│  ├── Polls TM2 channel every 30 seconds                       │
│  ├── Detects new messages with video/document attachments     │
│  ├── Extracts metadata from filename:                         │
│  │   ├── Title (cleaned)                                      │
│  │   ├── Year (regex: 19xx or 20xx)                          │
│  │   ├── Quality (720p, 1080p, 2160p)                        │
│  │   ├── Source (BluRay, WEBRip, WEB-DL, HDRip)              │
│  │   └── File size                                            │
│  └── Inserts into SQLite database                             │
└────────────────────────────────────────────────────────────────┘
```

### Server 144.91.71.106 (Web Server)

| Property | Value |
|----------|-------|
| **SSH Port** | 22 |
| **Primary Role** | Host trendimovies.com website |
| **Site Path** | `/var/www/trendimovies/` |
| **Framework** | Astro (SSR mode) |
| **Process Manager** | PM2 (trendimovies-astro) |
| **Port** | 4000 |

**What runs on this server:**
```
┌────────────────────────────────────────────────────────────────┐
│  trendimovies-astro (PM2)                                      │
│  ├── Astro SSR application                                    │
│  ├── Public website: trendimovies.com                         │
│  ├── Admin panel: trendimovies.com/admin                      │
│  └── API endpoints:                                            │
│      ├── /api/admin/assign/search-telegram (→ SSH to 38)     │
│      ├── /api/admin/assign/search-tmdb (→ TMDB API)          │
│      └── /api/admin/assign/link (→ PostgreSQL)               │
└────────────────────────────────────────────────────────────────┘
```

---

## Detailed Scenario: Uploading "The Edge 2025"

### Scenario Timeline

```
TIME        EVENT
────────────────────────────────────────────────────────────────────────────
00:00:00    Edmund uploads "The.Edge.2025.1080p.WEB-DL.x265.mkv" to Telegram
            └── File appears in TM2 channel instantly
            └── Telegram assigns message_id: 1063100

00:00:15    Auto-indexer's last poll was 15 seconds ago
            └── File not yet detected
            └── NOT searchable in admin yet

00:00:30    Auto-indexer polls channel (every 30 sec)
            └── Detects new message_id 1063100
            └── Downloads file metadata (not the file itself)
            └── Extracts: title="The Edge", year=2025, quality="1080p"

00:00:31    Auto-indexer inserts into SQLite
            └── INSERT INTO movies (message_id, file_name, quality, year, ...)
            └── File now EXISTS in 38 server's database

00:00:35    Edmund opens admin/manual-assign
            └── Searches: "the edge 2025"
            └── API queries 38 server via SSH
            └── Returns: "The.Edge.2025.1080p.WEB-DL.x265.mkv"
            └── SUCCESS! File is searchable
────────────────────────────────────────────────────────────────────────────
TOTAL TIME: ~35 seconds from upload to searchable
```

### What Happens If Search Fails?

```
SCENARIO: Edmund searches but file not found
────────────────────────────────────────────────────────────────────────────

POSSIBLE CAUSE 1: Too early (file not indexed yet)
├── Solution: Wait 30 seconds and search again
└── The indexer polls every 30 seconds

POSSIBLE CAUSE 2: Auto-indexer not running
├── Check: ssh -p 2222 root@38.242.195.0 "ps aux | grep auto_indexer"
├── Fix: ssh -p 2222 root@38.242.195.0 "pm2 restart auto_indexer"
└── Then wait 30 seconds and search again

POSSIBLE CAUSE 3: Search term doesn't match
├── Filename: "The.Edge.2025.1080p.WEB-DL.x265.mkv"
├── normalized_title in DB: "the edge"
├── Searching "edge 2025" → WORKS
├── Searching "the edge" → WORKS
├── Searching "Edge movie" → MAY NOT WORK (word "movie" not in title)
└── Solution: Use keywords that appear in the actual filename

POSSIBLE CAUSE 4: SSH connection failed
├── Check: ssh -p 2222 root@38.242.195.0 "echo OK"
├── If fails: Network issue between 144 and 38 servers
└── Fix: Check firewall rules, server status
```

---

## Database Details

### SQLite Schema (38 server)

```sql
CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Core file info
    file_name TEXT NOT NULL,           -- Original Telegram filename
    file_id TEXT NOT NULL,             -- Telegram file_id for streaming
    message_id INTEGER NOT NULL,       -- Telegram message ID (unique)
    file_size INTEGER DEFAULT 0,       -- Size in bytes
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Extracted metadata
    clean_title TEXT,                  -- "The Edge" (human readable)
    normalized_title TEXT,             -- "the edge" (lowercase for search)
    title_keywords TEXT,               -- Search keywords
    year INTEGER,                      -- 2025
    quality TEXT,                      -- "1080p"
    source TEXT,                       -- "WEB-DL"
    codec TEXT,                        -- "x265"

    -- Quality scoring
    quality_score INTEGER,             -- Ranking score for sorting
    quality_bucket TEXT                -- "high", "medium", "low"
);

-- Full-text search index
CREATE VIRTUAL TABLE movies_fts USING fts5(
    clean_title,
    normalized_title,
    raw_title,
    title_keywords,
    file_name
);
```

### Sample Data

```
message_id | file_name                                          | quality | year | normalized_title
───────────┼────────────────────────────────────────────────────┼─────────┼──────┼──────────────────
1063088    | A.Fathers.Miracle.2026.1080p.WEBRip.x264.mp4      | 1080p   | 2026 | a fathers miracle
1063087    | A.Fathers.Miracle.2026.720p.WEBRip.x264.mp4       | 720p    | 2026 | a fathers miracle
1063085    | The.Edge.2025.1080p.WEB-DL.x265.mkv               | 1080p   | 2025 | the edge
65288      | Let Us Prey (2014) BluRay - 1080p.mkv             | 1080p   | 2014 | let us prey
65287      | Let Us Prey (2014) BluRay - 720p.mkv              | 720p    | 2014 | let us prey
```

---

## Search Algorithm

### How the Search Works

```
USER INPUT: "fathers miracle 2026"
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Clean & Normalize                                  │
│  ─────────────────────────                                  │
│  Input:  "fathers miracle 2026"                             │
│  Output: "fathers%miracle%2026"                             │
│  (lowercase, special chars removed, spaces → %)            │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Build SQL Query                                    │
│  ───────────────────────                                    │
│  SELECT id, message_id, file_name, file_size, quality, year │
│  FROM movies                                                 │
│  WHERE (normalized_title LIKE '%fathers%miracle%2026%'      │
│         OR file_name LIKE '%fathers%miracle%2026%')         │
│  AND file_name NOT LIKE '%.srt'   -- Exclude subtitles     │
│  ORDER BY message_id DESC         -- Newest first           │
│  LIMIT 50                                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Execute via SSH                                    │
│  ───────────────────────                                    │
│  144 server runs:                                           │
│  ssh -p 2222 root@38.242.195.0 "sqlite3 -json                │
│      /opt/trendimovies/bot/database/movies.db              │
│      \"<SQL QUERY>\""                                       │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Return Results                                     │
│  ──────────────────────                                     │
│  JSON array of matching files with:                         │
│  - message_id (for streaming URL)                          │
│  - file_name (display)                                      │
│  - file_size (formatted: "1.86 GB")                        │
│  - quality (720p, 1080p, etc.)                             │
│  - year                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Commands

### Check if file was indexed (run on 38 server)

```bash
# SSH to 38 server
ssh -p 2222 root@38.242.195.0

# Search for a specific file
sqlite3 /opt/trendimovies/bot/database/movies.db \
  "SELECT message_id, file_name, added_date FROM movies
   WHERE file_name LIKE '%keyword%'
   ORDER BY message_id DESC LIMIT 10"

# Check latest indexed files
sqlite3 /opt/trendimovies/bot/database/movies.db \
  "SELECT message_id, file_name, added_date FROM movies
   ORDER BY message_id DESC LIMIT 10"

# Check database stats
sqlite3 /opt/trendimovies/bot/database/movies.db \
  "SELECT COUNT(*) as total, MIN(message_id) as oldest, MAX(message_id) as newest FROM movies"
```

### Check auto-indexer status (run on 38 server)

```bash
# Is it running?
ps aux | grep auto_indexer

# Check PM2 status
pm2 status

# View indexer logs
pm2 logs auto_indexer --lines 50

# Restart if needed
pm2 restart auto_indexer
```

### Test search API (run on 144 server)

```bash
# Test the search endpoint
curl -s 'https://trendimovies.com/api/admin/assign/search-telegram?query=movie%20name'

# Test SSH connection to 38
ssh -p 2222 root@38.242.195.0 "echo 'Connection OK'"

# Check Astro server
pm2 status trendimovies-astro
pm2 logs trendimovies-astro --lines 20
```

---

## Configuration Files

### Auto-Indexer Config (38 server)

**File:** `/opt/trendimovies/bot/.env`
```env
API_ID=<telegram_api_id>
API_HASH=<telegram_api_hash>
BOT_TOKEN=<bot_token>
TM2_CHANNEL_ID=-1002271215725
TM2B_CHANNEL_ID=-1002155073716
TM2C_CHANNEL_ID=-1002195728981
```

**File:** `/opt/trendimovies/bot/config/settings.py`
```python
class Config:
    DB_PATH = '/opt/trendimovies/bot/database/movies.db'
    TM2_CHANNEL_ID = int(os.getenv('TM2_CHANNEL_ID', 0))
    TELEGRAM_API_ID = int(os.getenv('API_ID'))
    TELEGRAM_API_HASH = os.getenv('API_HASH')
```

### Search API Config (144 server)

**File:** `/var/www/trendimovies/src/pages/api/admin/assign/search-telegram.ts`
```typescript
const SQLITE_DB = '/opt/trendimovies/bot/database/movies.db';
const SQLITE_HOST = '38.242.195.0';
const SSH_PORT = 80;
```

---

## Summary Table

| Step | Server | Action | Time |
|------|--------|--------|------|
| 1 | Telegram | File uploaded to channel | Instant |
| 2 | 38 | Auto-indexer polls channel | 0-30 sec |
| 3 | 38 | Metadata extracted & inserted to SQLite | ~1 sec |
| 4 | 144 | Admin searches via UI | User action |
| 5 | 144 → 38 | SSH query to SQLite | ~1-2 sec |
| 6 | 144 | Results displayed | Instant |
| **Total** | | **From upload to searchable** | **~30-60 sec** |

---

## Why This Architecture?

### Why SSH Query Instead of Database Sync?

| Approach | Pros | Cons |
|----------|------|------|
| **SSH Query (Current)** | Real-time results, Single source of truth, No sync delays | Slight network latency (~1-2 sec), Depends on 38 server being online |
| **Database Sync** | Fast local queries, Works if 38 is offline | Stale data, Sync takes 30+ seconds for 900MB DB, Two databases to maintain |

**Decision:** SSH query chosen for **real-time accuracy**. When Edmund uploads a file, he needs it searchable within 30-60 seconds, not waiting for a periodic sync.

---

## Last Updated

- **Date:** 2026-02-20
- **Author:** Claude Code
- **Changes:**
  - Implemented real-time SSH-based search (144 queries 38 directly)
  - Removed database sync dependency
  - Files now searchable within 30-60 seconds of upload

================================================================================
## FILE LIFECYCLE & DELETION SYNC (Added 2026-05-22)
================================================================================

### Overview
When files are deleted from the Telegram TM File Database 1A channel, three
databases must be kept in sync to avoid serving broken download links:

1. SQLite indexer DB (server 38.242.195.0): /opt/trendimovies/bot/database/movies.db
2. PostgreSQL website DB (server 144.91.71.106): trendimovies / download_links table
3. The actual Telegram channel: -1002271215725

### Detection Flows

**Flow A — User-Triggered (Instant)**
- User clicks a download button on Telegram bot
- bot.copy_message() fails with "Message to copy not found"
- /opt/trendimovies/bot/handlers.py auto-removes the row from SQLite
- Next PG sync run will then deactivate the matching download_links row

**Flow B — Scheduled Telegram Probe (Slow / Bulk)**
- /opt/trendimovies/bot/cleanup_deleted_files.py runs daily at 3 AM (cron)
- Probes up to 1000 SQLite rows by attempting copy_message
- Removes rows whose files no longer exist in Telegram
- Limited to 1000/day due to Telegram 429 rate limits

**Flow C — PostgreSQL Mirror Sync (Daily, NEW)**
- /opt/trendimovies/sync_postgres_telegram.py runs daily at 4 AM (cron) on 144
- SSHes into 38.242.195.0 to fetch all valid SQLite IDs
- Deactivates download_links rows whose telegram_file_id is no longer in SQLite
- Sets is_active = false (does NOT delete) so history is preserved
- Safety: aborts if it gets zero valid IDs (would otherwise wipe everything)

### Why This Order?
3 AM (SQLite cleanup) → 4 AM (PG sync). The PG sync runs AFTER SQLite cleanup
so that any deletions detected by Flow B propagate the same night.

### Manual Operations

**Dry-run PostgreSQL sync (no changes):**
```
ssh root@144.91.71.106
python3 /opt/trendimovies/sync_postgres_telegram.py --dry-run
```

**Force-run PostgreSQL sync now:**
```
ssh root@144.91.71.106
python3 /opt/trendimovies/sync_postgres_telegram.py
```

**Logs:**
- /var/log/trendimovies/postgres_sync.log (script log)
- /var/log/trendimovies/postgres_sync_cron.log (cron output)
- /opt/trendimovies/logs/cleanup.log (on 38.242.195.0)

### Key Mapping
The `telegram_file_id` column in download_links is the SQLite `id` (primary key),
NOT the Telegram `message_id`. Do not confuse the two.

### Cron Entries

**On 38.242.195.0 (indexer server):**
```
0 3 * * * cd /opt/trendimovies/bot && /opt/trendimovies/venv/bin/python cleanup_deleted_files.py >> /opt/trendimovies/logs/cleanup.log 2>&1
```

**On 144.91.71.106 (website server):**
```
0 4 * * * /usr/bin/python3 /opt/trendimovies/sync_postgres_telegram.py >> /var/log/trendimovies/postgres_sync_cron.log 2>&1
```

================================================================================
## BACKFILL INDEXER (Added 2026-04-09, completed 2026-05-22)
================================================================================

### What Happened
The auto_indexer.py only scans for messages with `message_id > last_indexed`,
which means files posted while the indexer was down or before it existed were
never indexed. Result: ~186,000 files in the Telegram channel were invisible
to the search bot AND to the website's auto-assignment script.

### Solution
Created /opt/trendimovies/bot/backfill_indexer.py - a one-time script that:
1. Walks the entire channel history (oldest to newest)
2. Skips message_ids already present in SQLite
3. Indexes any missing files using the same extract_metadata() as auto_indexer
4. Tracks progress in /opt/trendimovies/bot/backfill_progress.txt (resumable)
5. Uses fcntl lock to prevent concurrent runs

### Results
- Scanned: 993,512 messages
- New files indexed: 186,487
- Final SQLite count: 990,184 (up from 802,507 before backfill)
- Total runtime: ~14 days (limited by Telegram rate limits)

### When To Run Again
Only if you suspect the indexer has been down for a long time OR if you find
files in the channel that don't appear in search. Normal operation does not
require re-running this.

```
# Stop auto_indexer first (so it doesn't fight for the session)
ssh root@38.242.195.0
systemctl stop trendimovies-indexer
cd /opt/trendimovies/bot
nohup /opt/trendimovies/venv/bin/python3 backfill_indexer.py > /opt/trendimovies/logs/backfill.log 2>&1 &

# When complete:
systemctl start trendimovies-indexer
```

================================================================================
## YEAR COLUMN BACKFILL (Added 2026-05-22)
================================================================================

### What Happened
Searching `behind the scenes 2025` returned 0 results even though the file
existed. Root cause: the indexer's year extraction regex failed for filenames
with channel tags (e.g. `Behind the Scenes (2025).@latestnollywood_movies.mkv`)
because the year wasn't followed by a typical separator. Result: 446,268
rows had year = NULL despite the year being present in the filename.

### Fix
Two parts:
1. Bulk SQL update populated year from `(YYYY)` patterns in file_name:
   - 4,275 rows fixed for years 2000-2030
   - 205 rows fixed for years 1950-1999
2. Updated db.search() in /opt/trendimovies/bot/database/db_manager.py to
   also LIKE-match the year in file_name as a fallback when year column is NULL.
   This means even unparsed years still get found.

### Verification
```
ssh root@38.242.195.0
cd /opt/trendimovies/bot && /opt/trendimovies/venv/bin/python3 -c "
from database.db_manager import DatabaseManager
from config.settings import Config
db = DatabaseManager(Config.DB_PATH)
r = db.search('behind the scenes 2025', limit=5)
print(f'Found: {len(r)}')
for m in r[:5]:
    print(f'  {m.get(\"file_name\", \"?\")[:70]}')
"
```

### Why The Sync Schedule Won't Affect User Search

The sync activities run at low-traffic hours and SQLite is in WAL mode:

| What | When | Where | Search Impact |
|------|------|-------|---------------|
| SQLite cleanup (1000 files/day) | 3 AM | 38.242.195.0 (bot server) | None — WAL mode means reads and writes don't block each other |
| PostgreSQL sync | 4 AM | 144.91.71.106 (website server) | None — runs on a different server |
| Auto-indexer | Continuous | 38.242.195.0 | None — already operating, only inserts new rows |

**WAL Mode Note:** /opt/trendimovies/bot/database/movies.db uses SQLite WAL
(Write-Ahead Logging). Concurrent reads (bot searches) and writes (cleanup/sync)
operate on separate files and never block each other. Search latency remains
unchanged regardless of what cleanup is doing.

================================================================================
## AUTO-ASSIGNMENT (SQLite → PostgreSQL) — How Telegram Files Become Website Downloads
================================================================================

### Overview
Once a Telegram file is indexed in SQLite (on 38.242.195.0), an automated cron
on 144.91.71.106 matches it to a movie or episode in PostgreSQL and creates a
download_links row. This is what makes a freshly uploaded Telegram file appear
as a download button on trendimovies.com.

### Script
- /opt/trendimovies/bot/trendimovies_cron.py (on 144.91.71.106)
- Wrapper: /opt/trendimovies/bot/run_cron.sh
- Wrapper steps:
  1. flock to prevent overlap (one instance only)
  2. scp the latest movies.db from 38.242.195.0
  3. Run `python3 trendimovies_cron.py assign`

### Cron Schedule (on 144.91.71.106)

| Cron | Frequency | Purpose |
|------|-----------|---------|
| run_cron.sh assign | Every 10 min | Incremental assign (skips already-assigned files) |
| run_quick_assign.sh | 5,15,25,35,45,55 * * * * | Fast pass between full runs |
| run_cron.sh assign | 00:00, 06:00, 14:00 | Deep daily passes |
| Assignment report | 01:30 daily | Email/log summary |

### Match Logic Highlights (trendimovies_cron.py)
- Parses filename → (title, year, quality)
- title_similarity() with Roman numeral + sequel-number normalization
- Skips dubbed files for non-Indian content
- Skips if movie already has the same quality link
- Skips on multiple DB matches (sends MANUAL REVIEW alert)
- Quality preference order: 720p BluRay > 720p WEBRip > 720p WEBDL > ...

### Logs
- /var/log/trendimovies/cron_assign.log
- /var/log/trendimovies/quick_assign.log
- /var/log/trendimovies/cron_newep.log

### Manual Operations

**Force a full re-sync + re-assign right now:**
```
ssh root@144.91.71.106
/opt/trendimovies/bot/run_cron.sh assign
```

**Check what's queued / coverage stats:**
```
sudo -u postgres psql -d trendimovies -c "
SELECT
  (SELECT COUNT(*) FROM movies WHERE has_downloads = true) as movies_with_links,
  (SELECT COUNT(*) FROM movies) as total_movies,
  (SELECT COUNT(*) FROM episodes WHERE has_downloads = true) as episodes_with_links,
  (SELECT COUNT(*) FROM episodes) as total_episodes,
  (SELECT COUNT(*) FROM download_links WHERE source = 'telegram' AND is_active = true) as telegram_links_active;
"
```

### Important: Don't Run These Manually
- assign cron uses flock — concurrent runs are skipped automatically
- The 14:00 deep pass can take 30+ minutes
- Don't kill mid-run; wait for the lock to clear

### How Backfilled Files Get Assigned
After backfill_indexer.py adds 100k+ rows to SQLite on 38, the next scp pull
on 144 picks them up (within 10 min). The assign cron then processes them
gradually over multiple runs. Full backfill coverage usually catches up
within 24-48 hours via the regular cron cycle — no manual action needed.

---

## Auto-Assignment to Website (Documented 2026-05-23)

After files are indexed in SQLite on 38.242.195.0, they get matched to website
movies/episodes via the auto-assignment cron on 144.91.71.106.

### Schedule
| Job | Cron | Purpose |
|-----|------|---------|
| Quick assign | xx:05,15,25,35,45,55 every hour | Fast incremental |
| Full assign | xx:00,10,20,30,40,50 every hour | Full sync + assign |
| Deep assign | 00:00, 06:00, 14:00 daily | Full re-scan |

### Flow Per Run
1. flock acquires /tmp/trendimovies_cron_assign.lock (prevents overlap)
2. scp -P 2222 syncs movies.db from 38.242.195.0 to 144.91.71.106
3. trendimovies_cron.py assign matches files against PG and inserts download_links
4. has_downloads flag set on parent movie/episode

### Don't Break This
- Don't modify trendimovies_cron.py without dry-run testing
- Don't delete /tmp/trendimovies_cron_*.lock while a job runs
- The SQLite on 144 is a snapshot — only updated via scp from 38
- Another instance of cron is running log lines are normal

### Logs
- /var/log/trendimovies/cron_assign.log
- /var/log/trendimovies/quick_assign.log
- /var/log/trendimovies/cron_newep.log

================================================================================
## DEEP ASSIGNMENT — ONE-TIME BACKLOG FIX (2026-05-27)
================================================================================

### Why It Was Needed
The regular auto-assign cron (trendimovies_cron.py assign) scans only the
5000 most-recent SQLite files (LIMIT 5000, ORDER BY id DESC). After the
186K-file backfill, older files that failed to match on their FIRST pass
(e.g. series not yet in PG at the time) were never re-evaluated — they fell
out of the 5000-row window permanently.

Example: "Lost S01E02" (SQLite id 188816) had a valid 720p file but episode
14702 in PostgreSQL showed has_downloads = false and never got a link.

### The Fix
Created /opt/trendimovies/bot/deep_assign.py — a ONE-TIME script that runs
the SAME matching logic as trendimovies_cron.py (imports its functions) but
WITHOUT the LIMIT, so it evaluates every file.

- Reuses: parse_episode_info, parse_movie_info, title_similarity,
  check_existing_link, insert_download_link, update_has_downloads,
  is_dubbed_file, file_matches_series_not_spinoff, calculate_file_preference_score
- Safe to re-run: check_existing_link + ON CONFLICT prevent duplicates
- The existing cron was NOT modified (its 5000 cap is intentional for speed)

### Results (run 2026-05-27, ~5.3 hours)
- Episodes newly assigned: 9,681
- Movies newly assigned: 2,312
- New download links: ~12,000
- Episode coverage: 101,418 -> 108,064
- Active telegram links: 176,570 -> 188,668
- no_match (no PG entry — mostly Indian soaps / non-TMDB): 58,408 eps, 69,531 movies

### Known Minor Issue
~20 titles with apostrophes (Harry Potter "Sorcerer's", My Hero Academia,
Gundam movies) hit a SQL-escaping edge case (title truncated mid-escape) and
were skipped. Handle via Manual Assign page if needed. Same edge case exists
in the original cron; left as-is to avoid altering shared logic.

### How To Run Again
    ssh root@144.91.71.106
    cd /opt/trendimovies/bot
    python3 deep_assign.py --dry-run        # preview
    nohup nice -n 19 ionice -c 3 python3 deep_assign.py all > /var/log/trendimovies/deep_assign.log 2>&1 &

Modes: all (default) | episodes | movies. Log: /var/log/trendimovies/deep_assign.log

### When To Run
Only after a large backfill, or if you find content with files in Telegram
that the website shows as having no downloads. Normal daily operation does NOT
need this — the standard cron handles new uploads.

================================================================================
## DEEP ASSIGN FOLDED INTO CRON + TMDB BACKFILL WORKFLOW (2026-05-30)
================================================================================

### What Changed
The standalone /opt/trendimovies/bot/deep_assign.py was retired (renamed to
.deprecated_20260530) and its functionality folded into trendimovies_cron.py
as a new `deep` task. One codebase, one scheduler.

### Code Change Summary (trendimovies_cron.py)
1. auto_assign_episodes() and auto_assign_movies() now accept an optional
   `file_limit: int = 10000` parameter. Their internal SQL builds
   `LIMIT {file_limit}` only when file_limit is truthy; passing None scans
   every file (no cap).
2. New run_deep_assign() function calls both with file_limit=None and emits
   a summary alert.
3. argparse choices include 'deep'; dispatch routes args.task == 'deep'
   to run_deep_assign().
4. Behavior of existing 'assign' and 'quick-assign' is UNCHANGED — both
   still use the 10000-file cap by default. No regression risk.

### Cron Schedule (144.91.71.106)
- Every 10 min: `assign` (fast 10000-file pass for new uploads)
- Every 10 min (offset): `quick-assign` (incremental "since last ID")
- 00:00 / 06:00 / 14:00: `assign` (full assign pass)
- **04:00 nightly: `deep`** (no LIMIT — catches any file the fast cron missed)
- The 4 AM nightly entry:
    0 4 * * * nice -n 19 ionice -c 3 /opt/trendimovies/bot/run_cron.sh deep >> /var/log/trendimovies/cron_deep.log 2>&1

### Why The Deep Task Is Needed
The regular `assign` task uses ORDER BY id DESC LIMIT 10000. After ~1M files
in SQLite, any file that failed to match on its first pass (because the
episode/movie row in PG didn't exist yet) sits outside that window forever.
The nightly deep run re-evaluates every file with no cap, picking up files
whose episode/movie row was created later (e.g. via TMDB enrichment or the
backfill below).

### Idempotency / Safety
- insert_download_link uses ON CONFLICT — safe to overlap with other assigns
- run_cron.sh uses a separate flock /tmp/trendimovies_cron_deep.lock so it
  cannot stomp on the every-10-min assign cron
- nice -n 19 ionice -c 3 keep load impact minimal during the 1–4 h run

### Manual Operations
```
# Run a deep pass right now (foreground)
/opt/trendimovies/bot/run_cron.sh deep

# Dry-run (logs would-be inserts only)
cd /opt/trendimovies/bot
python3 trendimovies_cron.py deep --dry-run
```

### Logs
- /var/log/trendimovies/cron_deep.log

================================================================================
## TARGETED TMDB BACKFILL WORKFLOW (2026-05-30)
================================================================================

### When Needed
A file is indexed in SQLite but its episode/movie row doesn't exist in
PostgreSQL. The website cron can't link a file to a row that doesn't exist.
The series-enrichment tool /var/www/trendimovies/scripts/sync-series-from-telegram.js
has a hard limit: it skips any series that already exists in PG (early
return on tmdb_id match) — so it WON'T add a new season to an existing
series, and it ignores anything the SQLite indexer flagged is_series = 0.

### Tool: /opt/trendimovies/backfill_tmdb_entries.py
Idempotent Python script that handles BOTH cases via direct TMDB fetches +
PG inserts:
- `add_season`: adds a missing season (+ all episodes) to an existing series
- `create_series`: creates a brand-new series + all seasons + episodes,
  generating a unique slug the same way the JS tool does

ON CONFLICT clauses on (series_id, season_number) and (season_id, episode_number)
make it safe to re-run.

### Usage Pattern
1. Identify gaps by querying PG directly (see "Trust" note below)
2. Look up TMDB IDs (curl or TMDB search)
3. Edit TASKS list in backfill_tmdb_entries.py
4. Run: `python3 /opt/trendimovies/backfill_tmdb_entries.py`
5. Trigger a `deep` (or `assign`) run to link the newly-indexed files

### --match Filter Added to sync-series-from-telegram.js
The series-enrichment script now accepts:
    --match "deli boys,murder mindfully,..."
Only series whose normalized name contains one of the comma-separated
substrings are processed. Useful for targeted runs, leaves the full-scan
behavior untouched when --match is absent.

================================================================================
## TRUST / VERIFICATION HABIT
================================================================================
When diagnosing "files uploaded but not on site," ALWAYS verify against the
PostgreSQL DB directly before reporting gaps. Filename-based parsers
(title + year guessing) produce false positives — colons in titles, year
heuristics, and 100% title-similarity thresholds can incorrectly classify
content as "missing" when it's already linked. The DB is the source of truth.

Pattern: parse the filename to get (series_token, season, episode), then
query PG for that exact (series, season, episode) and check
COUNT(active download_links). Trust the result of that query, not the
parser's guess.

================================================================================
## LATEST ADDITIONS — DESIGN (2026-05-31)
================================================================================

### Problem It Solves
The homepage "Latest Additions" used to query:
    SELECT ... FROM movies WHERE has_downloads = true
    ORDER BY created_at DESC LIMIT 20
where `created_at` is when the movie ROW was inserted in PG (usually by TMDB
enrichment, often months before the file was acquired). So a movie like
Iron Lung — enriched in Feb 2026 but only got Telegram files in May 2026 —
sat behind newer enrichment rows and never appeared.

### Fix
Two-part change, kept tightly scoped:

1. **PG trigger** on download_links that bumps `movies.updated_at` whenever
   a movie download_link is inserted or updated:
       trg_bump_movie_updated_at AFTER INSERT OR UPDATE ON download_links
       FOR EACH ROW EXECUTE FUNCTION bump_movie_updated_at_on_link()
   The function only fires for content_type='movie' AND is_active=true. No
   effect on episode links or inactive links.

2. **Homepage query change** in /var/www/trendimovies/src/pages/index.astro:
       has_downloads=eq.true
       year=gte.<currentYear - 1>          -- only current year + previous
       order=updated_at.desc
       limit=20
   `currentYear` is computed at request time so the year window rolls
   automatically on Jan 1 each year (today: 2025 and 2026 only).

### Behavior After Fix
| Scenario | Old | New |
|----------|-----|-----|
| 2026 movie just got files today | might appear | appears at top ✓ |
| Old 1985 movie just got files | sometimes appeared | excluded by year filter ✓ |
| 2024 movie that got files in 2024 | appeared | excluded (>1 yr old) |
| Brand-new TMDB-enriched 2026 with files | appeared | still appears |

### One-Time Data Migration
Before the trigger existed, ~20,000 movies had their `updated_at` stuck at
their original `created_at`. A backfill aligned each movie with the MAX
created_at of its active download_links so the new homepage query has
accurate history to sort by from day one:
    WITH latest AS (
      SELECT content_id AS movie_id, MAX(created_at) AS last_link_at
      FROM download_links
      WHERE content_type='movie' AND is_active=true
      GROUP BY content_id
    )
    UPDATE movies m SET updated_at = latest.last_link_at
    FROM latest WHERE m.id = latest.movie_id
      AND (m.updated_at IS NULL OR m.updated_at < latest.last_link_at);

### Maintenance
- Zero ongoing maintenance — the trigger handles everything automatically
- Nothing to schedule; no script to run; no cron entries
- Adding files for an old (<2024) movie won't pollute Latest Additions:
  the year filter blocks it, even though updated_at bumps

### Rollback (if ever needed)
    DROP TRIGGER trg_bump_movie_updated_at ON download_links;
    DROP FUNCTION bump_movie_updated_at_on_link;
Then in /var/www/trendimovies/src/pages/index.astro revert getLatestAdditions
to use `order=created_at.desc` and remove the year filter. Rebuild + restart.

================================================================================
## CUSTOM POSTER/BACKDROP OVERRIDE (2026-05-31)
================================================================================

### Convention
Custom images live in /var/www/trendimovies/public/images/<name>.webp
After upload, also copy to /var/www/trendimovies/dist/client/images/ so the
Astro Node SSR server serves them immediately (without rebuild):
    cp public/images/X.webp dist/client/images/X.webp

Set movies.poster_path (and/or backdrop_path) to "/images/X.webp". The
runtime detects the "/images/" prefix and serves the local file instead
of the TMDB CDN.

### Sizing for WhatsApp/Social Previews
The movie page emits og:image from poster_path. WhatsApp link-preview is
unreliable above ~300 KB. Target:
    convert source.webp -resize 800x1200 -quality 82 dest.webp
800x1200 keeps ample resolution for the in-site poster while staying
~120 KB — well within social preview limits.

### Example
Iron Lung (id=10) on 2026-05-31:
    public/images/iron-lung-2026.webp (123 KB, 800x1200)
    DB: poster_path = backdrop_path = '/images/iron-lung-2026.webp'

================================================================================
## EPISODE QUALITY CASCADE FIX (2026-05-31)
================================================================================

### Problems Found
1. Auto-assign was assigning ONLY ONE quality per cron run per episode. If both
   720p and 1080p files were uploaded, only the 720p got linked (the cascade
   `break`-ed after the first match). The 1080p had to wait for a future run.
2. The `hdrip` fallback step accepted 480p files (treating them as hdrip),
   creating low-quality buttons even when 720p existed.
3. Editorial rule: 720p and 1080p are PRIMARY; 480p and hdrip are FALLBACK
   ONLY when no 720p exists. This was being violated routinely.

### Fix in trendimovies_cron.py (auto_assign_episodes)
1. Quality cascade no longer breaks after first match — each quality
   (720p, 1080p, hdrip) is processed independently. Both 720p and 1080p
   get linked in the same run when files are available.
2. The `hdrip` step now requires the file to genuinely be hdrip
   (`'hdrip' in filename` OR `detected == 'hdrip'`) — 480p files are no
   longer silently inserted as hdrip.
3. The `hdrip` step also skips entirely if 720p already exists for that
   episode (true fallback only).
4. 480p is never auto-assigned by this cron (was the case before, still the case).

Backup: /opt/trendimovies/bot/trendimovies_cron.py.bak_20260531_premultiq

### One-Time Data Cleanup (2026-05-31)
~5,000 existing episode rows had a 480p or hdrip link in addition to 720p
(historical artifacts from older runs and link_populator). These were hidden
(is_active=false), NOT deleted, NOT removing the underlying Telegram files:

| | Hidden | Kept | Notes |
|---|---|---|---|
| 480p episode links | 4,434 | 762 | 762 kept = episodes with ONLY 480p |
| hdrip episode links | 6,569 | 1,482 | 1,482 kept = episodes with ONLY hdrip |
| TOTAL | 11,003 | 2,244 | |

### Safety Protocol Used
The cleanup ran in batches of 2,000 with PER-BATCH verification: after each
UPDATE, the script re-queried every touched episode to confirm it still had
≥1 active 720p link. If any episode had lost its 720p, the entire batch would
ROLLBACK and the script would abort. All 6 batches passed verification.

### Rollback (if ever needed)
Restore the cron file:
    cp /opt/trendimovies/bot/trendimovies_cron.py.bak_20260531_premultiq /opt/trendimovies/bot/trendimovies_cron.py
Un-hide the 11,003 cleanup rows (find them by created_at + is_active=false):
    -- careful: this also reactivates any legitimately-disabled links
    -- prefer to re-run a targeted UPDATE if exact rollback needed

================================================================================
## YEAR-SEARCH + DELETION PERSISTENCE FIXES (2026-06-02)
================================================================================

### Issue 1 — Year-Search Returned 0 Results
Symptom: a file like `Oversabi Aunty (2025).@latestnollywood_movies.mp4` was
found when searching "oversabi aunty" but NOT when searching "oversabi aunty
2025". Year-specific searches silently failed across the bot.

Root cause: the May 22, 2026 year-fallback patch in
`/opt/trendimovies/bot/database/db_manager.py` had two bugs in one line:
```python
year_filter = "AND (m.year = ? OR m.file_name LIKE ? || '%')"   # 2 ? placeholders
year_params = [search_year] if search_year else []              # only 1 value
```
1. **Param count mismatch** — SQL contained 2 `?` but code provided 1 value,
   so `cur.execute(...)` raised "Incorrect number of bindings" and the
   tier wrapper silently fell through to 0 results.
2. **LIKE pattern was prefix-only** — `? || '%'` = `2025%`, which only
   matches filenames *starting* with the year. Files named like
   `Title (2025).ext` never matched.

Fix (replacing those two lines):
```python
year_filter = "AND (m.year = ? OR m.file_name LIKE ?)" if search_year else ""
year_params = [search_year, f"%{search_year}%"] if search_year else []
```
Now the LIKE matches the year anywhere in the filename, AND param count is
correct. Verified live with: `oversabi aunty 2025`, `iron lung 2026`,
`godfather 1972`, `avatar 2009`, `inception 2010` (all correctly return
results), and `inception 2025` (correctly returns 0).

Backup: `/opt/trendimovies/bot/database/db_manager.py.bak_20260602_yearfix`

### Issue 2 — Search Results / File Messages Not Auto-Deleting After 60s
Symptom: search results and file deliveries from yesterday/earlier still
visible in the request group. APScheduler's `deletion_processor` cron was
running every 30s but finding nothing to process.

Root cause: the bot uses TWO parallel mechanisms for the 60s auto-delete:
- `context.job_queue.run_once(...)` — in-memory APScheduler job (LOST on bot restart)
- `deletion_tracker.add(...)` — persistent row in `/opt/trendimovies/bot/database/deletions.db` (survives restart)

The main paths (search header, file delivery, pagination) correctly used
BOTH. But 8 other handler paths only scheduled the in-memory job and
never persisted to the DB:

| Location in handlers.py | What it deletes |
|---|---|
| line 967 | "Did you mean..." episode suggestion |
| line 996 | Search auto-correction prompt |
| line 1039–1043 | Fuzzy suggestion bubble |
| line 1080–1084 | Phonetic suggestion bubble |
| line 1122–1126 | Generic suggestion bubble |
| line 1148 | Franchise watch-order box (path A) |
| line 1165 | Franchise watch-order box (path B) |
| line 1839 | Request submission confirmation |

When the bot restarted, every pending in-memory deletion was lost forever.
With the bot up for a week, hundreds of messages had no working deletion.

Fix: one additive line — `deletion_tracker.add(chat_id, message_id, delay, type)`
— next to each of the 8 `job_queue.run_once(...)` calls. No existing
behavior changed; the in-memory job still fires (which is what wins the
race normally). The DB row is the safety net for restart scenarios.

Verification (live in logs):
```
17:10:22 SUCCESS: Deleted search message 214361              <- job_queue (in-memory) fired
17:10:28 Could not delete message 214361: not found          <- deletion_processor (DB-backed) tried; already gone
```
This pattern across 5 fresh test searches proves both mechanisms are firing,
with the DB cron correctly cleaning up its row afterwards. The
`pending_deletions` table appears empty in steady state because rows are
removed immediately after the cron attempts them — that's correct cleanup,
not a missing entry.

Backup: `/opt/trendimovies/bot/handlers.py.bak_20260602_persistdel`

### Rollback (either fix individually)
```
# Year-search fix:
cp /opt/trendimovies/bot/database/db_manager.py.bak_20260602_yearfix /opt/trendimovies/bot/database/db_manager.py

# Deletion persistence fix:
cp /opt/trendimovies/bot/handlers.py.bak_20260602_persistdel /opt/trendimovies/bot/handlers.py

# Then restart:
systemctl restart trendimovies-bot
```

================================================================================
## AUTO-SEED MISSING METADATA (Added 2026-06-03)
================================================================================

### Overview
When a Telegram file is uploaded for a series/season/episode that does not yet
exist in the PostgreSQL website database, the cron now seeds the metadata from
TMDB automatically and assigns the file. No manual intervention needed.

This eliminates two previous failure modes:
1. New season released → files uploaded → website silently skips them because
   the season row does not exist (e.g. "Tyler Perry's The Oval" S07)
2. Brand new series uploaded → website skips because the series row does not
   exist (e.g. "Password 2022")

### Files Changed
- /opt/trendimovies/bot/trendimovies_cron.py
- Backup of pre-change version: trendimovies_cron.py.bak.before-autoseed

### What Was Added

**1. `auto_add_missing_season(series_pg_id, series_tmdb_id, season_number)`**
   - Fetches a single TMDB season payload
   - Inserts the season row into PG `seasons`
   - Inserts all episodes for that season into PG `episodes`
   - Idempotent via ON CONFLICT clauses

**2. `_find_series_only(series_name)`**
   - Tier-1 (exact lower), Tier-2 (NAME_MAP), Tier-3 (normalized) lookup
   - Returns the series PG id + tmdb_id + title, WITHOUT requiring an
     existing episode match
   - Used to detect "series exists but season missing" cases

**3. Hook inside `_find_episode_in_db`**
   - After all match tiers exhaust, if `_find_series_only` finds the series
     AND it has a `tmdb_id`, call `auto_add_missing_season` and retry the
     exact lookup. Returns the freshly-created episode row.

**4. Hook inside `quick_assign_new_files`**
   - During the per-file loop, collect series that didn't match any tier
     plus the file metadata
   - After the main loop, call existing `auto_add_missing_series` to create
     unknown series in batch
   - Retry assignment for files belonging to the newly-added series

### Safety Rails
| Risk | Mitigation |
|------|------------|
| Wrong series auto-created from misparsed filename | Existing `auto_add_missing_series` requires ≥3 episodes of same series in one run + exact TMDB title match |
| Wrong season created (e.g. season number mismatch) | `tmdb_get_season_details` validates against TMDB's own data |
| TMDB outage breaks the cron | All TMDB calls wrapped in try/except — failures fall back to existing "skip file" behavior |
| Race condition with concurrent cron runs | ON CONFLICT clauses + existing flock at /tmp/quick_assign.lock + /tmp/trendimovies_cron_assign.lock |
| Dry-run accidentally creating rows | All auto-add functions check `if not ENABLE_TMDB_AUTO_ADD or DRY_RUN: return` early |
| Manually-added series with no tmdb_id getting bogus seasons | `auto_add_missing_season` early-returns if `series_tmdb_id` is None/0 |

### When It Fires
- Both `quick-assign` (every 10 min) and `assign` (every 10 min + 3x daily deep)
- Triggered automatically inside `_find_episode_in_db` whenever a file does
  not match any existing season — no separate cron entry needed.

### Logs to Watch
- /var/log/trendimovies/tmdb_auto_add.log
  - "AUTO-ADDED SEASON: series_pg:X tmdb:Y SN (M episodes)"
  - "AUTO-ADDED: <series name> (tmdb:X) - Y seasons, Z episodes"
- /var/log/trendimovies/quick_assign.log
  - "Quick assign: TMDB auto-added N series, retrying M files"

### Manual Operations

**Test the season auto-add for a specific series + season:**
```
cd /opt/trendimovies/bot
python3 -c "
import sys; sys.path.insert(0,'.')
from trendimovies_cron import auto_add_missing_season
auto_add_missing_season(<series_pg_id>, <tmdb_id>, <season_number>)
"
```

**Roll back if anything misbehaves:**
```
cp /opt/trendimovies/bot/trendimovies_cron.py.bak.before-autoseed \
   /opt/trendimovies/bot/trendimovies_cron.py
```

### Don't Break This
- Don't remove the `tmdb_id` check inside `auto_add_missing_season` — it
  prevents creating bogus seasons for non-TMDB series.
- Don't lower the ≥3-episode threshold in `auto_add_missing_series` —
  single-file series additions caused wrong-show creations in the past.
- Don't change the ON CONFLICT clauses to DELETE/REPLACE — that would
  destroy any manually-assigned metadata for the same row.
- The `_find_series_only` cache (`get_series_cache()`) is invalidated when
  series are added — don't bypass that path.

### What Still Needs Manual Intervention
- **Movies whose title doesn't match TMDB exactly** (special chars, channel
  tags in filename, weird transliterations). Use the Manual Assign page
  at trendimovies.com/admin/manual-assign.
- **Series identified by the wrong TMDB id** (rare — happens when title
  is highly ambiguous). Fix the `tmdb_id` column on the series row, then
  re-run `assign`.

================================================================================
## DELETE A SERIES'S DOWNLOAD LINKS (Documented 2026-06-03)
================================================================================

### Use Case
You want to wipe all download_links for one series (e.g. before re-uploading
fresh files). Other series stay untouched.

### Procedure
```sql
BEGIN;

DELETE FROM download_links
WHERE content_type = 'episode'
  AND content_id IN (
    SELECT e.id FROM episodes e
    JOIN seasons se ON se.id = e.season_id
    WHERE se.series_id = <SERIES_PG_ID>
  );

UPDATE episodes SET has_downloads = false
WHERE id IN (
  SELECT e.id FROM episodes e
  JOIN seasons se ON se.id = e.season_id
  WHERE se.series_id = <SERIES_PG_ID>
);

COMMIT;
```

Then re-upload files to Telegram — the auto-assignment cron picks them up
within 10 minutes.

### Why Not is_active=false?
The unique constraint `(content_type, content_id, source, quality, language)
WHERE is_active = true` means soft-deleted rows can coexist with new active
ones — that's fine. But hard DELETE keeps the table smaller and avoids
confusion when auditing later. Use whichever you prefer.

================================================================================
## TOP MOVIES PAGE (Added 2026-06-02)
================================================================================

### Overview
A single `/top-movies` page replaces the old three homepage tabs (Top 2026,
2024-25, 2020-23). Lists ~2,700 movies across 37 years (1990-2026) sourced
from dvdsreleasedates.com, enriched with TMDB posters, and cross-referenced
against the website database.

### Data Source
- /var/www/trendimovies/scripts/Top_Movies_By_Year.txt — raw curated list
- /var/www/trendimovies/scripts/enrich_top_movies.cjs — enrichment script
- /var/www/trendimovies/src/data/top_movies_by_year.json — generated cache
  (shipped with the build)

### How To Regenerate
```
cd /var/www/trendimovies
TMDB_API_KEY=46300aaf372203a94763f1f46846e843 node scripts/enrich_top_movies.cjs
npm run build
pm2 restart trendimovies-astro
```

Re-run when:
- The .txt file is updated with newer years
- Many new movies have been added to the website DB (to refresh `in_db` flags)

### Files Changed
- /var/www/trendimovies/src/components/FeaturedSection.svelte
  - Backup: FeaturedSection.svelte.bak.before-topmovies
- /var/www/trendimovies/src/pages/index.astro
- /var/www/trendimovies/src/pages/top-movies.astro (NEW)
- /var/www/trendimovies/src/pages/request.astro (adds URL-param prefill)

### OG Image / Social Preview
The /top-movies page sets `og:image` to the #1 movie's TMDB poster
(w780). When the URL is shared on WhatsApp / Telegram / Twitter, the
preview shows that poster.

### Old Routes Still Work
- /movies/top-2026
- /movies/top-2024-2025
- /movies/top-2020-2023

These are no longer linked from the homepage but were preserved so any
external links don't 404. Delete only if you're sure nothing references them.

================================================================================
## 504 GATEWAY TIMEOUT — ROOT CAUSE & FIX (2026-06-05)
================================================================================

### Symptom
Public site (trendimovies.com) returns 504 Gateway Timeout. Local
`curl http://localhost:3000/` hangs. PM2 shows trendimovies-astro online
but unresponsive.

### Root Cause
The series detail page (/var/www/trendimovies/src/pages/tv/[id].astro)
fetched every season's details in parallel via `Promise.all(...)`. For
short series this was fine, but for series like Melodi Grand Prix
(TMDB id 12758, 63 seasons), 63 TMDB requests fired simultaneously.

Sequence of failure:
1. User opens /tv/12758
2. Astro page fires 63 concurrent fetches to api.themoviedb.org
3. TMDB throttles/rate-limits, requests hang and time out (5-10s each)
4. The page render waits for `await Promise.all(...)` to resolve
5. nginx upstream timeout (proxy_read_timeout 30s) expires before
   Astro returns -> nginx returns 504
6. The hung fetches keep the Node.js event loop busy
7. Subsequent page requests queue up but can't be served quickly
8. Cascading 504s for ALL pages

### Fix
Concurrency-limited batch fetch in /var/www/trendimovies/src/pages/tv/[id].astro:
```js
async function fetchInBatches(items, batchSize, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResult = await Promise.all(batch.map(fn));
    out.push(...batchResult);
  }
  return out;
}
const seasonDataResults = await fetchInBatches(seasonNumbers, 8, num => getSeasonDetails(tmdbId, num));
```
Caps simultaneous TMDB calls at 8 (well under TMDB's ~50/sec rate limit
and well within Node's default HTTPS agent pool size).

### Recovery Procedure (If This Recurs)
1. `pm2 restart trendimovies-astro` — clears the hung request queue
2. Check `pm2 logs trendimovies-astro --lines 30 --nostream --err`
   for "TMDB retry" floods or "TMDB API error" patterns
3. Check `curl -s -o /dev/null -w '%{time_total}\n' --max-time 10 \
   https://api.themoviedb.org/3/movie/550?api_key=<KEY>` to verify
   TMDB itself is reachable
4. If TMDB is the bottleneck, the concurrency limit is doing its job;
   wait it out OR temporarily bump nginx `proxy_read_timeout` to 60s

### Defensive Posture Now In Place
| Layer | Setting | File |
|-------|---------|------|
| Concurrency cap | 8 parallel TMDB season fetches per request | /var/www/trendimovies/src/pages/tv/[id].astro |
| Memory cap | PM2 restarts process if heap > 500MB | /var/www/trendimovies/ecosystem.config.cjs |
| TMDB cache | 24-hour TTL on `/tv/<id>/season/<n>` responses | /var/www/trendimovies/src/lib/cache.ts |
| nginx upstream timeout | proxy_read_timeout 30s | /etc/nginx/sites-enabled/trendimovies |

### Why The Cache Didn't Help On First Render
The cache hits AFTER a successful response. The first time anyone visits
a 60-season series, TMDB has to be hit 60 times. The concurrency cap is
what prevents the herd from overwhelming both TMDB and the event loop
during that uncached window.

### PM2 Port Gotcha (Discovered During The Fix)
`/var/www/trendimovies/ecosystem.config.cjs` defines `PORT: 3000`.
nginx upstream `astro_backend` points to `127.0.0.1:3000`.
If you ever change one, change BOTH or the site will return 502.

Order of operations when restarting from ecosystem.config.cjs:
1. Confirm `PORT` matches nginx upstream:
   `grep -E 'PORT|upstream|127\.0\.0\.1' /var/www/trendimovies/ecosystem.config.cjs /etc/nginx/sites-enabled/trendimovies`
2. `pm2 delete trendimovies-astro && pm2 start ecosystem.config.cjs`
3. `pm2 save` (persists across reboots)
4. Curl-test BOTH local port and public URL with a browser UA
   (`-A 'Mozilla/5.0'` — nginx bot-blocker returns 403 to bare curl)

### Files Changed
- /var/www/trendimovies/src/pages/tv/[id].astro (concurrency cap)
- /var/www/trendimovies/ecosystem.config.cjs (PORT confirmed at 3000)
- Build artifacts under /var/www/trendimovies/dist/

### Don't Break This
- Don't raise the concurrency cap above ~10 without checking TMDB rate
  limit headers. TMDB's free tier allows ~50 req/sec but penalises
  bursts.
- Don't reduce the cache TTL for season data — high TTL is what keeps
  popular series cheap to render after the first hit.
- Don't change PORT in ecosystem.config.cjs without also updating
  /etc/nginx/sites-enabled/trendimovies upstream block AND reloading
  nginx (`nginx -t && systemctl reload nginx`).

================================================================================
## TMDB SEARCH — YEAR-AWARE FIX (2026-06-06)
================================================================================

### Bug
Filenames like `Rivals.2024.S02E04.720p...mkv` are parsed by the cron as
series name `"Rivals 2024"` (year included). The old `tmdb_search_series()`
sent that exact string as the TMDB query AND used a strict 0.90 similarity
check against TMDB's bare title `"Rivals"`. Similarity scored too low,
returned None, the series never auto-created in PG.

User-visible symptom: any series uploaded with year-in-filename
(Rivals 2024, Password 2022, Doctors 2000, Office Romance 2026, etc.)
never auto-created -> all uploaded episodes stayed unassigned -> empty
episodes section on the site even after multiple uploads.

### Fix
`tmdb_search_series()` in /opt/trendimovies/bot/trendimovies_cron.py now:

1. Detects a 4-digit year in the input title via `\b(19[5-9]\d|20[0-4]\d)\b`
2. Strips the year out -> uses the bare title as the query
3. Sends the year separately via TMDB's `first_air_date_year` parameter
4. Falls back to no-year query if the year-filtered search returns 0
5. Falls back to the original title (legacy behaviour) as last resort
6. Matches normalized titles against the cleaned (year-less) name

### Verified Results
| Input | Returns |
|-------|---------|
| `Rivals 2024` | Rivals (2024) tmdb_id=208921 |
| `Rivals` | Rivals (2024) tmdb_id=208921 |
| `Password 2022` | Password (2022) tmdb_id=203254 |
| `Doctors 2000` | Doctors (2000) tmdb_id=5080 |

### Backlog Cleanup Applied at the Same Time
- Rivals (2024) seeded: 2 seasons / 14 episodes from TMDB
- Password (2022) seeded: 3 seasons / 26 episodes from TMDB
- 38 existing SQLite files for those two series were assigned in one pass

### Forward Behaviour
The next quick-assign / full-assign cycle (every 10 min) automatically
picks up any other year-bearing-name series that have been silently
piling up. No further manual seeding needed.

### IMPORTANT MAINTENANCE GOTCHA — Shell Heredoc + Python Regex
When editing this file via SSH heredoc (`ssh ... \"python3 << 'PYEOF'\"`),
shell escaping can collapse `\\\\b` to `\\b` to literal `\x08`
(ASCII backspace byte). The file looks fine to `grep` but Python sees
an unmatchable regex.

Symptoms: code looks right, function silently returns None for ALL inputs.

How to spot it:
```
cat -A /opt/trendimovies/bot/trendimovies_cron.py | grep year_match
```
Look for `^H` characters where `\\b` should be. `^H` is `\x08`.

Safe patching workflow:
1. Write the patch as a Python file LOCALLY (not via ssh heredoc)
2. `scp` it to the server
3. `ssh ... python3 /tmp/patch.py`

Or, for byte-level fixes, use a pure-bytes replace as in the recovery
done on 2026-06-06:
```python
with open(fp, 'rb') as f: d = f.read()
d = d.replace(bytes([0x08]), bytes([0x5c, 0x62]))  # \x08 -> \b
with open(fp, 'wb') as f: f.write(d)
```

### Don't Break This
- Don't remove the `first_air_date_year` parameter — it's what
  disambiguates "Doctors (2000 UK soap)" from a hypothetical
  "Doctors (2024 reboot)" if both exist.
- Don't lower the year-stripping regex from `\b...\b` boundaries to
  bare `(19[5-9]\d|20[0-4]\d)` — without boundaries, a 4-digit number
  inside a real title (rare but possible, e.g. "1408") would get
  stripped.
- The 3-pass fallback (year-filtered -> no-year -> original) is
  intentional. Don't collapse to a single pass — some series have
  TMDB `first_air_date` mis-dated and only the no-year pass matches.

### Files Changed
- /opt/trendimovies/bot/trendimovies_cron.py (function tmdb_search_series)
- Existing backup remains at:
  /opt/trendimovies/bot/trendimovies_cron.py.bak.before-autoseed
