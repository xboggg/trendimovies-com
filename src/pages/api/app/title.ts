/**
 * /api/app/title?type=movie&id=<tmdb id>  -  the Telegram delivery buttons for one movie, for the app's pop-up.
 *
 * Same source and same rules as the movie page (DownloadSection.svelte): active download_links of the movie whose
 * url goes through /tgstream/stream/<id> become t.me/<delivery bot>?start=<id>. The two delivery bots are chosen by
 * the parity of the id, exactly as on the website, so a given file always maps to the same bot.
 */
import type { APIRoute } from 'astro';

const PG = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const DELIVERY_BOTS = ['trendimovies_dl_bot', 'trendimovies_dl2_bot'];
const RANK: Record<string, number> = { '2160p': 4, '1080p': 3, '720p': 2, '480p': 1 };

export const GET: APIRoute = async ({ url }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' };
  const tmdb = Number(url.searchParams.get('id'));
  if (url.searchParams.get('type') !== 'movie' || !Number.isInteger(tmdb) || tmdb <= 0) {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers });
  }
  try {
    const mr = await fetch(`${PG}/movies?tmdb_id=eq.${tmdb}&select=id,title,year&limit=1`, { signal: AbortSignal.timeout(8000) });
    const movie = ((await mr.json()) || [])[0];
    if (!movie) return new Response(JSON.stringify({ id: tmdb, links: [], other: 0, page: `/movie/${tmdb}` }), { status: 200, headers });

    const lr = await fetch(`${PG}/download_links?content_type=eq.movie&content_id=eq.${movie.id}&is_active=eq.true&select=*`, { signal: AbortSignal.timeout(8000) });
    const rows: any[] = (await lr.json()) || [];
    const links: Array<{ quality: string; size: string; lang: string; tg: string }> = [];
    let other = 0;
    for (const l of rows) {
      const m = String(l.url || '').match(/\/tgstream\/stream\/(\d+)/);
      if (!m) { other++; continue; }
      const bot = DELIVERY_BOTS[parseInt(m[1], 10) % DELIVERY_BOTS.length];
      links.push({ quality: l.quality || '', size: l.file_size || '', lang: l.language_tag || '', tg: `https://t.me/${bot}?start=${m[1]}` });
    }
    links.sort((a, b) => (RANK[b.quality] || 0) - (RANK[a.quality] || 0));
    return new Response(JSON.stringify({ id: tmdb, title: movie.title, year: movie.year, links, other, page: `/movie/${tmdb}` }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unavailable' }), { status: 502, headers });
  }
};
