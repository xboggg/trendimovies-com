import type { APIRoute } from 'astro';

// Running series for the acquirer's airing tracker on Oracle (added 2026-10-19).
//
// The tracker watches every series that is still airing on the site, so a
// series Edmund adds is picked up on the tracker's next daily refresh with no
// extra step. Only the acquirer may call this: it sends the shared
// ACQUIRER_TOKEN in X-Acquirer-Token (the same token /api/requests accepts).
//
// "Running" = TMDB status Returning Series / In Production / Pilot / Planned,
// plus Ended or Canceled series whose last episode aired in the last 30 days
// (a finale is often marked Ended before its WEBRip arrives).

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

function acquirerTokenOk(request: Request): boolean {
  const given = request.headers.get('x-acquirer-token') || '';
  const expected = import.meta.env.ACQUIRER_TOKEN || process.env.ACQUIRER_TOKEN || '';
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = async ({ request, url }) => {
  if (!acquirerTokenOk(request)) return json({ error: 'Unauthorized' }, 401);

  // ?all_ids=1 -> TMDB ids of EVERY series on the site (any status). The
  // tracker's new-series detection uses it so a finished mini-series that is
  // already on the site (Carrie 2026, "Ended") is never treated as new.
  if (url.searchParams.get('all_ids') === '1') {
    try {
      const r = await fetch(`${POSTGREST_URL}/series?select=tmdb_id&tmdb_id=not.is.null&limit=50000`,
                            { headers: { 'Accept-Profile': 'public' } });
      if (!r.ok) return json({ error: 'Database error' }, 502);
      const ids = (await r.json()).map((x: any) => x.tmdb_id);
      return json({ count: ids.length, ids });
    } catch (e) {
      console.error('airing-series all_ids error:', e);
      return json({ error: 'Server error' }, 500);
    }
  }

  const cols = 'tmdb_id,title,original_title,year,status,popularity,last_air_date';
  const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString().slice(0, 10);
  const running = `${POSTGREST_URL}/series?select=${cols}` +
    `&status=in.("Returning Series","In Production","Pilot","Planned")&tmdb_id=not.is.null&limit=20000`;
  const recentlyEnded = `${POSTGREST_URL}/series?select=${cols}` +
    `&status=in.(Ended,Canceled)&last_air_date=gte.${since}&tmdb_id=not.is.null&limit=20000`;

  try {
    const [a, b] = await Promise.all([
      fetch(running, { headers: { 'Accept-Profile': 'public' } }),
      fetch(recentlyEnded, { headers: { 'Accept-Profile': 'public' } }),
    ]);
    if (!a.ok || !b.ok) return json({ error: 'Database error' }, 502);
    const rows = [...(await a.json()), ...(await b.json())];
    const seen = new Set<number>();
    const series = rows.filter((r: any) => {
      if (!r.tmdb_id || seen.has(r.tmdb_id)) return false;
      seen.add(r.tmdb_id);
      return true;
    });
    return json({ count: series.length, series });
  } catch (e) {
    console.error('airing-series error:', e);
    return json({ error: 'Server error' }, 500);
  }
};
