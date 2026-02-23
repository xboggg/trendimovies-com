import { r as requireAuth } from '../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const POSTGREST_URL = "http://localhost:3001";
const GET = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const search = url.searchParams.get("search") || "";
  const contentType = url.searchParams.get("content_type") || "";
  const source = url.searchParams.get("source") || "";
  const year = url.searchParams.get("year") || "";
  const offset = (page - 1) * limit;
  try {
    let contentIds = [];
    if (search || year) {
      let movieSearchUrl = `${POSTGREST_URL}/movies?select=tmdb_id`;
      if (search) {
        const cleanSearch = search.replace(/[%_]/g, "\\$&").replace(/\s+/g, "*");
        movieSearchUrl += `&title=ilike.*${cleanSearch}*`;
      }
      if (year) {
        const parsedYear = parseInt(year);
        if (parsedYear >= 1900 && parsedYear <= 2100) {
          movieSearchUrl += `&year=eq.${parsedYear}`;
        }
      }
      movieSearchUrl += "&limit=500";
      const movieSearchRes = await fetch(movieSearchUrl, { headers: { "Accept-Profile": "public" } });
      const matchingMovies = await movieSearchRes.json();
      contentIds = Array.isArray(matchingMovies) ? matchingMovies.map((m) => m.tmdb_id) : [];
      if (contentIds.length === 0 && search && /^\d+$/.test(search) && !year) {
        contentIds = [parseInt(search)];
      }
      if (contentIds.length === 0) {
        return new Response(JSON.stringify({
          links: [],
          total: 0,
          page,
          totalPages: 0
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    let queryUrl = `${POSTGREST_URL}/download_links?select=*&order=id.desc`;
    let countUrl = `${POSTGREST_URL}/download_links?select=count`;
    if (contentIds.length > 0) {
      const idsFilter = `content_id=in.(${contentIds.join(",")})`;
      queryUrl += `&${idsFilter}`;
      countUrl += `&${idsFilter}`;
    }
    if (contentType && ["movie", "episode"].includes(contentType)) {
      queryUrl += `&content_type=eq.${contentType}`;
      countUrl += `&content_type=eq.${contentType}`;
    }
    if (source && ["telegram", "cinematika", "torrent"].includes(source)) {
      queryUrl += `&source=eq.${source}`;
      countUrl += `&source=eq.${source}`;
    }
    queryUrl += `&offset=${offset}&limit=${limit}`;
    const [linksRes, countRes] = await Promise.all([
      fetch(queryUrl, { headers: { "Accept-Profile": "public" } }),
      fetch(countUrl, { headers: { "Accept-Profile": "public" } })
    ]);
    let links = await linksRes.json();
    const countData = await countRes.json();
    const total = Array.isArray(countData) ? countData[0]?.count || 0 : 0;
    if (!Array.isArray(links)) {
      links = [];
    }
    if (links.length > 0) {
      const movieIds = [...new Set(links.filter((l) => l.content_type === "movie").map((l) => l.content_id))];
      if (movieIds.length > 0) {
        const moviesRes = await fetch(
          `${POSTGREST_URL}/movies?select=tmdb_id,title,year&tmdb_id=in.(${movieIds.join(",")})`,
          { headers: { "Accept-Profile": "public" } }
        );
        const movies = await moviesRes.json();
        const movieMap = new Map(Array.isArray(movies) ? movies.map((m) => [m.tmdb_id, { title: m.title, year: m.year }]) : []);
        links = links.map((link) => {
          if (link.content_type === "movie") {
            const movie = movieMap.get(link.content_id);
            return {
              ...link,
              content_title: movie ? `${movie.title} (${movie.year})` : `Movie ${link.content_id}`
            };
          }
          return {
            ...link,
            content_title: `Episode ${link.content_id}`
          };
        });
      }
    }
    return new Response(JSON.stringify({
      links,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to fetch links"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
