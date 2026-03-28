import { r as requireAuth } from '../../../../chunks/admin-auth_BKc-wy8e.mjs';
import { T as TMDB_API_KEY } from '../../../../chunks/env_OeVnBCeM.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const GET = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  const tmdbId = url.searchParams.get("tmdb_id");
  const season = url.searchParams.get("season");
  if (!tmdbId || !season) {
    return new Response(JSON.stringify({ error: "tmdb_id and season are required", episodes: [] }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsedTmdbId = parseInt(tmdbId);
  const parsedSeason = parseInt(season);
  if (isNaN(parsedTmdbId) || parsedTmdbId <= 0 || isNaN(parsedSeason) || parsedSeason < 0) {
    return new Response(JSON.stringify({ error: "Invalid tmdb_id or season", episodes: [] }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ error: "TMDB API not configured", episodes: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${parsedTmdbId}/season/${parsedSeason}?api_key=${TMDB_API_KEY}`,
      { signal: AbortSignal.timeout(1e4) }
    );
    if (!response.ok) {
      throw new Error(`TMDB API returned ${response.status}`);
    }
    const data = await response.json();
    const episodes = (data.episodes || []).map((ep) => ({
      id: ep.id,
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      name: ep.name,
      air_date: ep.air_date,
      overview: ep.overview?.substring(0, 100) || ""
    }));
    return new Response(JSON.stringify({ episodes }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Episodes fetch error:", error);
    return new Response(JSON.stringify({
      error: "Failed to fetch episodes",
      episodes: []
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
