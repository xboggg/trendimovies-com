# TrendiMovies — Architecture

## Stack

| Layer    | Choice                                         |
| -------- | ---------------------------------------------- |
| Frontend | Astro 4 with islands (Svelte for interactive)  |
| Rendering| SSR via @astrojs/node (Node adapter)           |
| Backend  | Astro API routes + dedicated /api/* endpoints  |
| Data     | PostgreSQL (Supabase self-hosted) + PostgREST  |
| Catalog  | TMDB API (cached per request)                  |
| Streams  | Telegram bot (separate service on port 8765)   |
| Auth     | Admin-only via password hash + signed cookie   |
| Hosting  | Contabo 144.91.71.106, behind nginx + Cloudflare|
| Process  | PM2 `trendimovies-astro` on port 3000          |
| Build    | `astro build` → dist/{client,server}/          |

## Layout

```
src/
├── pages/                  Astro routes (file-based)
│   ├── index.astro         Homepage
│   ├── movie/[id].astro    Movie detail (SSR with TMDB)
│   ├── tv/[id].astro       TV detail
│   ├── category/[slug].astro
│   ├── api/                Server-side API endpoints
│   │   ├── admin/          Admin CRUD (gated by middleware)
│   │   ├── search.ts       Catalog search
│   │   └── og.png.ts       OG image generator
│   └── ... (many more)
├── components/             Reusable UI (Astro + Svelte islands)
├── layouts/BaseLayout.astro  Shared shell
├── lib/                    Server-side helpers
│   ├── tmdb.ts             TMDB client (retry + timeout)
│   ├── events.ts           Event-page data
│   └── ...
└── data/
    └── top_movies_by_year.json  Curated dataset

public/                     Served verbatim by nginx
├── images/posters/         Movie posters (cached locally)
├── images/                 Site graphics + OG images
└── fonts/                  Roboto for OG rendering

scripts/                    One-off ops scripts
├── sync-series-from-telegram.js
├── sync-tmdb.js
└── enrich_top_movies.cjs
```

## Request lifecycle

```
client → Cloudflare → nginx (trendimovies.com)
                       ├── /tgstream/*  → 127.0.0.1:8765   (Telegram bot)
                       ├── /api/admin/* → 127.0.0.1:3000   (Astro SSR — admin)
                       ├── /api/*       → 127.0.0.1:3000   (Astro SSR)
                       ├── /_astro/*    → /var/www/trendimovies/dist/client/_astro/
                       ├── /images/*    → /var/www/trendimovies/public/images/
                       └── /*           → 127.0.0.1:3000   (Astro SSR)
```

Astro's Node adapter listens on the configured `PORT`. The build emits
`dist/server/entry.mjs` (the Node entrypoint) and `dist/client/` (static
assets that nginx serves directly).

## Data flow

- **Movie / TV detail**: SSR calls `getMovieDetails(id)` in
  `src/lib/tmdb.ts`. TMDB calls are wrapped with a 1-retry timeout
  fallback so a slow upstream doesn't 502 the page.
- **Catalog search**: `/api/search` queries the local catalog
  (Supabase) for download-link availability and joins with TMDB
  metadata.
- **Streaming**: `/tgstream/stream/<file_id>` is reverse-proxied to a
  separate Telegram-bot service on port 8765. That service streams
  Telegram-hosted files transparently to the browser.
- **Admin**: `/api/admin/*` is gated by an `ADMIN_SESSION_SECRET`
  cookie. The admin can add/remove movies, sync from Telegram, edit
  metadata.

## Build & deploy

`npm run build` runs Astro's build pipeline:
1. Vite bundles client islands
2. Renders prerenderable routes (sitemap, RSS, etc.)
3. Compiles SSR pages into `dist/server/`

The deploy install script (`/usr/local/bin/trendimovies-install`):
1. Snapshots current `/var/www/trendimovies/` minus heavy dirs to
   `/var/www/trendimovies.backup/`
2. Rsyncs the new source over the webroot, **preserving** `.env`,
   `dist/`, `dist.prev/`, `node_modules/`, `.cache/`, `.astro/`,
   `backups/`, `public_old_backup/`, `src_old_backup/`, and dist
   backup folders
3. Runs `npm ci` only if `package*.json` changed
4. Builds `astro build --outDir /var/www/trendimovies/.dist-build.XXXXXX`
5. Atomic swap: `mv dist dist.prev && mv .dist-build dist`
6. `pm2 reload trendimovies-astro --update-env`

The old build sits as `dist.prev` for one-step rollback.

## Hardening

- All admin routes behind cookie + password-hash check.
- TMDB calls have retry-with-backoff and timeout to survive upstream
  flakes without 502-ing the user.
- Telegram bot is sandboxed: a separate process, its own port, its own
  auth. Compromising the catalog process does not compromise the bot.
- All PUBLIC_* vars (Supabase URL, anon key) are non-sensitive by
  design. Secrets (`TMDB_API_KEY`, `ADMIN_SESSION_SECRET`,
  `ADMIN_PASSWORD_HASH`) are runtime-only — never inlined in the
  client bundle.
- Backups: nightly Postgres schema dump + webroot tarball to Google
  Drive (see OPERATIONS.md).
