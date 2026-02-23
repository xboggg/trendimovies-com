import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, q as defineScriptVars, g as addAttribute, m as maybeRenderHead } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_CFWSEGer.mjs';
import { d as discoverMovies } from '../../chunks/tmdb_DKnoDzGN.mjs';
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
  const genreMap = {
    "action": { id: 28, name: "Action" },
    "adventure": { id: 12, name: "Adventure" },
    "animation": { id: 16, name: "Animation" },
    "comedy": { id: 35, name: "Comedy" },
    "crime": { id: 80, name: "Crime" },
    "documentary": { id: 99, name: "Documentary" },
    "drama": { id: 18, name: "Drama" },
    "family": { id: 10751, name: "Family" },
    "fantasy": { id: 14, name: "Fantasy" },
    "history": { id: 36, name: "History" },
    "horror": { id: 27, name: "Horror" },
    "music": { id: 10402, name: "Music" },
    "mystery": { id: 9648, name: "Mystery" },
    "romance": { id: 10749, name: "Romance" },
    "science-fiction": { id: 878, name: "Science Fiction" },
    "sci-fi": { id: 878, name: "Science Fiction" },
    "thriller": { id: 53, name: "Thriller" },
    "war": { id: 10752, name: "War" },
    "western": { id: 37, name: "Western" }
  };
  const genre = genreMap[slug?.toLowerCase() || ""];
  if (!genre) {
    return Astro2.redirect("/movies");
  }
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const sort = Astro2.url.searchParams.get("sort") || "popularity.desc";
  const year = Astro2.url.searchParams.get("year") || "";
  const sortMap = {
    "latest": "primary_release_date.desc",
    "popular": "popularity.desc",
    "rating": "vote_average.desc",
    "title": "title.asc"
  };
  const sortBy = sortMap[sort] || "popularity.desc";
  const baseParams = {
    with_genres: genre.id.toString(),
    sort_by: sortBy,
    "vote_count.gte": "10"
  };
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${genre.name} Movies`, "description": `Browse ${genre.name} movies available for streaming` }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <h1 class="text-3xl font-bold mb-4 md:mb-0" style="color: var(--text-primary);">', ' Movies</h1> <!-- Filters --> <div class="flex flex-wrap gap-3"> <select id="sort-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="popular"', '>Popular</option> <option value="latest"', '>Latest</option> <option value="rating"', '>Top Rated</option> <option value="title"', '>A-Z</option> </select> <select id="year-select" class="px-3 py-2 rounded-lg text-sm" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);"> <option value="">All Years</option> ', " </select> </div> </div> <!-- Movie Grid --> ", " <!-- Pagination --> ", ' <!-- Other Genres --> <div class="mt-12"> <h2 class="text-xl font-semibold mb-4" style="color: var(--text-primary);">Browse by Genre</h2> <div class="flex flex-wrap gap-2"> ', " </div> </div> </div> <script>(function(){", "\n    function updateUrl() {\n      const sort = document.getElementById('sort-select').value;\n      const year = document.getElementById('year-select').value;\n\n      const params = new URLSearchParams();\n      if (sort && sort !== 'popular') params.set('sort', sort);\n      if (year) params.set('year', year);\n\n      window.location.href = '/genre/' + slug + (params.toString() ? '?' + params.toString() : '');\n    }\n\n    document.getElementById('sort-select')?.addEventListener('change', updateUrl);\n    document.getElementById('year-select')?.addEventListener('change', updateUrl);\n  })();<\/script> "])), maybeRenderHead(), genre.name, addAttribute(sort === "popular" || sort === "popularity.desc", "selected"), addAttribute(sort === "latest", "selected"), addAttribute(sort === "rating", "selected"), addAttribute(sort === "title", "selected"), years.map((y) => renderTemplate`<option${addAttribute(y, "value")}${addAttribute(year === y.toString(), "selected")}>${y}</option>`), movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${movies.map((movie) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": transformToItem(movie), "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No ${genre.name.toLowerCase()} movies found</p> </div>`, totalPages > 1 && renderTemplate`<div class="flex justify-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/genre/${slug}?page=${page - 1}&sort=${sort}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/genre/${slug}?page=${page + 1}&sort=${sort}&year=${year}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`, Object.entries(genreMap).filter(([key]) => !["sci-fi"].includes(key)).map(([genreSlug, g]) => renderTemplate`<a${addAttribute(`/genre/${genreSlug}`, "href")}${addAttribute(`px-4 py-2 rounded-full text-sm transition-colors ${genreSlug === slug ? "bg-[var(--accent)] text-white" : ""}`, "class")}${addAttribute(genreSlug !== slug ? "background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);" : "", "style")}> ${g.name} </a>`), defineScriptVars({ slug })) })}`;
}, "/var/www/trendimovies/src/pages/genre/[slug].astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/genre/[slug].astro";
const $$url = "/genre/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
