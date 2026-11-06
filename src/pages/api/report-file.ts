import type { APIRoute } from 'astro';
import { createHash } from 'crypto';
import { getAuthHeaders } from '../../lib/auth';

// "Report a bad file": one tap on a file in the Download pop-up. Saved in the
// table public.file_reports so a bad file can be found and fixed.
// Limits: 20 reports an hour per visitor, and the same visitor reporting the
// same file twice in a day is quietly counted once.

const POSTGREST_URL = 'http://localhost:3001';
const REASONS = new Set(['wont_open', 'wrong_film', 'bad_quality', 'no_sound', 'other']);

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
    if (tooMany(ip, 20, 60 * 60 * 1000)) return json({ success: false, error: 'Too many reports. Please try again later.' }, 429);

    const body = await request.json().catch(() => ({}));
    const linkId = Number(body.linkId);
    const reason = typeof body.reason === 'string' ? body.reason : '';
    if (!Number.isInteger(linkId) || linkId <= 0 || !REASONS.has(reason)) {
      return json({ success: false, error: 'Bad request.' }, 400);
    }

    // The file must exist.
    const lres = await fetch(`${POSTGREST_URL}/download_links?id=eq.${linkId}&select=id,content_type,content_id,quality,url`, { headers: getAuthHeaders() });
    const rows: any = await lres.json();
    if (!Array.isArray(rows) || rows.length === 0) return json({ success: false, error: 'File not found.' }, 404);
    const link = rows[0];

    const ipHash = createHash('sha256').update('tm-report:' + ip).digest('hex').slice(0, 32);
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const dres = await fetch(
      `${POSTGREST_URL}/file_reports?download_link_id=eq.${linkId}&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}&select=id&limit=1`,
      { headers: getAuthHeaders() }
    );
    const dup: any = await dres.json();
    if (Array.isArray(dup) && dup.length > 0) return json({ success: true });

    const ires = await fetch(`${POSTGREST_URL}/file_reports`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({
        download_link_id: linkId,
        content_type: link.content_type,
        content_id: link.content_id,
        quality: link.quality,
        file_url: link.url,
        reason,
        ip_hash: ipHash,
      }),
    });
    if (!ires.ok) {
      console.error('file report insert failed:', ires.status, await ires.text());
      return json({ success: false, error: 'Server error. Please try again.' }, 500);
    }
    return json({ success: true });
  } catch (error) {
    console.error('Report file error:', error);
    return json({ success: false, error: 'Server error. Please try again.' }, 500);
  }
};
