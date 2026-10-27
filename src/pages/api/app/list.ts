/**
 * /api/app/list?kind=movies|series  -  the 60 titles behind the Movies and Series tabs of the Telegram Mini App.
 * Source and rules: getTabList() in src/lib/appData.ts.
 */
import type { APIRoute } from 'astro';
import { getTabList } from '../../../lib/appData';

export const GET: APIRoute = async ({ url }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' };
  const kind = url.searchParams.get('kind');
  if (kind !== 'movies' && kind !== 'series') return new Response(JSON.stringify({ error: 'unknown kind' }), { status: 400, headers });
  try {
    const items = await getTabList(kind);
    return new Response(JSON.stringify({ kind, items }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'list unavailable' }), { status: 502, headers });
  }
};
