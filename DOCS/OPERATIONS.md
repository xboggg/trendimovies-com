# TrendiMovies — Operations

## Deploying

**Auto-deploy:** push to `main` triggers
`.github/workflows/deploy.yml`. The workflow tars the source
(excluding secrets, dist, node_modules, and old-build folders), scp's it
to the server with the locked deploy key, and runs
`/usr/local/bin/trendimovies-install` which:

1. Snapshots `/var/www/trendimovies/` (source files only) to
   `/var/www/trendimovies.backup/`
2. Rsyncs the new source into webroot, preserving `.env`, `dist/`,
   `dist.prev/`, `node_modules/`, `.cache/`, `.astro/`, and the
   `*_backup`/`*_old_backup` folders
3. Runs `npm ci` only if `package*.json` changed
4. Builds with `astro build --outDir <tempdir>` (~80s build time)
5. Atomic swap: `mv dist dist.prev && mv <tempdir> dist`
6. `pm2 reload trendimovies-astro --update-env`

**Docs-only commits skip the deploy** — workflow has
`paths-ignore: ['**.md', 'DOCS/**']`.

Watch a deploy: https://github.com/xboggg/trendimovies-com/actions

**Manual deploy (server SSH):**
```bash
cd /var/www/trendimovies
git pull                                 # if syncing via git
npm ci                                   # if deps changed
NEWDIST=$(mktemp -d -p . .dist-build.XXX)
chown trendimovies:trendimovies $NEWDIST
chmod 755 $NEWDIST
sudo -u trendimovies npx astro build --outDir $NEWDIST
mv dist dist.prev
mv $NEWDIST dist
pm2 reload trendimovies-astro --update-env
```

**Rolling back the LAST deploy:**
```bash
cd /var/www/trendimovies
[ -d dist.prev ] || { echo 'no dist.prev'; exit 1; }
mv dist dist.failed
mv dist.prev dist
pm2 reload trendimovies-astro --update-env
```

## Service control

```bash
pm2 list                              # all PM2 processes
pm2 show trendimovies-astro           # detailed view
pm2 logs trendimovies-astro           # tail
pm2 logs trendimovies-astro --err     # errors only
pm2 reload trendimovies-astro --update-env  # zero-ish-downtime
pm2 restart trendimovies-astro        # hard restart
```

## nginx

Live vhost: `/etc/nginx/sites-enabled/trendimovies`

After changes:
```bash
nginx -t              # validate first
systemctl reload nginx
```

## Secrets

Server file: `/var/www/trendimovies/.env` (chmod 600, owned trendimovies)

Required keys:
- `PUBLIC_SUPABASE_URL`     — embedded in client bundle (NOT secret)
- `PUBLIC_SUPABASE_ANON_KEY`— embedded in client bundle (NOT secret)
- `TMDB_API_KEY`            — server-only
- `ADMIN_PASSWORD_HASH`     — bcrypt hash of admin password
- `ADMIN_SESSION_SECRET`    — HMAC secret for admin session cookies
- `PORT=3000`
- `HOST=127.0.0.1`

Rotating `ADMIN_SESSION_SECRET` invalidates all admin sessions
immediately — admin must re-login.

## Database

Trendimovies catalog lives in **the self-hosted Supabase Postgres** on
the same box, accessed via the connection string in `.env`.

```bash
# psql shell into the catalog
docker exec -it supabase-db psql -U postgres -d postgres

# Schema is in the `public` schema; key tables: movies, tv_shows,
# series_episodes, downloads, requests, events
```

## Telegram bot integration

The bot stream service lives on a separate box (38.242.195.0:8765).
nginx on 144 proxies `/tgstream/*` there. If `/tgstream/*` returns
connection-refused, check the bot service on 38:

```bash
ssh root@38.242.195.0
systemctl status trendimovies-tg-api
```

## Backups

Daily at 02:00 UTC, `/opt/trendimovies/backup/backup.sh` uploads:

- `gdrive:144-main/daily/trendimovies-DATE.tar.gz` — full source +
  public + scripts (no node_modules, no dist, no dist_backup_*)
- `gdrive:databases/144-main/DATE/postgres-DATE.dump` — Supabase
  Postgres including the catalog schema
- `gdrive:144-main/daily/trendimovies-deploy-scripts-DATE.tar.gz` —
  install + gate scripts

Retention: daily 5d, weekly 14d, monthly 60d, DB-only 30d.

Watch backup log: `tail -f /var/log/trendimovies-backup.log`

## Monitoring

```bash
pm2 logs trendimovies-astro --err --lines 500
journalctl -u nginx -n 100 --since "1 hour ago"
journalctl -t trendimovies-deploy --since "1 day ago"  # SSH gate rejections
df -h                # disk full breaks builds
free -h              # `astro build` can need ~1GB during prerender
```

The deploy key is restricted via `/usr/local/bin/trendimovies-deploy`.
Any rejected commands log to syslog with tag `trendimovies-deploy`.

## Background jobs (cron)

The site relies on a large `root` crontab on 144 (`crontab -l`). The
heaviest job is the **nightly deep assignment**:

```cron
0 4 * * * nice -n 19 ionice -c 3 timeout -k 60 3h /opt/trendimovies/bot/run_cron.sh deep ...
```

`run_cron.sh deep` → `trendimovies_cron.py deep` runs
`auto_assign_episodes(file_limit=None)` over **every** file (no LIMIT)
to seed any missing TMDB seasons/episodes. Two guards keep it from
running away (added 2026-06-11, see DISASTER_RECOVERY.md):

- **`timeout -k 60 3h`** in the cron line — hard 3h ceiling. `run_cron.sh`
  ends with `exec python3 …` so the timeout signal reaches Python (not
  just the wrapper shell).
- **`_TMDB_NO_SEASON_CACHE`** in `trendimovies_cron.py` — once TMDB
  returns no data for a `(series, season)`, it's never re-queried that
  run. Without this, the deep pass re-hit the TMDB API thousands of
  times for the same missing seasons.

## Troubleshooting

### Site intermittently unreachable / `ERR_CONNECTION_TIMED_OUT`

This is almost always **server CPU overload, not the Astro code.** A
connection *timeout* (vs. a 500 / broken page) means the server couldn't
answer in time. Diagnose in order:

```bash
ssh root@144.91.71.106

# 1. Is it the CODE or the SERVER? If this is a fast 200, the app is
#    fine and the problem is server load, NOT the website.
curl -s -o /dev/null -w "astro %{http_code} %{time_total}s\n" http://127.0.0.1:3000/

# 2. Is the box overloaded? load >> nproc (6 cores) = overload.
uptime
nproc

# 3. Who's eating the CPU?
ps -eo pid,user,%cpu,etime,cmd --sort=-%cpu | head -10
```

**Most common cause — a stuck `deep` cron** (a daily job pinning CPU for
hours). If you see `trendimovies_cron.py deep` with a multi-hour ELAPSED:

```bash
# Kill the whole tree (the run_cron.sh wrapper AND the python child)
pkill -TERM -f 'run_cron.sh deep'; pkill -TERM -f 'trendimovies_cron.py deep'
# verify it's gone, then watch load fall over the next few minutes
ps -eo pid,etime,cmd | grep -E 'run_cron.sh deep|cron.py deep' | grep -v grep
uptime
```

Killing it is safe — it's background data enrichment, not the website.
Load average is a trailing 1/5/15-min metric, so it falls gradually.

Confirm what nginx is actually failing on:

```bash
# upstream timeouts to the Astro app (port 3000) = the box was too busy
grep 'upstream timed out.*127.0.0.1:3000' /var/log/nginx/error.log | tail
```

**If timeouts persist with NO runaway job**, the box has simply outgrown
its hardware. The 4 Telegram streaming workers (ports 8765–8768,
`tgstream_pool`) each peg ~1 core under genuine streaming load, and 144
co-hosts TechTrendi, TrendiCars, news bots, and Supabase/logflare. The
real fix is then **more CPU cores** or **moving streaming to the
dedicated box (38.242.195.0)** as originally architected — not a code
change.

To test the public site past Cloudflare's bot block, send the trusted
monitor UA: `-H 'User-Agent: TrendiOps-Monitor/1.0 (b0c1ef67b9618b2b)'`.
