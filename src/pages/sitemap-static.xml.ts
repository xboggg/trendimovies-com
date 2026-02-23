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

  const urls = staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
