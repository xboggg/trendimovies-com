import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_CFWSEGer.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Latest = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Latest;
  const POSTGREST_URL = "http://localhost:3001";
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const perPage = 30;
  const offset = (page - 1) * perPage;
  async function getLatestAdditions(limit, offset2) {
    try {
      const res = await fetch(
        `${POSTGREST_URL}/movies?has_downloads=eq.true&order=created_at.desc&limit=${limit}&offset=${offset2}&select=tmdb_id,title,year,poster_path,backdrop_path,vote_average,vote_count,popularity,overview,created_at`,
        {
          headers: {
            "Accept-Profile": "public",
            "Prefer": "count=exact"
          }
        }
      );
      if (!res.ok) return { movies: [], total: 0 };
      const contentRange = res.headers.get("content-range");
      const total2 = contentRange ? parseInt(contentRange.split("/")[1]) : 0;
      const movies2 = await res.json();
      return { movies: movies2, total: total2 };
    } catch (e) {
      console.error("Failed to fetch latest additions:", e);
      return { movies: [], total: 0 };
    }
  }
  const { movies, total } = await getLatestAdditions(perPage, offset);
  const totalPages = Math.ceil(total / perPage);
  function transformToItem(movie) {
    return {
      id: movie.tmdb_id,
      tmdb_id: movie.tmdb_id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average || 0,
      year: movie.year,
      type: "movie",
      has_downloads: true
    };
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Latest Additions", "description": "Recently added movies available for download" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <div> <h1 class="text-3xl font-bold" style="color: var(--text-primary);">Latest Additions</h1> <p class="mt-2 text-sm" style="color: var(--text-secondary);"> ${total.toLocaleString()} movies with downloads
</p> </div> </div> <!-- Movie Grid --> ${movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformToItem(movie), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No movies found</p> </div>`} <!-- Pagination --> ${totalPages > 1 && renderTemplate`<div class="flex justify-center items-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/movies/latest?page=${page - 1}`, "href")} class="px-4 py-2 rounded-lg transition-colors hover:opacity-80" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/movies/latest?page=${page + 1}`, "href")} class="px-4 py-2 rounded-lg transition-colors hover:opacity-80" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ` })}`;
}, "/var/www/trendimovies/src/pages/movies/latest.astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/movies/latest.astro";
const $$url = "/movies/latest";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Latest,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
