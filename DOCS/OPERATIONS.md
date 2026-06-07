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
