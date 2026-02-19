import type { APIRoute } from 'astro';
import { getMovies } from '../../../lib/admin-queries';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const filter = (url.searchParams.get('filter') || 'all') as 'all' | 'with_ddl' | 'without_ddl';

  try {
    const data = await getMovies({ page, limit, search, filter });
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message, movies: [], total: 0 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
