/**
 * /api/app/browse?kind=movies|series[&genre=][&lang=][&year=][&rating=1][&nolly=1][&running=1][&sort=][&page=]
 * The Movies and Series tabs of the Telegram Mini App: 60 titles per page with filters. Rules and lists: browse() in src/lib/appData.ts.
 * Anything not on the fixed lists is ignored (never put into a query).
 */
import type { APIRoute } from 'astro';
import { browse } from '../../../lib/appData';

export const GET: APIRoute = async ({ url }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' };
  const kind = url.searchParams.get('kind');
  if (kind !== 'movies' && kind !== 'series') return new Response(JSON.stringify({ error: 'unknown kind' }), { status: 400, headers });
  const g = (k: string) => url.searchParams.get(k) || '';
  try {
    const data = await browse(kind, {
      genre: g('genre'), lang: g('lang'), year: g('year'), sort: g('sort'),
      rating: g('rating') === '1', nolly: g('nolly') === '1', running: g('running') === '1',
      page: parseInt(g('page') || '1', 10),
    });
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'list unavailable' }), { status: 502, headers });
  }
};
