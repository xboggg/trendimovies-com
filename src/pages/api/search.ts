import type { APIRoute } from 'astro';
import { searchMulti, searchMovies, searchTV } from '../../lib/tmdb';

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

    if (type === 'all') {
      // Use multi search for combined results
      const response = await searchMulti(query, page);
      total = response.total_results || 0;
      totalPages = response.total_pages || 1;

      results = (response.results || [])
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
      const response = await searchMovies(query, page);
      total = response.total_results || 0;
      totalPages = response.total_pages || 1;

      results = (response.results || []).map((movie: any) => ({
        id: movie.id,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average || 0,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        type: 'movie'
      }));
    } else if (type === 'series') {
      const response = await searchTV(query, page);
      total = response.total_results || 0;
      totalPages = response.total_pages || 1;

      results = (response.results || []).map((show: any) => ({
        id: show.id,
        tmdb_id: show.id,
        title: show.name,
        poster_path: show.poster_path,
        vote_average: show.vote_average || 0,
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        type: 'series'
      }));
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
