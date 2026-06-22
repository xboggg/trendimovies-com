import type { APIRoute } from 'astro';
import { execFile } from 'child_process';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const SCRIPT = '/var/www/trendimovies/scripts/curate_topics.py';
const TMDB_KEY = import.meta.env.TMDB_API_KEY || '';
const TMDB = 'https://api.themoviedb.org/3';

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

// ── run the curation script. draft = read-only (root); save/refresh = as postgres ──
function runScript(mode: 'draft' | 'save' | 'refresh-live', topicJson?: string, timeoutMs = 180000): Promise<any> {
  return new Promise((resolve) => {
    let cmd: string;
    let args: string[];
    if (mode === 'draft') {
      cmd = 'python3';
      args = [SCRIPT, '--draft', topicJson || '{}'];
    } else if (mode === 'save') {
      cmd = 'sudo';
      args = ['-n', '-u', 'postgres', 'python3', SCRIPT, '--save', topicJson || '{}'];
    } else {
      cmd = 'sudo';
      args = ['-n', '-u', 'postgres', 'python3', SCRIPT, '--refresh-live'];
    }
    execFile(cmd, args, { timeout: timeoutMs, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, error: stderr?.trim() || err.message });
        return;
      }
      // the script prints a single JSON line for draft/save; refresh prints plain text
      const out = (stdout || '').trim();
      if (mode === 'refresh-live') { resolve({ ok: true, log: out }); return; }
      try {
        const lastLine = out.split('\n').filter(Boolean).pop() || '{}';
        resolve(JSON.parse(lastLine));
      } catch {
        resolve({ ok: false, error: 'Could not parse script output', raw: out.slice(0, 500) });
      }
    });
  });
}

async function pg(path: string, init?: RequestInit) {
  const r = await fetch(`${POSTGREST_URL}/${path}`, {
    ...init,
    headers: { 'Accept-Profile': 'public', 'Content-Profile': 'public', 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  return r;
}

// ── GET: list all guides (with film counts) or TMDB search for manual add ──
export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  // ?search=<title> → TMDB movie search for manually adding a film to a guide
  const search = url.searchParams.get('search');
  if (search) {
    try {
      const r = await fetch(`${TMDB}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(search)}`);
      const d = await r.json();
      const films = (d.results || [])
        .filter((m: any) => m.poster_path)
        .slice(0, 8)
        .map((m: any) => ({
          tmdb_id: m.id, title: m.title,
          year: parseInt((m.release_date || '0').slice(0, 4)) || null,
          blurb: '', poster_path: m.poster_path, backdrop_path: m.backdrop_path,
        }));
      return json({ ok: true, films });
    } catch (e: any) {
      return json({ ok: false, error: 'TMDB search failed' }, 502);
    }
  }

  // list guides
  try {
    const r = await pg('movie_topics?order=sort_order.asc&select=id,slug,title,category,intro,emoji,color,source,is_published,sort_order,updated_at');
    const topics = await r.json();
    await Promise.all(topics.map(async (t: any) => {
      try {
        const ir = await pg(`movie_topic_items?topic_id=eq.${t.id}&select=id&limit=1000`);
        const items = ir.ok ? await ir.json() : [];
        t.film_count = items.length;
      } catch { t.film_count = 0; }
    }));
    return json({ ok: true, topics });
  } catch (e: any) {
    return json({ ok: false, error: 'Failed to load guides' }, 500);
  }
};

// ── POST: action-based (preview / publish / recurate / refresh-live) ──
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad JSON' }, 400); }
  const action = body.action;

  // PREVIEW: curate but don't save — returns {engine, intro, films}
  if (action === 'preview') {
    if (!body.title) return json({ ok: false, error: 'Title required' }, 400);
    const topic = {
      title: body.title, prompt: body.prompt || body.title,
      category: body.category || 'best-of', emoji: body.emoji || '🎬',
      color: body.color || '#7c3aed', source: body.source, live_kind: body.live_kind,
    };
    const result = await runScript('draft', JSON.stringify(topic));
    return json(result, result.ok ? 200 : 500);
  }

  // PUBLISH: save a guide (with an edited films list, or curate fresh if none provided)
  if (action === 'publish') {
    if (!body.title) return json({ ok: false, error: 'Title required' }, 400);
    const topic = {
      slug: body.slug, title: body.title, prompt: body.prompt || body.title,
      category: body.category || 'best-of', emoji: body.emoji || '🎬',
      color: body.color || '#7c3aed', source: body.source,
      sort_order: body.sort_order, is_published: body.is_published !== false,
      intro: body.intro, films: body.films,
    };
    const result = await runScript('save', JSON.stringify(topic));
    return json(result, result.ok ? 200 : 500);
  }

  // RECURATE: re-run curation for an existing guide (fetch its config, curate fresh, save)
  if (action === 'recurate') {
    if (!body.slug) return json({ ok: false, error: 'Slug required' }, 400);
    try {
      const r = await pg(`movie_topics?slug=eq.${encodeURIComponent(body.slug)}&select=slug,title,category,emoji,color,source,sort_order&limit=1`);
      const rows = await r.json();
      if (!rows.length) return json({ ok: false, error: 'Guide not found' }, 404);
      const t = rows[0];
      const topic = { ...t }; // no films → script curates fresh using source
      const result = await runScript('save', JSON.stringify(topic));
      return json(result, result.ok ? 200 : 500);
    } catch (e: any) {
      return json({ ok: false, error: 'Recurate failed' }, 500);
    }
  }

  // REFRESH-LIVE: re-curate all live/time-sensitive guides (same as weekly cron)
  if (action === 'refresh-live') {
    const result = await runScript('refresh-live');
    return json(result, result.ok ? 200 : 500);
  }

  return json({ ok: false, error: 'Unknown action' }, 400);
};

// ── PATCH: toggle published / change sort_order without re-curating ──
export const PATCH: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad JSON' }, 400); }
  if (!body.slug) return json({ ok: false, error: 'Slug required' }, 400);
  const patch: any = {};
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
  if (typeof body.sort_order === 'number') patch.sort_order = body.sort_order;
  if (!Object.keys(patch).length) return json({ ok: false, error: 'Nothing to update' }, 400);
  try {
    const r = await pg(`movie_topics?slug=eq.${encodeURIComponent(body.slug)}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(patch),
    });
    if (!r.ok) return json({ ok: false, error: await r.text() }, 500);
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: 'Update failed' }, 500);
  }
};

// ── DELETE: remove a guide and its items ──
export const DELETE: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  const slug = url.searchParams.get('slug');
  if (!slug) return json({ ok: false, error: 'Slug required' }, 400);
  try {
    const r = await pg(`movie_topics?slug=eq.${encodeURIComponent(slug)}&select=id`);
    const rows = await r.json();
    if (!rows.length) return json({ ok: false, error: 'Not found' }, 404);
    const id = rows[0].id;
    await pg(`movie_topic_items?topic_id=eq.${id}`, { method: 'DELETE' });
    await pg(`movie_topics?id=eq.${id}`, { method: 'DELETE' });
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: 'Delete failed' }, 500);
  }
};
