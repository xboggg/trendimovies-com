/**
 * /api/app/home  -  data for the Telegram Mini App home (/app): hero, the first rows, first reviews.
 * Each row also says how many titles it has in total (`total`), so the app can offer "More".
 * The data and its rules live in src/lib/appData.ts.
 */
import type { APIRoute } from 'astro';
import { getAppData, ROWS, REVIEWS_META, MORE_LIMIT, sized, type Card } from '../../../lib/appData';

const RAIL = 12;
const REVIEW_RAIL = 8;

export const GET: APIRoute = async () => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' };
  try {
    const d = await getAppData();

    // hero: movies and series mixed, taken from the rows
    const hero: Array<Card & { tag: string }> = [];
    const used = new Set<string>();
    const pushHero = (c: Card | undefined, tag: string) => {
      if (c && !used.has(c.href)) { used.add(c.href); hero.push({ ...c, img: sized(c.img, 500), tag }); }
    };
    pushHero(d.rows.trending?.[0], 'Trending');
    pushHero(d.rows.newep?.[0], 'New episode');
    pushHero(d.rows.trending?.[1], 'Trending movie');
    pushHero(d.rows.tvtrending?.[0], 'Trending series');
    pushHero(d.rows.newmovies?.[0], 'New movie');

    // The website's own 12-slide hero when it could be read; otherwise the row-based hero built above.
    const heroOut = d.hero.length >= 4 ? d.hero.map((h) => ({ ...h, img: sized(h.img, 500) })) : hero;

    const rows = ROWS.map((r) => {
      const all = d.rows[r.key] || [];
      return { key: r.key, title: r.title, total: Math.min(all.length, MORE_LIMIT), items: all.slice(0, RAIL) };
    }).filter((r) => r.items.length > 0);

    return new Response(JSON.stringify({
      today: d.today,
      hero: heroOut,
      rows,
      reviews: d.reviews.slice(0, REVIEW_RAIL),
      reviewsTotal: Math.min(d.reviews.length, MORE_LIMIT),
      reviewsTitle: REVIEWS_META.title,
    }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'app data unavailable' }), { status: 502, headers });
  }
};
