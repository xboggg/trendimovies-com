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
│  ssh -p 80 root@38.242.195.0 "sqlite3 -json                                    │
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
| **SSH Port** | 80 |
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
| **Port** | 3000 |

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
├── Check: ssh -p 80 root@38.242.195.0 "ps aux | grep auto_indexer"
├── Fix: ssh -p 80 root@38.242.195.0 "pm2 restart auto_indexer"
└── Then wait 30 seconds and search again

POSSIBLE CAUSE 3: Search term doesn't match
├── Filename: "The.Edge.2025.1080p.WEB-DL.x265.mkv"
├── normalized_title in DB: "the edge"
├── Searching "edge 2025" → WORKS
├── Searching "the edge" → WORKS
├── Searching "Edge movie" → MAY NOT WORK (word "movie" not in title)
└── Solution: Use keywords that appear in the actual filename

POSSIBLE CAUSE 4: SSH connection failed
├── Check: ssh -p 80 root@38.242.195.0 "echo OK"
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
│  ssh -p 80 root@38.242.195.0 "sqlite3 -json                │
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
ssh -p 80 root@38.242.195.0

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
ssh -p 80 root@38.242.195.0 "echo 'Connection OK'"

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
