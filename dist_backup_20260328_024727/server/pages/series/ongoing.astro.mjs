import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_BH5Mr41D.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_DP3mE_-z.mjs';
import { c as discoverTV } from '../../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Ongoing = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Ongoing;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const tmdbPage = page;
  const ongoingResponse = await discoverTV({
    sort_by: "popularity.desc",
    "first_air_date.lte": (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    "air_date.gte": new Date(Date.now() - 90 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    // Last 90 days
    with_status: "0",
    // Returning Series
    "vote_count.gte": "20",
    page: tmdbPage.toString()
  });
  const series = ongoingResponse.results || [];
  const totalPages = Math.min(ongoingResponse.total_pages || 1, 50);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Ongoing Series", "description": "Browse all ongoing TV series currently airing" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="flex items-center justify-between mb-8"> <h1 class="text-3xl font-bold" style="color: var(--text-primary);">Ongoing Series</h1> <a href="/series" class="text-sm hover:underline" style="color: var(--accent);">
&larr; Back to All Series
</a> </div> ${series.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"> ${series.map((show) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "id": show.id, "title": show.name, "posterPath": show.poster_path, "year": show.first_air_date ? new Date(show.first_air_date).getFullYear() : null, "rating": show.vote_average, "type": "series" })}`)} </div>` : renderTemplate`<div class="text-center py-12" style="color: var(--text-secondary);"> <p>No ongoing series found.</p> </div>`}  ${totalPages > 1 && renderTemplate`<div class="flex justify-center items-center gap-2 mt-8"> ${page > 1 && renderTemplate`<a${addAttribute(`/series/ongoing?page=${page - 1}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/series/ongoing?page=${page + 1}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ` })}`;
}, "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/series/ongoing.astro", void 0);

const $$file = "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/series/ongoing.astro";
const $$url = "/series/ongoing";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ongoing,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
