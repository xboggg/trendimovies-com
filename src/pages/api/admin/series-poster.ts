import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

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

// POST: upload/replace a series' poster image from the admin panel.
// JSON body: { seriesId: number, fileName: string, contentType: string, dataBase64: string }
// Direct clone of api/admin/movie-poster.ts targeting the `series` table
// instead of `movies` -- see that file for the reasoning behind JSON+base64
// instead of multipart/form-data (Astro's same-origin check rejects
// multipart behind this server's nginx proxy setup).
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const seriesId = body?.seriesId ? parseInt(body.seriesId.toString(), 10) : NaN;
    const contentType = body?.contentType as string | undefined;
    const dataBase64 = body?.dataBase64 as string | undefined;

    if (!seriesId || isNaN(seriesId)) {
      return new Response(JSON.stringify({ error: 'seriesId is required' }), { status: 400 });
    }
    if (!dataBase64) {
      return new Response(JSON.stringify({ error: 'poster image data is required' }), { status: 400 });
    }
    // Input format is validated here but not preserved -- every upload is
    // re-encoded to JPEG below, so the output extension is always 'jpg'.
    if (!contentType || !ALLOWED_TYPES[contentType]) {
      return new Response(JSON.stringify({ error: 'Only JPG, PNG, or WEBP images are allowed' }), { status: 400 });
    }
    const ext = 'jpg';

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

    // Re-encode as a resized JPEG regardless of the input format. 780px
    // wide matches the TMDB w780 size already used everywhere else on the
    // site, and quality 82 keeps posters looking sharp while landing
    // comfortably under 300KB (WhatsApp link-preview crawlers silently
    // drop oversized images).
    try {
      buffer = await sharp(buffer)
        .resize({ width: 780, withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
    } catch {
      return new Response(JSON.stringify({ error: 'Could not process image (unsupported or corrupt file)' }), { status: 400 });
    }

    // Look up the series first so we can build a stable, readable filename
    // and confirm it actually exists before writing anything to disk.
    const seriesRes = await pg(`series?id=eq.${seriesId}&select=id,slug,tmdb_id,title`);
    if (!seriesRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to look up series' }), { status: 500 });
    }
    const seriesRows = await seriesRes.json();
    const series = Array.isArray(seriesRows) && seriesRows.length ? seriesRows[0] : null;
    if (!series) {
      return new Response(JSON.stringify({ error: 'Series not found' }), { status: 404 });
    }

    const safeSlug = (series.slug || `series-${series.id}`).toString();
    // Unique suffix on every upload so browsers/CDN never serve a stale
    // cached poster after a replace of the same series.
    const fileName = `${safeSlug}-${series.tmdb_id || series.id}-${Date.now()}.${ext}`;
    const posterPath = `/images/posters/${fileName}`;

    for (const dir of [POSTERS_DIR_SRC, POSTERS_DIR_LIVE]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(path.join(dir, fileName), buffer);
    }

    const updateRes = await pg(`series?id=eq.${seriesId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ poster_path: posterPath }),
    });
    if (!updateRes.ok) {
      return new Response(JSON.stringify({ error: 'File saved but database update failed' }), { status: 500 });
    }
    const updated = await updateRes.json();

    return new Response(JSON.stringify({ ok: true, poster_path: posterPath, series: updated?.[0] || null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
