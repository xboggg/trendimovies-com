import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';
import { readHold, writeHold } from '../../../lib/takedowns-store';

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  return json({ ok: true, hold: readHold() });
};

export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let b: any = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  return json({ ok: true, hold: writeHold(!!b.enabled, Number(b.days)) });
};
