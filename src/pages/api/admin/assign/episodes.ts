import type { APIRoute } from 'astro';

const TMDB_API_KEY = process.env.TMDB_API_KEY || import.meta.env.TMDB_API_KEY || '46300aaf372203a94763f1f46846e843';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const GET: APIRoute = async ({ url }) => {
  const tmdbId = url.searchParams.get('tmdb_id');
  const season = url.searchParams.get('season');

  if (!tmdbId || !season) {
    return new Response(JSON.stringify({ error: 'tmdb_id and season are required', episodes: [] }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${TMDB_API_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`TMDB API returned ${response.status}`);
    }

    const data = await response.json();

    const episodes = (data.episodes || []).map((ep: any) => ({
      id: ep.id,
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      name: ep.name,
      air_date: ep.air_date,
      overview: ep.overview?.substring(0, 100) || ''
    }));

    return new Response(JSON.stringify({ episodes }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Episodes fetch error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to fetch episodes',
      episodes: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
