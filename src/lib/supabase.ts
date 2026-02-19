// Direct PostgREST client (bypassing Kong for performance)
const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  order?: string;
  filter?: Record<string, any>;
  eq?: Record<string, any>;
  neq?: Record<string, any>;
  single?: boolean;
}

async function query<T>(table: string, options: QueryOptions = {}): Promise<{ data: T | null; error: any }> {
  const params = new URLSearchParams();

  if (options.select) params.set('select', options.select);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());
  if (options.order) params.set('order', options.order);

  // Handle eq filters
  if (options.eq) {
    for (const [key, value] of Object.entries(options.eq)) {
      params.set(key, `eq.${value}`);
    }
  }

  // Handle neq filters
  if (options.neq) {
    for (const [key, value] of Object.entries(options.neq)) {
      params.set(key, `neq.${value}`);
    }
  }

  const url = `${POSTGREST_URL}/${table}?${params.toString()}`;
  console.log('[DB Query]', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DB Error]', response.status, errorText);
      return { data: null, error: { status: response.status, message: errorText } };
    }

    const data = await response.json();
    console.log('[DB Result]', table, 'returned', Array.isArray(data) ? data.length : 1, 'items');
    return { data: options.single ? data[0] || null : data, error: null };
  } catch (error: any) {
    console.error('[DB Exception]', error.message);
    return { data: null, error };
  }
}

async function insert(table: string, data: any): Promise<{ data: any; error: any }> {
  const url = `${POSTGREST_URL}/${table}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept-Profile': 'public',
        'Content-Profile': 'public',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const error = await response.json();
      return { data: null, error };
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

async function update(table: string, id: number, data: any): Promise<{ data: any; error: any }> {
  const url = `${POSTGREST_URL}/${table}?id=eq.${id}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept-Profile': 'public',
        'Content-Profile': 'public',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const error = await response.json();
      return { data: null, error };
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

// Supabase-like API wrapper with full chaining support
export const supabase = {
  from: (table: string) => {
    const createChain = (opts: QueryOptions = {}) => ({
      eq: (column: string, value: any) => createChain({ ...opts, eq: { ...opts.eq, [column]: value } }),
      neq: (column: string, value: any) => createChain({ ...opts, neq: { ...opts.neq, [column]: value } }),
      order: (column: string, orderOpts?: { ascending?: boolean }) => createChain({
        ...opts,
        order: `${column}.${orderOpts?.ascending === false ? 'desc' : 'asc'}`
      }),
      limit: (n: number) => createChain({ ...opts, limit: n }),
      range: (from: number, to: number) => createChain({ ...opts, offset: from, limit: to - from + 1 }),
      single: () => query(table, { ...opts, single: true }),
      then: (resolve: any) => query(table, opts).then(resolve)
    });

    return {
      select: (columns?: string) => createChain({ select: columns }),
      insert: (data: any) => insert(table, data),
      update: (data: any) => ({
        eq: (column: string, value: any) => update(table, value, data)
      })
    };
  }
};

// Types
export interface Movie {
  id: number;
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  slug: string;
  original_title: string | null;
  overview: string | null;
  tagline: string | null;
  release_date: string | null;
  year: number | null;
  runtime: number | null;
  budget: number | null;
  revenue: number | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  trailer_key: string | null;
  original_language: string;
  spoken_languages: any[];
  production_countries: any[];
  production_companies: any[];
  genres: { id: number; name: string }[];
  cast_data: any[];
  crew_data: any[];
  keywords: any[];
  watch_providers: any[];
  status: string;
  has_downloads: boolean;
  has_streaming: boolean;
  view_count: number;
  download_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Series {
  id: number;
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  slug: string;
  original_title: string | null;
  overview: string | null;
  tagline: string | null;
  first_air_date: string | null;
  last_air_date: string | null;
  year: number | null;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  trailer_key: string | null;
  original_language: string;
  spoken_languages: any[];
  origin_country: string[];
  production_companies: any[];
  networks: any[];
  genres: { id: number; name: string }[];
  cast_data: any[];
  crew_data: any[];
  keywords: any[];
  watch_providers: any[];
  status: string;
  type: string | null;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: number;
  series_id: number;
  tmdb_id: number | null;
  season_number: number;
  name: string | null;
  overview: string | null;
  poster_path: string | null;
  air_date: string | null;
  episode_count: number | null;
}

export interface Episode {
  id: number;
  season_id: number;
  series_id: number;
  tmdb_id: number | null;
  episode_number: number;
  name: string | null;
  overview: string | null;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number | null;
  vote_count: number | null;
  has_downloads: boolean;
  view_count: number;
}

export interface DownloadLink {
  id: number;
  content_type: 'movie' | 'episode';
  content_id: number;
  source: 'telegram' | 'cinematika' | 'torrent';
  quality: '720p' | '1080p' | '2160p';
  file_size: string | null;
  url: string;
  telegram_file_id: string | null;
  is_active: boolean;
  click_count: number;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: 'franchise' | 'schedule' | 'curated' | 'genre';
  poster_path: string | null;
  backdrop_path: string | null;
  is_active: boolean;
  display_order: number;
}

// Helper functions
export function getPosterUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/images/no-poster.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: string = 'w1280'): string {
  if (!path) return '/images/no-backdrop.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: string = 'w185'): string {
  if (!path) return '/images/no-profile.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatYear(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).getFullYear().toString();
}

export function generateSlug(title: string, year?: number | null): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);

  if (year) {
    slug += `-${year}`;
  }

  return slug;
}

// Language codes to names
export const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
  tr: 'Turkish',
  th: 'Thai',
  tl: 'Filipino',
  id: 'Indonesian',
  vi: 'Vietnamese',
  pl: 'Polish',
  nl: 'Dutch',
  sv: 'Swedish'
};

export function getLanguageName(code: string): string {
  return LANGUAGES[code] || code.toUpperCase();
}
