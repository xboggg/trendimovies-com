import type { APIRoute } from 'astro';
import { fetchFromTMDB } from '../../lib/tmdb';

// /api/watch?type=movie|tv&id=<tmdb id>  ->  where to watch / rent / buy, for the visitor's country (Cloudflare header), from TMDB (data by JustWatch).
const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, max-age=300' } });

const FALLBACK = ['US', 'GB', 'CA', 'AU', 'IN', 'NG', 'GH', 'ZA', 'KE', 'DE', 'FR', 'ES', 'IT', 'BR', 'MX'];
const has = (r: any) => r && ['flatrate', 'free', 'ads', 'rent', 'buy'].some((k) => Array.isArray(r[k]) && r[k].length);
const uniq = (a: any[]) => { const seen = new Set<number>(); return (a || []).filter((p) => (seen.has(p.provider_id) ? false : (seen.add(p.provider_id), true))); };
const shape = (a: any[]) => a.slice(0, 12).map((p) => ({ name: p.provider_name, logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '' }));

export const GET: APIRoute = async ({ url, request }) => {
  const type = url.searchParams.get('type') === 'tv' ? 'tv' : 'movie';
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'bad id' }, 400);
  const cc = String(request.headers.get('cf-ipcountry') || '').toUpperCase();
  const mine = /^[A-Z]{2}$/.test(cc) ? cc : '';
  try {
    const d: any = await fetchFromTMDB<any>(`/${type}/${id}/watch/providers`, {});
    const results = (d && d.results) || {};
    const order = Array.from(new Set([mine, ...FALLBACK].filter(Boolean)));
    let region = order.find((c) => has(results[c])) || Object.keys(results).find((c) => has(results[c])) || '';
    if (!region) return json({ region: '', groups: [] });
    const r = results[region];
    let name = region;
    try { name = new Intl.DisplayNames(['en'], { type: 'region' }).of(region) || region; } catch { /* keep the code */ }
    const groups = [
      { label: 'Stream', providers: shape(uniq([...(r.flatrate || []), ...(r.free || []), ...(r.ads || [])])) },
      { label: 'Rent', providers: shape(uniq(r.rent || [])) },
      { label: 'Buy', providers: shape(uniq(r.buy || [])) },
    ].filter((g) => g.providers.length);
    return json({ region, regionName: name, note: region !== mine ? `Shown for ${name}; what is available where you are may differ.` : '', link: r.link || '', groups });
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
};
