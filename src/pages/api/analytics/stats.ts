import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = 'http://localhost:3001';

function getPeriodFilter(period: string): string {
  const now = new Date();
  let cutoff: Date;
  switch (period) {
    case '24h': cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
    case '7d': cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case '30d': cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    case '90d': cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
    default: cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return cutoff.toISOString();
}

async function rpc(name: string, params: Record<string, any> = {}) {
  try {
    const res = await fetch(`${POSTGREST_URL}/rpc/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function countRows(table: string, filter: string = '') {
  try {
    const url = `${POSTGREST_URL}/${table}?select=count${filter}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data?.[0]?.count || 0;
  } catch {
    return 0;
  }
}

export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  const period = url.searchParams.get('period') || '7d';
  const cutoff = getPeriodFilter(period);

  try {
    const [
      pageViews,
      uniqueVisitors,
      topPages,
      topDownloads,
      countries,
      devices,
      browsers,
    ] = await Promise.all([
      countRows('page_views', `&viewed_at=gte.${cutoff}&is_bot=eq.false`),
      rpc('get_unique_visitors', { p_cutoff: cutoff }),
      rpc('get_top_pages', { p_cutoff: cutoff, p_limit: 20 }),
      rpc('get_top_downloads', { p_cutoff: cutoff, p_limit: 20 }),
      rpc('get_top_countries', { p_cutoff: cutoff, p_limit: 10 }),
      rpc('get_device_stats', { p_cutoff: cutoff }),
      rpc('get_browser_stats', { p_cutoff: cutoff, p_limit: 5 }),
    ]);

    const visitorCount = Array.isArray(uniqueVisitors) ? (uniqueVisitors[0]?.count || 0) : (uniqueVisitors?.count || 0);

    return new Response(JSON.stringify({
      success: true,
      stats: {
        pageViews: pageViews,
        searches: 0,
        downloads: 0,
        uniqueVisitors: visitorCount,
      },
      topPages: topPages || [],
      topSearches: [],
      topDownloads: topDownloads || [],
      countries: countries || [],
      devices: devices || [],
      browsers: browsers || [],
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
