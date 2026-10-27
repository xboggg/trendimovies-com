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

const PG = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const SELF = `http://127.0.0.1:${process.env.PORT || '3000'}`;
const TTL_MS = 10 * 60 * 1000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ROW_LIMIT = 60;
/** A "More" list shows at most this many titles. */
export const MORE_LIMIT = 30;
/** The Movies and Series tabs show this many titles. */
const TAB_LIMIT = 60;

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

export type Card = { t: string; img: string; href: string; type: 'movie' | 'series' | 'request'; id?: number; ep?: string; q?: string; date?: string };
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
  const total = Object.values(rows).reduce((n, r) => n + r.length, 0);
  if (total === 0) throw new Error('home page markup changed: no cards parsed');
  return { today, rows, reviews, hero: parseHero(home) };
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
// The Movies and Series tabs: the 60 newest titles from OUR OWN database, same sources as the website's home rows
// "Newly Added Movies" (rpc/recently_added_movies: ordered by the moment a file was really added) and "New Episodes This Week"
// (recent_episode_series).
const tabCache: Record<string, { at: number; items: Card[] }> = {};

function posterUrl(p: any): string {
  if (!p) return '';
  const v = String(p);
  return v.startsWith('/images/') ? v : (v.startsWith('http') ? v : `https://image.tmdb.org/t/p/w342${v}`);
}

export async function getTabList(kind: 'movies' | 'series'): Promise<Card[]> {
  const hit = tabCache[kind];
  if (hit && Date.now() - hit.at < TTL_MS) return hit.items;
  try {
    let items: Card[] = [];
    if (kind === 'movies') {
      const r = await fetch(`${PG}/rpc/recently_added_movies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_limit: TAB_LIMIT, min_year: new Date().getFullYear() - 1 }),
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error(`recently_added_movies ${r.status}`);
      const rows: any[] = (await r.json()) || [];
      items = rows.filter((x) => x.poster_path && x.title).map((x) => ({
        t: x.title, img: posterUrl(x.poster_path), href: `/movie/${x.tmdb_id}`, type: 'movie' as const, id: Number(x.tmdb_id),
      }));
    } else {
      const r = await fetch(`${PG}/recent_episode_series?order=latest_added.desc&limit=${TAB_LIMIT * 2}`, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(`recent_episode_series ${r.status}`);
      const rows: any[] = (await r.json()) || [];
      const seen = new Set<number>();
      for (const x of rows) {
        if (!x.poster_path || !x.title || seen.has(x.tmdb_id)) continue;
        seen.add(x.tmdb_id);
        const ep = `S${String(x.season_number).padStart(2, '0')}E${String(x.episode_number).padStart(2, '0')}`;
        items.push({ t: x.title, img: posterUrl(x.poster_path), href: `/tv/${x.tmdb_id}`, type: 'series', id: Number(x.tmdb_id), ep });
      }
    }
    items = items.slice(0, TAB_LIMIT);
    if (!items.length) throw new Error('empty list');
    tabCache[kind] = { at: Date.now(), items };
    return items;
  } catch (e) {
    if (hit) return hit.items;      // a stale copy beats an empty tab
    throw e;
  }
}
