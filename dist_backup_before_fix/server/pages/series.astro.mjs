import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute, n as renderScript } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../chunks/MovieCard_CFWSEGer.mjs';
import { C as ContentRow } from '../chunks/ContentRow_DFJtx-HN.mjs';
import { c as discoverTV, j as getTVGenres } from '../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Series = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Series;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const sort = Astro2.url.searchParams.get("sort") || "popularity.desc";
  const genre = Astro2.url.searchParams.get("genre") || "";
  const year = Astro2.url.searchParams.get("year") || "";
  const sortMap = {
    "latest": "first_air_date.desc",
    "popular": "popularity.desc",
    "rating": "vote_average.desc",
    "title": "name.asc"
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
    baseParams.first_air_date_year = year;
  }
  const tmdbPage1 = (page - 1) * 2 + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const [response1, response2] = await Promise.all([
    discoverTV({ ...baseParams, page: tmdbPage1.toString() }),
    discoverTV({ ...baseParams, page: tmdbPage2.toString() })
  ]);
  const allSeries = [...response1.results || [], ...response2.results || []];
  const series = allSeries.slice(0, 30);
  const totalPages = Math.min(Math.ceil((response1.total_pages || 1) / 2), 250);
  const ongoingResponse = await discoverTV({
    sort_by: "popularity.desc",
    "first_air_date.lte": (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    "air_date.gte": new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    // Last 30 days
    with_status: "0",
    // Returning Series
    "vote_count.gte": "50"
  });
  const ongoingSeries = (ongoingResponse.results || []).slice(0, 12);
  const genres = await getTVGenres();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);
  function transformToItem(show) {
    return {
      id: show.id,
      tmdb_id: show.id,
      title: show.name,
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
      type: "series"
    };
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "TV Series", "description": "Browse all TV series available for streaming" }, { "default": async ($$result2) => renderTemplate`  ${page === 1 && !genre && !year && ongoingSeries.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Ongoing Series", "items": ongoingSeries.map(transformToItem), "seeAllLink": "/series/ongoing", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`}${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <h1 class="text-3xl font-bold mb-4 md:mb-0" style="color: var(--text-primary);">TV Series</h1> <!-- Filters --> <div class="flex flex-wrap gap-3"> <select id="sort-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="popular"${addAttribute(sort === "popular" || sort === "popularity.desc", "selected")}>Popular</option> <option value="latest"${addAttribute(sort === "latest", "selected")}>Latest</option> <option value="rating"${addAttribute(sort === "rating", "selected")}>Top Rated</option> <option value="title"${addAttribute(sort === "title", "selected")}>A-Z</option> </select> <select id="genre-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="">All Genres</option> ${genres.map((g) => renderTemplate`<option${addAttribute(g.id, "value")}${addAttribute(genre === g.id.toString(), "selected")}>${g.name}</option>`)} </select> <select id="year-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="">All Years</option> ${years.map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(year === y.toString(), "selected")}>${y}</option>`)} </select> </div> </div> <!-- Series Grid --> ${series.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${series.map((show) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformToItem(show), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No series found</p> </div>`} <!-- Pagination --> ${totalPages > 1 && renderTemplate`<div class="flex justify-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/series?page=${page - 1}&sort=${sort}&genre=${genre}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/series?page=${page + 1}&sort=${sort}&genre=${genre}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ${renderScript($$result2, "/var/www/trendimovies/src/pages/series.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/var/www/trendimovies/src/pages/series.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/series.astro";
const $$url = "/series";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Series,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
