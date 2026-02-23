import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { S as SeasonTabs } from '../../chunks/SeasonTabs_CV8DMzNu.mjs';
import { C as ContentRow } from '../../chunks/ContentRow_DFJtx-HN.mjs';
import { s as supabase, g as getBackdropUrl, a as getPosterUrl, c as getLanguageName, d as getProfileUrl } from '../../chunks/supabase_H7J9YlW_.mjs';
import { S as Star } from '../../chunks/star_DHTXgEc7.mjs';
import { T as Tv } from '../../chunks/tv_BwBqCXmW.mjs';
import { C as Clock } from '../../chunks/clock_CjYHN5RC.mjs';
import { G as Globe } from '../../chunks/globe_BOcdjHoP.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const { data: series, error } = await supabase.from("series").select("*").eq("slug", slug).single();
  if (error || !series) {
    return Astro2.redirect("/404");
  }
  const { data: seasons } = await supabase.from("seasons").select("*").eq("series_id", series.id).order("season_number", { ascending: true });
  const { data: allEpisodes } = await supabase.from("episodes").select("*").eq("series_id", series.id).order("episode_number", { ascending: true });
  const episodeIds = (allEpisodes || []).map((ep) => ep.id);
  let downloadsByEpisode = {};
  if (episodeIds.length > 0) {
    const POSTGREST_URL = "http://localhost:3001";
    try {
      const dlResp = await fetch(
        `${POSTGREST_URL}/download_links?content_type=eq.episode&is_active=eq.true&content_id=in.(${episodeIds.join(",")})`,
        { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(1e4) }
      );
      if (dlResp.ok) {
        const dlData = await dlResp.json();
        for (const link of dlData) {
          if (!downloadsByEpisode[link.content_id]) downloadsByEpisode[link.content_id] = [];
          downloadsByEpisode[link.content_id].push(link);
        }
      }
    } catch (e) {
      console.error("Error fetching episode downloads:", e);
    }
  }
  const { data: similarSeries } = await supabase.from("series").select("id, title, slug, poster_path, vote_average, year").neq("id", series.id).order("popularity", { ascending: false }).limit(12);
  await supabase.from("series").update({ view_count: (series.view_count || 0) + 1 }).eq("id", series.id);
  const similar = (similarSeries || []).map((s) => ({ ...s, type: "series" }));
  const creators = (series.crew_data || []).filter(
    (c) => ["Creator", "Executive Producer", "Showrunner"].includes(c.job)
  );
  const episodesBySeason = {};
  (allEpisodes || []).forEach((ep) => {
    const seasonNum = seasons?.find((s) => s.id === ep.season_id)?.season_number || 1;
    if (!episodesBySeason[seasonNum]) {
      episodesBySeason[seasonNum] = [];
    }
    episodesBySeason[seasonNum].push(ep);
  });
  const avgRuntime = series.episode_run_time && series.episode_run_time.length > 0 ? Math.round(series.episode_run_time.reduce((a, b) => a + b, 0) / series.episode_run_time.length) : null;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": series.title, "description": series.overview || `Watch ${series.title} online for free in HD quality.`, "image": getBackdropUrl(series.backdrop_path), "type": "video.tv_show" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative"> <!-- Background --> <div class="absolute inset-0 h-[300px] md:h-[500px]"> <img${addAttribute(getBackdropUrl(series.backdrop_path), "src")}${addAttribute(series.title, "alt")} class="w-full h-full object-cover"> <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent"></div> </div> <!-- Content --> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 md:pb-12"> <div class="flex flex-col md:flex-row gap-5 md:gap-8"> <!-- Poster --> <div class="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0"> <img${addAttribute(getPosterUrl(series.poster_path), "src")}${addAttribute(series.title, "alt")} class="w-full rounded-lg shadow-2xl"> </div> <!-- Info --> <div class="flex-1"> <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4" style="color: var(--text-primary);"> ${series.title} ${series.year && renderTemplate`<span class="text-xl md:text-2xl font-normal" style="color: var(--text-secondary);"> (${series.year})</span>`} </h1> ${series.tagline && renderTemplate`<p class="text-base md:text-lg italic mb-3 md:mb-4" style="color: var(--text-secondary);">
"${series.tagline}"
</p>`} <!-- Meta Info --> <div class="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6 text-sm" style="color: var(--text-secondary);"> <div class="flex items-center gap-1"> ${renderComponent($$result2, "Star", Star, { "size": 16, "class": "text-yellow-400", "fill": "currentColor" })} <span class="font-semibold" style="color: var(--text-primary);">${series.vote_average.toFixed(1)}</span> <span class="text-xs md:text-sm">(${series.vote_count} votes)</span> </div> <div class="flex items-center gap-1"> ${renderComponent($$result2, "Tv", Tv, { "size": 16 })} <span>${series.number_of_seasons} Season${series.number_of_seasons > 1 ? "s" : ""}</span> </div> <div class="flex items-center gap-1"> <span>${series.number_of_episodes} Episodes</span> </div> ${avgRuntime && renderTemplate`<div class="flex items-center gap-1"> ${renderComponent($$result2, "Clock", Clock, { "size": 16 })} <span>~${avgRuntime} min/ep</span> </div>`} <div class="flex items-center gap-1"> ${renderComponent($$result2, "Globe", Globe, { "size": 16 })} <span>${getLanguageName(series.original_language)}</span> </div> </div> <!-- Status Badge --> <div class="mb-4"> <span${addAttribute(`badge ${series.status === "Ended" ? "bg-gray-500" : "bg-green-500"} text-white`, "class")}> ${series.status} </span> ${series.first_air_date && series.last_air_date && renderTemplate`<span class="ml-2 text-sm" style="color: var(--text-secondary);"> ${new Date(series.first_air_date).getFullYear()} - ${series.status === "Ended" ? new Date(series.last_air_date).getFullYear() : "Present"} </span>`} </div> <!-- Genres --> ${series.genres && series.genres.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mb-4 md:mb-6"> ${series.genres.map((genre) => renderTemplate`<a${addAttribute(`/genre/${genre.name.toLowerCase().replace(/\s+/g, "-")}`, "href")} class="genre-chip"> ${genre.name} </a>`)} </div>`} <!-- Networks --> ${series.networks && series.networks.length > 0 && renderTemplate`<div class="flex items-center gap-3 mb-4 md:mb-6"> <span class="text-sm" style="color: var(--text-secondary);">Network:</span> <div class="flex gap-2"> ${series.networks.slice(0, 3).map((network) => renderTemplate`<img${addAttribute(`https://image.tmdb.org/t/p/w92${network.logo_path}`, "src")}${addAttribute(network.name, "alt")}${addAttribute(network.name, "title")} class="h-6 object-contain bg-white rounded px-2">`)} </div> </div>`} <!-- Overview --> <div class="mb-4 md:mb-6"> <h3 class="font-semibold mb-1.5 md:mb-2" style="color: var(--text-primary);">Synopsis</h3> <p class="leading-relaxed text-sm md:text-base" style="color: var(--text-primary); opacity: 0.85;"> ${series.overview || "No synopsis available."} </p> </div> <!-- Creators --> ${creators.length > 0 && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Created by</h4> <p style="color: var(--text-primary);">${creators.map((c) => c.name).join(", ")}</p> </div>`} </div> </div> </div> </section>  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Seasons & Episodes</h2> ${renderComponent($$result2, "SeasonTabs", SeasonTabs, { "client:load": true, "seriesId": series.id, "tmdbId": series.tmdb_id, "imdbId": series.imdb_id, "seasons": seasons || [], "episodesBySeason": episodesBySeason, "downloadsByEpisode": downloadsByEpisode, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/SeasonTabs.svelte", "client:component-export": "default" })} </section>  ${series.cast_data && series.cast_data.length > 0 && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Cast</h2> <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"> ${series.cast_data.slice(0, 12).map((actor) => renderTemplate`<div class="flex-shrink-0 w-32 text-center"> <img${addAttribute(getProfileUrl(actor.profile_path), "src")}${addAttribute(actor.name, "alt")} class="w-24 h-24 rounded-full mx-auto object-cover mb-2"> <p class="font-medium text-sm line-clamp-1" style="color: var(--text-primary);">${actor.name}</p> <p class="text-xs line-clamp-1" style="color: var(--text-secondary);">${actor.character}</p> </div>`)} </div> </section>`} ${series.trailer_key && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Trailer</h2> <div class="video-container rounded-lg overflow-hidden"> <iframe${addAttribute(`https://www.youtube.com/embed/${series.trailer_key}`, "src")} allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Trailer"></iframe> </div> </section>`} ${similar.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Similar Series", "items": similar, "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`}` })}`;
}, "/var/www/trendimovies/src/pages/s/[slug].astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/s/[slug].astro";
const $$url = "/s/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
