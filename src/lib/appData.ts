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
export type AppData = { today: string; rows: Record<string, Card[]>; reviews: Review[] };

let cache: { at: number; data: AppData } | null = null;

/** Today's date in the SERVER's own time zone (not UTC: the server runs on Berlin time and UTC would be a day behind after midnight). */
export function localISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  return { today, rows, reviews };
}

export async function getAppData(): Promise<AppData> {
  try {
    if (!cache || Date.now() - cache.at > TTL_MS) cache = { at: Date.now(), data: await build() };
  } catch (e) {
    if (!cache) throw e;           // a stale copy beats an empty app
  }
  return cache!.data;
}
