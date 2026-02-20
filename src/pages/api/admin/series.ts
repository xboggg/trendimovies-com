import type { APIRoute } from 'astro';
import { getSeries } from '../../../lib/admin-queries';
import { requireAuth } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, url }) => {
  // Auth check
  const authError = requireAuth(request);
  if (authError) return authError;

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100); // Cap at 100
  const search = url.searchParams.get('search') || '';

  try {
    const data = await getSeries({ page, limit, search });
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to fetch series', series: [], total: 0 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
