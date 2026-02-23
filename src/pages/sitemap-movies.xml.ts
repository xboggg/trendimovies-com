import type { APIRoute } from 'astro';

const SITE_URL = 'https://trendimovies.com';
const POSTGREST_URL = 'http://localhost:3001';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 1000;
  const offset = (page - 1) * limit;

  try {
    // Fetch movies from database
    const response = await fetch(
      `${POSTGREST_URL}/movies?select=tmdb_id,slug,updated_at&order=tmdb_id.asc&limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const movies = await response.json();
    
    if (movies.length === 0) {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    const urls = movies.map((movie: any) => {
      const lastmod = movie.updated_at ? new Date(movie.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return `
  <url>
    <loc>${SITE_URL}/movie/${movie.tmdb_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
};
