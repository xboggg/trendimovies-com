import type { APIRoute } from 'astro';

const SITE_URL = 'https://trendimovies.com';

const GENRES = [
  { id: 28, name: 'action' },
  { id: 12, name: 'adventure' },
  { id: 16, name: 'animation' },
  { id: 35, name: 'comedy' },
  { id: 80, name: 'crime' },
  { id: 99, name: 'documentary' },
  { id: 18, name: 'drama' },
  { id: 10751, name: 'family' },
  { id: 14, name: 'fantasy' },
  { id: 36, name: 'history' },
  { id: 27, name: 'horror' },
  { id: 10402, name: 'music' },
  { id: 9648, name: 'mystery' },
  { id: 10749, name: 'romance' },
  { id: 878, name: 'science-fiction' },
  { id: 10770, name: 'tv-movie' },
  { id: 53, name: 'thriller' },
  { id: 10752, name: 'war' },
  { id: 37, name: 'western' },
];

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  const urls = GENRES.map(genre => `
  <url>
    <loc>${SITE_URL}/genre/${genre.id}/${genre.name}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};
