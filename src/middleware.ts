// Hidden titles (see lib/hidden-titles.ts):
//   1. their pages answer 410 Gone, and
//   2. they are taken out of every film list the server gets from TMDB or from the site database.
// If anything goes wrong in the filter, the original answer is passed through unchanged.
import { defineMiddleware } from 'astro:middleware';
import { hiddenTitles, isHiddenId, withoutHidden } from './lib/hidden-titles';

const SOURCES = [
  'https://api.themoviedb.org/',
  'http://localhost:3001/',
  'http://127.0.0.1:3001/',
  String(import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/?$/, '/'),
].filter((s) => s.length > 1);

const g = globalThis as any;
if (!g.__tmHiddenFetch) {
  g.__tmHiddenFetch = true;
  const original: typeof fetch = g.fetch.bind(g);
  g.fetch = async (input: any, init?: any): Promise<Response> => {
    const res = await original(input, init);
    try {
      const list = hiddenTitles();
      if (!list.length || !res.ok) return res;
      const url = typeof input === 'string' ? input : input?.url || String(input);
      if (!SOURCES.some((s) => url.startsWith(s))) return res;
      if (!(res.headers.get('content-type') || '').includes('json')) return res;
      const text = await res.clone().text();
      if (!list.some((h) => text.includes(String(h.id)))) return res;
      const { data, removed } = withoutHidden(JSON.parse(text), list);
      if (!removed) return res;
      const headers = new Headers(res.headers);
      headers.delete('content-length');
      headers.delete('content-encoding');
      return new Response(JSON.stringify(data), { status: res.status, statusText: res.statusText, headers });
    } catch {
      return res;
    }
  };
}

const GONE_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Page removed | TrendiMovies</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;text-align:center}
a{display:inline-block;margin-top:18px;padding:12px 22px;border-radius:999px;background:#e50914;color:#fff;font-weight:700;text-decoration:none}</style></head>
<body><main><h1>This page has been removed</h1><p>It is no longer available.</p><a href="/">Go to the home page</a></main></body></html>`;

function gone(type: string, body: string) {
  return new Response(body, { status: 410, headers: { 'Content-Type': type, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, searchParams } = context.url;
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  // /movie/<number>   and the old /m/<slug>-<number> address
  const pageId = parts[0] === 'movie' ? parseInt(parts[1] || '', 10)
    : parts[0] === 'm' ? Number((parts[1] || '').match(/(\d+)$/)?.[1])
    : NaN;
  if (pageId && isHiddenId(pageId)) return gone('text/html; charset=utf-8', GONE_PAGE);
  // the same film asked for through the Mini App's data feed
  if (pathname === '/api/app/title' && searchParams.get('type') === 'movie' && isHiddenId(Number(searchParams.get('id')))) {
    return gone('application/json', '{"error":"gone"}');
  }
  return next();
});
