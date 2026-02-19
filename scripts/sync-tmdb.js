#!/usr/bin/env node
/**
 * TMDB Sync Script
 * Fetches new/trending movies and series from TMDB and syncs to database
 * Run hourly via cron: 0 * * * * node /var/www/trendimovies-new/scripts/sync-tmdb.js
 */

const POSTGREST_URL = process.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const API_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function dbQuery(table, params = {}) {
  const url = new URL(`${POSTGREST_URL}/${table}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept-Profile': 'public',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`DB error: ${response.status}`);
  }
  return response.json();
}

async function dbInsert(table, data) {
  const url = `${POSTGREST_URL}/${table}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept-Profile': 'public',
      'Content-Profile': 'public',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw error;
  }
  return response.json();
}

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
}

function generateSlug(title, year) {
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

function getTrailerKey(videos) {
  if (!videos || videos.length === 0) return null;
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find(v => v.site === 'YouTube');
  return trailer?.key || null;
}

async function syncMovie(tmdbId) {
  try {
    // Check if already exists
    const existing = await dbQuery('movies', { tmdb_id: `eq.${tmdbId}`, select: 'id', limit: '1' });

    if (existing.length > 0) {
      console.log(`Movie ${tmdbId} already exists, skipping`);
      return;
    }

    // Fetch full details
    const movie = await fetchTMDB(`/movie/${tmdbId}`, {
      append_to_response: 'credits,videos,keywords,watch/providers'
    });

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

    const movieData = {
      tmdb_id: movie.id,
      imdb_id: movie.imdb_id || null,
      title: movie.title,
      slug: generateSlug(movie.title, year),
      original_title: movie.original_title,
      overview: movie.overview,
      tagline: movie.tagline || null,
      release_date: movie.release_date || null,
      year,
      runtime: movie.runtime || null,
      budget: movie.budget || null,
      revenue: movie.revenue || null,
      popularity: movie.popularity,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      trailer_key: getTrailerKey(movie.videos?.results),
      original_language: movie.original_language,
      spoken_languages: movie.spoken_languages || [],
      production_countries: movie.production_countries || [],
      production_companies: movie.production_companies || [],
      genres: movie.genres || [],
      cast_data: (movie.credits?.cast || []).slice(0, 20),
      crew_data: (movie.credits?.crew || []).filter(c =>
        ['Director', 'Writer', 'Screenplay', 'Producer'].includes(c.job)
      ).slice(0, 10),
      keywords: movie.keywords?.keywords || [],
      watch_providers: movie['watch/providers']?.results?.US || {},
      status: movie.status || 'released',
      has_streaming: true,
      has_downloads: false,
      is_featured: movie.popularity > 100
    };

    await dbInsert('movies', movieData);
    console.log(`Added movie: ${movie.title} (${year})`);
  } catch (error) {
    if (error.code === '23505') {
      console.log(`Movie ${tmdbId} already exists (slug conflict)`);
    } else {
      console.error(`Error syncing movie ${tmdbId}:`, error.message || error);
    }
  }
}

async function syncSeries(tmdbId) {
  try {
    // Check if already exists
    const existing = await dbQuery('series', { tmdb_id: `eq.${tmdbId}`, select: 'id', limit: '1' });

    if (existing.length > 0) {
      console.log(`Series ${tmdbId} already exists, skipping`);
      return;
    }

    // Fetch full details
    const series = await fetchTMDB(`/tv/${tmdbId}`, {
      append_to_response: 'credits,videos,keywords,watch/providers,external_ids'
    });

    const year = series.first_air_date ? new Date(series.first_air_date).getFullYear() : null;

    const seriesData = {
      tmdb_id: series.id,
      imdb_id: series.external_ids?.imdb_id || null,
      title: series.name,
      slug: generateSlug(series.name, year),
      original_title: series.original_name,
      overview: series.overview,
      tagline: series.tagline || null,
      first_air_date: series.first_air_date || null,
      last_air_date: series.last_air_date || null,
      year,
      number_of_seasons: series.number_of_seasons,
      number_of_episodes: series.number_of_episodes,
      episode_run_time: series.episode_run_time || [],
      popularity: series.popularity,
      vote_average: series.vote_average,
      vote_count: series.vote_count,
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      trailer_key: getTrailerKey(series.videos?.results),
      original_language: series.original_language,
      spoken_languages: series.spoken_languages || [],
      origin_country: series.origin_country || [],
      production_companies: series.production_companies || [],
      networks: series.networks || [],
      genres: series.genres || [],
      cast_data: (series.credits?.cast || []).slice(0, 20),
      crew_data: (series.credits?.crew || []).filter(c =>
        ['Creator', 'Executive Producer', 'Showrunner'].includes(c.job)
      ).slice(0, 10),
      keywords: series.keywords?.results || [],
      watch_providers: series['watch/providers']?.results?.US || {},
      status: series.status,
      type: series.type,
      is_featured: series.popularity > 100
    };

    const [insertedSeries] = await dbInsert('series', seriesData);
    console.log(`Added series: ${series.name} (${year})`);

    // Sync seasons and episodes
    if (insertedSeries?.id) {
      await syncSeasons(insertedSeries.id, tmdbId, series.number_of_seasons);
    }
  } catch (error) {
    if (error.code === '23505') {
      console.log(`Series ${tmdbId} already exists (slug conflict)`);
    } else {
      console.error(`Error syncing series ${tmdbId}:`, error.message || error);
    }
  }
}

async function syncSeasons(seriesId, tmdbId, numSeasons) {
  for (let seasonNum = 1; seasonNum <= numSeasons; seasonNum++) {
    try {
      const seasonData = await fetchTMDB(`/tv/${tmdbId}/season/${seasonNum}`);

      const [season] = await dbInsert('seasons', {
        series_id: seriesId,
        tmdb_id: seasonData.id,
        season_number: seasonNum,
        name: seasonData.name,
        overview: seasonData.overview,
        poster_path: seasonData.poster_path,
        air_date: seasonData.air_date || null,
        episode_count: seasonData.episodes?.length || 0
      });

      // Insert episodes
      if (season?.id && seasonData.episodes) {
        const episodes = seasonData.episodes.map(ep => ({
          season_id: season.id,
          series_id: seriesId,
          tmdb_id: ep.id,
          episode_number: ep.episode_number,
          name: ep.name,
          overview: ep.overview,
          still_path: ep.still_path,
          air_date: ep.air_date || null,
          runtime: ep.runtime || null,
          vote_average: ep.vote_average || null,
          vote_count: ep.vote_count || null,
          has_downloads: false
        }));

        await dbInsert('episodes', episodes);
        console.log(`  Added ${episodes.length} episodes for Season ${seasonNum}`);
      }
    } catch (error) {
      console.error(`Error syncing season ${seasonNum}:`, error.message || error);
    }
  }
}

async function main() {
  console.log('Starting TMDB sync...');
  console.log('Time:', new Date().toISOString());

  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY not set');
    process.exit(1);
  }

  try {
    // Fetch now playing movies
    console.log('\nFetching now playing movies...');
    const nowPlaying = await fetchTMDB('/movie/now_playing', { region: 'US' });
    for (const movie of nowPlaying.results.slice(0, 20)) {
      await syncMovie(movie.id);
      await new Promise(r => setTimeout(r, 250)); // Rate limiting
    }

    // Fetch trending movies
    console.log('\nFetching trending movies...');
    const trendingMovies = await fetchTMDB('/trending/movie/week');
    for (const movie of trendingMovies.results.slice(0, 20)) {
      await syncMovie(movie.id);
      await new Promise(r => setTimeout(r, 250));
    }

    // Fetch popular movies
    console.log('\nFetching popular movies...');
    const popularMovies = await fetchTMDB('/movie/popular');
    for (const movie of popularMovies.results.slice(0, 20)) {
      await syncMovie(movie.id);
      await new Promise(r => setTimeout(r, 250));
    }

    // Fetch trending TV
    console.log('\nFetching trending TV series...');
    const trendingTV = await fetchTMDB('/trending/tv/week');
    for (const series of trendingTV.results.slice(0, 10)) {
      await syncSeries(series.id);
      await new Promise(r => setTimeout(r, 500)); // More delay for series (more API calls)
    }

    // Fetch popular TV
    console.log('\nFetching popular TV series...');
    const popularTV = await fetchTMDB('/tv/popular');
    for (const series of popularTV.results.slice(0, 10)) {
      await syncSeries(series.id);
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('\nSync completed!');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
