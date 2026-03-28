import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = 'http://localhost:3001';

function getPeriodFilter(period: string): string {
  const now = new Date();
  let cutoff: Date;

  switch (period) {
    case '24h':
      cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return cutoff.toISOString();
}

export const GET: APIRoute = async ({ request, url }) => {
  // Auth check
  const authError = requireAuth(request);
  if (authError) return authError;

  const period = url.searchParams.get('period') || '7d';
  const cutoff = getPeriodFilter(period);

  try {
    // Fetch all stats in parallel
    const [
      pageviewsRes,
      searchesRes,
      downloadsRes,
      topPagesRes,
      topSearchesRes,
      topDownloadsRes,
      countriesRes,
      devicesRes,
      browsersRes,
      uniqueVisitorsRes
    ] = await Promise.all([
      // Total pageviews
      fetch(`${POSTGREST_URL}/page_views?viewed_at=gte.${cutoff}&select=count`, {
        headers: { 'Prefer': 'count=exact' }
      }),
      // Total searches
      fetch(`${POSTGREST_URL}/search_queries?searched_at=gte.${cutoff}&select=count`, {
        headers: { 'Prefer': 'count=exact' }
      }),
      // Total downloads (from download_tokens)
      fetch(`${POSTGREST_URL}/download_tokens?created_at=gte.${cutoff}&select=count`, {
        headers: { 'Prefer': 'count=exact' }
      }),
      // Top pages
      fetch(`${POSTGREST_URL}/rpc/get_top_pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff, p_limit: 20 })
      }),
      // Top searches
      fetch(`${POSTGREST_URL}/rpc/get_top_searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff, p_limit: 20 })
      }),
      // Top downloads
      fetch(`${POSTGREST_URL}/rpc/get_top_downloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff, p_limit: 20 })
      }),
      // Top countries
      fetch(`${POSTGREST_URL}/rpc/get_top_countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff, p_limit: 10 })
      }),
      // Device breakdown
      fetch(`${POSTGREST_URL}/rpc/get_device_stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff })
      }),
      // Browser breakdown
      fetch(`${POSTGREST_URL}/rpc/get_browser_stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff, p_limit: 5 })
      }),
      // Unique visitors (by session_id or ip)
      fetch(`${POSTGREST_URL}/rpc/get_unique_visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_cutoff: cutoff })
      })
    ]);

    // Parse responses
    const pageviewsCount = parseInt(pageviewsRes.headers.get('content-range')?.split('/')[1] || '0');
    const searchesCount = parseInt(searchesRes.headers.get('content-range')?.split('/')[1] || '0');
    const downloadsCount = parseInt(downloadsRes.headers.get('content-range')?.split('/')[1] || '0');

    const topPages = topPagesRes.ok ? await topPagesRes.json() : [];
    const topSearches = topSearchesRes.ok ? await topSearchesRes.json() : [];
    const topDownloads = topDownloadsRes.ok ? await topDownloadsRes.json() : [];
    const countries = countriesRes.ok ? await countriesRes.json() : [];
    const devices = devicesRes.ok ? await devicesRes.json() : [];
    const browsers = browsersRes.ok ? await browsersRes.json() : [];
    const uniqueVisitorsData = uniqueVisitorsRes.ok ? await uniqueVisitorsRes.json() : { count: 0 };

    return new Response(JSON.stringify({
      success: true,
      stats: {
        pageViews: pageviewsCount,
        searches: searchesCount,
        downloads: downloadsCount,
        uniqueVisitors: uniqueVisitorsData.count || uniqueVisitorsData[0]?.count || 0
      },
      topPages,
      topSearches,
      topDownloads,
      countries,
      devices,
      browsers
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Analytics stats error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
