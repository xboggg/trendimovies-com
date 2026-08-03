import type { APIRoute } from 'astro';
import { createHash } from 'crypto';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

function pg(path: string, init?: RequestInit) {
  return fetch(`${POSTGREST_URL}/${path}`, {
    ...init,
    headers: { 'Accept-Profile': 'public', 'Content-Profile': 'public', 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}

// Collapse whitespace / strip control chars via unicode-property-safe regex.
const clean = (s: string) => String(s || '').replace(/[\t\n\r]+/g, ' ').replace(/  +/g, ' ').trim();
const hashIp = (ip: string) => createHash('sha256').update('tmrv:' + ip).digest('hex').slice(0, 32);

// Lightweight spam/abuse signals -> route a comment to 'pending' instead of 'visible'.
const PROFANITY = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'asshole', 'whore', 'retard'];
function isSuspicious(name: string, body: string): boolean {
  const b = body.toLowerCase();
  const linkCount = (b.match(/https?:\/\/|www\.|\.(com|net|xyz|ru|top|click|shop)\b/g) || []).length;
  if (linkCount >= 1) return true;                          // any link -> hold
  if (PROFANITY.some((w) => b.includes(w))) return true;    // slurs/profanity -> hold
  if ((body.match(/[A-Z]/g) || []).length > body.length * 0.6 && body.length > 20) return true; // SHOUTING
  if (/(.)\1{6,}/.test(b)) return true;                     // repeated-char spam
  if (body.length < 2) return true;
  if (/\b(viagra|casino|crypto|bitcoin|loan|forex|porn|xxx|telegram\.me|t\.me)\b/i.test(b)) return true;
  return false;
}

function json(o: any, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
}

// GET: threaded comments for any content (content_type + content_id), or legacy review_id
export const GET: APIRoute = async ({ url }) => {
  // new generic keying; falls back to review_id for backward compat
  let contentType = (url.searchParams.get('content_type') || '').toLowerCase();
  let contentId = parseInt(url.searchParams.get('content_id') || '0');
  if (!contentId && url.searchParams.get('review_id')) {
    contentType = 'review';
    contentId = parseInt(url.searchParams.get('review_id') || '0');
  }
  const sort = url.searchParams.get('sort') === 'top' ? 'likes.desc,created_at.desc' : 'created_at.desc';
  if (!contentId || !['review', 'movie', 'series'].includes(contentType)) return json({ comments: [], total: 0 });
  try {
    const r = await pg(`review_comments?content_type=eq.${contentType}&content_id=eq.${contentId}&status=eq.visible&select=id,parent_id,author,body,is_spoiler,is_staff,likes,created_at&order=${sort}&limit=500`);
    const rows = r.ok ? await r.json() : [];
    const byId = new Map<number, any>();
    rows.forEach((c: any) => { c.replies = []; byId.set(c.id, c); });
    const top: any[] = [];
    rows.forEach((c: any) => {
      if (c.parent_id && byId.has(c.parent_id)) byId.get(c.parent_id).replies.push(c);
      else if (!c.parent_id) top.push(c);
    });
    top.forEach((c) => c.replies.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
    return json({ comments: top, total: rows.length });
  } catch { return json({ comments: [], total: 0 }); }
};

// POST: create a comment (auto-filtered) or like
export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any = {};
  try { body = await request.json(); } catch { }
  const ip = hashIp(clientAddress || request.headers.get('x-forwarded-for') || 'x');

  // LIKE
  if (body.action === 'like' && body.comment_id && body.visitor) {
    try {
      const r = await pg('rpc/like_comment', { method: 'POST', body: JSON.stringify({ p_comment_id: body.comment_id, p_visitor: String(body.visitor).slice(0, 64) }) });
      const n = r.ok ? await r.json() : null;
      return json({ ok: r.ok, likes: typeof n === 'number' ? n : (Array.isArray(n) ? n[0] : 0) });
    } catch { return json({ ok: false }, 500); }
  }

  // POST comment — generic keying (content_type + content_id), legacy review_id fallback
  let contentType = String(body.content_type || '').toLowerCase();
  let contentId = parseInt(body.content_id || '0');
  if (!contentId && body.review_id) { contentType = 'review'; contentId = parseInt(body.review_id); }
  const author = clean(body.author || '').slice(0, 60) || 'Movie Fan';
  const text = clean(body.body || '').slice(0, 3000);
  const parentId = body.parent_id ? parseInt(body.parent_id) : null;
  const isSpoiler = !!body.is_spoiler;
  if (body.website) return json({ ok: true, status: 'visible' });   // honeypot -> silently drop bots
  if (!contentId || !['review', 'movie', 'series'].includes(contentType) || text.length < 2)
    return json({ ok: false, error: 'Comment too short' }, 400);

  // rate-limit: max 4 comments / 5 min per ip_hash
  try {
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const rc = await pg(`review_comments?ip_hash=eq.${ip}&created_at=gte.${since}&select=id`, { headers: { Prefer: 'count=exact', Range: '0-0' } });
    const cr = rc.headers.get('content-range') || '';
    const recent = parseInt(cr.split('/')[1] || '0', 10);
    if (recent >= 4) return json({ ok: false, error: 'You are commenting too fast. Please wait a moment.' }, 429);
  } catch { }

  const status = isSuspicious(author, text) ? 'pending' : 'visible';
  try {
    const row: any = { content_type: contentType, content_id: contentId, parent_id: parentId, author, body: text, is_spoiler: isSpoiler, status, ip_hash: ip };
    if (contentType === 'review') row.review_id = contentId;   // keep legacy column populated for reviews
    const r = await pg('review_comments', {
      method: 'POST', headers: { Prefer: 'return=representation' },
      body: JSON.stringify(row),
    });
    const rows = r.ok ? await r.json() : [];
    const c = Array.isArray(rows) ? rows[0] : null;
    return json({ ok: r.ok, status, comment: status === 'visible' ? c : null,
      message: status === 'pending' ? 'Thanks! Your comment is awaiting review.' : '' });
  } catch { return json({ ok: false, error: 'Could not post comment' }, 500); }
};
