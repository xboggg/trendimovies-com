import type { APIRoute } from 'astro';
import { requestPasswordReset } from '../../../lib/password-reset';
import { mailConfigured } from '../../../lib/mailer';

// "Forgot password": asks for a reset link by email.
// The answer is the same whether or not the address has an account.

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = (request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown').trim();
    if (tooMany(ip, 5, 15 * 60 * 1000)) {
      return json({ success: false, error: 'Too many tries. Please wait a few minutes and try again.' }, 429);
    }
    if (!mailConfigured()) {
      return json({ success: false, error: 'Password reset by email is not switched on yet. Please contact us.' }, 503);
    }
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return json({ success: false, error: 'Please enter a valid email address.' }, 400);
    }
    await requestPasswordReset(email, ip);
    return json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return json({ success: false, error: 'Server error. Please try again.' }, 500);
  }
};
