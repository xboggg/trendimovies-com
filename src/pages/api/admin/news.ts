import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';
import { fetchFromTMDB } from '../../../lib/tmdb';
import { list, counts, update, setStatus, readMode, writeMode, readSources, publishDatedDrafts, addLead, recentLeads, addChannel, replaceChannel, toggleChannel } from '../../../lib/news-store';

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// GET ?status=draft|published|rejected|skipped -> items + counts + switch state
export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    // Picture picker: ?pictures=<words> finds films/series/people on TMDB; ?images=<movie|tv|person>:<id> lists their pictures
    const pq = url.searchParams.get('pictures');
    if (pq !== null) {
      const d: any = await fetchFromTMDB('/search/multi', { query: pq.slice(0, 80) });
      const results = (d?.results || []).filter((x: any) => ['movie', 'tv', 'person'].includes(x.media_type)).slice(0, 8).map((x: any) => ({
        kind: x.media_type, id: x.id, name: x.title || x.name,
        year: String(x.release_date || x.first_air_date || '').slice(0, 4),
        thumb: (x.backdrop_path || x.poster_path || x.profile_path) ? 'https://image.tmdb.org/t/p/w185' + (x.poster_path || x.profile_path || x.backdrop_path) : '',
      }));
      return json({ ok: true, results });
    }
    const im = url.searchParams.get('images');
    if (im !== null) {
      const m = im.match(/^(movie|tv|person):(\d{1,9})$/);
      if (!m) return json({ ok: false, error: 'Bad request' }, 400);
      const [, kind, id] = m;
      const imgs: any = await fetchFromTMDB(`/${kind}/${id}/images`, { include_image_language: 'en,null' });
      let images: { url: string; thumb: string }[] = [];
      let poster = '', title = '';
      if (kind === 'person') {
        images = (imgs?.profiles || []).slice(0, 12).map((x: any) => ({ url: 'https://image.tmdb.org/t/p/h632' + x.file_path, thumb: 'https://image.tmdb.org/t/p/w185' + x.file_path }));
        const pd: any = await fetchFromTMDB(`/person/${id}`, {}); title = pd?.name || '';
      } else {
        const bd = (imgs?.backdrops || []);
        const clean = bd.filter((x: any) => !x.iso_639_1);               // pictures without writing on them first
        images = (clean.length >= 4 ? clean : bd).slice(0, 12).map((x: any) => ({ url: 'https://image.tmdb.org/t/p/w1280' + x.file_path, thumb: 'https://image.tmdb.org/t/p/w300' + x.file_path }));
        const fd: any = await fetchFromTMDB(`/${kind}/${id}`, {});
        title = fd?.title || fd?.name || '';
        poster = fd?.poster_path ? 'https://image.tmdb.org/t/p/w500' + fd.poster_path : '';
      }
      return json({ ok: true, images, poster, title, kind, id: Number(id) });
    }
    const status = url.searchParams.get('status') || 'draft';
    return json({ ok: true, items: await list(status), counts: await counts(), mode: readMode(), sources: readSources(), leads: await recentLeads() });
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
    if (b.action === 'lead_add') return json(await addLead(String(b.text || ''), String(b.link || ''), String(b.posted_on || '')));
    if (b.action === 'publish_dated') return json(await publishDatedDrafts());
    if (b.action === 'source_add') return json(await addChannel(String(b.link || ''), String(b.label || '')));
    if (b.action === 'source_replace') return json(await replaceChannel(String(b.handle || ''), String(b.link || '')));
    if (b.action === 'source_toggle') return json(toggleChannel(String(b.handle || ''), !!b.active));
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
