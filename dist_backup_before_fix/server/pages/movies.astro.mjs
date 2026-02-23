import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute, n as renderScript } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../chunks/MovieCard_CFWSEGer.mjs';
import { d as discoverMovies, e as getMovieGenres } from '../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Movies = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Movies;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const sort = Astro2.url.searchParams.get("sort") || "popularity.desc";
  const genre = Astro2.url.searchParams.get("genre") || "";
  const year = Astro2.url.searchParams.get("year") || "";
  const sortMap = {
    "latest": "primary_release_date.desc",
    "popular": "popularity.desc",
    "rating": "vote_average.desc",
    "title": "title.asc"
  };
  const sortBy = sortMap[sort] || "popularity.desc";
  const baseParams = {
    sort_by: sortBy,
    "vote_count.gte": "10"
  };
  if (genre) {
    baseParams.with_genres = genre;
  }
  if (year) {
    baseParams.primary_release_year = year;
  }
  const tmdbPage1 = (page - 1) * 2 + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const [response1, response2] = await Promise.all([
    discoverMovies({ ...baseParams, page: tmdbPage1.toString() }),
    discoverMovies({ ...baseParams, page: tmdbPage2.toString() })
  ]);
  const allMovies = [...response1.results || [], ...response2.results || []];
  const movies = allMovies.slice(0, 30);
  const totalPages = Math.min(Math.ceil((response1.total_pages || 1) / 2), 250);
  const genres = await getMovieGenres();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);
  function transformToItem(movie) {
    return {
      id: movie.id,
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      type: "movie"
    };
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Movies", "description": "Browse all movies available for streaming" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <h1 class="text-3xl font-bold mb-4 md:mb-0" style="color: var(--text-primary);">Movies</h1> <!-- Filters --> <div class="flex flex-wrap gap-3"> <select id="sort-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="popular"${addAttribute(sort === "popular" || sort === "popularity.desc", "selected")}>Popular</option> <option value="latest"${addAttribute(sort === "latest", "selected")}>Latest</option> <option value="rating"${addAttribute(sort === "rating", "selected")}>Top Rated</option> <option value="title"${addAttribute(sort === "title", "selected")}>A-Z</option> </select> <select id="genre-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="">All Genres</option> ${genres.map((g) => renderTemplate`<option${addAttribute(g.id, "value")}${addAttribute(genre === g.id.toString(), "selected")}>${g.name}</option>`)} </select> <select id="year-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="">All Years</option> ${years.map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(year === y.toString(), "selected")}>${y}</option>`)} </select> </div> </div> <!-- Movie Grid --> ${movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformToItem(movie), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No movies found</p> </div>`} <!-- Pagination --> ${totalPages > 1 && renderTemplate`<div class="flex justify-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/movies?page=${page - 1}&sort=${sort}&genre=${genre}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/movies?page=${page + 1}&sort=${sort}&genre=${genre}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ${renderScript($$result2, "/var/www/trendimovies/src/pages/movies.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/var/www/trendimovies/src/pages/movies.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/movies.astro";
const $$url = "/movies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Movies,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
