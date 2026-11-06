import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// IMDb rating and Rotten Tomatoes score for the movie and series pages.
//
// IMDb: read from a local copy of IMDb's free ratings file
// (/opt/trendimovies/cache/imdb_ratings.db, rebuilt weekly by
// /opt/trendimovies/imdb/build_ratings.py). No daily limit, works for every
// title IMDb has rated.
//
// Rotten Tomatoes: only OMDb (omdbapi.com, key in OMDB_API_KEY) has it. The
// free key allows about 1000 questions a day, so: an answer is kept for 30
// days, a "limit reached" or network failure is NEVER stored (it just pauses
// questions until the limit resets at midnight UTC), and search-engine bots
// are answered from what is already stored and never spend the allowance.
const KEY = process.env.OMDB_API_KEY || (import.meta as any).env?.OMDB_API_KEY || '';
const FILE = '/opt/trendimovies/cache/omdb-ratings.json';
const IMDB_DB = '/opt/trendimovies/cache/imdb_ratings.db';
const KEEP = 30 * 24 * 3600 * 1000;

type Entry = { at: number; rt: number | null; ok: boolean };
let cache: Record<string, Entry> | null = null;
let pausedUntil = 0;

function load(): Record<string, Entry> {
  if (cache) return cache;
  try { cache = JSON.parse(readFileSync(FILE, 'utf-8')); } catch (e) { cache = {}; }
  return cache as Record<string, Entry>;
}
function save() {
  try {
    mkdirSync('/opt/trendimovies/cache', { recursive: true });
    writeFileSync(FILE, JSON.stringify(cache));
  } catch (e) {}
}

function imdbScore(id: string): { rating: number; votes: number } | null {
  let db: Database.Database | null = null;
  try {
    db = new Database(IMDB_DB, { readonly: true, fileMustExist: true });
    const row = db.prepare('SELECT rating, votes FROM r WHERE tconst = ?').get(id) as { rating: number; votes: number } | undefined;
    return row ? { rating: row.rating, votes: row.votes } : null;
  } catch (e) {
    return null;
  } finally {
    try { db?.close(); } catch (e) {}
  }
}

function nextMidnightUtc(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 5, 0);
}

export const GET: APIRoute = async ({ params, request }) => {
  const id = String(params.imdb || '');
  const json = (body: unknown, maxAge: number, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}` } });
  if (!/^tt\d{6,10}$/.test(id)) return json({ imdb: null, rt: null }, 3600, 400);

  const imdb = imdbScore(id);
  const c = load();
  const hit = c[id];
  // Old failed lookups (ok:false) are ignored; only real answers count.
  if (hit && hit.ok && Date.now() - hit.at < KEEP) return json({ imdb, rt: hit.rt }, 3600);

  const ua = request.headers.get('user-agent') || '';
  const isBot = /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|preview/i.test(ua);
  if (!KEY || isBot || Date.now() < pausedUntil) return json({ imdb, rt: null }, 600);

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(`https://www.omdbapi.com/?apikey=${encodeURIComponent(KEY)}&i=${id}`, { signal: ctl.signal });
    clearTimeout(t);
    const d: any = await res.json();
    if (d && d.Response === 'True') {
      const rtRow = (d.Ratings || []).find((r: any) => r.Source === 'Rotten Tomatoes');
      const rt = rtRow ? parseInt(String(rtRow.Value), 10) : NaN;
      const entry: Entry = { at: Date.now(), rt: isFinite(rt) ? rt : null, ok: true };
      c[id] = entry;
      save();
      return json({ imdb, rt: entry.rt }, 3600);
    }
    if (d && /limit/i.test(String(d.Error || ''))) pausedUntil = nextMidnightUtc();
    else if (d && /not found|incorrect/i.test(String(d.Error || ''))) {
      c[id] = { at: Date.now(), rt: null, ok: true };
      save();
    }
  } catch (e) {
    console.error('OMDb lookup failed:', (e as Error).message);
  }
  return json({ imdb, rt: null }, 600);
};
