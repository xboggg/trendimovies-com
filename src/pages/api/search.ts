import type { APIRoute } from 'astro';
import { searchMulti, searchMovies, searchTV } from '../../lib/tmdb';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

async function searchLocalDB(query: string, type: string = 'all'): Promise<any[]> {
  try {
    const response = await fetch(`${POSTGREST_URL}/rpc/search_local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search_query: query, search_type: type, result_limit: 20 }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data || []).map((item: any) => ({
      id: item.tmdb_id,
      tmdb_id: item.tmdb_id,
      title: item.title,
      poster_path: item.poster_path,
      vote_average: item.vote_average || 0,
      year: item.year,
      type: item.media_type === 'series' ? 'series' : 'movie',
      _local: true,
    }));
  } catch {
    return [];
  }
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');

  if (!query.trim()) {
    return new Response(JSON.stringify({ results: [], total: 0, hasMore: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let results: any[] = [];
    let total = 0;
    let totalPages = 1;

    // Run TMDB and local DB searches in parallel
    const [tmdbData, localResults] = await Promise.all([
      (async () => {
        try {
          if (type === 'all') return await searchMulti(query, page);
          if (type === 'movie') return await searchMovies(query, page);
          if (type === 'series') return await searchTV(query, page);
          return { results: [], total_results: 0, total_pages: 1 };
        } catch {
          return { results: [], total_results: 0, total_pages: 1 };
        }
      })(),
      page === 1 ? searchLocalDB(query, type) : Promise.resolve([]),
    ]);

    total = tmdbData.total_results || 0;
    totalPages = tmdbData.total_pages || 1;

    if (type === 'all') {
      results = (tmdbData.results || [])
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => {
          if (item.media_type === 'movie') {
            return {
              id: item.id,
              tmdb_id: item.id,
              title: item.title,
              poster_path: item.poster_path,
              vote_average: item.vote_average || 0,
              year: item.release_date ? new Date(item.release_date).getFullYear() : null,
              type: 'movie'
            };
          } else {
            return {
              id: item.id,
              tmdb_id: item.id,
              title: item.name,
              poster_path: item.poster_path,
              vote_average: item.vote_average || 0,
              year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
              type: 'series'
            };
          }
        });
    } else if (type === 'movie') {
      results = (tmdbData.results || []).map((movie: any) => ({
        id: movie.id,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average || 0,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        type: 'movie'
      }));
    } else if (type === 'series') {
      results = (tmdbData.results || []).map((show: any) => ({
        id: show.id,
        tmdb_id: show.id,
        title: show.name,
        poster_path: show.poster_path,
        vote_average: show.vote_average || 0,
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        type: 'series'
      }));
    }

    // Merge local DB results: add any that are not already in TMDB results
    if (localResults.length > 0) {
      const tmdbIds = new Set(results.map((r: any) => r.tmdb_id));
      const newLocal = localResults.filter((r: any) => !tmdbIds.has(r.tmdb_id));
      if (newLocal.length > 0) {
        // Prepend local results (they matched fuzzy search on our DB)
        results = [...newLocal, ...results];
        total = total + newLocal.length;
      }
    }

    const hasMore = page < totalPages;

    return new Response(JSON.stringify({
      results,
      total,
      page,
      totalPages,
      hasMore
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({
      results: [],
      total: 0,
      hasMore: false,
      error: 'Search failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
