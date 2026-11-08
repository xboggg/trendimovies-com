import { getAuthHeaders } from './auth';

// "Just Added": what we added most recently, in four tabs.
//   movie  : movies with new files
//   tv     : shows that got new episode files this week (view recent_episode_series)
//   indian : Hindi, Tamil, Telugu, Malayalam and other Indian-language films and shows, newest first
//   asian  : Korean, Japanese, Chinese and Thai films and shows, newest first
// Used by the home page row and by the /just-added page. Answers are kept in
// memory for 5 minutes so both stay fast. Any failure gives an empty tab, and
// an empty tab is simply not shown on the home page.
const POSTGREST_URL = 'http://localhost:3001';
const ASIAN = new Set(['ko', 'ja', 'zh', 'cn', 'th']);
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
async function build(tab: JustAddedTab): Promise<any[]> {
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
