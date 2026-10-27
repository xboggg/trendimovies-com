/**
 * /api/app/title?type=movie&id=<tmdb id>  -  the Telegram delivery buttons for one movie, for the app's pop-up.
 *
 * Same source and same rules as the movie page (DownloadSection.svelte): active download_links of the movie whose url goes
 * through /tgstream/stream/<id> become t.me/<delivery bot>?start=<id>. The two delivery bots are chosen by the parity of the
 * id, exactly as on the website, so a given file always maps to the same bot.
 *
 * The pop-up shows the BEST 720p first, then the BEST 1080p (the same order as the movie page). "Best" among files of the same resolution:
 *   1. a file whose language tag is empty beats a tagged one (a dub must never beat the original just for being bigger),
 *   2. then no hard-coded subtitles beats hard-coded,
 *   3. then BluRay beats WEB-DL beats WEBRip beats unknown,
 *   4. then the larger file.
 * Everything else (other resolutions and the runners-up) is returned in `more`.
 */
import type { APIRoute } from 'astro';

const PG = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const DELIVERY_BOTS = ['trendimovies_dl_bot', 'trendimovies_dl2_bot'];
// order used on the website's movie page: 720p, 1080p, 2160p, then the rest
const ORDER: Record<string, number> = { '720p': 0, '1080p': 1, '2160p': 2, '480p': 3, 'hdrip': 4 };
const VARIANT_RANK: Record<string, number> = { bluray: 3, webdl: 2, webrip: 1 };
const VARIANT_LABEL: Record<string, string> = { bluray: 'BluRay', webdl: 'WEB-DL', webrip: 'WEBRip' };

type Link = { quality: string; size: string; variant: string; lang: string; hard: boolean; mb: number; tg: string };

function toMB(size: string): number {
  const m = String(size || '').match(/([\d.]+)\s*(GB|MB|KB)/i);
  if (!m) return 0;
  const v = parseFloat(m[1]);
  return /GB/i.test(m[2]) ? v * 1024 : (/MB/i.test(m[2]) ? v : v / 1024);
}

/** > 0 when a is the better file. */
function better(a: Link, b: Link): number {
  const ka = [a.lang ? 0 : 1, a.hard ? 0 : 1, VARIANT_RANK[a.variant] || 0, a.mb];
  const kb = [b.lang ? 0 : 1, b.hard ? 0 : 1, VARIANT_RANK[b.variant] || 0, b.mb];
  for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
  return 0;
}

export const GET: APIRoute = async ({ url }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' };
  const tmdb = Number(url.searchParams.get('id'));
  if (url.searchParams.get('type') !== 'movie' || !Number.isInteger(tmdb) || tmdb <= 0) {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers });
  }
  const page = `/movie/${tmdb}`;
  try {
    const mr = await fetch(`${PG}/movies?tmdb_id=eq.${tmdb}&select=id,title,year&limit=1`, { signal: AbortSignal.timeout(8000) });
    const movie = ((await mr.json()) || [])[0];
    if (!movie) return new Response(JSON.stringify({ id: tmdb, best: [], more: [], other: 0, page }), { status: 200, headers });

    const lr = await fetch(`${PG}/download_links?content_type=eq.movie&content_id=eq.${movie.id}&is_active=eq.true&select=*`, { signal: AbortSignal.timeout(8000) });
    const rows: any[] = (await lr.json()) || [];
    const links: Link[] = [];
    let other = 0;
    for (const l of rows) {
      const m = String(l.url || '').match(/\/tgstream\/stream\/(\d+)/);
      if (!m) { other++; continue; }
      const bot = DELIVERY_BOTS[parseInt(m[1], 10) % DELIVERY_BOTS.length];
      links.push({
        quality: String(l.quality || '').toLowerCase(),
        size: l.file_size || '',
        variant: VARIANT_LABEL[l.variant] ? l.variant : '',
        lang: l.language_tag || '',
        hard: l.subtitle_burn_status === 'hardcoded',
        mb: toMB(l.file_size),
        tg: `https://t.me/${bot}?start=${m[1]}`,
      });
    }

    const best: Link[] = [];
    for (const res of ['720p', '1080p']) {
      const cands = links.filter((l) => l.quality === res);
      if (!cands.length) continue;
      const untagged = cands.filter((l) => !l.lang);
      const pool = untagged.length ? untagged : cands;
      best.push(pool.reduce((a, b) => (better(b, a) > 0 ? b : a)));
    }
    const more = links.filter((l) => !best.includes(l))
      .sort((a, b) => (ORDER[a.quality] ?? 9) - (ORDER[b.quality] ?? 9) || better(b, a));

    const out = (l: Link) => ({ quality: l.quality, size: l.size, variant: VARIANT_LABEL[l.variant] || '', lang: l.lang, hard: l.hard, tg: l.tg });
    return new Response(JSON.stringify({ id: tmdb, title: movie.title, year: movie.year, best: best.map(out), more: more.map(out), other, page }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unavailable' }), { status: 502, headers });
  }
};
