/**
 * Shared data for the Telegram Mini App (/app): used by /api/app/home (the home rows) and /api/app/more (a full row).
 *
 * The rows are NOT re-computed here. They are read from the site's own pages (the home page and /digital-releases), so the
 * app always shows the same titles, posters and order as the website. That makes this file depend on the markup of those two
 * pages (h2 section headings, <a href="/movie/ID"> cards, <h3> titles, <span> badges). If a row stops appearing in the app, the
 * home page markup changed: fix parseCards() / ROWS below.
 *
 * The result is cached in memory for 10 minutes; if a refresh fails the last good copy is served.
 */

import { fetchFromTMDB } from './tmdb';

const PG = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const SELF = `http://127.0.0.1:${process.env.PORT || '3000'}`;
const TTL_MS = 10 * 60 * 1000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ROW_LIMIT = 60;
/** A "More" list shows at most this many titles. */
export const MORE_LIMIT = 30;

/** Row order on the app home. `heading` = the h2 text on the website home page ('' = built from another source). */
export const ROWS: Array<{ key: string; title: string; heading: string; seeAll: string }> = [
  { key: 'trending', title: 'Trending This Week', heading: 'Trending This Week', seeAll: '/trending' },
  { key: 'newmovies', title: 'Newly Added Movies', heading: 'Newly Added Movies', seeAll: '/movies/latest' },
  { key: 'newep', title: 'New Episodes This Week', heading: 'New Episodes This Week', seeAll: '/series/new-episodes' },
  { key: 'tvtrending', title: 'Trending TV Series', heading: 'Trending TV Series', seeAll: '/series/popular' },
  { key: 'action', title: 'Non-Stop Action', heading: 'Non-Stop Action', seeAll: '/genre/action' },
  { key: 'digital', title: 'Digital Releases', heading: '', seeAll: '/digital-releases' },
];
export const REVIEWS_META = { key: 'reviews', title: 'Movie Reviews', seeAll: '/reviews' };

export type Card = { t: string; img: string; href: string; type: 'movie' | 'series' | 'request'; id?: number; ep?: string; q?: string; date?: string; y?: number };
export type Review = { slug: string; t: string; y: number | null; h: string; rt: string; img: string; href: string };
export type HeroCard = Card & { tag: string };
export type AppData = { today: string; rows: Record<string, Card[]>; reviews: Review[]; hero: HeroCard[] };

let cache: { at: number; data: AppData } | null = null;

/** Today's date as the UTC date (= Ghana's date). The home page and /digital-releases use the same "today". */
export function localISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function decode(s: string): string {
  return s.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, '&');
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decode(m[1]) : '';
}

export function sized(src: string, w: number): string {
  return src.includes('image.tmdb.org') ? src.replace(/\/t\/p\/w\d+\//, `/t/p/w${w}/`) : src;
}

async function getText(url: string): Promise<string> {
  const r = await fetch(url, { headers: { 'User-Agent': 'TrendiMovies-AppData/1.0' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return await r.text();
}

function parseCards(chunk: string, limit: number): Card[] {
  const out: Card[] = [];
  const seen = new Set<string>();
  const re = /<a\s+href="(\/(?:movie|tv)\/(\d+)[^"]*|\/request\?title=[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const m of chunk.matchAll(re)) {
    const href = decode(m[1]);
    const inner = m[3];
    const imgTag = inner.match(/<img\b[^>]*>/);
    if (!imgTag) continue;
    const src = attr(imgTag[0], 'src');
    const alt = attr(imgTag[0], 'alt');
    if (!src || src.includes('no-poster')) continue;
    const h3 = inner.match(/<h3[^>]*>([^<]*)<\/h3>/);
    const t = (h3 ? decode(h3[1]) : alt).trim();
    if (!t || seen.has(href)) continue;
    seen.add(href);
    const spans = Array.from(inner.matchAll(/<span[^>]*>([^<]*)<\/span>/g)).map((x) => x[1].trim());
    const ep = spans.find((s) => /^(S\d{1,2}E\d{1,3}|E\d{1,3})$/.test(s));
    const q = spans.find((s) => /^(HD|4K|CAM|\d{3,4}p)$/i.test(s));
    const type: Card['type'] = href.startsWith('/tv/') ? 'series' : (href.startsWith('/movie/') ? 'movie' : 'request');
    out.push({ t, img: src, href, type, id: m[2] ? Number(m[2]) : undefined, ep, q });
    if (out.length >= limit) break;
  }
  return out;
}

function sectionsOf(html: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const part of html.split(/(?=<h2\b)/).slice(1)) {
    const m = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (m) map[decode(m[1].replace(/<[^>]+>/g, '')).trim()] = part;
  }
  return map;
}

/** Astro writes an island's props as [type, value] pairs (0 = plain value or object, 1 = array). */
function astroValue(v: any): any {
  if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') {
    const [t, x] = v;
    if (t === 0) return x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).map(([k, y]) => [k, astroValue(y)])) : x;
    if (t === 1) return (x as any[]).map(astroValue);
    return x;
  }
  return v;
}

/**
 * The website's OWN hero (top 8 TMDB weekly trending movies + top 4 trending series, interleaved, 12 slides) is passed to its hero
 * component as props, and Astro writes those props into the page. Reading them from there gives the app exactly the website's
 * hero with no TMDB call. Returns [] if the markup changed (the caller then falls back to a hero built from the rows).
 */
function parseHero(home: string): HeroCard[] {
  try {
    for (const m of home.matchAll(/<astro-island\b[^>]*>/g)) {
      const tag = m[0];
      if (!/component-url="[^"]*Hero/.test(tag)) continue;
      const pm = tag.match(/\sprops="([^"]*)"/);
      if (!pm) continue;
      const props = JSON.parse(decode(pm[1]));
      const list = astroValue(props.trending);
      if (!Array.isArray(list)) continue;
      const out: HeroCard[] = [];
      for (const it of list) {
        const title = it && (it.title || it.name);
        const id = Number(it && it.id);
        if (!title || !id || !it.poster_path) continue;
        const series = it.type === 'series' || it.media_type === 'tv';
        const p = String(it.poster_path);
        out.push({
          t: String(title), img: p.startsWith('/images/') ? p : `https://image.tmdb.org/t/p/w500${p}`,
          href: `${series ? '/tv/' : '/movie/'}${id}`, type: series ? 'series' : 'movie', id,
          tag: series ? 'Trending series' : 'Trending movie',
          y: (() => { const v = parseInt(String(it.release_date || it.first_air_date || it.year || '').slice(0, 4), 10); return v > 1800 ? v : undefined; })(),
        });
      }
      if (out.length) return out;
    }
  } catch (e) { /* fall through */ }
  return [];
}

async function digitalRows(today: string): Promise<Card[]> {
  const html = await getText(`${SELF}/digital-releases`);
  const out: Card[] = [];
  for (const blk of html.split(/(?=<h2\b)/).slice(1)) {
    const h = blk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (!h) continue;
    const dm = decode(h[1].replace(/<[^>]+>/g, '')).match(/([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})/);
    if (!dm) continue;
    const mi = MONTHS.indexOf(dm[1]);
    if (mi < 0) continue;
    const iso = `${dm[3]}-${String(mi + 1).padStart(2, '0')}-${String(Number(dm[2])).padStart(2, '0')}`;
    if (iso < today) continue;
    for (const c of parseCards(blk, 60)) out.push({ ...c, date: iso, img: sized(c.img, 342) });
  }
  out.sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0));
  return out.slice(0, ROW_LIMIT);
}

async function reviewRows(): Promise<Review[]> {
  const r = await fetch(`${PG}/movie_reviews?status=eq.published&select=slug,title,year,headline,poster_path,rt_score&order=published_at.desc&limit=40`,
    { signal: AbortSignal.timeout(8000) });
  if (!r.ok) return [];
  const rows = await r.json();
  return (rows || []).map((x: any) => ({
    slug: x.slug, t: x.title, y: x.year, h: x.headline, rt: x.rt_score || '',
    img: x.poster_path ? (String(x.poster_path).startsWith('/images/') ? x.poster_path : `https://image.tmdb.org/t/p/w185${x.poster_path}`) : '',
    href: `/review/${x.slug}`,
  }));
}

// Rows that come from TMDB hold fewer than 30 titles on the website itself: TMDB gives 20 per page for trending, and the website
// cuts the action row at 15. To let a "More" list reach 30, ask TMDB for the next page(s) and APPEND (the first titles stay exactly
// the website's row; duplicates are skipped; a failure just leaves the row as it was). TMDB answers in 20-120 ms and the site's own
// TMDB helper caches the pages.
const TOPUP: Array<{ key: string; endpoint: string; params: Record<string, string>; type: 'movie' | 'series'; pages: number[] }> = [
  { key: 'trending', endpoint: '/trending/movie/week', params: {}, type: 'movie', pages: [1, 2] },
  { key: 'tvtrending', endpoint: '/trending/tv/week', params: {}, type: 'series', pages: [1, 2] },
  { key: 'action', endpoint: '/discover/movie', params: { with_genres: '28', sort_by: 'popularity.desc' }, type: 'movie', pages: [1, 2] },
];

async function topUp(rows: Record<string, Card[]>): Promise<void> {
  for (const spec of TOPUP) {
    const row = rows[spec.key];
    if (!row || row.length === 0 || row.length >= MORE_LIMIT) continue;     // row missing (markup changed) or already long enough
    try {
      const seen = new Set(row.map((c) => c.href));
      for (const page of spec.pages) {
        const data: any = await fetchFromTMDB<any>(spec.endpoint, { ...spec.params, page: String(page) });
        for (const r of (data && data.results) || []) {
          if (row.length >= MORE_LIMIT) break;
          const id = Number(r.id);
          const title = r.title || r.name;
          if (!id || !title || !r.poster_path) continue;
          const href = `${spec.type === 'series' ? '/tv/' : '/movie/'}${id}`;
          if (seen.has(href)) continue;
          seen.add(href);
          const yr = parseInt(String(r.release_date || r.first_air_date || '').slice(0, 4), 10);
          row.push({ t: String(title), img: `https://image.tmdb.org/t/p/w342${r.poster_path}`, href, type: spec.type, id, y: yr > 1800 ? yr : undefined });
        }
        if (row.length >= MORE_LIMIT) break;
      }
    } catch (e) { /* keep the row as the website has it */ }
  }
}

/** Year printed on a poster. The website's cards do not carry it, so fill it from our own tables (one query per 150 titles). */
async function fillYears(rows: Record<string, Card[]>, hero: HeroCard[]): Promise<void> {
  try {
    const all: Card[] = [...hero, ...Object.values(rows).flat()];
    for (const [type, table] of [['movie', 'movies'], ['series', 'series']] as const) {
      const need = all.filter((c) => c.type === type && c.id && !c.y);
      const ids = Array.from(new Set(need.map((c) => c.id as number)));
      const year = new Map<number, number>();
      for (let i = 0; i < ids.length; i += 150) {
        const r = await fetch(`${PG}/${table}?tmdb_id=in.(${ids.slice(i, i + 150).join(',')})&select=tmdb_id,year`, { signal: AbortSignal.timeout(8000) });
        if (!r.ok) continue;
        for (const x of (await r.json()) || []) if (x.year) year.set(Number(x.tmdb_id), Number(x.year));
      }
      for (const c of need) {
        const y = year.get(c.id as number);
        if (y) c.y = y;
      }
    }
    for (const c of all) if (!c.y && c.date) c.y = Number(c.date.slice(0, 4));      // digital release not in our tables yet
    // titles we do not hold (trending ones): ask TMDB, 10 at a time (the site's TMDB helper caches every answer)
    const rest = Array.from(new Map(all.filter((c) => !c.y && c.id && (c.type === 'movie' || c.type === 'series')).map((c) => [c.href, c])).values());
    for (let i = 0; i < rest.length; i += 10) {
      await Promise.all(rest.slice(i, i + 10).map(async (c) => {
        try {
          const t: any = await fetchFromTMDB<any>(`/${c.type === 'series' ? 'tv' : 'movie'}/${c.id}`, {});
          const y = parseInt(String((t && (t.release_date || t.first_air_date)) || '').slice(0, 4), 10);
          if (y > 1800) for (const x of all) if (x.href === c.href) x.y = y;
        } catch (e) { /* no year */ }
      }));
    }
  } catch (e) { /* a poster without a year is fine */ }
}

async function build(): Promise<AppData> {
  const today = localISO();
  const home = await getText(`${SELF}/`);
  const secs = sectionsOf(home);
  const rows: Record<string, Card[]> = {};
  for (const r of ROWS) {
    if (!r.heading) continue;
    rows[r.key] = parseCards(secs[r.heading] || '', ROW_LIMIT).map((c) => ({ ...c, img: sized(c.img, 342) }));
  }
  const [digital, reviews] = await Promise.all([digitalRows(today).catch(() => [] as Card[]), reviewRows().catch(() => [] as Review[])]);
  rows.digital = digital;
  await topUp(rows);
  const total = Object.values(rows).reduce((n, r) => n + r.length, 0);
  if (total === 0) throw new Error('home page markup changed: no cards parsed');
  const hero = parseHero(home);
  await fillYears(rows, hero);
  return { today, rows, reviews, hero };
}

export async function getAppData(): Promise<AppData> {
  try {
    if (!cache || Date.now() - cache.at > TTL_MS) cache = { at: Date.now(), data: await build() };
  } catch (e) {
    if (!cache) throw e;           // a stale copy beats an empty app
  }
  return cache!.data;
}

// ---------------------------------------------------------------------------------------------------------------------------
// The Movies and Series tabs: 60 titles per page from OUR OWN database, with filters (genre, year, language, rating, sort, ...).
// The rules copy the website's own /movies/latest page, so the app and the site agree: only titles that have files; quality is NOT a
// filter (on the site it only matters when delivering on Telegram); the rating sort needs a vote floor, otherwise the top is films with
// 0 votes at a meaningless 10.0. Every value that reaches a query is checked against the lists below first.
export const PAGE_SIZE = 60;
const MOVIE_GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
  'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'];
const SERIES_GENRES = ['Drama', 'Comedy', 'Sci-Fi & Fantasy', 'Crime', 'Animation', 'Action & Adventure', 'Mystery', 'Documentary', 'Family',
  'Reality', 'Kids', 'War & Politics', 'Western', 'Soap'];
const LANGS: Record<string, { label: string; codes: string[] }> = {
  en: { label: 'English', codes: ['en'] },
  indian: { label: 'Indian', codes: ['hi', 'ta', 'ml', 'te', 'kn', 'bn', 'mr', 'pa', 'gu'] },
  chinese: { label: 'Chinese', codes: ['zh', 'cn'] },
  japanese: { label: 'Japanese', codes: ['ja'] },
  french: { label: 'French', codes: ['fr'] },
  korean: { label: 'Korean', codes: ['ko'] },
  spanish: { label: 'Spanish', codes: ['es'] },
};
const YEARS: Record<string, { label: string; from: number; to: number }> = {
  '2026': { label: '2026', from: 2026, to: 2026 },
  '2025': { label: '2025', from: 2025, to: 2025 },
  '2024': { label: '2024', from: 2024, to: 2024 },
  '2020s': { label: '2020–23', from: 2020, to: 2023 },
  '2010s': { label: '2010s', from: 2010, to: 2019 },
  'older': { label: 'Before 2010', from: 1900, to: 2009 },
};
const MOVIE_SORTS: Record<string, { label: string; order: string }> = {
  newest: { label: 'Newest added', order: 'created_at.desc' },
  rated: { label: 'Top rated', order: 'vote_average.desc' },
  popular: { label: 'Most popular', order: 'popularity.desc' },
  released: { label: 'Release date', order: 'release_date.desc' },
};
const SERIES_SORTS: Record<string, { label: string; order: string }> = {
  episodes: { label: 'New episodes', order: '' },                       // special: the series with the newest files, newest first
  rated: { label: 'Top rated', order: 'vote_average.desc' },
  popular: { label: 'Most popular', order: 'popularity.desc' },
  newest: { label: 'Newest shows', order: 'first_air_date.desc.nullslast' },
};

export type BrowseKind = 'movies' | 'series';
export type BrowseFilters = { genre?: string; lang?: string; year?: string; rating?: boolean; nolly?: boolean; running?: boolean; sort?: string; page?: number };

export function browseMeta(kind: BrowseKind) {
  const movies = kind === 'movies';
  return {
    genres: movies ? MOVIE_GENRES : SERIES_GENRES,
    langs: Object.entries(LANGS).map(([key, v]) => ({ key, label: v.label })),
    years: Object.entries(YEARS).map(([key, v]) => ({ key, label: v.label })),
    sorts: Object.entries(movies ? MOVIE_SORTS : SERIES_SORTS).map(([key, v]) => ({ key, label: v.label })),
    defaultSort: movies ? 'newest' : 'episodes',
  };
}

function posterUrl(p: any): string {
  if (!p) return '';
  const v = String(p);
  return v.startsWith('/images/') ? v : (v.startsWith('http') ? v : `https://image.tmdb.org/t/p/w342${v}`);
}

function totalOf(range: string | null): number {
  const m = range && range.match(/\/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

const browseCache = new Map<string, { at: number; data: any }>();

export async function browse(kind: BrowseKind, f: BrowseFilters) {
  const movies = kind === 'movies';
  const genre = f.genre && (movies ? MOVIE_GENRES : SERIES_GENRES).includes(f.genre) ? f.genre : '';
  const lang = f.lang && LANGS[f.lang] ? f.lang : '';
  const year = f.year && YEARS[f.year] ? f.year : '';
  const sorts = movies ? MOVIE_SORTS : SERIES_SORTS;
  const defaultSort = movies ? 'newest' : 'episodes';
  const sort = f.sort && sorts[f.sort] ? f.sort : defaultSort;
  const page = Math.min(Math.max(1, Math.floor(Number(f.page) || 1)), 200);
  const rating = !!f.rating;
  const nolly = movies && !!f.nolly;
  const running = !movies && !!f.running;

  const key = JSON.stringify([kind, genre, lang, year, sort, page, rating, nolly, running]);
  const hit = browseCache.get(key);
  if (hit && Date.now() - hit.at < 60000) return hit.data;

  // filters shared by both kinds; genre and status are shaped differently in the two tables
  const q: string[] = [];
  if (genre) q.push(`genres=cs.${encodeURIComponent(JSON.stringify(movies ? [genre] : [{ name: genre }]))}`);
  if (lang) q.push(`original_language=in.(${LANGS[lang].codes.join(',')})`);
  if (year) q.push(`year=gte.${YEARS[year].from}`, `year=lte.${YEARS[year].to}`);
  if (rating) q.push('vote_average=gte.7');
  if (nolly) q.push(`production_countries=cs.${encodeURIComponent(JSON.stringify(['NG']))}`);   // Nigerian: matched on production country, as on the website
  if (running) q.push('status=in.(%22Returning%20Series%22,%22In%20Production%22)');
  if (sort === 'rated') q.push(movies ? 'vote_count=gte.200' : 'vote_count=gte.100');

  const offset = (page - 1) * PAGE_SIZE;
  let items: Card[] = [];
  let total = 0;

  if (movies) {
    const url = `${PG}/movies?${['has_downloads=eq.true', ...q].join('&')}&order=${MOVIE_SORTS[sort].order}&limit=${PAGE_SIZE}&offset=${offset}&select=tmdb_id,title,year,poster_path`;
    const r = await fetch(url, { headers: { Prefer: 'count=exact' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`movies ${r.status}`);
    total = totalOf(r.headers.get('content-range'));
    items = ((await r.json()) || []).filter((x: any) => x.title).map((x: any) => ({
      t: x.title, img: posterUrl(x.poster_path), href: `/movie/${x.tmdb_id}`, type: 'movie' as const, id: Number(x.tmdb_id), y: x.year || undefined,
    }));
  } else if (sort === 'episodes') {
    // the series with the newest files (same list as the New Episodes row), narrowed by the filters
    const rr = await fetch(`${PG}/recent_episode_series?order=latest_added.desc&limit=500&select=tmdb_id,title,poster_path,season_number,episode_number,year`, { signal: AbortSignal.timeout(10000) });
    if (!rr.ok) throw new Error(`recent_episode_series ${rr.status}`);
    const recent: any[] = (await rr.json()) || [];
    let allowed: Set<number> | null = null;
    if (q.length && recent.length) {
      const sr = await fetch(`${PG}/series_with_downloads?${[`tmdb_id=in.(${recent.map((x) => Number(x.tmdb_id)).join(',')})`, ...q].join('&')}&select=tmdb_id`, { signal: AbortSignal.timeout(10000) });
      if (!sr.ok) throw new Error(`series_with_downloads ${sr.status}`);
      allowed = new Set(((await sr.json()) || []).map((x: any) => Number(x.tmdb_id)));
    }
    const list = recent.filter((x) => x.title && (!allowed || allowed.has(Number(x.tmdb_id))));
    total = list.length;
    items = list.slice(offset, offset + PAGE_SIZE).map((x: any) => ({
      t: x.title, img: posterUrl(x.poster_path), href: `/tv/${x.tmdb_id}`, type: 'series' as const, id: Number(x.tmdb_id), y: x.year || undefined,
      ep: `S${String(x.season_number).padStart(2, '0')}E${String(x.episode_number).padStart(2, '0')}`,
    }));
  } else {
    const url = `${PG}/series_with_downloads?${[...q, `order=${SERIES_SORTS[sort].order}`, `limit=${PAGE_SIZE}`, `offset=${offset}`, 'select=tmdb_id,title,year,poster_path'].join('&')}`;
    const r = await fetch(url, { headers: { Prefer: 'count=exact' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`series_with_downloads ${r.status}`);
    total = totalOf(r.headers.get('content-range'));
    items = ((await r.json()) || []).filter((x: any) => x.title).map((x: any) => ({
      t: x.title, img: posterUrl(x.poster_path), href: `/tv/${x.tmdb_id}`, type: 'series' as const, id: Number(x.tmdb_id), y: x.year || undefined,
    }));
  }

  const data = { kind, items, total, page, pageSize: PAGE_SIZE, hasMore: offset + items.length < total, sort, meta: browseMeta(kind) };
  if (browseCache.size > 300) browseCache.clear();
  browseCache.set(key, { at: Date.now(), data });
  return data;
}
