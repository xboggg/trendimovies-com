import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
// Astro's Node adapter (output: 'server') only serves static files from
// dist/client/ -- that's a build-time COPY of public/, made once by
// `npm run build`. Writing only to public/ means a runtime upload is
// invisible (404) until the next full rebuild, which could be hours or
// days away. Write to both: public/ so the file survives the next
// rebuild (which wipes and repopulates dist/client/ from public/ alone),
// and dist/client/ so it's actually reachable immediately.
const POSTERS_DIR_SRC = '/var/www/trendimovies/public/images/posters';
const POSTERS_DIR_LIVE = '/var/www/trendimovies/dist/client/images/posters';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, checked against the decoded image bytes
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

async function pg(pathSuffix: string, init?: RequestInit) {
  return fetch(`${POSTGREST_URL}/${pathSuffix}`, {
    ...init,
    headers: { 'Accept-Profile': 'public', 'Content-Profile': 'public', 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}

// POST: upload/replace a movie's poster image from the admin panel.
// JSON body: { movieId: number, fileName: string, contentType: string, dataBase64: string }
//
// Sent as JSON with a base64-encoded image rather than multipart/form-data
// on purpose: Astro's built-in same-origin check for POST requests only
// inspects form-like content types (multipart/form-data,
// x-www-form-urlencoded, text/plain), and this server's `url.origin` does
// not currently resolve to the real public domain when running behind
// nginx (it falls back to "http://localhost", dropping both the real host
// and the port) -- so any multipart POST gets rejected as cross-site
// regardless of where it actually came from. That's a site-wide proxy/
// adapter configuration gap, not specific to this endpoint, and fixing it
// properly means touching nginx + Astro's Node adapter config for every
// route -- out of scope for a single admin feature. JSON POSTs are exempt
// from that check (confirmed against the existing working admin/blog.ts
// endpoint), so sending the image as base64 JSON avoids the bug entirely
// without touching shared infrastructure.
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const movieId = body?.movieId ? parseInt(body.movieId.toString(), 10) : NaN;
    const contentType = body?.contentType as string | undefined;
    const dataBase64 = body?.dataBase64 as string | undefined;

    if (!movieId || isNaN(movieId)) {
      return new Response(JSON.stringify({ error: 'movieId is required' }), { status: 400 });
    }
    if (!dataBase64) {
      return new Response(JSON.stringify({ error: 'poster image data is required' }), { status: 400 });
    }
    const ext = contentType ? ALLOWED_TYPES[contentType] : undefined;
    if (!ext) {
      return new Response(JSON.stringify({ error: 'Only JPG, PNG, or WEBP images are allowed' }), { status: 400 });
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(dataBase64, 'base64');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid image data' }), { status: 400 });
    }
    if (buffer.length === 0) {
      return new Response(JSON.stringify({ error: 'Empty file' }), { status: 400 });
    }
    if (buffer.length > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` }), { status: 400 });
    }

    // Look up the movie first so we can build a stable, readable filename
    // and confirm it actually exists before writing anything to disk.
    const movieRes = await pg(`movies?id=eq.${movieId}&select=id,slug,tmdb_id,title`);
    if (!movieRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to look up movie' }), { status: 500 });
    }
    const movies = await movieRes.json();
    const movie = Array.isArray(movies) && movies.length ? movies[0] : null;
    if (!movie) {
      return new Response(JSON.stringify({ error: 'Movie not found' }), { status: 404 });
    }

    const safeSlug = (movie.slug || `movie-${movie.id}`).toString();
    // Unique suffix on every upload so browsers/CDN never serve a stale
    // cached poster after a replace of the same movie.
    const fileName = `${safeSlug}-${movie.tmdb_id || movie.id}-${Date.now()}.${ext}`;
    const posterPath = `/images/posters/${fileName}`;

    for (const dir of [POSTERS_DIR_SRC, POSTERS_DIR_LIVE]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(path.join(dir, fileName), buffer);
    }

    const updateRes = await pg(`movies?id=eq.${movieId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ poster_path: posterPath }),
    });
    if (!updateRes.ok) {
      return new Response(JSON.stringify({ error: 'File saved but database update failed' }), { status: 500 });
    }
    const updated = await updateRes.json();

    return new Response(JSON.stringify({ ok: true, poster_path: posterPath, movie: updated?.[0] || null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
