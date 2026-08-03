import type { APIRoute } from 'astro';

const SITE_URL = 'https://trendimovies.com';
const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];
  let slugs: string[] = [];
  try {
    const r = await fetch(`${POSTGREST_URL}/movie_topics?is_published=eq.true&select=slug`);
    if (r.ok) slugs = (await r.json()).map((t: any) => t.slug);
  } catch (e) {}

  const urls = [
    `  <url><loc>${SITE_URL}/guides</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    ...slugs.map((s) =>
      `  <url><loc>${SITE_URL}/guides/${s}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  });
};
