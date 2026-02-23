import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { A as Activity, $ as $$AdminLayout } from '../../chunks/AdminLayout_Bd36yBVL.mjs';
import { s as sanitize_props, a as spread_props, b as slot, c as attr, e as escape_html, d as ensure_array_like, f as attr_class, g as clsx } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { o as onDestroy } from '../../chunks/index-server_CS77EolT.mjs';
import { P as Play } from '../../chunks/play_C2FbJLkE.mjs';
import { I as Icon } from '../../chunks/tv_BwBqCXmW.mjs';
import { C as Clock } from '../../chunks/clock_CjYHN5RC.mjs';

function Cpu($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		[
			"rect",
			{ "width": "16", "height": "16", "x": "4", "y": "4", "rx": "2" }
		],

		[
			"rect",
			{ "width": "6", "height": "6", "x": "9", "y": "9", "rx": "1" }
		],
		["path", { "d": "M15 2v2" }],
		["path", { "d": "M15 20v2" }],
		["path", { "d": "M2 15h2" }],
		["path", { "d": "M2 9h2" }],
		["path", { "d": "M20 15h2" }],
		["path", { "d": "M20 9h2" }],
		["path", { "d": "M9 2v2" }],
		["path", { "d": "M9 20v2" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'cpu' },
		$$sanitized_props,
		{
			/**
			 * @component @name Cpu
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHg9IjQiIHk9IjQiIHJ4PSIyIiAvPgogIDxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjkiIHk9IjkiIHJ4PSIxIiAvPgogIDxwYXRoIGQ9Ik0xNSAydjIiIC8+CiAgPHBhdGggZD0iTTE1IDIwdjIiIC8+CiAgPHBhdGggZD0iTTIgMTVoMiIgLz4KICA8cGF0aCBkPSJNMiA5aDIiIC8+CiAgPHBhdGggZD0iTTIwIDE1aDIiIC8+CiAgPHBhdGggZD0iTTIwIDloMiIgLz4KICA8cGF0aCBkPSJNOSAydjIiIC8+CiAgPHBhdGggZD0iTTkgMjB2MiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/cpu
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

function Refresh_cw($$renderer, $$props) {
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
			{ "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }
		],
		["path", { "d": "M21 3v5h-5" }],
		[
			"path",
			{ "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }
		],
		["path", { "d": "M8 16H3v5" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'refresh-cw' },
		$$sanitized_props,
		{
			/**
			 * @component @name RefreshCw
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAxMmE5IDkgMCAwIDEgOS05IDkuNzUgOS43NSAwIDAgMSA2Ljc0IDIuNzRMMjEgOCIgLz4KICA8cGF0aCBkPSJNMjEgM3Y1aC01IiAvPgogIDxwYXRoIGQ9Ik0yMSAxMmE5IDkgMCAwIDEtOSA5IDkuNzUgOS43NSAwIDAgMS02Ljc0LTIuNzRMMyAxNiIgLz4KICA8cGF0aCBkPSJNOCAxNkgzdjUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/refresh-cw
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

function Terminal($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["polyline", { "points": "4 17 10 11 4 5" }],
		["line", { "x1": "12", "x2": "20", "y1": "19", "y2": "19" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'terminal' },
		$$sanitized_props,
		{
			/**
			 * @component @name Terminal
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSI0IDE3IDEwIDExIDQgNSIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIyMCIgeTE9IjE5IiB5Mj0iMTkiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/terminal
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

function CronMonitor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let status = { runningScripts: [], progress: {} };
		let logs = [];
		let loading = true;
		let logsLoading = false;
		let triggering = null;
		let selectedLog = 'series-sync.log';
		let autoRefresh = true;
		let refreshInterval;

		const availableLogs = [
			{ value: 'series-sync.log', label: 'Series Sync Log' },
			{ value: 'series-sync-temp.log', label: 'Series Sync (Temp)' },
			{
				value: 'episode-ddl-migration.log',
				label: 'Episode DDL Migration'
			}
		];

		async function fetchStatus() {
			try {
				const res = await fetch('/api/admin/crons/status');

				status = await res.json();
			} catch(e) {
				console.error('Error fetching status:', e);
			}

			loading = false;
		}

		async function fetchLogs() {
			logsLoading = true;

			try {
				const res = await fetch(`/api/admin/crons/logs?file=${selectedLog}&lines=100`);
				const data = await res.json();

				logs = data.lines || [];
			} catch(e) {
				logs = ['Error fetching logs'];
			}

			logsLoading = false;
		}

		function startAutoRefresh() {
			if (refreshInterval) clearInterval(refreshInterval);

			{
				refreshInterval = setInterval(
					() => {
						fetchStatus();
						fetchLogs();
					},
					10000
				);
			}
		}

		onDestroy(() => {
			if (refreshInterval) clearInterval(refreshInterval);
		});

		function getLogLineClass(line) {
			if (line.includes('Error') || line.includes('error') || line.includes('failed')) return 'log-line error';
			if (line.includes('Success') || line.includes('Added:') || line.includes('✓')) return 'log-line success';
			if (line.includes('Warning') || line.includes('Skipped')) return 'log-line warning';
			if (line.includes('[')) return 'log-line info';

			return 'log-line';
		}

		startAutoRefresh();
		fetchLogs();

		$$renderer.push(`<div class="space-y-6"><div class="flex flex-wrap gap-4 items-center justify-between"><div class="flex gap-2"><button${attr('disabled', triggering !== null, true)} class="btn btn-primary">`);

		{
			$$renderer.push('<!--[!-->');
			Play($$renderer, { size: 16 });
		}

		$$renderer.push(`<!--]--> Run Series Sync</button> <button${attr('disabled', triggering !== null, true)} class="btn btn-secondary">`);

		{
			$$renderer.push('<!--[!-->');
			Play($$renderer, { size: 16 });
		}

		$$renderer.push(`<!--]--> Run Episode DDL</button></div> <div class="flex items-center gap-4"><label class="flex items-center gap-2 text-sm"><input type="checkbox"${attr('checked', autoRefresh, true)} class="rounded"/> Auto-refresh (10s)</label> <button class="btn btn-ghost">`);
		Refresh_cw($$renderer, { size: 16 });
		$$renderer.push(`<!----> Refresh Now</button></div></div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"><h3 class="text-lg font-semibold mb-4 flex items-center gap-2">`);
		Activity($$renderer, { size: 20, class: 'text-green-500' });
		$$renderer.push(`<!----> Running Processes</h3> `);

		if (loading) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="text-[#666] py-4">Loading...</div>`);
		} else if (status.runningScripts.length === 0) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<div class="text-[#666] py-4">No scripts currently running</div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="space-y-3"><!--[-->`);

			const each_array = ensure_array_like(status.runningScripts);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let proc = each_array[$$index];

				$$renderer.push(`<div class="bg-[#0a0a0a] rounded-lg p-4 flex items-center justify-between"><div class="flex items-center gap-4"><div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div> <div><p class="font-mono text-sm truncate max-w-md">${escape_html(proc.command)}</p> <p class="text-xs text-[#666]">PID: ${escape_html(proc.pid)}</p></div></div> <div class="flex items-center gap-4 text-sm"><div class="flex items-center gap-1">`);
				Cpu($$renderer, { size: 14, class: 'text-[#666]' });
				$$renderer.push(`<!----> <span>${escape_html(proc.cpu)}%</span></div> <div class="flex items-center gap-1"><span class="text-[#666]">MEM:</span> <span>${escape_html(proc.mem)}%</span></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (status.progress?.seriesSync) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"><h3 class="text-lg font-semibold mb-4 flex items-center gap-2">`);
			Clock($$renderer, { size: 20, class: 'text-blue-500' });
			$$renderer.push(`<!----> Series Sync Progress</h3> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-[#0a0a0a] rounded-lg p-4"><p class="text-sm text-[#666] mb-1">Processed</p> <p class="text-2xl font-bold">${escape_html((status.progress.seriesSync.totalProcessed || 0).toLocaleString())}</p></div> <div class="bg-[#0a0a0a] rounded-lg p-4"><p class="text-sm text-[#666] mb-1">Successful</p> <p class="text-2xl font-bold text-green-500">${escape_html((status.progress.seriesSync.successful || 0).toLocaleString())}</p></div> <div class="bg-[#0a0a0a] rounded-lg p-4"><p class="text-sm text-[#666] mb-1">Failed</p> <p class="text-2xl font-bold text-red-500">${escape_html((status.progress.seriesSync.failed || 0).toLocaleString())}</p></div> <div class="bg-[#0a0a0a] rounded-lg p-4"><p class="text-sm text-[#666] mb-1">Skipped</p> <p class="text-2xl font-bold text-yellow-500">${escape_html((status.progress.seriesSync.skipped || 0).toLocaleString())}</p></div></div> `);

			if (status.progress.seriesSync.lastUpdated) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<p class="text-xs text-[#666] mt-4">Last updated: ${escape_html(status.progress.seriesSync.lastUpdated)}</p>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold flex items-center gap-2">`);
		Terminal($$renderer, { size: 20, class: 'text-purple-500' });
		$$renderer.push(`<!----> Logs</h3> `);

		$$renderer.select({ value: selectedLog, class: 'select w-auto' }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array_1 = ensure_array_like(availableLogs);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let log = each_array_1[$$index_1];

				$$renderer.option({ value: log.value }, ($$renderer) => {
					$$renderer.push(`${escape_html(log.label)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`</div> <div class="log-viewer admin-scrollbar">`);

		if (logsLoading) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="text-[#666]">Loading logs...</div>`);
		} else if (logs.length === 0) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<div class="text-[#666]">No log entries found</div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<!--[-->`);

			const each_array_2 = ensure_array_like(logs);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let line = each_array_2[$$index_2];

				$$renderer.push(`<div${attr_class(clsx(getLogLineClass(line)))}>${escape_html(line)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}

const $$Crons = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Cron Jobs", "activeTab": "crons" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CronMonitor", CronMonitor, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/CronMonitor.svelte", "client:component-export": "default" })} ` })}`;
}, "/var/www/trendimovies/src/pages/admin/crons.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/crons.astro";
const $$url = "/admin/crons";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Crons,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
