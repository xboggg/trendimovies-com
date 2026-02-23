import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { S as SeasonTabs } from '../../chunks/SeasonTabs_CV8DMzNu.mjs';
import { C as ContentRow } from '../../chunks/ContentRow_DFJtx-HN.mjs';
import { i as getTVDetails, o as transformSeriesData, p as getSeasonDetails } from '../../chunks/tmdb_DKnoDzGN.mjs';
import { S as Star } from '../../chunks/star_DHTXgEc7.mjs';
import { T as Tv } from '../../chunks/tv_BwBqCXmW.mjs';
import { C as Calendar } from '../../chunks/calendar_D8dvDgub.mjs';
import { G as Globe } from '../../chunks/globe_BOcdjHoP.mjs';
import { P as Play } from '../../chunks/play_C2FbJLkE.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const tmdbId = parseInt(id || "0");
  if (!tmdbId) {
    return Astro2.redirect("/404");
  }
  const tmdbData = await getTVDetails(tmdbId);
  if (!tmdbData) {
    return Astro2.redirect("/404");
  }
  const series = transformSeriesData(tmdbData);
  const seasonNumbers = (tmdbData.seasons || []).filter((s) => s.season_number > 0).map((s) => s.season_number);
  const seasonDataPromises = seasonNumbers.map((num) => getSeasonDetails(tmdbId, num));
  const seasonDataResults = await Promise.all(seasonDataPromises);
  const episodesBySeason = {};
  seasonDataResults.forEach((seasonData) => {
    if (seasonData && seasonData.episodes) {
      episodesBySeason[seasonData.season_number] = seasonData.episodes.map((ep) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path,
        air_date: ep.air_date,
        runtime: ep.runtime,
        vote_average: ep.vote_average,
        has_downloads: false
      }));
    }
  });
  let downloadsByEpisode = {};
  const POSTGREST_URL = "http://localhost:3001";
  try {
    const seriesResp = await fetch(
      `${POSTGREST_URL}/series?tmdb_id=eq.${tmdbId}&select=id`,
      { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(5e3) }
    );
    if (seriesResp.ok) {
      const seriesData = await seriesResp.json();
      if (seriesData.length > 0) {
        const dbSeriesId = seriesData[0].id;
        const epResp = await fetch(
          `${POSTGREST_URL}/episodes?series_id=eq.${dbSeriesId}&select=id,season_id,episode_number`,
          { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(1e4) }
        );
        if (epResp.ok) {
          const dbEpisodes = await epResp.json();
          const seasonsResp = await fetch(
            `${POSTGREST_URL}/seasons?series_id=eq.${dbSeriesId}&select=id,season_number`,
            { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(5e3) }
          );
          const dbSeasons = seasonsResp.ok ? await seasonsResp.json() : [];
          const seasonIdToNum = {};
          for (const s of dbSeasons) seasonIdToNum[s.id] = s.season_number;
          const epLookup = {};
          for (const ep of dbEpisodes) {
            const sNum = seasonIdToNum[ep.season_id];
            if (sNum) epLookup[`${sNum}-${ep.episode_number}`] = ep.id;
          }
          const dbEpIds = dbEpisodes.map((ep) => ep.id);
          if (dbEpIds.length > 0) {
            const dlResp = await fetch(
              `${POSTGREST_URL}/download_links?content_type=eq.episode&is_active=eq.true&content_id=in.(${dbEpIds.join(",")})`,
              { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(1e4) }
            );
            if (dlResp.ok) {
              const dlData = await dlResp.json();
              const dlByDbId = {};
              for (const link of dlData) {
                if (!dlByDbId[link.content_id]) dlByDbId[link.content_id] = [];
                dlByDbId[link.content_id].push(link);
              }
              for (const [seasonNumStr, episodes] of Object.entries(episodesBySeason)) {
                for (const ep of episodes) {
                  const dbEpId = epLookup[`${seasonNumStr}-${ep.episode_number}`];
                  if (dbEpId) {
                    ep.id = dbEpId;
                    if (dlByDbId[dbEpId] && dlByDbId[dbEpId].length > 0) {
                      ep.has_downloads = true;
                      downloadsByEpisode[dbEpId] = dlByDbId[dbEpId];
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error checking episode downloads:", e);
  }
  const seasons = (tmdbData.seasons || []).filter((s) => s.season_number > 0).map((s) => ({
    id: s.id,
    season_number: s.season_number,
    name: s.name,
    overview: s.overview,
    poster_path: s.poster_path,
    episode_count: s.episode_count
  }));
  function getPosterUrl(path) {
    if (!path) return "/images/no-poster.svg";
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
  function getBackdropUrl(path) {
    if (!path) return "/images/no-backdrop.svg";
    return `https://image.tmdb.org/t/p/w1280${path}`;
  }
  function getProfileUrl(path) {
    if (!path) return "/images/no-profile.svg";
    return `https://image.tmdb.org/t/p/w185${path}`;
  }
  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  const LANGUAGES = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    hi: "Hindi",
    ar: "Arabic",
    tr: "Turkish",
    th: "Thai"
  };
  function getLanguageName(code) {
    return LANGUAGES[code] || code.toUpperCase();
  }
  const creators = (series.crew_data || []).filter((c) => c.job === "Creator" || c.job === "Executive Producer").slice(0, 3);
  const similar = (tmdbData.similar?.results || []).slice(0, 12).map((s) => ({
    id: s.id,
    tmdb_id: s.id,
    title: s.name,
    poster_path: s.poster_path,
    vote_average: s.vote_average,
    year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : null,
    type: "series"
  }));
  const ogYear = series.year ? `(${series.year})` : "";
  const ogRating = series.vote_average ? `⭐ ${series.vote_average.toFixed(1)}` : "";
  const ogGenres = series.genres?.length > 0 ? series.genres.map((g) => g.name).join(", ") : "";
  const ogSynopsis = series.overview || `Watch ${series.title} online for free in HD quality.`;
  const ogDescription = [
    ogRating,
    ogGenres,
    "",
    ogSynopsis
  ].filter(Boolean).join("\n");
  const ogImage = series.poster_path ? `https://image.tmdb.org/t/p/w780${series.poster_path}` : "/images/og-default.jpg";
  const ogTitle = `${series.title} ${ogYear}`.trim();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": ogTitle, "description": ogDescription, "image": ogImage, "type": "video.tv_show" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative"> <div class="absolute inset-0 h-[500px]"> <img${addAttribute(getBackdropUrl(series.backdrop_path), "src")}${addAttribute(series.title, "alt")} class="w-full h-full object-cover"> <div class="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div> </div> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12"> <div class="flex flex-col md:flex-row gap-8"> <div class="flex-shrink-0 w-64 mx-auto md:mx-0"> <img${addAttribute(getPosterUrl(series.poster_path), "src")}${addAttribute(series.title, "alt")} class="w-full rounded-lg shadow-2xl"> </div> <div class="flex-1"> <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white"> ${series.title} ${series.year && renderTemplate`<span class="text-2xl font-normal text-gray-300"> (${series.year})</span>`} </h1> ${series.tagline && renderTemplate`<p class="text-lg italic mb-4 text-gray-300">
"${series.tagline}"
</p>`} <div class="flex flex-wrap items-center gap-4 mb-6 text-gray-300"> <div class="flex items-center gap-1"> ${renderComponent($$result2, "Star", Star, { "size": 18, "class": "text-yellow-400", "fill": "currentColor" })} <span class="font-semibold text-white">${series.vote_average.toFixed(1)}</span> <span class="text-sm">(${series.vote_count} votes)</span> </div> <div class="flex items-center gap-1"> ${renderComponent($$result2, "Tv", Tv, { "size": 18 })} <span>${series.number_of_seasons} Season${series.number_of_seasons > 1 ? "s" : ""}</span> </div> ${series.first_air_date && renderTemplate`<div class="flex items-center gap-1"> ${renderComponent($$result2, "Calendar", Calendar, { "size": 18 })} <span>${formatDate(series.first_air_date)}</span> </div>`} <div class="flex items-center gap-1"> ${renderComponent($$result2, "Globe", Globe, { "size": 18 })} <span>${getLanguageName(series.original_language)}</span> </div> </div> ${series.genres && series.genres.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mb-6"> ${series.genres.map((genre) => renderTemplate`<span class="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 border border-white/20 text-gray-200"> ${genre.name} </span>`)} </div>`} <div class="mb-6"> <h3 class="font-semibold mb-2 text-white">Synopsis</h3> <p class="leading-relaxed text-gray-300"> ${series.overview || "No synopsis available."} </p> </div> <div class="grid grid-cols-2 gap-4"> ${creators.length > 0 && renderTemplate`<div> <h4 class="text-sm font-semibold text-gray-400">Creator</h4> <p class="text-white">${creators.map((c) => c.name).join(", ")}</p> </div>`} ${series.networks && series.networks.length > 0 && renderTemplate`<div> <h4 class="text-sm font-semibold text-gray-400">Network</h4> <p class="text-white">${series.networks.map((n) => n.name).join(", ")}</p> </div>`} </div> </div> </div> </div> </section>  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-6 flex items-center gap-2" style="color: var(--text-primary);"> ${renderComponent($$result2, "Play", Play, { "size": 24 })}
Episodes
</h2> ${renderComponent($$result2, "SeasonTabs", SeasonTabs, { "client:load": true, "seriesId": series.tmdb_id, "tmdbId": series.tmdb_id, "imdbId": series.imdb_id, "seasons": seasons, "episodesBySeason": episodesBySeason, "downloadsByEpisode": downloadsByEpisode, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/SeasonTabs.svelte", "client:component-export": "default" })} </section>  ${series.cast_data && series.cast_data.length > 0 && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Cast</h2> <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"> ${series.cast_data.slice(0, 12).map((actor) => renderTemplate`<a${addAttribute(`/person/${actor.id}`, "href")} class="flex-shrink-0 w-32 text-center group"> <img${addAttribute(getProfileUrl(actor.profile_path), "src")}${addAttribute(actor.name, "alt")} class="w-24 h-24 rounded-full mx-auto object-cover mb-2 transition-transform group-hover:scale-105"> <p class="font-medium text-sm line-clamp-1 group-hover:underline" style="color: var(--text-primary);">${actor.name}</p> <p class="text-xs line-clamp-1" style="color: var(--text-secondary);">${actor.character}</p> </a>`)} </div> </section>`} ${series.trailer_key && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Trailer</h2> <div class="video-container rounded-lg overflow-hidden"> <iframe${addAttribute(`https://www.youtube.com/embed/${series.trailer_key}`, "src")} allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Trailer"></iframe> </div> </section>`} <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Details</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-lg" style="background-color: var(--bg-card);"> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Original Title</h4> <p style="color: var(--text-primary);">${series.original_title || series.title}</p> </div> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Status</h4> <p style="color: var(--text-primary);">${series.status}</p> </div> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Seasons</h4> <p style="color: var(--text-primary);">${series.number_of_seasons}</p> </div> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Episodes</h4> <p style="color: var(--text-primary);">${series.number_of_episodes}</p> </div> ${series.production_companies && series.production_companies.length > 0 && renderTemplate`<div class="col-span-2"> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Production</h4> <p style="color: var(--text-primary);">${series.production_companies.slice(0, 3).map((c) => c.name).join(", ")}</p> </div>`} </div> </section>  ${similar.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "You May Also Like", "items": similar, "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`}` })}`;
}, "/var/www/trendimovies/src/pages/tv/[id].astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/tv/[id].astro";
const $$url = "/tv/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
