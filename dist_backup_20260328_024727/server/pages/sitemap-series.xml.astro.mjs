export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const SITE_URL = "https://trendimovies.com";
const POSTGREST_URL = "http://localhost:3001";
const GET = async ({ url }) => {
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 1e3;
  const offset = (page - 1) * limit;
  try {
    const response = await fetch(
      `${POSTGREST_URL}/series?select=tmdb_id,slug,updated_at&order=tmdb_id.asc&limit=${limit}&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch series");
    }
    const series = await response.json();
    if (series.length === 0) {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
        headers: { "Content-Type": "application/xml" }
      });
    }
    const urls = series.map((show) => {
      const lastmod = show.updated_at ? new Date(show.updated_at).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      return `
  <url>
    <loc>${SITE_URL}/series/${show.tmdb_id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: { "Content-Type": "application/xml" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
