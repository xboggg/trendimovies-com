import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { a as searchMovies } from '../chunks/tmdb_DKnoDzGN.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$BoxOffice = createComponent(async ($$result, $$props, $$slots) => {
  const POSTGREST_URL = "http://localhost:3001";
  async function getBoxOfficeData() {
    try {
      const res = await fetch(
        `${POSTGREST_URL}/box_office_weekly?order=week_start.desc,rank.asc&limit=100`,
        { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(1e4) }
      );
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch box office:", e);
      return [];
    }
  }
  const boxOfficeData = await getBoxOfficeData();
  const weeklyData = {};
  for (const entry of boxOfficeData) {
    const weekKey = entry.week_start;
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = [];
    }
    weeklyData[weekKey].push(entry);
  }
  const weeks = Object.keys(weeklyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const hasDbData = weeks.length > 0;
  const hardcodedData = [
    { rank: 1, movie_title: "Wuthering Heights", three_day_gross: 348e5, four_day_gross: 4e7, total_gross: 4e7, weeks_in_release: 1 },
    { rank: 2, movie_title: "GOAT", three_day_gross: 26e6, four_day_gross: 32e6, total_gross: 32e6, weeks_in_release: 1 },
    { rank: 3, movie_title: "Crime 101", three_day_gross: 154e5, four_day_gross: 177e5, total_gross: 177e5, weeks_in_release: 1 },
    { rank: 4, movie_title: "Send Help", three_day_gross: 89e5, four_day_gross: 107e5, total_gross: 496e5, weeks_in_release: 3 },
    { rank: 5, movie_title: "Solo Mio", three_day_gross: 68e5, four_day_gross: 8e6, total_gross: 185e5, weeks_in_release: 2 },
    { rank: 6, movie_title: "Zootopia 2", three_day_gross: 37e5, four_day_gross: 5e6, total_gross: 4206e5, weeks_in_release: 9 },
    { rank: 7, movie_title: "Good Luck, Have Fun, Don't Die", three_day_gross: 36e5, four_day_gross: 41e5, total_gross: 41e5, weeks_in_release: 1 },
    { rank: 8, movie_title: "Avatar: Fire and Ash", three_day_gross: 33e5, four_day_gross: 38e5, total_gross: 3965e5, weeks_in_release: 10 },
    { rank: 9, movie_title: "Iron Lung", three_day_gross: 33e5, four_day_gross: 37e5, total_gross: 379e5, weeks_in_release: 4 },
    { rank: 10, movie_title: "Dracula", three_day_gross: 3e6, four_day_gross: 35e5, total_gross: 95e5, weeks_in_release: 2 }
  ];
  async function enrichWithPosters(entries) {
    return Promise.all(entries.map(async (entry) => {
      if (entry.poster_path) return entry;
      try {
        const result = await searchMovies(entry.movie_title, 1);
        if (result.results && result.results.length > 0) {
          const movie = result.results[0];
          return { ...entry, tmdb_id: movie.id, poster_path: movie.poster_path };
        }
      } catch (e) {
      }
      return entry;
    }));
  }
  const currentWeekData = hasDbData ? await enrichWithPosters(weeklyData[weeks[0]] || []) : await enrichWithPosters(hardcodedData);
  function formatMoney(amount) {
    if (!amount) return "-";
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${amount.toLocaleString()}`;
  }
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }
  function getPosterUrl(path) {
    if (!path) return "/images/no-poster.svg";
    return `https://image.tmdb.org/t/p/w185${path}`;
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Weekend Box Office - Movie Earnings & Charts", "description": "Latest weekend box office results, movie earnings, and charts. Track the highest-grossing films of the week." }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="relative py-12 overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-br from-green-900/30 via-transparent to-emerald-900/30"></div> <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center"> <h1 class="text-3xl md:text-5xl font-black mb-4" style="color: var(--text-primary);"> <span class="text-green-500">$</span> Weekend Box Office
</h1> <p class="text-lg" style="color: var(--text-secondary);">
Track the highest-grossing films at the box office
</p> ${hasDbData && weeks[0] && renderTemplate`<p class="mt-2 text-sm font-medium text-green-500">
Latest: ${formatDate(weeks[0])} </p>`} </div> </div> </section>  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2" style="color: var(--text-primary);"> <span class="text-green-500">📊</span>
This Week's Top 10
</h2> <div class="overflow-x-auto"> <table class="w-full"> <thead> <tr class="text-left text-sm" style="color: var(--text-muted);"> <th class="pb-4 pl-2">#</th> <th class="pb-4">Movie</th> <th class="pb-4 text-right">Weekend (3-Day)</th> <th class="pb-4 text-right hidden md:table-cell">Weekend (4-Day)</th> <th class="pb-4 text-right">Total Gross</th> <th class="pb-4 text-center pr-4">Weeks</th> </tr> </thead> <tbody> ${currentWeekData.map((entry, index) => renderTemplate`<tr class="transition-colors hover:bg-[var(--bg-hover)]" style="border-top: 1px solid var(--border);"> <td class="py-4 pl-2"> <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"${addAttribute(index < 3 ? "background: linear-gradient(135deg, #22c55e, #16a34a); color: white;" : "background-color: var(--bg-hover); color: var(--text-primary);", "style")}> ${entry.rank} </span> </td> <td class="py-4"> <a${addAttribute(entry.tmdb_id ? `/movie/${entry.tmdb_id}` : "#", "href")} class="flex items-center gap-3 group"> <img${addAttribute(getPosterUrl(entry.poster_path), "src")}${addAttribute(entry.movie_title, "alt")} class="w-10 h-15 rounded object-cover hidden sm:block"> <div> <p class="font-semibold group-hover:text-green-500 transition-colors" style="color: var(--text-primary);"> ${entry.movie_title} </p> <p class="text-xs sm:hidden" style="color: var(--text-muted);">
Week ${entry.weeks_in_release || 1} </p> </div> </a> </td> <td class="py-4 text-right font-medium" style="color: var(--text-primary);"> ${formatMoney(entry.three_day_gross)} </td> <td class="py-4 text-right hidden md:table-cell" style="color: var(--text-secondary);"> ${formatMoney(entry.four_day_gross)} </td> <td class="py-4 text-right"> <span class="font-bold text-green-500">${formatMoney(entry.total_gross)}</span> </td> <td class="py-4 text-center pr-4"> <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style="background-color: var(--bg-hover); color: var(--text-primary);"> ${entry.weeks_in_release || 1} </span> </td> </tr>`)} </tbody> </table> </div> </section>  ${hasDbData && weeks.length > 1 && renderTemplate`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h2 class="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2" style="color: var(--text-primary);"> <span class="text-green-500">📈</span>
Previous Weeks
</h2> <div class="space-y-8"> ${weeks.slice(1, 6).map((weekKey) => renderTemplate`<div class="rounded-xl p-6" style="background-color: var(--bg-card); border: 1px solid var(--border);"> <h3 class="text-lg font-bold mb-4" style="color: var(--text-primary);">
Week of ${formatDate(weekKey)} </h3> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"> ${weeklyData[weekKey].slice(0, 6).map((entry) => renderTemplate`<a${addAttribute(entry.tmdb_id ? `/movie/${entry.tmdb_id}` : "#", "href")} class="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"> <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white;"> ${entry.rank} </span> <div class="min-w-0 flex-1"> <p class="font-medium truncate" style="color: var(--text-primary);">${entry.movie_title}</p> <p class="text-xs" style="color: var(--text-muted);">
Weekend: ${formatMoney(entry.three_day_gross)} | Total: ${formatMoney(entry.total_gross)} </p> </div> </a>`)} </div> </div>`)} </div> </section>`} <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="rounded-xl p-6" style="background-color: var(--bg-card); border: 1px solid var(--border);"> <h3 class="text-lg font-bold mb-4" style="color: var(--text-primary);">
About Box Office Data
</h3> <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">
Box office data is updated weekly every Monday with the latest weekend earnings.
        The 3-day weekend covers Friday through Sunday, while the 4-day weekend includes
        Monday for holiday weekends. Total gross represents the cumulative domestic earnings
        since the film's theatrical release.
</p> <p class="text-xs mt-4" style="color: var(--text-muted);">
Data source: The Numbers / Box Office Mojo
</p> </div> </section> ` })}`;
}, "/var/www/trendimovies/src/pages/box-office.astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/box-office.astro";
const $$url = "/box-office";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BoxOffice,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
