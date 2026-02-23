import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { M as MovieCard } from '../../chunks/MovieCard_CFWSEGer.mjs';
import { h as getOnTheAirTVPaginated, i as getTVDetails } from '../../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$NewEpisodes = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$NewEpisodes;
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const tmdbPage1 = (page - 1) * 2 + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const [response1, response2] = await Promise.all([
    getOnTheAirTVPaginated(tmdbPage1),
    getOnTheAirTVPaginated(tmdbPage2)
  ]);
  const allShows = [...response1.results || [], ...response2.results || []];
  const filtered = allShows.filter((t) => t.poster_path).slice(0, 30);
  const totalPages = Math.min(Math.ceil((response1.total_pages || 1) / 2), 250);
  const details = await Promise.all(
    filtered.map((t) => getTVDetails(t.id).catch(() => null))
  );
  const shows = filtered.map((t, index) => {
    const detail = details[index];
    const lastEp = detail?.last_episode_to_air;
    let episode_info;
    if (lastEp && lastEp.season_number != null && lastEp.episode_number != null) {
      const s = String(lastEp.season_number).padStart(2, "0");
      const e = String(lastEp.episode_number).padStart(2, "0");
      episode_info = `S${s}E${e}`;
    }
    return {
      id: t.id,
      tmdb_id: t.id,
      title: t.name,
      poster_path: t.poster_path,
      vote_average: t.vote_average,
      year: t.first_air_date ? new Date(t.first_air_date).getFullYear() : null,
      type: "series",
      episode_info
    };
  });
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "New Episodes This Week", "description": "TV series with new episodes airing this week" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <!-- Header --> <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"> <div> <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">New Episodes This Week</h1> <p class="text-sm" style="color: var(--text-secondary);">
TV series currently airing new episodes
</p> </div> </div> <!-- Series Grid --> ${shows.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"> ${shows.map((show) => renderTemplate`${renderComponent($$result2, "MovieCard", MovieCard, { "client:visible": true, "item": show, "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/MovieCard.svelte", "client:component-export": "default" })}`)} </div>` : renderTemplate`<div class="text-center py-16"> <p style="color: var(--text-secondary);">No new episodes airing this week</p> </div>`} <!-- Pagination --> ${totalPages > 1 && renderTemplate`<div class="flex justify-center mt-8 gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(`/series/new-episodes?page=${page - 1}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Previous
</a>`} <span class="px-4 py-2" style="color: var(--text-secondary);">
Page ${page} of ${totalPages} </span> ${page < totalPages && renderTemplate`<a${addAttribute(`/series/new-episodes?page=${page + 1}`, "href")} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);">
Next
</a>`} </div>`} </div> ` })}`;
}, "/var/www/trendimovies/src/pages/series/new-episodes.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/series/new-episodes.astro";
const $$url = "/series/new-episodes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$NewEpisodes,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
