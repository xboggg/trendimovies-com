import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';

// Which files of a film are ALREADY IN TELEGRAM (active, not deleted) - added
// 2026-10-22, corrected twice the same day:
//  1. it first returned only the files the site's buttons use (one per quality),
//     so Hope 2026 / Masterplan 2026 looked incomplete although every copy was there;
//  2. a film can carry several titles: Hope 2026 (Korean, original 호프) is
//     uploaded as "Hopeu.2026..." too. Every known title counts: the title, the
//     original title, TMDB's other titles (sent as `alts`) and IMDb's other
//     titles for the film's IMDb id (offline IMDb data on this server).
//
// GET ?films=<json>  json = [{"id":1,"title":"Hope","alt":"호프","alts":["Hopeu"],"imdb":"tt27369017","year":2026}] (max 50)
//  -> { films: { "1": { files: [{file_name, message_id, file_size}], names: [...] } } }
// Token-gated (X-Acquirer-Token).

const CATALOG_PATH = '/opt/trendimovies/bot/database/movies.db';
const IMDB_PATH = '/opt/trendimovies/imdb/imdb_titles.db';

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

const norm = (s: string) =>
  (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

export const GET: APIRoute = async ({ request, url }) => {
  if (!acquirerTokenOk(request)) return json({ error: 'Unauthorized' }, 401);
  let films: any[] = [];
  try {
    films = JSON.parse(url.searchParams.get('films') || '[]').slice(0, 50);
  } catch {
    return json({ error: 'films must be JSON' }, 400);
  }
  const db = new Database(CATALOG_PATH, { readonly: true, fileMustExist: true });
  let imdb: Database.Database | null = null;
  try { imdb = new Database(IMDB_PATH, { readonly: true, fileMustExist: true }); } catch { imdb = null; }
  const out: Record<string, any> = {};
  try {
    // One catalogue scan per YEAR (not per name): every active non-episode file of
    // that year, indexed by its title part (everything before the year). A film
    // can have ~25 names; scanning a million rows per name timed out.
    const byYear = new Map<number, Map<string, any[]>>();
    const scan = db.prepare(`SELECT file_name, message_id, file_size FROM movies
                             WHERE file_name LIKE ? AND COALESCE(is_deleted, 0) = 0`);
    const yearIndex = (year: number) => {
      if (!byYear.has(year)) {
        const idx = new Map<string, any[]>();
        const re = new RegExp(`^(.*?)\\s${year}\\b`);
        for (const row of scan.all(`%${year}%`) as any[]) {
          const fnorm = norm(row.file_name.replace(/\[[^\]]*\]/g, ' '));
          if (/\bs\d{1,2}\s?e\d{1,3}\b/.test(fnorm)) continue;    // episodes are not films
          const m = fnorm.match(re);
          const t = m ? m[1].trim() : '';
          if (!t) continue;
          for (const k of new Set([t, t.replace(/^the /, '')])) {
            if (!idx.has(k)) idx.set(k, []);
            idx.get(k)!.push(row);
          }
        }
        byYear.set(year, idx);
      }
      return byYear.get(year)!;
    };
    const qa = imdb ? imdb.prepare(`SELECT DISTINCT norm FROM titles WHERE tconst = ? LIMIT 40`) : null;
    for (const f of films) {
      const year = parseInt(f.year, 10);
      const raw: string[] = [f.title, f.alt, ...(Array.isArray(f.alts) ? f.alts : [])];
      if (qa && typeof f.imdb === 'string' && /^tt\d+$/.test(f.imdb)) {
        for (const r of qa.all(f.imdb) as any[]) raw.push(r.norm);
      }
      const names = [...new Set(raw.filter(Boolean).map(norm).filter((x: string) => x.length > 1))].slice(0, 25);
      const found: Record<string, any> = {};
      if (year) {
        const idx = yearIndex(year);
        for (const n of names) {
          for (const k of [n, n.replace(/^the /, '')]) {
            for (const row of idx.get(k) || []) found[row.file_name] = row;
          }
        }
      }
      out[String(f.id)] = { files: Object.values(found), names };
    }
  } finally {
    db.close();
    if (imdb) imdb.close();
  }
  return json({ films: out });
};
