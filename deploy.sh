#!/bin/bash
# TrendiMovies Deploy Script
# Usage: ./deploy.sh ["optional commit message"]
# Flow: git add -A → commit → push → build → deploy to VPS

set -e

VPS_USER="root"
VPS_HOST="144.91.71.106"
VPS_PATH="/var/www/trendimovies"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $1"; }
fail() { echo -e "${RED}[deploy] ERROR:${NC} $1"; exit 1; }

# ── 1. Sync to GitHub ──────────────────────────────────────────────────────────

COMMIT_MSG="${1:-Deploy: $(date '+%Y-%m-%d %H:%M')}"

log "Staging all changes..."
git add -A

if git diff --cached --quiet; then
  warn "Nothing to commit — working tree clean. Skipping commit."
else
  log "Committing: \"$COMMIT_MSG\""
  git commit -m "$COMMIT_MSG"
fi

log "Pushing to GitHub (origin/main)..."
git push origin main

# ── 2. Build ───────────────────────────────────────────────────────────────────

log "Building..."
npm run build || fail "Build failed"

# ── 3. Package ────────────────────────────────────────────────────────────────

log "Packaging dist..."
tar czf dist.tar.gz dist/

# ── 4. Deploy to VPS ──────────────────────────────────────────────────────────

log "Uploading to VPS..."
scp dist.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/dist.tar.gz

log "Extracting on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "
  cd ${VPS_PATH} &&
  tar xzf /tmp/dist.tar.gz &&
  rm /tmp/dist.tar.gz &&
  pm2 restart trendimovies-astro
"

# ── 5. Cleanup ────────────────────────────────────────────────────────────────

rm -f dist.tar.gz

log "Done! trendimovies.com is live."
