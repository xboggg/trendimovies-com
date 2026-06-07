# TrendiMovies — Disaster Recovery

## Inventory

| Component                    | Source of truth                                            |
| ---------------------------- | ---------------------------------------------------------- |
| Source code                  | `github.com/xboggg/trendimovies-com`                       |
| `/var/www/trendimovies/.env` | `gdrive:144-main/daily/server-configs-*.tar.gz`            |
| Catalog (Supabase Postgres)  | `gdrive:databases/144-main/<date>/postgres-<date>.dump`    |
| Public assets (posters, etc.)| `gdrive:144-main/daily/trendimovies-<date>.tar.gz`         |
| nginx vhost                  | `gdrive:144-main/daily/server-configs-*.tar.gz`            |
| SSL cert                     | re-issued by certbot                                       |
| Deploy scripts               | `gdrive:144-main/daily/trendimovies-deploy-scripts-*.tar.gz`|
| Deploy key (server side)     | regenerate; update GitHub secret `DEPLOY_SSH_KEY`           |
| Telegram bot service         | separate box (38.242.195.0), has its own DR                |

## Last-deploy rollback

A failed deploy is the most common "disaster." The install script keeps
the previous build as `dist.prev/`:

```bash
ssh root@144.91.71.106
cd /var/www/trendimovies
[ -d dist.prev ] || { echo 'no dist.prev — cannot rollback'; exit 1; }
mv dist dist.failed.$(date +%FT%H%M%S)
mv dist.prev dist
pm2 reload trendimovies-astro --update-env
curl -sI https://trendimovies.com/ | head -3
```

## DB restore — current box, lost catalog

```bash
# 1. Stop reads/writes to the affected schema
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "REVOKE ALL ON SCHEMA public FROM PUBLIC; REVOKE ALL ON SCHEMA public FROM anon, authenticated;"

# 2. Pull yesterday's dump
DATE=$(date -d 'yesterday' +%F)
rclone copy gdrive:databases/144-main/$DATE/postgres-$DATE.dump /tmp/

# 3. Restore (overwrites the public schema; preserves auth/storage)
docker cp /tmp/postgres-$DATE.dump supabase-db:/tmp/
docker exec -it supabase-db pg_restore -U postgres -d postgres \
  --clean --if-exists --schema=public /tmp/postgres-$DATE.dump

# 4. Re-grant + reload
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "GRANT USAGE ON SCHEMA public TO PUBLIC; GRANT ALL ON SCHEMA public TO postgres;"
pm2 reload trendimovies-astro --update-env
```

## Public assets restore (posters)

If `public/images/posters/` got wiped:

```bash
cd /var/www/trendimovies
rclone copy gdrive:144-main/daily/trendimovies-LATEST.tar.gz /tmp/
tar -xzf /tmp/trendimovies-LATEST.tar.gz --strip-components=4 \
  -C public/images/posters/ var/www/trendimovies/public/images/posters/
chown -R trendimovies:trendimovies public/images/posters/
```

## Rebuild on a fresh server

```bash
# ── On the NEW server ────────────────────────────────────────────────

# 1. Base packages
apt-get update && apt-get install -y nginx nodejs npm rsync certbot \
  python3-certbot-nginx rclone git
curl -fsSL https://get.docker.com | sh

# 2. PM2
npm install -g pm2

# 3. Create dedicated user
useradd -m -s /bin/bash trendimovies
mkdir -p /var/www/trendimovies
chown trendimovies:trendimovies /var/www/trendimovies

# 4. Clone source
sudo -u trendimovies git clone https://github.com/xboggg/trendimovies-com \
  /var/www/trendimovies

# 5. Restore .env from configs tarball
rclone copy gdrive:144-main/daily/server-configs-LATEST.tar.gz /tmp/
tar -xzf /tmp/server-configs-LATEST.tar.gz -C /  # restores .env in place
chmod 600 /var/www/trendimovies/.env
chown trendimovies:trendimovies /var/www/trendimovies/.env

# 6. Spin up self-hosted Supabase (see ../techtrendi/DOCS/DISASTER_RECOVERY.md
#    — same Postgres container hosts the catalog). Restore the dump:
DATE=$(date -d 'yesterday' +%F)
rclone copy gdrive:databases/144-main/$DATE/postgres-$DATE.dump /tmp/
docker cp /tmp/postgres-$DATE.dump supabase-db:/tmp/
docker exec -it supabase-db pg_restore -U postgres -d postgres \
  --clean --if-exists /tmp/postgres-$DATE.dump

# 7. Install deps and build
cd /var/www/trendimovies
sudo -u trendimovies npm ci
sudo -u trendimovies npx astro build

# 8. Start under PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup        # follow the printed instructions

# 9. nginx + SSL
#    Vhost is in the server-configs tarball at /etc/nginx/sites-available/
cp /etc/nginx/sites-available/trendimovies /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d trendimovies.com -d www.trendimovies.com

# 10. Restore the deploy gate scripts
rclone copy gdrive:144-main/daily/trendimovies-deploy-scripts-LATEST.tar.gz /tmp/
tar -xzf /tmp/trendimovies-deploy-scripts-LATEST.tar.gz -C /usr/local/bin/
chmod +x /usr/local/bin/trendimovies-{deploy,install}

# 11. Re-issue the deploy key (see "Re-issuing the deploy key" below)
```

## Re-issuing the deploy key

```bash
# On any workstation
ssh-keygen -t ed25519 -f /tmp/tm_key -N '' \
  -C 'trendimovies-github-actions@xboggg'

gh -R xboggg/trendimovies-com secret set DEPLOY_SSH_KEY < /tmp/tm_key

# On 144
sed -i '/trendimovies-github-actions@xboggg/d' /root/.ssh/authorized_keys
PUBKEY=$(cat /tmp/tm_key.pub)
echo "command=\"/usr/local/bin/trendimovies-deploy\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,restrict $PUBKEY" \
  >> /root/.ssh/authorized_keys
```

The next workflow run picks up the new key automatically.

## What is NOT covered by automated backup

- Cloudflare WAF rules and DNS records — manage via Cloudflare dashboard
  (mirrored manually if you change them; otherwise the live config is the
  source of truth)
- Posters that were never in the public/images/posters/ folder
  (TMDB-only references) — these regenerate on first visit because the
  app can re-fetch from TMDB
- In-flight admin sessions — restoring an old `.env` with a different
  `ADMIN_SESSION_SECRET` will log out the admin
