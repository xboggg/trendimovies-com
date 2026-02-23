import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieGrid } from '../../chunks/MovieGrid_CU0LyPhc.mjs';
import { d as discoverMovies } from '../../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Top20202023 = createComponent(async ($$result, $$props, $$slots) => {
  const [page1, page2, page3, page4] = await Promise.all([
    discoverMovies({
      "primary_release_date.gte": "2020-01-01",
      "primary_release_date.lte": "2023-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "500",
      page: "1"
    }),
    discoverMovies({
      "primary_release_date.gte": "2020-01-01",
      "primary_release_date.lte": "2023-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "500",
      page: "2"
    }),
    discoverMovies({
      "primary_release_date.gte": "2020-01-01",
      "primary_release_date.lte": "2023-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "500",
      page: "3"
    }),
    discoverMovies({
      "primary_release_date.gte": "2020-01-01",
      "primary_release_date.lte": "2023-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "500",
      page: "4"
    })
  ]);
  const allResults = [
    ...page1?.results || [],
    ...page2?.results || [],
    ...page3?.results || [],
    ...page4?.results || []
  ];
  const movies = allResults.map((m) => ({
    id: m.id,
    tmdb_id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    vote_average: m.vote_average,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null,
    type: "movie"
  }));
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Top Movies 2020-2023 - Highest Rated Films", "description": "Discover the highest rated movies from 2020 to 2023. Browse the best films from recent years." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex items-center justify-between mb-8"> <div> <h1 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
Top Movies 2020-2023
</h1> <p class="mt-2 text-gray-600 dark:text-gray-400">
The highest rated films from 2020 to 2023
</p> </div> <span class="px-4 py-2 rounded-full text-sm font-bold bg-amber-500 text-black">
2020-2023
</span> </div> ${renderComponent($$result2, "MovieGrid", MovieGrid, { "client:load": true, "items": movies, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/MovieGrid.svelte", "client:component-export": "default" })} ${movies.length === 0 && renderTemplate`<div class="text-center py-12 text-gray-600 dark:text-gray-400"> <p>No movies found. Check back later!</p> </div>`} </section> ` })}`;
}, "/var/www/trendimovies/src/pages/movies/top-2020-2023.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/movies/top-2020-2023.astro";
const $$url = "/movies/top-2020-2023";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Top20202023,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
