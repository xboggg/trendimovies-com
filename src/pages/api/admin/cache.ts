import type { APIRoute } from 'astro';
import { getCacheStats, clearCache, cleanupCache } from '../../../lib/cache';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'clear') {
    const cleared = clearCache();
    return new Response(JSON.stringify({
      success: true,
      message: `Cleared ${cleared} cache files`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (action === 'cleanup') {
    const cleaned = cleanupCache();
    return new Response(JSON.stringify({
      success: true,
      message: `Cleaned up ${cleaned} expired cache files`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Default: return stats
  const stats = getCacheStats();
  return new Response(JSON.stringify({
    success: true,
    cache: {
      files: stats.files,
      sizeKB: Math.round(stats.size / 1024),
      sizeMB: (stats.size / 1024 / 1024).toFixed(2),
      oldestAge: stats.oldest ? Math.round((Date.now() - stats.oldest) / 60000) + ' minutes' : 'N/A',
      newestAge: stats.newest ? Math.round((Date.now() - stats.newest) / 60000) + ' minutes' : 'N/A'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
