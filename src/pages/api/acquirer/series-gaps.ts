import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';

// Missing episodes for the acquirer's night-time gap filler (added 2026-10-20).
// Written nightly by /opt/trendimovies/bot/series_gaps_export.py (most-viewed
// series first, checked against TMDB). Token-gated like the other
// /api/acquirer/* endpoints (X-Acquirer-Token = ACQUIRER_TOKEN).

const GAPS_FILE = '/var/lib/trendimovies/series_gaps.json';

function acquirerTokenOk(request: Request): boolean {
  const given = request.headers.get('x-acquirer-token') || '';
  const expected = import.meta.env.ACQUIRER_TOKEN || process.env.ACQUIRER_TOKEN || '';
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = async ({ request }) => {
  if (!acquirerTokenOk(request)) return json({ error: 'Unauthorized' }, 401);
  try {
    return json(readFileSync(GAPS_FILE, 'utf-8'));
  } catch {
    return json({ error: 'gap list not generated yet' }, 503);
  }
};
