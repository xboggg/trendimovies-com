// TrendiMovies News ("The Wire"): shared helpers for the public pages.
// Public pages only ever read the view `news_public` (published items, safe columns). Drafts and lead text are never reachable here.

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
// Which read-only view to use. Always news_public in production; only a throwaway visual test points it elsewhere.
const VIEW = (typeof process !== 'undefined' && process.env && process.env.NEWS_VIEW) || 'news_public';

export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  points: string[] | null;
  category: string;
  cover_image: string | null;
  poster_image: string | null;
  related_tmdb_id: number | null;
  related_type: string | null;
  film_title: string | null;
  source_name: string | null;
  source_url: string | null;
  published_at: string;
};

export type NewsCategory = { key: string; label: string; color: string; glyph: string };

export const NEWS_CATEGORIES: NewsCategory[] = [
  { key: 'casting', label: 'Casting', color: '#a855f7', glyph: '🎭' },
  { key: 'trailers', label: 'Trailers', color: '#ef4444', glyph: '🎞️' },
  { key: 'release-dates', label: 'Release dates', color: '#f59e0b', glyph: '📅' },
  { key: 'box-office', label: 'Box office', color: '#22c55e', glyph: '💰' },
  { key: 'streaming', label: 'Streaming', color: '#3b82f6', glyph: '📺' },
  { key: 'awards', label: 'Awards', color: '#eab308', glyph: '🏆' },
  { key: 'behind-the-scenes', label: 'Behind the scenes', color: '#ec4899', glyph: '🎬' },
  { key: 'new-projects', label: 'New projects', color: '#06b6d4', glyph: '✨' },
];

export function catMeta(key: string | null | undefined): NewsCategory {
  return NEWS_CATEGORIES.find((c) => c.key === key) || NEWS_CATEGORIES[NEWS_CATEGORIES.length - 1];
}

const FIELDS = 'id,slug,title,summary,body,points,category,cover_image,poster_image,related_tmdb_id,related_type,film_title,source_name,source_url,published_at';

export async function getNews(opts: { limit?: number; offset?: number; category?: string } = {}): Promise<{ items: NewsItem[]; total: number }> {
  const { limit = 20, offset = 0, category } = opts;
  const cat = category && NEWS_CATEGORIES.some((c) => c.key === category) ? `&category=eq.${category}` : '';
  try {
    const r = await fetch(`${POSTGREST_URL}/${VIEW}?select=${FIELDS}${cat}&order=published_at.desc&limit=${limit}&offset=${offset}`, {
      headers: { Prefer: 'count=exact' },
    });
    if (!r.ok) return { items: [], total: 0 };
    const items = (await r.json()) as NewsItem[];
    const cr = r.headers.get('content-range');
    const total = cr ? parseInt(cr.split('/')[1] || '0') || 0 : items.length;
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  try {
    const r = await fetch(`${POSTGREST_URL}/${VIEW}?select=${FIELDS}&slug=eq.${slug}&limit=1`);
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

/** News about one film/series (for a "News" strip on its page). */
export async function getNewsForTitle(tmdbId: number, limit = 3): Promise<NewsItem[]> {
  if (!Number.isInteger(tmdbId)) return [];
  try {
    const r = await fetch(`${POSTGREST_URL}/${VIEW}?select=${FIELDS}&related_tmdb_id=eq.${tmdbId}&order=published_at.desc&limit=${limit}`);
    return r.ok ? ((await r.json()) as NewsItem[]) : [];
  } catch {
    return [];
  }
}

export function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const key = (x: Date) => x.toISOString().slice(0, 10);
  const y = new Date(today.getTime() - 86400000);
  if (key(d) === key(today)) return 'Today';
  if (key(d) === key(y)) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

/** Small picture for lists (TMDB sizes are in the URL; swap the size segment). */
export function thumb(url: string | null, size = 'w500'): string {
  if (!url) return '';
  // official trailer pictures (YouTube): small size for lists, full size for big covers
  if (url.includes('img.youtube.com/vi/')) return url.replace(/\/(maxresdefault|mqdefault)\.jpg$/, size === 'w342' || size === 'w500' ? '/mqdefault.jpg' : '/maxresdefault.jpg');
  return url.replace(/\/t\/p\/w\d+\//, `/t/p/${size}/`);
}

export function readMinutes(body: string | null): number {
  const w = (body || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(w / 200));
}
