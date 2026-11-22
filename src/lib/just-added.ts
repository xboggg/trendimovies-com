import { getAuthHeaders } from './auth';
import { filesEnabled } from './site-mode';
import { fetchFromTMDB } from './tmdb';

// "Just Added": what we added most recently, in four tabs.
//   movie  : movies with new files
//   tv     : shows that got new episode files this week (view recent_episode_series)
//   indian : Hindi, Tamil, Telugu, Malayalam and other Indian-language films and shows, newest first
//   asian  : Korean, Japanese, Chinese, Thai, Indonesian, Vietnamese, Filipino and Malay films and shows, newest first
// Used by the home page row and by the /just-added page. Answers are kept in
// memory for 5 minutes so both stay fast. Any failure gives an empty tab, and
// an empty tab is simply not shown on the home page.
const POSTGREST_URL = 'http://localhost:3001';
const ASIAN = new Set(['ko', 'ja', 'zh', 'cn', 'th', 'id', 'vi', 'tl', 'ms']);
const INDIAN = new Set(['hi', 'ta', 'ml', 'te', 'kn', 'bn', 'mr', 'pa', 'gu']);

export type JustAddedTab = 'movie' | 'tv' | 'indian' | 'asian';
export const JUST_ADDED_TABS: { key: JustAddedTab; label: string; long: string }[] = [
  { key: 'movie', label: 'Movie', long: 'Movies' },
  { key: 'tv', label: 'TV Show', long: 'Series' },
  { key: 'indian', label: 'Indian', long: 'Indian' },
  { key: 'asian', label: 'Asian', long: 'Asian' },
];

export function isJustAddedTab(v: string | null | undefined): v is JustAddedTab {
  return v === 'movie' || v === 'tv' || v === 'indian' || v === 'asian';
}

const memo = new Map<string, { at: number; items: any[] }>();
const TTL = 5 * 60 * 1000;

const genreNames = (g: any): string[] => {
  const arr = typeof g === 'string' ? [g] : Array.isArray(g) ? g : [];
  return arr.map((x: any) => (typeof x === 'string' ? x : x?.name)).filter(Boolean);
};

async function pg(path: string, init?: RequestInit): Promise<any[]> {
  const res = await fetch(`${POSTGREST_URL}${path}`, { headers: getAuthHeaders(), ...init });
  if (!res.ok) return [];
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

// Language and genres for a list of films / shows, asked 300 at a time.
async function pgByIds(table: string, ids: number[]): Promise<any[]> {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += 300) {
    out.push(...(await pg(`/${table}?tmdb_id=in.(${ids.slice(i, i + 300).join(',')})&select=tmdb_id,original_language,genres,overview`)));
  }
  return out;
}

async function recentMovies(limit: number, minYear: number): Promise<any[]> {
  return pg('/rpc/recently_added_movies', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ result_limit: limit, min_year: minYear }),
  });
}

const movieItem = (m: any, info?: any) => ({
  id: m.tmdb_id, tmdb_id: m.tmdb_id, title: m.title, poster_path: m.poster_path,
  backdrop_path: m.backdrop_path, vote_average: m.vote_average || 0, vote_count: m.vote_count || 0,
  popularity: m.popularity || 0, year: m.year, overview: m.overview,
  updated_at: m.last_file_added, type: 'movie' as const, has_downloads: true,
  _at: m.last_file_added || '', _lang: info?.original_language || '', _genres: genreNames(info?.genres),
});
const seriesItem = (s: any, info?: any) => ({
  id: s.tmdb_id, tmdb_id: s.tmdb_id, slug: s.slug, title: s.title, poster_path: s.poster_path,
  vote_average: s.vote_average || 0, vote_count: 0, popularity: 0, year: s.year, overview: info?.overview || '', type: 'series' as const, has_downloads: true,
  episode_info: `S${String(s.season_number).padStart(2, '0')}E${String(s.episode_number).padStart(2, '0')}`,
  _at: s.latest_added || '', _lang: info?.original_language || '', _genres: genreNames(info?.genres),
});

async function recentSeries(): Promise<any[]> {
  return pg('/recent_episode_series?order=latest_added.desc&limit=80');
}

// Everything the tab holds, newest first, with language and genres attached
// (used for the filters on the /just-added page). Not sliced.
// ---------------------------------------------------------------------------------------------------------------------------
// CLEAN SITE (files switched off): the same four tabs, but made from TMDB instead of from our file library.
//   movie  : films released in the last 75 days, most popular first
//   tv     : shows with an episode airing in the last 7 days, most popular first
//   indian / asian : films and shows released in the last 150 days in those languages, newest first
const dayStr = (back: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - back); return d.toISOString().slice(0, 10); };
const yearOf = (d: any) => { const y = parseInt(String(d || '').slice(0, 4), 10); return y > 1800 ? y : null; };
let genreNamesById: Map<string, string> | null = null;

async function tmdbGenres(): Promise<Map<string, string>> {
  if (genreNamesById) return genreNamesById;
  const m = new Map<string, string>();
  for (const kind of ['movie', 'tv']) {
    try {
      const d: any = await fetchFromTMDB<any>(`/genre/${kind}/list`, {});
      for (const g of (d && d.genres) || []) m.set(`${kind}:${g.id}`, g.name);
    } catch (e) { /* genres are only for the filters */ }
  }
  if (m.size) genreNamesById = m;
  return m;
}

async function tmdbPages(endpoint: string, params: Record<string, string>, pages: number): Promise<any[]> {
  const rs = await Promise.all(Array.from({ length: pages }, (_, i) => fetchFromTMDB<any>(endpoint, { ...params, page: String(i + 1) }).catch(() => null)));
  const out: any[] = [];
  const seenIds = new Set<number>();
  for (const r of rs) for (const x of ((r && r.results) || [])) if (x && x.id && !seenIds.has(x.id)) { seenIds.add(x.id); out.push(x); }
  return out;
}

const tmdbMovieItem = (m: any, gn: Map<string, string>) => ({
  id: m.id, tmdb_id: m.id, title: m.title, poster_path: m.poster_path, backdrop_path: m.backdrop_path,
  vote_average: m.vote_average || 0, vote_count: m.vote_count || 0, popularity: m.popularity || 0, year: yearOf(m.release_date),
  overview: m.overview, type: 'movie' as const, has_downloads: false,
  _at: m.release_date || '', _lang: m.original_language || '', _genres: (m.genre_ids || []).map((i: number) => gn.get(`movie:${i}`)).filter(Boolean),
});
const tmdbShowItem = (s: any, gn: Map<string, string>) => ({
  id: s.id, tmdb_id: s.id, title: s.name, poster_path: s.poster_path, backdrop_path: s.backdrop_path,
  vote_average: s.vote_average || 0, vote_count: s.vote_count || 0, popularity: s.popularity || 0, year: yearOf(s.first_air_date),
  overview: s.overview, type: 'series' as const, has_downloads: false,
  _at: s.first_air_date || '', _lang: s.original_language || '', _genres: (s.genre_ids || []).map((i: number) => gn.get(`tv:${i}`)).filter(Boolean),
});

async function buildFromTmdb(tab: JustAddedTab): Promise<any[]> {
  const gn = await tmdbGenres();
  const today = dayStr(0);
  if (tab === 'movie') {
    const ms = await tmdbPages('/discover/movie', { sort_by: 'popularity.desc', 'primary_release_date.gte': dayStr(75), 'primary_release_date.lte': today, 'vote_count.gte': '5', include_adult: 'false' }, 3);
    return ms.filter((m) => m.poster_path).map((m) => tmdbMovieItem(m, gn));
  }
  if (tab === 'tv') {
    const ss = await tmdbPages('/discover/tv', { sort_by: 'popularity.desc', 'air_date.gte': dayStr(7), 'air_date.lte': today, include_adult: 'false' }, 3);
    return ss.filter((s) => s.poster_path).map((s) => tmdbShowItem(s, gn));
  }
  const langs = tab === 'indian' ? 'hi|ta|ml|te|kn|bn|mr|pa|gu' : 'ko|ja|zh|th|id|vi|tl|ms';
  const [ms, ss] = await Promise.all([
    tmdbPages('/discover/movie', { sort_by: 'primary_release_date.desc', 'primary_release_date.gte': dayStr(150), 'primary_release_date.lte': today, with_original_language: langs, 'vote_count.gte': '2', include_adult: 'false' }, 2),
    tmdbPages('/discover/tv', { sort_by: 'first_air_date.desc', 'first_air_date.gte': dayStr(150), 'first_air_date.lte': today, with_original_language: langs, 'vote_count.gte': '2', include_adult: 'false' }, 2),
  ]);
  const out = [
    ...ms.filter((m) => m.poster_path).map((m) => tmdbMovieItem(m, gn)),
    ...ss.filter((x) => x.poster_path).map((x) => tmdbShowItem(x, gn)),
  ];
  out.sort((a, b) => String(b._at).localeCompare(String(a._at)));
  return out;
}

async function build(tab: JustAddedTab): Promise<any[]> {
  if (!filesEnabled()) return buildFromTmdb(tab);
  if (tab === 'movie') {
    const minYear = new Date().getFullYear() - 1;
    return (await recentMovies(30, minYear)).map(m => movieItem(m));
  }
  const [movies, shows] = await Promise.all([tab === 'tv' ? Promise.resolve([]) : recentMovies(800, 0), recentSeries()]);
  const [mInfo, sInfo] = await Promise.all([
    pgByIds('movies', movies.map((m: any) => m.tmdb_id)),
    pgByIds('series', shows.map((s: any) => s.tmdb_id)),
  ]);
  const mi = new Map<number, any>(mInfo.map((r: any) => [r.tmdb_id, r]));
  const si = new Map<number, any>(sInfo.map((r: any) => [r.tmdb_id, r]));
  const fits = (info: any) => {
    if (tab === 'tv') return true;
    if (!info) return false;
    return tab === 'indian' ? INDIAN.has(info.original_language) : ASIAN.has(info.original_language);
  };
  const out = [
    ...movies.filter((m: any) => fits(mi.get(m.tmdb_id))).map((m: any) => movieItem(m, mi.get(m.tmdb_id))),
    ...shows.filter((s: any) => fits(si.get(s.tmdb_id))).map((s: any) => seriesItem(s, si.get(s.tmdb_id))),
  ];
  out.sort((a, b) => String(b._at).localeCompare(String(a._at)));
  return out;
}

const refreshing = new Set<string>();
async function refresh(tab: JustAddedTab): Promise<any[]> {
  const items = (await build(tab)).filter(i => i.poster_path);
  memo.set(tab, { at: Date.now(), items });
  return items;
}

// A saved answer is always returned straight away. When it is older than the
// time limit it is refreshed in the background, so no visitor waits for it;
// only the very first request after a restart does the real work.
export async function getJustAddedAll(tab: JustAddedTab): Promise<any[]> {
  const hit = memo.get(tab);
  if (hit) {
    if (Date.now() - hit.at >= TTL && !refreshing.has(tab)) {
      refreshing.add(tab);
      refresh(tab).catch(e => console.error('just-added refresh failed for', tab, (e as Error).message)).finally(() => refreshing.delete(tab));
    }
    return hit.items;
  }
  try {
    return await refresh(tab);
  } catch (e) {
    console.error('just-added failed for', tab, (e as Error).message);
    return [];
  }
}

// The home page row: the newest 30.
export async function getJustAdded(tab: JustAddedTab): Promise<any[]> {
  return (await getJustAddedAll(tab)).slice(0, 30);
}
