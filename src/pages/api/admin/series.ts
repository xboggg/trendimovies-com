import type { APIRoute } from 'astro';
import { getSeries } from '../../../lib/admin-queries';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';

  try {
    const data = await getSeries({ page, limit, search });
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message, series: [], total: 0 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
