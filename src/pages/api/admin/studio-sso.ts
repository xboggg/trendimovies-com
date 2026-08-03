import type { APIRoute } from 'astro';
import { createHmac } from 'crypto';
import { requireAuth } from '../../../lib/admin-auth';

const SSO_SECRET = import.meta.env.STUDIO_SSO_SECRET || '';
const STUDIO_URL = import.meta.env.STUDIO_URL || 'https://studio.trendimovies.com';

// Mints a short-lived token the Studio's /sso route verifies (same HMAC scheme),
// so an already-logged-in admin enters the Studio without a second password.
export const GET: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  if (!SSO_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: 'STUDIO_SSO_SECRET not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  // token = base64url( "<expires_epoch_seconds>.<hmac_sha256(expires)>" ), 60s TTL
  const expires = Math.floor(Date.now() / 1000) + 60;
  const sig = createHmac('sha256', SSO_SECRET).update(String(expires)).digest('hex');
  const token = Buffer.from(`${expires}.${sig}`).toString('base64url');
  const url = `${STUDIO_URL}/sso?token=${encodeURIComponent(token)}`;

  return new Response(JSON.stringify({ ok: true, url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
