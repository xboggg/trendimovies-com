const TMDB_API_KEY = "46300aaf372203a94763f1f46846e843";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(1e4)
  });
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}
async function getTrendingMovies(timeWindow = "week") {
  const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
  return data.results;
}
async function getNowPlayingMovies() {
  const data = await fetchFromTMDB("/movie/now_playing");
  return data.results;
}
async function getPopularMovies() {
  const data = await fetchFromTMDB("/movie/popular");
  return data.results;
}
async function getTopRatedMovies() {
  const data = await fetchFromTMDB("/movie/top_rated");
  return data.results;
}
async function getMovieDetails(tmdbId) {
  try {
    return await fetchFromTMDB(`/movie/${tmdbId}`, {
      append_to_response: "credits,videos,keywords,watch/providers,similar"
    });
  } catch (error) {
    console.error(`Failed to fetch movie ${tmdbId}:`, error);
    return null;
  }
}
async function searchMovies(query, page = 1) {
  return fetchFromTMDB("/search/movie", { query, page: page.toString() });
}
async function getTrendingTV(timeWindow = "week") {
  const data = await fetchFromTMDB(`/trending/tv/${timeWindow}`);
  return data.results;
}
async function getPopularTV() {
  const data = await fetchFromTMDB("/tv/popular");
  return data.results;
}
async function getTopRatedTV() {
  const data = await fetchFromTMDB("/tv/top_rated");
  return data.results;
}
async function getOnTheAirTV(page = 1) {
  const data = await fetchFromTMDB("/tv/on_the_air", { page: page.toString() });
  return data.results;
}
async function getOnTheAirTVPaginated(page = 1) {
  return fetchFromTMDB("/tv/on_the_air", { page: page.toString() });
}
async function getTVDetails(tmdbId) {
  try {
    return await fetchFromTMDB(`/tv/${tmdbId}`, {
      append_to_response: "credits,videos,keywords,watch/providers,similar"
    });
  } catch (error) {
    console.error(`Failed to fetch TV series ${tmdbId}:`, error);
    return null;
  }
}
async function getSeasonDetails(tmdbId, seasonNumber) {
  return fetchFromTMDB(`/tv/${tmdbId}/season/${seasonNumber}`);
}
async function searchTV(query, page = 1) {
  return fetchFromTMDB("/search/tv", { query, page: page.toString() });
}
async function searchMulti(query, page = 1) {
  return fetchFromTMDB("/search/multi", { query, page: page.toString() });
}
async function discoverMovies(params = {}) {
  return fetchFromTMDB("/discover/movie", params);
}
async function discoverTV(params = {}) {
  return fetchFromTMDB("/discover/tv", params);
}
async function getMovieGenres() {
  const data = await fetchFromTMDB("/genre/movie/list");
  return data.genres;
}
async function getTVGenres() {
  const data = await fetchFromTMDB("/genre/tv/list");
  return data.genres;
}
function transformMovieData(tmdbMovie) {
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
    crew_data: (tmdbMovie.credits?.crew || []).filter(
      (c) => ["Director", "Writer", "Screenplay", "Producer"].includes(c.job)
    ).slice(0, 10),
    keywords: tmdbMovie.keywords?.keywords || [],
    watch_providers: tmdbMovie["watch/providers"]?.results?.US || {},
    status: tmdbMovie.status || "released"
  };
}
function transformSeriesData(tmdbSeries) {
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
    crew_data: (tmdbSeries.credits?.crew || []).filter(
      (c) => ["Creator", "Executive Producer", "Showrunner"].includes(c.job)
    ).slice(0, 10),
    keywords: tmdbSeries.keywords?.results || [],
    watch_providers: tmdbSeries["watch/providers"]?.results?.US || {},
    status: tmdbSeries.status,
    type: tmdbSeries.type
  };
}
function getTrailerKey(videos) {
  if (!videos || videos.length === 0) return null;
  const trailer = videos.find(
    (v) => v.type === "Trailer" && v.site === "YouTube" && v.official
  ) || videos.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || videos.find(
    (v) => v.site === "YouTube"
  );
  return trailer?.key || null;
}
function generateSlug(title, year) {
  let slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 100);
  if (year) {
    slug += `-${year}`;
  }
  return slug;
}

export { searchMovies as a, searchTV as b, discoverTV as c, discoverMovies as d, getMovieGenres as e, fetchFromTMDB as f, getMovieDetails as g, getOnTheAirTVPaginated as h, getTVDetails as i, getTVGenres as j, getTopRatedMovies as k, getTopRatedTV as l, getTrendingMovies as m, getTrendingTV as n, transformSeriesData as o, getSeasonDetails as p, getNowPlayingMovies as q, getPopularMovies as r, searchMulti as s, transformMovieData as t, getPopularTV as u, getOnTheAirTV as v };
