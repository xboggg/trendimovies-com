import type { APIRoute } from 'astro';

const SITE_URL = 'https://trendimovies.com';
const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

export const GET: APIRoute = async () => {
  let rows: { slug: string; published_at: string }[] = [];
  try {
    const r = await fetch(`${POSTGREST_URL}/news_public?select=slug,published_at&order=published_at.desc&limit=2000`);
    if (r.ok) rows = await r.json();
  } catch (e) {}

  const latest = rows[0]?.published_at ? rows[0].published_at.split('T')[0] : new Date().toISOString().split('T')[0];
  const urls = [
    `  <url><loc>${SITE_URL}/news</loc><lastmod>${latest}</lastmod><changefreq>hourly</changefreq><priority>0.8</priority></url>`,
    ...rows.map((n) =>
      `  <url><loc>${SITE_URL}/news/${n.slug}</loc><lastmod>${n.published_at.split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=900' },
  });
};
