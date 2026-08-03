import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

async function pg(path: string, init?: RequestInit) {
  return fetch(`${POSTGREST_URL}/${path}`, {
    ...init,
    headers: { 'Accept-Profile': 'public', 'Content-Profile': 'public', 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
}

// GET: list all blog posts (draft + published)
export const GET: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const r = await pg('blog_posts?select=id,slug,title,deck,body,tags,cover_image,accent,related_tmdb_id,related_type,angle,source,status,created_at,published_at&order=created_at.desc');
    const rows = r.ok ? await r.json() : [];
    return new Response(JSON.stringify({ posts: rows }), { headers: { 'Content-Type': 'application/json' } });
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
      const r = await pg(`blog_posts?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      });
      const rows = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, post: rows?.[0] }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'unpublish') {
      const r = await pg(`blog_posts?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'draft', updated_at: new Date().toISOString() }),
      });
      const rows = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, post: rows?.[0] }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'delete') {
      const r = await pg(`blog_posts?id=eq.${id}`, { method: 'DELETE' });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'update' && patch) {
      // whitelist editable fields
      const allowed = ['title', 'deck', 'body', 'tags', 'accent', 'cover_image', 'related_tmdb_id', 'related_type'];
      const clean: any = {};
      for (const k of allowed) if (k in patch) clean[k] = patch[k];
      clean.updated_at = new Date().toISOString();
      const r = await pg(`blog_posts?id=eq.${id}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(clean),
      });
      const rows = await r.json();
      return new Response(JSON.stringify({ ok: r.ok, post: rows?.[0] }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'action failed' }), { status: 500 });
  }
};
