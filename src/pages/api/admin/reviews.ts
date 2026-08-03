import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

async function pg(path: string, init?: RequestInit) {
  return fetch(`${POSTGREST_URL}/${path}`, {
    ...init,
    headers: { 'Accept-Profile': 'public', 'Content-Profile': 'public', 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}

// GET: list all reviews (draft + published), or comment-moderation feed (?comments=pending|all)
export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const cmode = url.searchParams.get('comments');
  if (cmode) {
    try {
      const statusFilter = cmode === 'pending' ? '&status=eq.pending' : '';
      const cr = await pg(`review_comments?select=id,content_type,content_id,review_id,parent_id,author,body,is_spoiler,status,likes,created_at${statusFilter}&order=created_at.desc&limit=200`);
      const rows = cr.ok ? await cr.json() : [];
      // resolve a display label + link per comment, by content_type
      const revIds = [...new Set(rows.filter((c: any) => (c.content_type || 'review') === 'review').map((c: any) => c.content_id || c.review_id))].filter(Boolean);
      const titles = new Map<number, any>();
      if (revIds.length) {
        const tr = await pg(`movie_reviews?id=in.(${revIds.join(',')})&select=id,slug,title`);
        if (tr.ok) { const trows = await tr.json(); trows.forEach((t: any) => titles.set(t.id, t)); }
      }
      const out = rows.map((c: any) => {
        const ct = c.content_type || 'review';
        let ctx: any = null;
        if (ct === 'review') {
          const t = titles.get(c.content_id || c.review_id);
          ctx = t ? { kind: 'Review', title: t.title, url: `/review/${t.slug}` } : null;
        } else if (ct === 'movie') {
          ctx = { kind: 'Movie', title: `tmdb ${c.content_id}`, url: `/movie/${c.content_id}` };
        } else if (ct === 'series') {
          ctx = { kind: 'Series', title: `tmdb ${c.content_id}`, url: `/tv/${c.content_id}` };
        }
        return { ...c, review: ctx && ctx.kind === 'Review' ? { title: ctx.title, slug: ctx.url.replace('/review/', '') } : null, ctx };
      });
      const pendingCount = out.filter((c: any) => c.status === 'pending').length;
      return new Response(JSON.stringify({ comments: out, pendingCount }), { headers: { 'Content-Type': 'application/json' } });
    } catch { return new Response(JSON.stringify({ comments: [] }), { status: 500 }); }
  }

  try {
    const r = await pg('movie_reviews?select=id,tmdb_id,slug,title,year,headline,deck,body,pull_quote,verdict,status,accent,poster_path,rt_score,box_office,budget,director,starring,genre,rating,digital_date,created_at,published_at&order=created_at.desc');
    const rows = r.ok ? await r.json() : [];
    return new Response(JSON.stringify({ reviews: rows }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'fetch failed' }), { status: 500 });
  }
};

// POST: actions — publish / unpublish / delete / update
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let body: any = {};
  try { body = await request.json(); } catch { }
  const { action, id, patch } = body;
  if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });

  try {
    if (action === 'publish') {
      const r = await pg(`movie_reviews?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      });
      const rows = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, review: rows?.[0] }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'unpublish') {
      const r = await pg(`movie_reviews?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'draft', updated_at: new Date().toISOString() }),
      });
      const rows = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, review: rows?.[0] }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'delete') {
      const r = await pg(`movie_reviews?id=eq.${id}`, { method: 'DELETE' });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'update' && patch) {
      // whitelist editable fields
      const allowed = ['headline', 'deck', 'body', 'pull_quote', 'verdict', 'rt_score', 'box_office', 'budget', 'accent', 'rating', 'director', 'starring', 'genre', 'digital_date', 'read_minutes'];
      const clean: any = {};
      for (const k of allowed) if (k in patch) clean[k] = patch[k];
      clean.updated_at = new Date().toISOString();
      const r = await pg(`movie_reviews?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(clean),
      });
      const rows = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, review: rows?.[0] }), { headers: { 'Content-Type': 'application/json' } });
    }
    // ---- comment moderation ----
    if (action === 'comment_reply') {
      // Post an OFFICIAL staff reply under a comment. body.text = the reply.
      const parent = await pg(`review_comments?id=eq.${id}&select=content_type,content_id,review_id`);
      const prow = parent.ok ? (await parent.json())[0] : null;
      if (!prow) return new Response(JSON.stringify({ ok: false, error: 'parent not found' }), { status: 400 });
      const text = String((body.text || '')).trim().slice(0, 3000);
      if (text.length < 2) return new Response(JSON.stringify({ ok: false, error: 'reply too short' }), { status: 400 });
      const row: any = {
        content_type: prow.content_type || 'review', content_id: prow.content_id || prow.review_id,
        parent_id: id, author: 'TrendiMovies Team', body: text,
        is_spoiler: false, is_staff: true, status: 'visible',
      };
      if ((prow.content_type || 'review') === 'review') row.review_id = prow.content_id || prow.review_id;
      const r = await pg('review_comments', { method: 'POST', body: JSON.stringify(row) });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'comment_approve') {
      const r = await pg(`review_comments?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'visible' }) });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'comment_remove') {
      const r = await pg(`review_comments?id=eq.${id}`, { method: 'DELETE' });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'action failed' }), { status: 500 });
  }
};
