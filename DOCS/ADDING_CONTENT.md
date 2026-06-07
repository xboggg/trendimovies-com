# TrendiMovies — Adding Content & Pages

The catalog (movies, TV shows, episodes, download links) is admin-managed
via the in-app admin UI. Most "content" work doesn't touch the codebase.

For code-level changes:

## Adding a new page

Astro is file-based — drop a new `.astro` file in `src/pages/` and it
becomes a route.

```
src/pages/awards-2026.astro     →   /awards-2026
src/pages/category/horror.astro →   /category/horror  (or use [slug])
```

Reuse `BaseLayout`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Awards 2026" description="...">
  <main>
    <!-- ... -->
  </main>
</BaseLayout>
```

## Adding a category, genre, or curated list

Two patterns:

**Dynamic ([slug] routes)**: edit `src/pages/category/[slug].astro` and
add the slug → query mapping at the top of the file.

**Static lists**: drop a JSON dataset in `src/data/`, import it in a
page, and render. The current `top_movies_by_year.json` is a good
example — see `src/pages/top-movies.astro`.

## Adding an event / collection

Events (Cannes, awards, festival lineups) live in
`src/lib/events.ts` as a static config array. Add an entry there, then
create the matching page at `src/pages/<event>-YYYY.astro`.

## Adding a new API endpoint

```
src/pages/api/my-thing.ts        →   GET /api/my-thing
src/pages/api/admin/my-thing.ts  →   GET /api/admin/my-thing (admin-gated)
```

Admin routes inherit the admin auth middleware from
`src/middleware.ts`. Anything under `/api/admin/*` requires a valid
admin session cookie.

## Adding a UI component

- `.astro` for static / SSR components
- `.svelte` for interactive islands (we already have Svelte set up)

Mount a Svelte island in an Astro page with:

```astro
<MySvelteComponent client:load />     {/* or client:visible, client:idle */}
```

Use `client:visible` by default — defers the JS until the user scrolls
to the component.

## Image policy

- Posters go to `public/images/posters/`
- OG images go to `public/images/`
- Use `.webp` for screenshots (smaller); `.jpg` for posters where TMDB
  already gives us JPEG
- nginx serves these directly — no Astro overhead

## Adding a Telegram-sync script

Sync scripts live in `scripts/`. The pattern:

```js
// scripts/sync-<thing>.js
import { createClient } from '@supabase/supabase-js';
// ... do work
// ... write progress to scripts/<thing>-progress.json
```

Run manually from server:
```bash
cd /var/www/trendimovies
node scripts/sync-<thing>.js
```

Progress files in `scripts/*-progress.json` are tracked in git — they
record where the last sync left off so re-runs are resumable.

## Editing schema

Catalog schema lives in Supabase. **DO NOT** edit on the live DB
without a backup. Standard flow:

```bash
# 1. Snapshot the DB
docker exec supabase-db pg_dump -U postgres -Fc -d postgres > /tmp/catalog-pre.dump

# 2. Apply your migration as a SQL file
docker exec -i supabase-db psql -U postgres -d postgres < /path/to/migration.sql

# 3. Sanity check the affected tables
docker exec -it supabase-db psql -U postgres -d postgres
```

For Astro to pick up new columns, you may also need to regenerate
TypeScript types from Supabase. There's no automated pipeline — keep
the types in `src/lib/db-types.ts` in sync manually.
