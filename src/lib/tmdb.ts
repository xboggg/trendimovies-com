const TMDB_API_KEY = import.meta.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

// Movie endpoints
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>(`/trending/movie/${timeWindow}`);
  return data.results;
}

export async function getNowPlayingMovies(): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/movie/now_playing');
  return data.results;
}

export async function getUpcomingMovies(): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/movie/upcoming');
  return data.results;
}

export async function getPopularMovies(): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/movie/popular');
  return data.results;
}

export async function getTopRatedMovies(): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/movie/top_rated');
  return data.results;
}

export async function getMovieDetails(tmdbId: number): Promise<any> {
  return fetchFromTMDB(`/movie/${tmdbId}`, {
    append_to_response: 'credits,videos,keywords,watch/providers,similar'
  });
}

export async function searchMovies(query: string, page: number = 1): Promise<TMDBResponse<any>> {
  return fetchFromTMDB('/search/movie', { query, page: page.toString() });
}

// TV endpoints
export async function getTrendingTV(timeWindow: 'day' | 'week' = 'week'): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>(`/trending/tv/${timeWindow}`);
  return data.results;
}

export async function getPopularTV(): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/tv/popular');
  return data.results;
}

export async function getTopRatedTV(): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/tv/top_rated');
  return data.results;
}

export async function getOnTheAirTV(page: number = 1): Promise<any[]> {
  const data = await fetchFromTMDB<TMDBResponse<any>>('/tv/on_the_air', { page: page.toString() });
  return data.results;
}

export async function getOnTheAirTVPaginated(page: number = 1): Promise<TMDBResponse<any>> {
  return fetchFromTMDB<TMDBResponse<any>>('/tv/on_the_air', { page: page.toString() });
}

export async function getTVDetails(tmdbId: number): Promise<any> {
  return fetchFromTMDB(`/tv/${tmdbId}`, {
    append_to_response: 'credits,videos,keywords,watch/providers,similar'
  });
}

export async function getSeasonDetails(tmdbId: number, seasonNumber: number): Promise<any> {
  return fetchFromTMDB(`/tv/${tmdbId}/season/${seasonNumber}`);
}

export async function searchTV(query: string, page: number = 1): Promise<TMDBResponse<any>> {
  return fetchFromTMDB('/search/tv', { query, page: page.toString() });
}

// Multi search
export async function searchMulti(query: string, page: number = 1): Promise<TMDBResponse<any>> {
  return fetchFromTMDB('/search/multi', { query, page: page.toString() });
}

// Discover
export async function discoverMovies(params: Record<string, string> = {}): Promise<TMDBResponse<any>> {
  return fetchFromTMDB('/discover/movie', params);
}

export async function discoverTV(params: Record<string, string> = {}): Promise<TMDBResponse<any>> {
  return fetchFromTMDB('/discover/tv', params);
}

// Genres
export async function getMovieGenres(): Promise<{ id: number; name: string }[]> {
  const data = await fetchFromTMDB<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
  return data.genres;
}

export async function getTVGenres(): Promise<{ id: number; name: string }[]> {
  const data = await fetchFromTMDB<{ genres: { id: number; name: string }[] }>('/genre/tv/list');
  return data.genres;
}

// Watch providers
export async function getWatchProviders(type: 'movie' | 'tv', tmdbId: number, region: string = 'US'): Promise<any> {
  const data = await fetchFromTMDB(`/${type}/${tmdbId}/watch/providers`);
  return data.results?.[region] || null;
}

// Transform TMDB data to our schema
export function transformMovieData(tmdbMovie: any) {
  return {
    tmdb_id: tmdbMovie.id,
    imdb_id: tmdbMovie.imdb_id || null,
    title: tmdbMovie.title,
    slug: generateSlug(tmdbMovie.title, tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null),
    original_title: tmdbMovie.original_title,
    overview: tmdbMovie.overview,
    tagline: tmdbMovie.tagline || null,
    release_date: tmdbMovie.release_date || null,
    year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
    runtime: tmdbMovie.runtime || null,
    budget: tmdbMovie.budget || null,
    revenue: tmdbMovie.revenue || null,
    popularity: tmdbMovie.popularity,
    vote_average: tmdbMovie.vote_average,
    vote_count: tmdbMovie.vote_count,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    trailer_key: getTrailerKey(tmdbMovie.videos?.results),
    original_language: tmdbMovie.original_language,
    spoken_languages: tmdbMovie.spoken_languages || [],
    production_countries: tmdbMovie.production_countries || [],
    production_companies: tmdbMovie.production_companies || [],
    genres: tmdbMovie.genres || [],
    cast_data: (tmdbMovie.credits?.cast || []).slice(0, 20),
    crew_data: (tmdbMovie.credits?.crew || []).filter((c: any) =>
      ['Director', 'Writer', 'Screenplay', 'Producer'].includes(c.job)
    ).slice(0, 10),
    keywords: tmdbMovie.keywords?.keywords || [],
    watch_providers: tmdbMovie['watch/providers']?.results?.US || {},
    status: tmdbMovie.status || 'released'
  };
}

export function transformSeriesData(tmdbSeries: any) {
  return {
    tmdb_id: tmdbSeries.id,
    imdb_id: tmdbSeries.external_ids?.imdb_id || null,
    title: tmdbSeries.name,
    slug: generateSlug(tmdbSeries.name, tmdbSeries.first_air_date ? new Date(tmdbSeries.first_air_date).getFullYear() : null),
    original_title: tmdbSeries.original_name,
    overview: tmdbSeries.overview,
    tagline: tmdbSeries.tagline || null,
    first_air_date: tmdbSeries.first_air_date || null,
    last_air_date: tmdbSeries.last_air_date || null,
    year: tmdbSeries.first_air_date ? new Date(tmdbSeries.first_air_date).getFullYear() : null,
    number_of_seasons: tmdbSeries.number_of_seasons,
    number_of_episodes: tmdbSeries.number_of_episodes,
    episode_run_time: tmdbSeries.episode_run_time || [],
    popularity: tmdbSeries.popularity,
    vote_average: tmdbSeries.vote_average,
    vote_count: tmdbSeries.vote_count,
    poster_path: tmdbSeries.poster_path,
    backdrop_path: tmdbSeries.backdrop_path,
    trailer_key: getTrailerKey(tmdbSeries.videos?.results),
    original_language: tmdbSeries.original_language,
    spoken_languages: tmdbSeries.spoken_languages || [],
    origin_country: tmdbSeries.origin_country || [],
    production_companies: tmdbSeries.production_companies || [],
    networks: tmdbSeries.networks || [],
    genres: tmdbSeries.genres || [],
    cast_data: (tmdbSeries.credits?.cast || []).slice(0, 20),
    crew_data: (tmdbSeries.credits?.crew || []).filter((c: any) =>
      ['Creator', 'Executive Producer', 'Showrunner'].includes(c.job)
    ).slice(0, 10),
    keywords: tmdbSeries.keywords?.results || [],
    watch_providers: tmdbSeries['watch/providers']?.results?.US || {},
    status: tmdbSeries.status,
    type: tmdbSeries.type
  };
}

function getTrailerKey(videos: any[]): string | null {
  if (!videos || videos.length === 0) return null;

  // Prefer official trailers from YouTube
  const trailer = videos.find(v =>
    v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) || videos.find(v =>
    v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.find(v =>
    v.site === 'YouTube'
  );

  return trailer?.key || null;
}

function generateSlug(title: string, year: number | null): string {
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
