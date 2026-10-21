import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';

// Films the acquirer should look for (added 2026-10-22): films people view
// with no download, and films with nothing at 720p/1080p. Written by
// /opt/trendimovies/bot/movie_demand_export.py. Token-gated (X-Acquirer-Token).

const FILE = '/var/lib/trendimovies/movie_candidates.json';

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
    return json(readFileSync(FILE, 'utf-8'));
  } catch {
    return json({ error: 'not generated yet' }, 503);
  }
};
