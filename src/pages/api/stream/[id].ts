import type { APIRoute } from 'astro';

/**
 * Telegram File Streaming Proxy
 * Proxies file downloads through the trendimovies.com nginx reverse proxy
 * which forwards to the Telegram streaming API on the Contabo server.
 *
 * URL: /api/stream/{sqlite_id}
 * Proxied via: https://trendimovies.com/tgstream/stream/{sqlite_id}
 * Internal (Contabo): http://127.0.0.1:8765/stream/{sqlite_id}
 */
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id || !/^\d+$/.test(id)) {
    return new Response('Invalid file ID', { status: 400 });
  }

  try {
    // Use trendimovies.com nginx proxy to reach the Telegram API on Contabo
    const telegramUrl = `https://trendimovies.com/tgstream/stream/${id}`;

    const response = await fetch(telegramUrl, {
      signal: AbortSignal.timeout(30000), // 30 second timeout for initial connection
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response('File not found', { status: 404 });
      }
      return new Response('File unavailable', { status: 502 });
    }

    // Stream the response through without buffering
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': response.headers.get('content-disposition') || `attachment; filename="download-${id}"`,
        'Content-Length': response.headers.get('content-length') || '',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error(`[Stream Proxy] Error for ID ${id}:`, error.message);

    if (error.name === 'TimeoutError') {
      return new Response('File server timeout', { status: 504 });
    }

    return new Response('Internal server error', { status: 500 });
  }
};
