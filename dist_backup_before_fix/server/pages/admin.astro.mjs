import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { L as Link_2, $ as $$AdminLayout } from '../chunks/AdminLayout_Bd36yBVL.mjs';
import { s as sanitize_props, a as spread_props, b as slot, i as fallback, e as escape_html, f as attr_class, h as stringify, j as bind_props, d as ensure_array_like } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { I as Icon, T as Tv, F as Film } from '../chunks/tv_BwBqCXmW.mjs';
import { D as Download } from '../chunks/download_CqztGVIg.mjs';
import { P as Play } from '../chunks/play_C2FbJLkE.mjs';
import { a as getDashboardStats } from '../chunks/admin-queries_SEI3HfdQ.mjs';

function Database($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["ellipse", { "cx": "12", "cy": "5", "rx": "9", "ry": "3" }],
		["path", { "d": "M3 5V19A9 3 0 0 0 21 19V5" }],
		["path", { "d": "M3 12A9 3 0 0 0 21 12" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'database' },
		$$sanitized_props,
		{
			/**
			 * @component @name Database
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8ZWxsaXBzZSBjeD0iMTIiIGN5PSI1IiByeD0iOSIgcnk9IjMiIC8+CiAgPHBhdGggZD0iTTMgNVYxOUE5IDMgMCAwIDAgMjEgMTlWNSIgLz4KICA8cGF0aCBkPSJNMyAxMkE5IDMgMCAwIDAgMjEgMTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/database
			 * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			 *
			 * @param {Object} props - Lucide icons props and any valid SVG attribute
			 * @returns {FunctionalComponent} Svelte component
			 *
			 */
			iconNode,

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				slot($$renderer, $$props, 'default', {});
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}

function Eye($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		[
			"path",
			{
				"d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
			}
		],
		["circle", { "cx": "12", "cy": "12", "r": "3" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'eye' },
		$$sanitized_props,
		{
			/**
			 * @component @name Eye
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi4wNjIgMTIuMzQ4YTEgMSAwIDAgMSAwLS42OTYgMTAuNzUgMTAuNzUgMCAwIDEgMTkuODc2IDAgMSAxIDAgMCAxIDAgLjY5NiAxMC43NSAxMC43NSAwIDAgMS0xOS44NzYgMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eye
			 * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			 *
			 * @param {Object} props - Lucide icons props and any valid SVG attribute
			 * @returns {FunctionalComponent} Svelte component
			 *
			 */
			iconNode,

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				slot($$renderer, $$props, 'default', {});
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}

function Mouse_pointer($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M12.586 12.586 19 19" }],
		[
			"path",
			{
				"d": "M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'mouse-pointer' },
		$$sanitized_props,
		{
			/**
			 * @component @name MousePointer
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIuNTg2IDEyLjU4NiAxOSAxOSIgLz4KICA8cGF0aCBkPSJNMy42ODggMy4wMzdhLjQ5Ny40OTcgMCAwIDAtLjY1MS42NTFsNi41IDE1Ljk5OWEuNTAxLjUwMSAwIDAgMCAuOTQ3LS4wNjJsMS41NjktNi4wODNhMiAyIDAgMCAxIDEuNDQ4LTEuNDc5bDYuMTI0LTEuNTc5YS41LjUgMCAwIDAgLjA2My0uOTQ3eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/mouse-pointer
			 * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
			 *
			 * @param {Object} props - Lucide icons props and any valid SVG attribute
			 * @returns {FunctionalComponent} Svelte component
			 *
			 */
			iconNode,

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				slot($$renderer, $$props, 'default', {});
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}

function StatsCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let IconComponent;
		let label = $$props['label'];
		let value = $$props['value'];
		let icon = fallback($$props['icon'], 'database');
		let subtext = fallback($$props['subtext'], '');
		let trend = fallback($$props['trend'], 'neutral');
		let color = fallback($$props['color'], 'red');

		const icons = {
			film: Film,
			tv: Tv,
			play: Play,
			download: Download,
			eye: Eye,
			click: Mouse_pointer,
			link: Link_2,
			database: Database
		};

		const colors = {
			red: 'from-red-500 to-red-700',
			blue: 'from-blue-500 to-blue-700',
			green: 'from-green-500 to-green-700',
			yellow: 'from-yellow-500 to-yellow-700',
			purple: 'from-purple-500 to-purple-700'
		};

		IconComponent = icons[icon];

		$$renderer.push(`<div class="stats-card bg-[#141414] border border-[#2a2a2a] rounded-xl p-5"><div class="flex items-start justify-between"><div><p class="text-sm font-medium text-[#666] mb-1">${escape_html(label)}</p> <p class="text-3xl font-bold text-white">${escape_html(typeof value === 'number' ? value.toLocaleString() : value)}</p> `);

		if (subtext) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<p class="text-xs text-[#888] mt-1">${escape_html(subtext)}</p>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div> <div${attr_class(`w-12 h-12 rounded-xl bg-gradient-to-br ${stringify(colors[color])} flex items-center justify-center shadow-lg`)}>`);
		$$renderer.push('<!---->');
		IconComponent?.($$renderer, { size: 24, class: 'text-white' });
		$$renderer.push(`<!----></div></div></div>`);
		bind_props($$props, { label, value, icon, subtext, trend, color });
	});
}

function DataTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let columns = fallback($$props['columns'], () => [], true);
		let rows = fallback($$props['rows'], () => [], true);
		let emptyMessage = fallback($$props['emptyMessage'], 'No data available');

		$$renderer.push(`<div class="overflow-x-auto">`);

		if (rows.length === 0) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="text-center py-8 text-[#666]">${escape_html(emptyMessage)}</div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<table class="admin-table"><thead><tr><!--[-->`);

			const each_array = ensure_array_like(columns);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let col = each_array[$$index];

				$$renderer.push(`<th>${escape_html(col)}</th>`);
			}

			$$renderer.push(`<!--]--></tr></thead><tbody><!--[-->`);

			const each_array_1 = ensure_array_like(rows);

			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let row = each_array_1[$$index_2];

				$$renderer.push(`<tr><!--[-->`);

				const each_array_2 = ensure_array_like(row);

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let cell = each_array_2[$$index_1];

					$$renderer.push(`<td>${escape_html(cell ?? '-')}</td>`);
				}

				$$renderer.push(`<!--]--></tr>`);
			}

			$$renderer.push(`<!--]--></tbody></table>`);
		}

		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { columns, rows, emptyMessage });
	});
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const stats = await getDashboardStats();
  const movieDDLPercent = stats.totals.movies > 0 ? Math.round(stats.ddlCoverage.moviesWithDDL / stats.totals.movies * 100) : 0;
  const episodeDDLPercent = stats.totals.episodes > 0 ? Math.round(stats.ddlCoverage.episodesWithDDL / stats.totals.episodes * 100) : 0;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard", "activeTab": "dashboard" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"> ${renderComponent($$result2, "StatsCard", StatsCard, { "label": "Total Movies", "value": stats.totals.movies, "icon": "film", "color": "red", "subtext": `${stats.ddlCoverage.moviesWithDDL.toLocaleString()} with DDL` })} ${renderComponent($$result2, "StatsCard", StatsCard, { "label": "Total Series", "value": stats.totals.series, "icon": "tv", "color": "blue" })} ${renderComponent($$result2, "StatsCard", StatsCard, { "label": "Total Episodes", "value": stats.totals.episodes, "icon": "play", "color": "green", "subtext": `${stats.ddlCoverage.episodesWithDDL.toLocaleString()} with DDL` })} ${renderComponent($$result2, "StatsCard", StatsCard, { "label": "Download Links", "value": stats.totals.downloadLinks, "icon": "link", "color": "purple", "subtext": `${stats.downloads.totalClicks.toLocaleString()} total clicks` })} </div>  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Movie DDL Coverage</h3> <div class="mb-4"> <div class="flex justify-between text-sm mb-2"> <span class="text-[#a0a0a0]">With Downloads</span> <span class="font-medium">${movieDDLPercent}%</span> </div> <div class="progress-bar"> <div class="progress-bar-fill"${addAttribute(`width: ${movieDDLPercent}%`, "style")}></div> </div> </div> <div class="grid grid-cols-2 gap-4 text-sm"> <div class="bg-[#0a0a0a] rounded-lg p-3"> <p class="text-[#666] mb-1">With DDL</p> <p class="text-xl font-bold text-green-500">${stats.ddlCoverage.moviesWithDDL.toLocaleString()}</p> </div> <div class="bg-[#0a0a0a] rounded-lg p-3"> <p class="text-[#666] mb-1">Without DDL</p> <p class="text-xl font-bold text-red-500">${stats.ddlCoverage.moviesWithoutDDL.toLocaleString()}</p> </div> </div> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Episode DDL Coverage</h3> <div class="mb-4"> <div class="flex justify-between text-sm mb-2"> <span class="text-[#a0a0a0]">With Downloads</span> <span class="font-medium">${episodeDDLPercent}%</span> </div> <div class="progress-bar"> <div class="progress-bar-fill"${addAttribute(`width: ${episodeDDLPercent}%`, "style")}></div> </div> </div> <div class="grid grid-cols-2 gap-4 text-sm"> <div class="bg-[#0a0a0a] rounded-lg p-3"> <p class="text-[#666] mb-1">With DDL</p> <p class="text-xl font-bold text-green-500">${stats.ddlCoverage.episodesWithDDL.toLocaleString()}</p> </div> <div class="bg-[#0a0a0a] rounded-lg p-3"> <p class="text-[#666] mb-1">Without DDL</p> <p class="text-xl font-bold text-red-500">${stats.ddlCoverage.episodesWithoutDDL.toLocaleString()}</p> </div> </div> </div> </div>  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Downloads by Quality</h3> <div class="space-y-3"> ${Object.entries(stats.downloads.byQuality).map(([quality, clicks]) => renderTemplate`<div class="flex items-center justify-between"> <div class="flex items-center gap-2"> <span${addAttribute(`w-3 h-3 rounded-full ${quality === "720p" ? "bg-green-500" : quality === "1080p" ? "bg-blue-500" : "bg-purple-500"}`, "class")}></span> <span class="font-medium">${quality}</span> </div> <span class="text-[#a0a0a0]">${clicks.toLocaleString()} clicks</span> </div>`)} </div> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Downloads by Source</h3> <div class="space-y-3"> ${Object.entries(stats.downloads.bySource).map(([source, clicks]) => renderTemplate`<div class="flex items-center justify-between"> <div class="flex items-center gap-2"> <span${addAttribute(`w-3 h-3 rounded-full ${source === "telegram" ? "bg-blue-400" : source === "cinematika" ? "bg-yellow-500" : "bg-orange-500"}`, "class")}></span> <span class="font-medium capitalize">${source}</span> </div> <span class="text-[#a0a0a0]">${clicks.toLocaleString()} clicks</span> </div>`)} </div> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Downloads by Type</h3> <div class="space-y-3"> ${Object.entries(stats.downloads.byContentType).map(([type, clicks]) => renderTemplate`<div class="flex items-center justify-between"> <div class="flex items-center gap-2"> <span${addAttribute(`w-3 h-3 rounded-full ${type === "movie" ? "bg-red-500" : "bg-green-500"}`, "class")}></span> <span class="font-medium capitalize">${type}s</span> </div> <span class="text-[#a0a0a0]">${clicks.toLocaleString()} clicks</span> </div>`)} </div> </div> </div>  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <div class="flex items-center justify-between"> <div> <p class="text-sm text-[#666] mb-1">Movie Download Links</p> <p class="text-2xl font-bold">${stats.linkCounts.movieLinks.toLocaleString()}</p> </div> <div class="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg> </div> </div> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <div class="flex items-center justify-between"> <div> <p class="text-sm text-[#666] mb-1">Episode Download Links</p> <p class="text-2xl font-bold">${stats.linkCounts.episodeLinks.toLocaleString()}</p> </div> <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> </div> </div> </div> </div>  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Top 10 Most Viewed Movies</h3> ${renderComponent($$result2, "DataTable", DataTable, { "client:load": true, "columns": ["#", "Title", "Year", "Views"], "rows": stats.topViewed.movies.map((m, i) => [
    i + 1,
    m.title,
    m.year || "-",
    (m.view_count || 0).toLocaleString()
  ]), "emptyMessage": "No view data yet", "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/DataTable.svelte", "client:component-export": "default" })} </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">Top 10 Most Viewed Series</h3> ${renderComponent($$result2, "DataTable", DataTable, { "client:load": true, "columns": ["#", "Title", "Year", "Views"], "rows": stats.topViewed.series.map((s, i) => [
    i + 1,
    s.title,
    s.year || "-",
    (s.view_count || 0).toLocaleString()
  ]), "emptyMessage": "No view data yet", "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/DataTable.svelte", "client:component-export": "default" })} </div> </div> ` })}`;
}, "/var/www/trendimovies/src/pages/admin/index.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
