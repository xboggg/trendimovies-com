import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { V as VideoPlayer } from '../../chunks/VideoPlayer_CXuyZn5Z.mjs';
import { D as DownloadSection } from '../../chunks/DownloadSection_BxxmhzgW.mjs';
import { C as ContentRow } from '../../chunks/ContentRow_DFJtx-HN.mjs';
import { g as getMovieDetails, t as transformMovieData } from '../../chunks/tmdb_DKnoDzGN.mjs';
import { s as supabase } from '../../chunks/supabase_H7J9YlW_.mjs';
import { S as Star } from '../../chunks/star_DHTXgEc7.mjs';
import { C as Clock } from '../../chunks/clock_CjYHN5RC.mjs';
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
  const tmdbData = await getMovieDetails(tmdbId);
  if (!tmdbData) {
    return Astro2.redirect("/404");
  }
  const movie = transformMovieData(tmdbData);
  const { data: rawLinks } = await supabase.from("download_links").select("*").eq("content_type", "movie").eq("content_id", tmdbId).eq("is_active", true);
  const downloadLinks = (rawLinks || []).map((link) => ({
    ...link,
    type: link.source === "torrent" ? "torrent" : "ddl",
    source: link.source === "telegram" ? 1 : link.source === "cinematika" ? 2 : void 0
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
  function formatRuntime(minutes) {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  function formatMoney(amount) {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
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
  const directors = (movie.crew_data || []).filter((c) => c.job === "Director");
  const writers = (movie.crew_data || []).filter((c) => ["Writer", "Screenplay"].includes(c.job));
  const similar = (tmdbData.similar?.results || []).slice(0, 12).map((m) => ({
    id: m.id,
    tmdb_id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    vote_average: m.vote_average,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null,
    type: "movie"
  }));
  const ogYear = movie.year ? `(${movie.year})` : "";
  movie.vote_average ? `\u2B50 ${movie.vote_average.toFixed(1)}` : "";
  movie.genres?.length > 0 ? movie.genres.map((g) => g.name).join(", ") : "";
  const ogDescription = movie.overview || "Watch now on TrendiMovies";
  const ogImage = movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : "/images/og-default.jpg";
  const ogTitle = `${movie.title} ${ogYear}`.trim();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": ogTitle, "description": ogDescription, "image": ogImage, "type": "video.movie" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative"> <div class="absolute inset-0 h-[300px] md:h-[500px]"> <img${addAttribute(getBackdropUrl(movie.backdrop_path), "src")}${addAttribute(movie.title, "alt")} class="w-full h-full object-cover"> <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent"></div> </div> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 md:pb-12"> <div class="flex flex-col md:flex-row gap-5 md:gap-8"> <div class="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0"> <img${addAttribute(getPosterUrl(movie.poster_path), "src")}${addAttribute(movie.title, "alt")} class="w-full rounded-lg shadow-2xl"> </div> <div class="flex-1"> <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4" style="color: var(--text-primary);"> ${movie.title} ${movie.year && renderTemplate`<span class="text-xl md:text-2xl font-normal" style="color: var(--text-secondary);"> (${movie.year})</span>`} </h1> ${movie.tagline && renderTemplate`<p class="text-base md:text-lg italic mb-3 md:mb-4" style="color: var(--text-secondary);">
"${movie.tagline}"
</p>`} <div class="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6 text-sm" style="color: var(--text-secondary);"> <div class="flex items-center gap-1"> ${renderComponent($$result2, "Star", Star, { "size": 16, "class": "text-yellow-400", "fill": "currentColor" })} <span class="font-semibold" style="color: var(--text-primary);">${movie.vote_average.toFixed(1)}</span> <span class="text-xs md:text-sm">(${movie.vote_count} votes)</span> </div> ${movie.runtime && renderTemplate`<div class="flex items-center gap-1"> ${renderComponent($$result2, "Clock", Clock, { "size": 16 })} <span>${formatRuntime(movie.runtime)}</span> </div>`} ${movie.release_date && renderTemplate`<div class="flex items-center gap-1"> ${renderComponent($$result2, "Calendar", Calendar, { "size": 16 })} <span>${formatDate(movie.release_date)}</span> </div>`} <div class="flex items-center gap-1"> ${renderComponent($$result2, "Globe", Globe, { "size": 16 })} <span>${getLanguageName(movie.original_language)}</span> </div> </div> ${movie.genres && movie.genres.length > 0 && renderTemplate`<div class="flex flex-wrap gap-2 mb-4 md:mb-6"> ${movie.genres.map((genre) => renderTemplate`<a${addAttribute(`/genre/${genre.name.toLowerCase().replace(/\s+/g, "-")}`, "href")} class="genre-chip"> ${genre.name} </a>`)} </div>`} <div class="mb-4 md:mb-6"> <h3 class="font-semibold mb-1.5 md:mb-2" style="color: var(--text-primary);">Synopsis</h3> <p class="leading-relaxed text-sm md:text-base" style="color: var(--text-primary); opacity: 0.85;"> ${movie.overview || "No synopsis available."} </p> </div> <div class="grid grid-cols-2 gap-3 md:gap-4"> ${directors.length > 0 && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Director</h4> <p style="color: var(--text-primary);">${directors.map((d) => d.name).join(", ")}</p> </div>`} ${writers.length > 0 && renderTemplate`<div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Writers</h4> <p style="color: var(--text-primary);">${writers.slice(0, 3).map((w) => w.name).join(", ")}</p> </div>`} </div> </div> </div> </div> </section>  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4 flex items-center gap-2" style="color: var(--text-primary);"> ${renderComponent($$result2, "Play", Play, { "size": 24 })}
Watch Now
</h2> ${renderComponent($$result2, "VideoPlayer", VideoPlayer, { "client:load": true, "tmdbId": movie.tmdb_id, "imdbId": movie.imdb_id, "type": "movie", "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/VideoPlayer.svelte", "client:component-export": "default" })} </section>  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ${renderComponent($$result2, "DownloadSection", DownloadSection, { "client:load": true, "links": downloadLinks || [], "contentId": tmdbId, "contentType": "movie", "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/DownloadSection.svelte", "client:component-export": "default" })} </section>  ${movie.cast_data && movie.cast_data.length > 0 && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Cast</h2> <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4"> ${movie.cast_data.slice(0, 12).map((actor) => renderTemplate`<a${addAttribute(`/person/${actor.id}`, "href")} class="flex-shrink-0 w-32 text-center group"> <img${addAttribute(getProfileUrl(actor.profile_path), "src")}${addAttribute(actor.name, "alt")} class="w-24 h-24 rounded-full mx-auto object-cover mb-2 transition-transform group-hover:scale-105"> <p class="font-medium text-sm line-clamp-1 group-hover:underline" style="color: var(--text-primary);">${actor.name}</p> <p class="text-xs line-clamp-1" style="color: var(--text-secondary);">${actor.character}</p> </a>`)} </div> </section>`} ${movie.trailer_key && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Trailer</h2> <div class="video-container rounded-lg overflow-hidden"> <iframe${addAttribute(`https://www.youtube.com/embed/${movie.trailer_key}`, "src")} allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Trailer"></iframe> </div> </section>`} <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Details</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-lg" style="background-color: var(--bg-card);"> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Original Title</h4> <p style="color: var(--text-primary);">${movie.original_title || movie.title}</p> </div> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Status</h4> <p style="color: var(--text-primary);">${movie.status}</p> </div> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Budget</h4> <p style="color: var(--text-primary);">${formatMoney(movie.budget)}</p> </div> <div> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Revenue</h4> <p style="color: var(--text-primary);">${formatMoney(movie.revenue)}</p> </div> ${movie.production_companies && movie.production_companies.length > 0 && renderTemplate`<div class="col-span-2"> <h4 class="text-sm font-semibold" style="color: var(--text-muted);">Production</h4> <p style="color: var(--text-primary);">${movie.production_companies.slice(0, 3).map((c) => c.name).join(", ")}</p> </div>`} </div> </section>  ${similar.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "You May Also Like", "items": similar, "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`}` })}`;
}, "/var/www/trendimovies/src/pages/movie/[id].astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/movie/[id].astro";
const $$url = "/movie/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
