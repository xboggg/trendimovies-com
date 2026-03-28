import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_UnkNmAYZ.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_CSdWW6MJ.mjs';
import { d as discoverMovies } from '../../chunks/tmdb_BxXk2-sk.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Anime = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Anime;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const tmdbPage1 = (page - 1) * 2 + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const [response1, response2] = await Promise.all([
    discoverMovies({
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      page: tmdbPage1.toString()
    }),
    discoverMovies({
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      page: tmdbPage2.toString()
    })
  ]);
  const allMovies = [...response1.results || [], ...response2.results || []];
  const movies = allMovies.slice(0, 30);
  const totalPages = Math.min(Math.ceil((response1.total_pages || 1) / 2), 100);
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Top Anime Movies", "description": "Browse the best rated anime movies from Japan" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <h1 class="text-3xl font-bold mb-4 md:mb-0" style="color: var(--text-primary);">Top Anime Movies</h1> </div> ${movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "item": transformToItem(movie) })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p class="text-lg" style="color: var(--text-muted);">No anime movies found</p> </div>`} ${totalPages > 1 && renderTemplate`<div class="flex justify-center gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/movies/anime?page=${page - 1}`, "href")} class="px-4 py-2 rounded-lg font-medium" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/movies/anime?page=${page + 1}`, "href")} class="px-4 py-2 rounded-lg font-medium" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ` })}`;
}, "/var/www/trendimovies/src/pages/movies/anime.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/movies/anime.astro";
const $$url = "/movies/anime";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Anime,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
