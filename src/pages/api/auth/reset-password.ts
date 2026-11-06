import type { APIRoute } from 'astro';
import { completePasswordReset, isResetTokenValid } from '../../../lib/password-reset';

// Checks a reset link (GET) and saves the new password (POST).

const hits = new Map<string, number[]>();
function tooMany(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return list.length > max;
}

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const ipOf = (request: Request) =>
  (request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown').trim();

export const GET: APIRoute = async ({ request, url }) => {
  if (tooMany(ipOf(request), 30, 15 * 60 * 1000)) return json({ valid: false }, 429);
  return json({ valid: await isResetTokenValid(url.searchParams.get('token') || '') });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (tooMany(ipOf(request), 10, 15 * 60 * 1000)) {
      return json({ success: false, error: 'Too many tries. Please wait a few minutes and try again.' }, 429);
    }
    const body = await request.json().catch(() => ({}));
    const result = await completePasswordReset(String(body.token || ''), String(body.password || ''));
    if (!result.ok) return json({ success: false, error: result.error }, 400);
    return json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return json({ success: false, error: 'Server error. Please try again.' }, 500);
  }
};
