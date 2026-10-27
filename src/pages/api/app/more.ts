/**
 * /api/app/more?row=<key>  -  the FULL list behind one row of the Telegram Mini App home (the "More" button).
 * Keys: trending, newmovies, newep, tvtrending, action, digital, reviews. Same data and cache as /api/app/home. At most 30 titles.
 */
import type { APIRoute } from 'astro';
import { getAppData, ROWS, REVIEWS_META, MORE_LIMIT } from '../../../lib/appData';

export const GET: APIRoute = async ({ url }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' };
  const key = url.searchParams.get('row') || '';
  const meta = key === REVIEWS_META.key ? REVIEWS_META : ROWS.find((r) => r.key === key);
  if (!meta) return new Response(JSON.stringify({ error: 'unknown row' }), { status: 400, headers });
  try {
    const d = await getAppData();
    const items = (key === REVIEWS_META.key ? d.reviews : (d.rows[key] || [])).slice(0, MORE_LIMIT);   // a More list holds at most 30
    return new Response(JSON.stringify({ key, title: meta.title, seeAll: meta.seeAll, today: d.today, items }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'app data unavailable' }), { status: 502, headers });
  }
};
