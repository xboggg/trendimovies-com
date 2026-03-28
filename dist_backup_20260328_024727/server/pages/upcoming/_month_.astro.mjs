import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute, l as renderScript } from '../../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_UnkNmAYZ.mjs';
import { d as discoverMovies } from '../../chunks/tmdb_BxXk2-sk.mjs';
/* empty css                                      */
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$month = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$month;
  const { month } = Astro2.params;
  if (!month) {
    return Astro2.redirect("/upcoming");
  }
  const parts = month.split("-");
  if (parts.length !== 2) {
    return Astro2.redirect("/upcoming");
  }
  const monthName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const year = parseInt(parts[1]);
  const monthMap = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
  };
  const monthNum = monthMap[monthName];
  if (monthNum === void 0 || isNaN(year)) {
    return Astro2.redirect("/upcoming");
  }
  const startDate = new Date(year, monthNum, 1);
  const endDate = new Date(year, monthNum + 1, 0);
  const today = /* @__PURE__ */ new Date();
  let startStr;
  if (year === today.getFullYear() && monthNum === today.getMonth()) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    startStr = tomorrow.toISOString().split("T")[0];
  } else {
    startStr = startDate.toISOString().split("T")[0];
  }
  const endStr = endDate.toISOString().split("T")[0];
  const [page1, page2, page3] = await Promise.all([
    discoverMovies({
      "primary_release_date.gte": startStr,
      "primary_release_date.lte": endStr,
      sort_by: "popularity.desc",
      page: 1
    }),
    discoverMovies({
      "primary_release_date.gte": startStr,
      "primary_release_date.lte": endStr,
      sort_by: "popularity.desc",
      page: 2
    }),
    discoverMovies({
      "primary_release_date.gte": startStr,
      "primary_release_date.lte": endStr,
      sort_by: "popularity.desc",
      page: 3
    })
  ]);
  const movies = [
    ...page1?.results || [],
    ...page2?.results || [],
    ...page3?.results || []
  ].filter((m) => m.poster_path && m.release_date);
  const allMonths = [];
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  for (let y = currentYear; y <= 2026; y++) {
    const startM = y === currentYear ? currentMonth : 0;
    const endM = y === 2026 ? 11 : 11;
    for (let m = startM; m <= endM; m++) {
      const d = new Date(y, m, 1);
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const shortLabel = d.toLocaleDateString("en-US", { month: "short" });
      const slug = `${d.toLocaleDateString("en-US", { month: "long" }).toLowerCase()}-${y}`;
      allMonths.push({
        label,
        shortLabel,
        year: y,
        slug,
        isActive: slug === month
      });
    }
  }
  const displayMonth = `${monthName} ${year}`;
  function getPosterUrl(path) {
    if (!path) return "/images/no-poster.svg";
    return `https://image.tmdb.org/t/p/w342${path}`;
  }
  function formatReleaseDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
  function getCountdownData(dateStr) {
    const releaseDate = new Date(dateStr);
    releaseDate.setHours(0, 0, 0, 0);
    const now = /* @__PURE__ */ new Date();
    const diff = releaseDate.getTime() - now.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(diff / (1e3 * 60 * 60 * 24)),
      hours: Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)),
      minutes: Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60)),
      seconds: Math.floor(diff % (1e3 * 60) / 1e3)
    };
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `Upcoming Movies - ${displayMonth} | TrendiMovies`, "description": `Discover movies releasing in ${displayMonth}. Get release dates, trailers, and details for upcoming films.`, "data-astro-cid-tfvoerag": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative py-8 overflow-hidden" data-astro-cid-tfvoerag> <div class="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-pink-900/30" data-astro-cid-tfvoerag></div> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-tfvoerag> <div class="text-center" data-astro-cid-tfvoerag> <h1 class="text-3xl md:text-4xl font-black mb-2" style="color: var(--text-primary);" data-astro-cid-tfvoerag> <span class="text-purple-500" data-astro-cid-tfvoerag>Upcoming</span> Movies
</h1> <p class="text-lg" style="color: var(--text-secondary);" data-astro-cid-tfvoerag> ${movies.length} movies in ${displayMonth} </p> </div> </div> </section>  <section class="sticky top-0 z-40 py-3" style="background-color: var(--bg-primary); border-bottom: 1px solid var(--border);" data-astro-cid-tfvoerag> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-astro-cid-tfvoerag> <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1" data-astro-cid-tfvoerag> ${allMonths.map((m) => renderTemplate`<a${addAttribute(`/upcoming/${m.slug}`, "href")}${addAttribute(["month-tab flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all", { active: m.isActive }], "class:list")}${addAttribute(!m.isActive ? "background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);" : "", "style")} data-astro-cid-tfvoerag> <span class="block text-center" data-astro-cid-tfvoerag>${m.shortLabel}</span> <span class="block text-center text-xs"${addAttribute(!m.isActive ? "color: var(--text-muted);" : "", "style")} data-astro-cid-tfvoerag>${m.year}</span> </a>`)} </div> </div> </section>  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-astro-cid-tfvoerag> ${movies.length > 0 ? renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" data-astro-cid-tfvoerag> ${movies.map((movie) => {
    const countdown = getCountdownData(movie.release_date);
    return renderTemplate`<a${addAttribute(`/movie/${movie.id}`, "href")} class="group movie-card"${addAttribute(movie.release_date, "data-release")} data-astro-cid-tfvoerag> <div class="relative aspect-[2/3] rounded-xl overflow-hidden mb-2" data-astro-cid-tfvoerag> <img${addAttribute(getPosterUrl(movie.poster_path), "src")}${addAttribute(movie.title, "alt")} class="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" data-astro-cid-tfvoerag> <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" data-astro-cid-tfvoerag></div> <!-- Countdown Timer --> <div class="absolute top-2 left-2 right-2" data-astro-cid-tfvoerag> <div class="countdown-timer flex items-center justify-center gap-1"${addAttribute(movie.release_date, "data-release")} data-astro-cid-tfvoerag> <div class="countdown-box bg-red-600" data-astro-cid-tfvoerag> <span class="countdown-num" data-days data-astro-cid-tfvoerag>${String(countdown.days).padStart(2, "0")}</span> <span class="countdown-label" data-astro-cid-tfvoerag>D</span> </div> <div class="countdown-box bg-gray-800/90" data-astro-cid-tfvoerag> <span class="countdown-num" data-hours data-astro-cid-tfvoerag>${String(countdown.hours).padStart(2, "0")}</span> <span class="countdown-label" data-astro-cid-tfvoerag>H</span> </div> <div class="countdown-box bg-gray-800/90" data-astro-cid-tfvoerag> <span class="countdown-num" data-minutes data-astro-cid-tfvoerag>${String(countdown.minutes).padStart(2, "0")}</span> <span class="countdown-label" data-astro-cid-tfvoerag>M</span> </div> <div class="countdown-box bg-gray-800/90" data-astro-cid-tfvoerag> <span class="countdown-num" data-seconds data-astro-cid-tfvoerag>${String(countdown.seconds).padStart(2, "0")}</span> <span class="countdown-label" data-astro-cid-tfvoerag>S</span> </div> </div> </div> <!-- Rating if available --> ${movie.vote_average > 0 && renderTemplate`<div class="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-amber-400 text-xs font-bold flex items-center gap-1" data-astro-cid-tfvoerag> <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" data-astro-cid-tfvoerag> <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" data-astro-cid-tfvoerag></path> </svg> ${movie.vote_average.toFixed(1)} </div>`} </div> <h3 class="text-sm font-medium line-clamp-2 group-hover:text-purple-400 transition-colors" style="color: var(--text-primary);" data-astro-cid-tfvoerag> ${movie.title} </h3> <p class="text-xs mt-1" style="color: var(--text-muted);" data-astro-cid-tfvoerag> ${formatReleaseDate(movie.release_date)} </p> </a>`;
  })} </div>` : renderTemplate`<div class="text-center py-16" data-astro-cid-tfvoerag> <p class="text-xl" style="color: var(--text-muted);" data-astro-cid-tfvoerag>No movies scheduled for ${displayMonth}</p> </div>`} </section>  ${renderScript($$result2, "/var/www/trendimovies/src/pages/upcoming/[month].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/var/www/trendimovies/src/pages/upcoming/[month].astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/upcoming/[month].astro";
const $$url = "/upcoming/[month]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$month,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
