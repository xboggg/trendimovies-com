import { s as searchMulti, a as searchMovies, b as searchTV } from '../../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ url }) => {
  const query = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "all";
  const page = parseInt(url.searchParams.get("page") || "1");
  if (!query.trim()) {
    return new Response(JSON.stringify({ results: [], total: 0, hasMore: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let results = [];
    let total = 0;
    let totalPages = 1;
    if (type === "all") {
      const response = await searchMulti(query, page);
      total = response.total_results || 0;
      totalPages = response.total_pages || 1;
      results = (response.results || []).filter((item) => item.media_type === "movie" || item.media_type === "tv").map((item) => {
        if (item.media_type === "movie") {
          return {
            id: item.id,
            tmdb_id: item.id,
            title: item.title,
            poster_path: item.poster_path,
            vote_average: item.vote_average || 0,
            year: item.release_date ? new Date(item.release_date).getFullYear() : null,
            type: "movie"
          };
        } else {
          return {
            id: item.id,
            tmdb_id: item.id,
            title: item.name,
            poster_path: item.poster_path,
            vote_average: item.vote_average || 0,
            year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
            type: "series"
          };
        }
      });
    } else if (type === "movie") {
      const response = await searchMovies(query, page);
      total = response.total_results || 0;
      totalPages = response.total_pages || 1;
      results = (response.results || []).map((movie) => ({
        id: movie.id,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average || 0,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        type: "movie"
      }));
    } else if (type === "series") {
      const response = await searchTV(query, page);
      total = response.total_results || 0;
      totalPages = response.total_pages || 1;
      results = (response.results || []).map((show) => ({
        id: show.id,
        tmdb_id: show.id,
        title: show.name,
        poster_path: show.poster_path,
        vote_average: show.vote_average || 0,
        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        type: "series"
      }));
    }
    const hasMore = page < totalPages;
    return new Response(JSON.stringify({
      results,
      total,
      page,
      totalPages,
      hasMore
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({
      results: [],
      total: 0,
      hasMore: false,
      error: "Search failed"
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
