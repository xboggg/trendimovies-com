import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';
import { readTakedowns, searchMovies, takeDown, restore } from '../../../lib/takedowns-store';

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// GET            -> the takedown list
// GET ?search=x  -> find films (title words or TMDB id)
export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  const q = url.searchParams.get('search');
  if (q !== null) return json({ ok: true, results: await searchMovies(q) });
  return json({ ok: true, list: readTakedowns().slice().reverse() });
};

// POST {tmdb_id, note} -> take the film down everywhere
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let b: any = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  const r = await takeDown(Number(b.tmdb_id), String(b.note || ''));
  return json(r, r.ok ? 200 : 500);
};

// DELETE {tmdb_id} -> remove from the list
export const DELETE: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let b: any = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  const r = await restore(Number(b.tmdb_id));
  return json(r, r.ok ? 200 : 500);
};
