import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';
import { list, counts, update, setStatus, readMode, writeMode } from '../../../lib/news-store';

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// GET ?status=draft|published|rejected|skipped -> items + counts + switch state
export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const status = url.searchParams.get('status') || 'draft';
    return json({ ok: true, items: await list(status), counts: await counts(), mode: readMode() });
  } catch (e: any) {
    return json({ ok: false, error: 'Could not read the news list' }, 500);
  }
};

// POST {action: publish|reject|restore|unpublish|save|mode, id, patch}
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let b: any = {};
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  try {
    if (b.action === 'mode') return json({ ok: true, mode: writeMode({ auto_publish: !!b.auto_publish }) });
    const id = Number(b.id);
    if (!Number.isInteger(id) || id <= 0) return json({ ok: false, error: 'id required' }, 400);
    if (b.action === 'save') return json(await update(id, b.patch || {}));
    if (b.action === 'publish') {
      if (b.patch) { const u = await update(id, b.patch); if (!u.ok) return json(u); }
      return json(await setStatus(id, 'published'));
    }
    if (b.action === 'reject') return json(await setStatus(id, 'rejected'));
    if (b.action === 'restore' || b.action === 'unpublish') return json(await setStatus(id, 'draft'));
    return json({ ok: false, error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ ok: false, error: 'Something went wrong. Nothing was changed.' }, 500);
  }
};
