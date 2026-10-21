import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

// Which files each film's download buttons use right now (added 2026-10-22).
// The acquirer uses it to skip films already complete and to know which
// copies are still missing. Token-gated (X-Acquirer-Token).
//
// GET ?tmdb_ids=1,2,3 (max 100)
//  -> { films: { "<tmdb_id>": { on_site: bool, links: [{quality, file_name, message_id}] } } }

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const CATALOG_PATH = '/opt/trendimovies/bot/database/movies.db';

let _apiJwt = '';
try { _apiJwt = readFileSync('/etc/trendimovies/jwt_secret', 'utf-8').trim(); } catch {}
function pgHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Accept-Profile': 'public' };
  if (_apiJwt) h['Authorization'] = 'Bearer ' + jwt.sign({ role: 'web_auth' }, _apiJwt, { expiresIn: '5m' });
  return h;
}

function acquirerTokenOk(request: Request): boolean {
  const given = request.headers.get('x-acquirer-token') || '';
  const expected = import.meta.env.ACQUIRER_TOKEN || process.env.ACQUIRER_TOKEN || '';
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = async ({ request, url }) => {
  if (!acquirerTokenOk(request)) return json({ error: 'Unauthorized' }, 401);
  const ids = (url.searchParams.get('tmdb_ids') || '')
    .split(',').map((x) => parseInt(x, 10)).filter((x) => x > 0).slice(0, 100);
  if (!ids.length) return json({ error: 'tmdb_ids required' }, 400);
  try {
    const mr = await fetch(`${POSTGREST_URL}/movies?tmdb_id=in.(${ids.join(',')})&select=id,tmdb_id`,
                           { headers: pgHeaders() });
    if (!mr.ok) return json({ error: 'Database error' }, 502);
    const movies: any[] = await mr.json();
    const films: Record<string, any> = {};
    for (const id of ids) films[String(id)] = { on_site: false, links: [] };
    if (movies.length) {
      const byId = new Map(movies.map((m) => [m.id, m.tmdb_id]));
      const lr = await fetch(`${POSTGREST_URL}/download_links?content_type=eq.movie&is_active=eq.true` +
                             `&content_id=in.(${movies.map((m) => m.id).join(',')})&select=content_id,quality,telegram_file_id`,
                             { headers: pgHeaders() });
      if (!lr.ok) return json({ error: 'Database error' }, 502);
      const links: any[] = await lr.json();
      const db = new Database(CATALOG_PATH, { readonly: true, fileMustExist: true });
      try {
        const q = db.prepare('SELECT message_id, file_name FROM movies WHERE id = ?');
        for (const l of links) {
          const tid = String(byId.get(l.content_id));
          const row: any = q.get(parseInt(l.telegram_file_id, 10)) || {};
          films[tid].on_site = true;
          films[tid].links.push({ quality: l.quality, file_name: row.file_name ?? null, message_id: row.message_id ?? null });
        }
      } finally {
        db.close();
      }
    }
    return json({ films });
  } catch (e) {
    console.error('movie-files error:', e);
    return json({ error: 'Server error' }, 500);
  }
};
