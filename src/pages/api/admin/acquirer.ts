import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

// Server-side proxy to the standalone TM Acquirer (Oracle 138,
// acquirer.trendimovies.com). The acquirer's own Basic-Auth /queue UI is left
// untouched; this talks to the ADDITIVE token-guarded /adminapi/* routes so the
// admin never triggers a Basic-Auth prompt. Token lives only in 144's .env.
const ACQUIRER_URL = import.meta.env.ACQUIRER_API_URL || 'https://acquirer.trendimovies.com/adminapi';
const ACQUIRER_TOKEN = import.meta.env.ACQUIRER_TOKEN || process.env.ACQUIRER_TOKEN || '';

async function acq(path: string, init?: RequestInit) {
  return fetch(`${ACQUIRER_URL}${path}`, {
    ...init,
    headers: {
      'X-Acquirer-Token': ACQUIRER_TOKEN,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    signal: AbortSignal.timeout(20000),
  });
}

// GET: list the queue
export const GET: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  if (!ACQUIRER_TOKEN) {
    return new Response(JSON.stringify({ error: 'acquirer token not configured' }), { status: 500 });
  }
  try {
    const r = await acq('/queue');
    const rows = r.ok ? await r.json() : [];
    return new Response(JSON.stringify({ ok: r.ok, items: rows }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'acquirer unreachable' }), { status: 502 });
  }
};

// POST: actions — add / run-now / delete / clear-done / clear-all
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  if (!ACQUIRER_TOKEN) {
    return new Response(JSON.stringify({ error: 'acquirer token not configured' }), { status: 500 });
  }

  let body: any = {};
  try { body = await request.json(); } catch { }
  const action = body.action;

  try {
    if (action === 'add') {
      const text = String(body.text || '').slice(0, 20000);
      const r = await acq('/queue/add', { method: 'POST', body: JSON.stringify({ text }) });
      const data = r.ok ? await r.json() : {};
      return new Response(JSON.stringify({ ok: r.ok, ...data }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'run-now') {
      const r = await acq('/queue/run-now', { method: 'POST', body: '{}' });
      const data = r.ok ? await r.json() : {};
      return new Response(JSON.stringify({ ok: r.ok, ...data }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'delete') {
      const id = parseInt(body.id);
      if (!id) return new Response(JSON.stringify({ ok: false, error: 'id required' }), { status: 400 });
      const r = await acq('/queue/delete', { method: 'POST', body: JSON.stringify({ id }) });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'clear-done') {
      const r = await acq('/queue/clear-done', { method: 'POST', body: '{}' });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (action === 'clear-all') {
      const r = await acq('/queue/clear-all', { method: 'POST', body: '{}' });
      return new Response(JSON.stringify({ ok: r.ok }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'acquirer unreachable' }), { status: 502 });
  }
};
