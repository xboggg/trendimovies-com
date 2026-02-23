import { s as sanitize_props, a as spread_props, b as slot, i as fallback, f as attr_class, d as ensure_array_like, c as attr, e as escape_html, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
/* empty css                          */
import { I as Icon } from './tv_BwBqCXmW.mjs';
import { L as Loader_circle } from './loader-circle_Cmeteb-C.mjs';

function Circle_alert($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["circle", { "cx": "12", "cy": "12", "r": "10" }],
		["line", { "x1": "12", "x2": "12", "y1": "8", "y2": "12" }],
		[
			"line",
			{ "x1": "12", "x2": "12.01", "y1": "16", "y2": "16" }
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'circle-alert' },
		$$sanitized_props,
		{
			/**
			 * @component @name CircleAlert
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjgiIHkyPSIxMiIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMi4wMSIgeTE9IjE2IiB5Mj0iMTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/circle-alert
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

function Maximize_2($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["polyline", { "points": "15 3 21 3 21 9" }],
		["polyline", { "points": "9 21 3 21 3 15" }],
		["line", { "x1": "21", "x2": "14", "y1": "3", "y2": "10" }],
		["line", { "x1": "3", "x2": "10", "y1": "21", "y2": "14" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'maximize-2' },
		$$sanitized_props,
		{
			/**
			 * @component @name Maximize2
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIxNSAzIDIxIDMgMjEgOSIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSI5IDIxIDMgMjEgMyAxNSIgLz4KICA8bGluZSB4MT0iMjEiIHgyPSIxNCIgeTE9IjMiIHkyPSIxMCIgLz4KICA8bGluZSB4MT0iMyIgeDI9IjEwIiB5MT0iMjEiIHkyPSIxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/maximize-2
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

function Monitor($$renderer, $$props) {
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
			{ "width": "20", "height": "14", "x": "2", "y": "3", "rx": "2" }
		],
		["line", { "x1": "8", "x2": "16", "y1": "21", "y2": "21" }],
		["line", { "x1": "12", "x2": "12", "y1": "17", "y2": "21" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'monitor' },
		$$sanitized_props,
		{
			/**
			 * @component @name Monitor
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHg9IjIiIHk9IjMiIHJ4PSIyIiAvPgogIDxsaW5lIHgxPSI4IiB4Mj0iMTYiIHkxPSIyMSIgeTI9IjIxIiAvPgogIDxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMTciIHkyPSIyMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/monitor
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

const STREAMING_SERVERS = {
  server1: {
    id: "server1",
    name: "Server 1",
    getMovieUrl: (tmdbId) => `https://vidsrc.icu/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`,
    idType: "tmdb"
  },
  server2: {
    id: "server2",
    name: "Server 2",
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
    idType: "tmdb"
  },
  server3: {
    id: "server3",
    name: "Server 3",
    getMovieUrl: (tmdbId) => `https://moviesapi.club/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://moviesapi.club/tv/${tmdbId}/${season}/${episode}`,
    idType: "tmdb"
  }
};

function VideoPlayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // Load saved server preference
		// Keyboard shortcuts
		currentUrl;

		let tmdbId = $$props['tmdbId'];
		let imdbId = fallback($$props['imdbId'], null);
		let type = fallback($$props['type'], 'movie');
		let season = fallback($$props['season'], 1);
		let episode = fallback($$props['episode'], 1);
		let activeServer = 'server1';
		let isTheaterMode = false;
		let isLoading = true;
		let hasError = false;

		function getStreamUrl(server) {
			const config = STREAMING_SERVERS[server];

			if (type === 'movie') {
				if (config.idType === 'imdb') {
					if (!imdbId) return null;

					return config.getMovieUrl(imdbId);
				}

				return config.getMovieUrl(tmdbId);
			} else {
				if (config.idType === 'imdb') {
					if (!imdbId) return null;

					return config.getTVUrl(imdbId, season, episode);
				}

				return config.getTVUrl(tmdbId, season, episode);
			}
		}

		currentUrl = getStreamUrl(activeServer);

		if (currentUrl) {
			isLoading = true;
			hasError = false;
		}

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div${attr_class('rounded-lg overflow-hidden transition-all duration-300 svelte-aremre', void 0, { 'theater-mode': isTheaterMode })} style="background-color: var(--bg-card);"><div class="flex border-b flex-wrap" style="border-color: var(--border);"><!--[-->`);

		const each_array = ensure_array_like(Object.entries(STREAMING_SERVERS));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [key, server] = each_array[$$index];
			const serverKey = key;
			const isDisabled = server.idType === 'imdb' && !imdbId;

			$$renderer.push(`<button${attr('disabled', isDisabled, true)}${attr_class('flex-1 min-w-[80px] px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5', void 0, {
				'tab-active': activeServer === serverKey,
				'tab-inactive': activeServer !== serverKey
			})}>`);

			Monitor($$renderer, { size: 14, class: 'hidden sm:inline' });
			$$renderer.push(`<!----> ${escape_html(server.name)}</button>`);
		}

		$$renderer.push(`<!--]--></div> <div class="video-container relative">`);

		if (isLoading) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="absolute inset-0 flex items-center justify-center z-10" style="background-color: var(--bg-secondary);"><div class="flex flex-col items-center gap-3">`);
			Loader_circle($$renderer, { size: 40, class: 'animate-spin text-[#e50914]' });
			$$renderer.push(`<!----> <p class="text-sm" style="color: var(--text-secondary);">Loading player...</p></div></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		if (hasError) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="absolute inset-0 flex items-center justify-center z-10" style="background-color: var(--bg-secondary);"><div class="flex flex-col items-center gap-3 text-center px-4">`);
			Circle_alert($$renderer, { size: 40, class: 'text-red-500' });
			$$renderer.push(`<!----> <p class="text-sm" style="color: var(--text-secondary);">Server not responding</p> <button class="px-4 py-2 bg-[#e50914] text-white rounded-lg text-sm font-medium hover:bg-[#b20710] transition-colors">Try Next Server</button></div></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		if (currentUrl) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<iframe${attr('src', currentUrl)} allowfullscreen="" scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Video Player" style="overflow: hidden;"></iframe>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="absolute inset-0 flex items-center justify-center" style="background-color: var(--bg-secondary);"><p style="color: var(--text-secondary);">This server requires an IMDb ID which is not available.</p></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center justify-between px-3 py-2 text-xs" style="color: var(--text-muted); background-color: var(--bg-secondary);"><div><p>If the current server doesn't work, try switching to another server above.</p> <p class="hidden sm:block mt-1">Press <kbd class="px-1.5 py-0.5 rounded bg-[#333] text-[#ccc] font-mono text-[10px]">T</kbd> for theater mode, <kbd class="px-1.5 py-0.5 rounded bg-[#333] text-[#ccc] font-mono text-[10px]">F</kbd> for fullscreen</p></div> <div class="flex items-center gap-2"><button class="p-1.5 rounded hover:bg-[#333] transition-colors"${attr('title', 'Theater Mode (T)')}>`);

		{
			$$renderer.push('<!--[!-->');
			Maximize_2($$renderer, { size: 18 });
		}

		$$renderer.push(`<!--]--></button></div></div></div>`);
		bind_props($$props, { tmdbId, imdbId, type, season, episode });
	});
}

export { VideoPlayer as V };
