import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, q as defineScriptVars, g as addAttribute, m as maybeRenderHead } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_CFWSEGer.mjs';
import { d as discoverMovies, c as discoverTV } from '../../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const sort = Astro2.url.searchParams.get("sort") || "popular";
  const year = Astro2.url.searchParams.get("year") || "";
  const sortMap = {
    "latest": "primary_release_date.desc",
    "popular": "popularity.desc",
    "rating": "vote_average.desc"
  };
  const tvSortMap = {
    "latest": "first_air_date.desc",
    "popular": "popularity.desc",
    "rating": "vote_average.desc"
  };
  const sortBy = sortMap[sort] || "popularity.desc";
  const tvSortBy = tvSortMap[sort] || "popularity.desc";
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);
  const categoryConfig = {
    "anime": {
      title: "Anime",
      description: "Browse Japanese animated movies and series",
      type: "both",
      params: {
        with_genres: "16",
        // Animation
        with_original_language: "ja"
      }
    },
    "korean-movies": {
      title: "Korean Movies",
      description: "Browse popular Korean movies",
      type: "movie",
      params: {
        with_original_language: "ko"
      }
    },
    "korean-series": {
      title: "Korean Series",
      description: "Browse popular Korean TV series (K-Drama)",
      type: "tv",
      params: {
        with_original_language: "ko"
      }
    },
    "bollywood": {
      title: "Bollywood",
      description: "Browse Indian Hindi movies",
      type: "movie",
      params: {
        with_original_language: "hi"
      }
    },
    "marvel": {
      title: "Marvel",
      description: "Browse Marvel Cinematic Universe movies and shows",
      type: "both",
      params: {
        with_companies: "420"
        // Marvel Studios
      }
    },
    "dc": {
      title: "DC",
      description: "Browse DC Comics movies and shows",
      type: "both",
      params: {
        with_companies: "429"
        // DC Entertainment
      }
    }
  };
  const config = categoryConfig[slug || ""];
  if (!config) {
    return Astro2.redirect("/movies");
  }
  const movieParams = { ...config.params, sort_by: sortBy };
  const tvParams = { ...config.params, sort_by: tvSortBy };
  if (year) {
    movieParams.primary_release_year = year;
    tvParams.first_air_date_year = year;
  }
  let movies = [];
  let series = [];
  let totalPages = 1;
  const tmdbPage1 = (page - 1) * 2 + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  if (config.type === "movie" || config.type === "both") {
    const [resp1, resp2] = await Promise.all([
      discoverMovies({ ...movieParams, page: tmdbPage1.toString() }),
      discoverMovies({ ...movieParams, page: tmdbPage2.toString() })
    ]);
    movies = [...resp1.results || [], ...resp2.results || []].slice(0, 30);
    totalPages = Math.max(totalPages, Math.ceil((resp1.total_pages || 1) / 2));
  }
  if (config.type === "tv" || config.type === "both") {
    const [resp1, resp2] = await Promise.all([
      discoverTV({ ...tvParams, page: tmdbPage1.toString() }),
      discoverTV({ ...tvParams, page: tmdbPage2.toString() })
    ]);
    series = [...resp1.results || [], ...resp2.results || []].slice(0, 30);
    totalPages = Math.max(totalPages, Math.ceil((resp1.total_pages || 1) / 2));
  }
  totalPages = Math.min(totalPages, 250);
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": config.title, "description": config.description }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <div class="mb-4 md:mb-0"> <h1 class="text-3xl font-bold" style="color: var(--text-primary);">', '</h1> <p style="color: var(--text-secondary);">', '</p> </div> <!-- Filters --> <div class="flex flex-wrap gap-3"> <select id="sort-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="popular"', '>Popular</option> <option value="latest"', '>Latest</option> <option value="rating"', '>Top Rated</option> </select> <select id="year-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="">All Years</option> ', " </select> </div> </div> <!-- Movies Section --> ", " <!-- Series Section --> ", " <!-- No Results --> ", " <!-- Pagination --> ", " </div> <script>(function(){", "\n    function updateUrl() {\n      const sort = document.getElementById('sort-select').value;\n      const year = document.getElementById('year-select').value;\n\n      const params = new URLSearchParams();\n      if (sort && sort !== 'popular') params.set('sort', sort);\n      if (year) params.set('year', year);\n\n      window.location.href = '/category/' + slug + (params.toString() ? '?' + params.toString() : '');\n    }\n\n    document.getElementById('sort-select')?.addEventListener('change', updateUrl);\n    document.getElementById('year-select')?.addEventListener('change', updateUrl);\n  })();<\/script> "])), maybeRenderHead(), config.title, config.description, addAttribute(sort === "popular", "selected"), addAttribute(sort === "latest", "selected"), addAttribute(sort === "rating", "selected"), years.map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(year === y.toString(), "selected")}>${y}</option>`), movies.length > 0 && renderTemplate`<section class="mb-12"> ${config.type === "both" && renderTemplate`<h2 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Movies</h2>`} <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformMovie(movie), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div> </section>`, series.length > 0 && renderTemplate`<section class="mb-12"> ${config.type === "both" && renderTemplate`<h2 class="text-2xl font-semibold mb-6" style="color: var(--text-primary);">Series</h2>`} <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${series.map((show) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformSeries(show), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div> </section>`, movies.length === 0 && series.length === 0 && renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No content found in this category</p> </div>`, totalPages > 1 && renderTemplate`<div class="flex justify-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/category/${slug}?page=${page - 1}&sort=${sort}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/category/${slug}?page=${page + 1}&sort=${sort}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`, defineScriptVars({ slug })) })}`;
}, "/var/www/trendimovies/src/pages/category/[slug].astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/category/[slug].astro";
const $$url = "/category/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
