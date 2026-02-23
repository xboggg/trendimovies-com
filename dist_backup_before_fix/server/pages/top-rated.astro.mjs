import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../chunks/MovieCard_CFWSEGer.mjs';
import { k as getTopRatedMovies, l as getTopRatedTV } from '../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$TopRated = createComponent(async ($$result, $$props, $$slots) => {
  const [topMovies, topTV] = await Promise.all([
    getTopRatedMovies(),
    getTopRatedTV()
  ]);
  function transformMovie(movie) {
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
  function transformSeries(show) {
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
  const movies = topMovies.map(transformMovie);
  const series = topTV.map(transformSeries);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Top Rated", "description": "Highest rated movies and TV series" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h1 class="text-3xl font-bold mb-8" style="color: var(--text-primary);">Top Rated</h1> <!-- Top Rated Movies --> <section class="mb-12"> <h2 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Movies</h2> ${movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": movie, "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<p style="color: var(--text-secondary);">No movies found</p>`} </section> <!-- Top Rated Series --> <section> <h2 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">TV Series</h2> ${series.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"> ${series.map((show) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": show, "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<p style="color: var(--text-secondary);">No series found</p>`} </section> </div> ` })}`;
}, "/var/www/trendimovies/src/pages/top-rated.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/top-rated.astro";
const $$url = "/top-rated";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$TopRated,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
