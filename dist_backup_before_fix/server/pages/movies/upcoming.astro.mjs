import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_CFWSEGer.mjs';
import { d as discoverMovies } from '../../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Upcoming = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Upcoming;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const today = /* @__PURE__ */ new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const sixMonthsLater = new Date(today);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  const futureStr = sixMonthsLater.toISOString().split("T")[0];
  const tmdbPage1 = (page - 1) * 2 + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const [response1, response2] = await Promise.all([
    discoverMovies({
      "primary_release_date.gte": tomorrowStr,
      "primary_release_date.lte": futureStr,
      sort_by: "popularity.desc",
      page: tmdbPage1.toString()
    }),
    discoverMovies({
      "primary_release_date.gte": tomorrowStr,
      "primary_release_date.lte": futureStr,
      sort_by: "popularity.desc",
      page: tmdbPage2.toString()
    })
  ]);
  const allMovies = [...response1.results || [], ...response2.results || []].filter((m) => m.poster_path);
  const movies = allMovies.slice(0, 30);
  const totalPages = Math.min(Math.ceil((response1.total_pages || 1) / 2), 250);
  function transformToItem(movie) {
    return {
      id: movie.id,
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      release_date: movie.release_date,
      type: "movie"
    };
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Coming Soon", "description": "Browse upcoming movies coming to theaters" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="mb-8"> <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">Coming Soon</h1> <p style="color: var(--text-secondary);">Upcoming movies releasing in theaters</p> </div> <!-- Movie Grid --> ${movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformToItem(movie), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No upcoming movies found</p> </div>`} <!-- Pagination --> ${totalPages > 1 && renderTemplate`<div class="flex justify-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/movies/upcoming?page=${page - 1}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/movies/upcoming?page=${page + 1}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ` })}`;
}, "/var/www/trendimovies/src/pages/movies/upcoming.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/movies/upcoming.astro";
const $$url = "/movies/upcoming";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Upcoming,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
