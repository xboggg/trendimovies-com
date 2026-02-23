import type { APIRoute } from 'astro';

const SITE_URL = 'https://trendimovies.com';

export const GET: APIRoute = async () => {
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/movies', changefreq: 'daily', priority: '0.9' },
    { url: '/series', changefreq: 'daily', priority: '0.9' },
    { url: '/box-office', changefreq: 'daily', priority: '0.8' },
    { url: '/franchises', changefreq: 'weekly', priority: '0.7' },
    { url: '/oscars-2026', changefreq: 'weekly', priority: '0.7' },
    { url: '/request', changefreq: 'monthly', priority: '0.5' },
    { url: '/about', changefreq: 'monthly', priority: '0.3' },
    { url: '/contact', changefreq: 'monthly', priority: '0.3' },
    { url: '/privacy', changefreq: 'monthly', priority: '0.2' },
    { url: '/dmca', changefreq: 'monthly', priority: '0.2' },
  ];

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-movies.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-series.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-genres.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
