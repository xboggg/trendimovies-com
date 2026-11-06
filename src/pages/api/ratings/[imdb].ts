import type { APIRoute } from 'astro';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// IMDb rating and Rotten Tomatoes score for the movie page, from OMDb
// (omdbapi.com, one key in OMDB_API_KEY). Every film is asked for at most
// once a week: answers are kept in memory and in a small file, so visitors
// never wait on OMDb and the free daily limit is never close. With no key,
// or if OMDb is down, the answer is simply "nothing" and the page shows only
// the scores it already has.
const KEY = process.env.OMDB_API_KEY || (import.meta as any).env?.OMDB_API_KEY || '';
const FILE = '/opt/trendimovies/cache/omdb-ratings.json';
const WEEK = 7 * 24 * 3600 * 1000;
const RETRY = 6 * 3600 * 1000;

type Entry = { at: number; imdb: { rating: number; votes: number } | null; rt: number | null; ok: boolean };
let cache: Record<string, Entry> | null = null;

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

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' };

export const GET: APIRoute = async ({ params }) => {
  const id = String(params.imdb || '');
  if (!/^tt\d{6,10}$/.test(id)) {
    return new Response(JSON.stringify({ imdb: null, rt: null }), { status: 400, headers });
  }
  const c = load();
  const hit = c[id];
  if (hit && Date.now() - hit.at < (hit.ok ? WEEK : RETRY)) {
    return new Response(JSON.stringify({ imdb: hit.imdb, rt: hit.rt }), { headers });
  }
  if (!KEY) return new Response(JSON.stringify({ imdb: null, rt: null }), { headers });

  let entry: Entry = { at: Date.now(), imdb: null, rt: null, ok: false };
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(`https://www.omdbapi.com/?apikey=${encodeURIComponent(KEY)}&i=${id}`, { signal: ctl.signal });
    clearTimeout(t);
    const d: any = await res.json();
    if (d && d.Response === 'True') {
      const rating = parseFloat(d.imdbRating);
      const votes = parseInt(String(d.imdbVotes || '').replace(/,/g, ''), 10);
      const rtRow = (d.Ratings || []).find((r: any) => r.Source === 'Rotten Tomatoes');
      const rt = rtRow ? parseInt(String(rtRow.Value), 10) : NaN;
      entry = {
        at: Date.now(),
        imdb: isFinite(rating) ? { rating, votes: isFinite(votes) ? votes : 0 } : null,
        rt: isFinite(rt) ? rt : null,
        ok: true,
      };
    }
  } catch (e) {
    console.error('OMDb lookup failed:', (e as Error).message);
  }
  c[id] = entry;
  save();
  return new Response(JSON.stringify({ imdb: entry.imdb, rt: entry.rt }), { headers });
};
