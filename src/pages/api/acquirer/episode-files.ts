import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

// Which Telegram files an episode's download buttons point to RIGHT NOW
// (added 2026-10-19 for the acquirer's airing tracker).
//
// The tracker on Oracle only deletes a MeGusta placeholder after this endpoint
// shows the WEBRip is linked and the MeGusta is not -- so a deletion can never
// leave an episode without a download. Token-gated with ACQUIRER_TOKEN
// (X-Acquirer-Token), same as /api/acquirer/airing-series.
//
// GET ?tmdb_id=<series tmdb id>&season=<n>&episode=<n>
//  -> { found: true, links: [{ quality, message_id, file_name, file_size }] }
// message_id is the file's message id in the 1A channel.

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

async function pg(path: string): Promise<any[]> {
  const r = await fetch(`${POSTGREST_URL}/${path}`, { headers: pgHeaders() });
  if (!r.ok) throw new Error(`postgrest ${r.status}`);
  return r.json();
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!acquirerTokenOk(request)) return json({ error: 'Unauthorized' }, 401);
  const tmdbId = parseInt(url.searchParams.get('tmdb_id') || '', 10);
  const season = parseInt(url.searchParams.get('season') || '', 10);
  const episode = parseInt(url.searchParams.get('episode') || '', 10);
  if (!tmdbId || isNaN(season) || !episode) return json({ error: 'tmdb_id, season, episode required' }, 400);

  try {
    const series = await pg(`series?tmdb_id=eq.${tmdbId}&select=id`);
    if (!series.length) return json({ found: false, reason: 'series not on site', links: [] });
    const seasons = await pg(`seasons?series_id=eq.${series[0].id}&season_number=eq.${season}&select=id`);
    if (!seasons.length) return json({ found: false, reason: 'season not on site', links: [] });
    const eps = await pg(`episodes?season_id=eq.${seasons[0].id}&episode_number=eq.${episode}&select=id`);
    if (!eps.length) return json({ found: false, reason: 'episode not on site', links: [] });
    const links = await pg(`download_links?content_type=eq.episode&content_id=eq.${eps[0].id}` +
                           `&is_active=eq.true&select=quality,telegram_file_id`);

    const db = new Database(CATALOG_PATH, { readonly: true, fileMustExist: true });
    try {
      const q = db.prepare('SELECT message_id, file_name, file_size FROM movies WHERE id = ?');
      const out = links.map((l: any) => {
        const row: any = q.get(parseInt(l.telegram_file_id, 10)) || {};
        return { quality: l.quality, message_id: row.message_id ?? null,
                 file_name: row.file_name ?? null, file_size: row.file_size ?? null };
      });
      return json({ found: true, links: out });
    } finally {
      db.close();
    }
  } catch (e) {
    console.error('episode-files error:', e);
    return json({ error: 'Server error' }, 500);
  }
};
