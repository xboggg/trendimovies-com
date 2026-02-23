import { r as requireAuth } from '../../../../chunks/admin-auth_BKc-wy8e.mjs';
import { T as TMDB_API_KEY } from '../../../../chunks/env_OeVnBCeM.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const GET = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  let query = url.searchParams.get("query") || url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "movie";
  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ results: [], message: "Query too short" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  if (query.length > 100) {
    query = query.substring(0, 100);
  }
  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ results: [], error: "TMDB API not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  let year = null;
  const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
    query = query.replace(yearMatch[0], "").trim();
  }
  if (!query || query.length < 1) {
    return new Response(JSON.stringify({ results: [], message: "Query too short after extracting year" }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const endpoint = type === "tv" ? "search/tv" : "search/movie";
    let apiUrl = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    if (year) {
      apiUrl += type === "tv" ? `&first_air_date_year=${year}` : `&year=${year}`;
    }
    const response = await fetch(apiUrl, { signal: AbortSignal.timeout(1e4) });
    if (!response.ok) {
      throw new Error(`TMDB API returned ${response.status}`);
    }
    const data = await response.json();
    let results = data.results || [];
    if (year && results.length < 5) {
      const fallbackUrl = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
      const fallbackRes = await fetch(fallbackUrl, { signal: AbortSignal.timeout(1e4) });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const existingIds = new Set(results.map((r) => r.id));
        const additionalResults = (fallbackData.results || []).filter((r) => !existingIds.has(r.id));
        results = [...results, ...additionalResults];
      }
    }
    const formattedResults = results.slice(0, 20).map((item) => {
      const itemYear = (type === "tv" ? item.first_air_date : item.release_date)?.substring(0, 4) || null;
      return {
        id: item.id,
        title: type === "tv" ? item.name : item.title,
        original_title: type === "tv" ? item.original_name : item.original_title,
        year: itemYear,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : null,
        overview: item.overview?.substring(0, 150) || "",
        vote_average: item.vote_average || 0,
        media_type: type,
        _yearMatch: year && itemYear === year ? 1 : 0
      };
    });
    formattedResults.sort((a, b) => {
      if (a._yearMatch !== b._yearMatch) return b._yearMatch - a._yearMatch;
      return (b.vote_average || 0) - (a.vote_average || 0);
    });
    const cleanResults = formattedResults.map(({ _yearMatch, ...rest }) => rest);
    return new Response(JSON.stringify({ results: cleanResults }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("TMDB search error:", error);
    return new Response(JSON.stringify({
      error: "Failed to search TMDB",
      results: []
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
