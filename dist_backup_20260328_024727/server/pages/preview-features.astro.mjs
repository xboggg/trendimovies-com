import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BH5Mr41D.mjs';
import { s as sanitize_props, a as spread_props, b as slot, i as fallback, d as ensure_array_like, c as attr, f as attr_class, o as attr_style, h as stringify, e as escape_html, j as bind_props } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
/* empty css                                            */
import { S as Star } from '../chunks/star_DHTXgEc7.mjs';
import { T as Trending_up } from '../chunks/trending-up_DlofYxrt.mjs';
import { I as Icon } from '../chunks/tv_BwBqCXmW.mjs';
import { P as Play } from '../chunks/play_C2FbJLkE.mjs';
import { C as Collections, P as PickYourMood, a as ContinueWatching } from '../chunks/ContinueWatching_C_SIXuTe.mjs';
import { o as onDestroy } from '../chunks/index-server_CS77EolT.mjs';
import { C as Calendar } from '../chunks/calendar_D8dvDgub.mjs';
import { C as Chevron_left } from '../chunks/chevron-left_DA35Owfk.mjs';
import { C as Chevron_right } from '../chunks/chevron-right_CYTSjxVf.mjs';
import { E as Eye } from '../chunks/eye_BC1Wb-tk.mjs';

function Bell_off($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M10.268 21a2 2 0 0 0 3.464 0" }],
		[
			"path",
			{
				"d": "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"
			}
		],
		["path", { "d": "m2 2 20 20" }],
		[
			"path",
			{
				"d": "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'bell-off' },
		$$sanitized_props,
		{
			/**
			 * @component @name BellOff
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAuMjY4IDIxYTIgMiAwIDAgMCAzLjQ2NCAwIiAvPgogIDxwYXRoIGQ9Ik0xNyAxN0g0YTEgMSAwIDAgMS0uNzQtMS42NzNDNC41OSAxMy45NTYgNiAxMi40OTkgNiA4YTYgNiAwIDAgMSAuMjU4LTEuNzQyIiAvPgogIDxwYXRoIGQ9Im0yIDIgMjAgMjAiIC8+CiAgPHBhdGggZD0iTTguNjY4IDMuMDFBNiA2IDAgMCAxIDE4IDhjMCAyLjY4Ny43NyA0LjY1MyAxLjcwNyA2LjA1IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/bell-off
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

function Bell($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M10.268 21a2 2 0 0 0 3.464 0" }],
		[
			"path",
			{
				"d": "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'bell' },
		$$sanitized_props,
		{
			/**
			 * @component @name Bell
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAuMjY4IDIxYTIgMiAwIDAgMCAzLjQ2NCAwIiAvPgogIDxwYXRoIGQ9Ik0zLjI2MiAxNS4zMjZBMSAxIDAgMCAwIDQgMTdoMTZhMSAxIDAgMCAwIC43NC0xLjY3M0MxOS40MSAxMy45NTYgMTggMTIuNDk5IDE4IDhBNiA2IDAgMCAwIDYgOGMwIDQuNDk5LTEuNDExIDUuOTU2LTIuNzM4IDcuMzI2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/bell
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

function Flame($$renderer, $$props) {
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
				"d": "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'flame' },
		$$sanitized_props,
		{
			/**
			 * @component @name Flame
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOC41IDE0LjVBMi41IDIuNSAwIDAgMCAxMSAxMmMwLTEuMzgtLjUtMi0xLTMtMS4wNzItMi4xNDMtLjIyNC00LjA1NCAyLTYgLjUgMi41IDIgNC45IDQgNi41IDIgMS42IDMgMy41IDMgNS41YTcgNyAwIDEgMS0xNCAwYzAtMS4xNTMuNDMzLTIuMjk0IDEtM2EyLjUgMi41IDAgMCAwIDIuNSAyLjV6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/flame
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

function Minus($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [["path", { "d": "M5 12h14" }]];

	Icon($$renderer, spread_props([
		{ name: 'minus' },
		$$sanitized_props,
		{
			/**
			 * @component @name Minus
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/minus
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

function Trending_down($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["polyline", { "points": "22 17 13.5 8.5 8.5 13.5 2 7" }],
		["polyline", { "points": "16 17 22 17 22 11" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'trending-down' },
		$$sanitized_props,
		{
			/**
			 * @component @name TrendingDown
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIyMiAxNyAxMy41IDguNSA4LjUgMTMuNSAyIDciIC8+CiAgPHBvbHlsaW5lIHBvaW50cz0iMTYgMTcgMjIgMTcgMjIgMTEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/trending-down
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

function Top10ThisWeek($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // Mock data if none provided
		displayItems;

		let items = fallback($$props['items'], () => [], true);

		const mockItems = [
			{
				id: 1,
				title: 'Thunderbolts*',
				poster_path: '/gbGHezV6yrhua0KfAgwzknWYJSf.jpg',
				backdrop_path: '/yDp5UQHBO2bz0vEo1F0VcDMSvnB.jpg',
				year: 2025,
				vote_average: 8.1,
				type: 'movie',
				genres: ['Action', 'Sci-Fi'],
				movement: 'new'
			},

			{
				id: 2,
				title: 'Sinners',
				poster_path: '/9xhm6AO1HXIY6JCYVFbOOJLPah.jpg',
				backdrop_path: '/1GjSaqMU5bYRnClPGhwEbBQirkp.jpg',
				year: 2025,
				vote_average: 7.9,
				type: 'movie',
				genres: ['Horror', 'Thriller'],
				movement: 'up',
				prev_rank: 5
			},

			{
				id: 3,
				title: 'Daredevil: Born Again',
				poster_path: '/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg',
				backdrop_path: '/3AEoFb8OKTEOkPbd7MwJt2kzOkv.jpg',
				year: 2025,
				vote_average: 8.5,
				type: 'series',
				genres: ['Action', 'Crime'],
				movement: 'down',
				prev_rank: 1
			},

			{
				id: 4,
				title: 'The Amateur',
				poster_path: '/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg',
				backdrop_path: '/dLCl4lEyrhdpICBBqMjSCYlOmcn.jpg',
				year: 2025,
				vote_average: 7.4,
				type: 'movie',
				genres: ['Thriller'],
				movement: 'up',
				prev_rank: 8
			},

			{
				id: 5,
				title: 'Adolescence',
				poster_path: '/v9De2KqsmIxSxNMVGODuBfH5wfj.jpg',
				backdrop_path: '/gkyEdMzP7wRBjLFkvJdch78nmcU.jpg',
				year: 2025,
				vote_average: 9.0,
				type: 'series',
				genres: ['Drama', 'Crime'],
				movement: 'same'
			},

			{
				id: 6,
				title: 'Snow White',
				poster_path: '/jFmMFbMEad0fmxl0EKkSAqVjfjT.jpg',
				backdrop_path: '/dLCl4lEyrhdpICBBqMjSCYlOmcn.jpg',
				year: 2025,
				vote_average: 5.8,
				type: 'movie',
				genres: ['Fantasy', 'Musical'],
				movement: 'down',
				prev_rank: 3
			},

			{
				id: 7,
				title: 'White Lotus S3',
				poster_path: '/bE2GiFLLJcOuG1bCOqnahC4bWtN.jpg',
				backdrop_path: null,
				year: 2025,
				vote_average: 8.2,
				type: 'series',
				genres: ['Comedy', 'Drama'],
				movement: 'up',
				prev_rank: 10
			},

			{
				id: 8,
				title: 'A Minecraft Movie',
				poster_path: '/jQBtmKFa9Bfhw44UOGYdCbluMmZ.jpg',
				backdrop_path: null,
				year: 2025,
				vote_average: 6.5,
				type: 'movie',
				genres: ['Adventure', 'Comedy'],
				movement: 'new'
			},

			{
				id: 9,
				title: 'Andor S2',
				poster_path: '/uNMlwRCPlZQhDaJlwL0Ivbu6v4r.jpg',
				backdrop_path: null,
				year: 2025,
				vote_average: 8.7,
				type: 'series',
				genres: ['Sci-Fi', 'Thriller'],
				movement: 'same'
			},

			{
				id: 10,
				title: 'Mission: Impossible 8',
				poster_path: '/z0R3d6dJPYMixkFnbnK37qTzLRi.jpg',
				backdrop_path: null,
				year: 2025,
				vote_average: 7.8,
				type: 'movie',
				genres: ['Action', 'Thriller'],
				movement: 'down',
				prev_rank: 7
			}
		];
		let mounted = false;

		function getRatingColor(rating) {
			if (rating >= 7) return '#22c55e';
			if (rating >= 5) return '#eab308';

			return '#ef4444';
		}

		displayItems = items.length > 0 ? items.slice(0, 10) : mockItems;

		$$renderer.push(`<section class="py-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center gap-3 mb-6"><div class="top10-badge svelte-g6w0by">TOP 10</div> <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">This Week</h2> <div class="h-px flex-1 bg-gradient-to-r from-red-600/50 to-transparent"></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);

		const each_array = ensure_array_like(displayItems);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			const rank = i + 1;

			$$renderer.push(`<a${attr('href', item.type === 'movie'
				? `/movie/${item.tmdb_id || item.id}`
				: `/tv/${item.tmdb_id || item.id}`)}${attr_class('top10-item group svelte-g6w0by', void 0, { 'mounted': mounted })}${attr_style(`--delay: ${stringify(i * 80)}ms`)}><div${attr_class('rank-number svelte-g6w0by', void 0, { 'rank-gold': rank <= 3 })}><span class="rank-text svelte-g6w0by">${escape_html(rank)}</span> `);

			if (rank <= 3) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="rank-glow svelte-g6w0by"></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div> <div class="poster-wrapper svelte-g6w0by"><img${attr('src', item.poster_path
				? `https://image.tmdb.org/t/p/w185${item.poster_path}`
				: '/images/no-poster.svg')}${attr('alt', item.title)} class="poster-img svelte-g6w0by" loading="lazy"/></div> <div class="flex-1 min-w-0 py-2"><h3 class="font-bold text-sm md:text-base truncate group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">${escape_html(item.title)}</h3> <div class="flex items-center gap-2 mt-1"><span class="type-tag svelte-g6w0by">${escape_html(item.type === 'movie' ? 'Movie' : 'Series')}</span> <span class="text-xs" style="color: var(--text-secondary);">${escape_html(item.year)}</span> `);

			if (item.genres) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<span class="text-xs hidden sm:inline" style="color: var(--text-muted);">${escape_html(item.genres.slice(0, 2).join(' · '))}</span>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div> <div class="flex items-center gap-2 mt-2">`);
			Star($$renderer, { size: 12, fill: '#fbbf24', class: 'text-amber-400' });
			$$renderer.push(`<!----> <div class="rating-bar-bg svelte-g6w0by"><div class="rating-bar-fill svelte-g6w0by"${attr_style(`width: ${stringify(item.vote_average * 10)}%; background: ${stringify(getRatingColor(item.vote_average))}`)}></div></div> <span class="text-xs font-bold"${attr_style(`color: ${stringify(getRatingColor(item.vote_average))}`)}>${escape_html(item.vote_average.toFixed(1))}</span></div></div> <div class="movement-indicator svelte-g6w0by">`);

			if (item.movement === 'new') {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<span class="movement-new svelte-g6w0by">NEW</span>`);
			} else if (item.movement === 'up') {
				$$renderer.push('<!--[1-->');
				$$renderer.push(`<div class="movement-up svelte-g6w0by">`);
				Trending_up($$renderer, { size: 14 });
				$$renderer.push(`<!----></div>`);
			} else if (item.movement === 'down') {
				$$renderer.push('<!--[2-->');
				$$renderer.push(`<div class="movement-down svelte-g6w0by">`);
				Trending_down($$renderer, { size: 14 });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push(`<div class="movement-same svelte-g6w0by">`);
				Minus($$renderer, { size: 14 });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="play-hover svelte-g6w0by">`);
			Play($$renderer, { size: 18, fill: 'white', class: 'text-white ml-0.5' });
			$$renderer.push(`<!----></div></a>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
		bind_props($$props, { items });
	});
}

function ComingSoon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let displayItems;
		let items = fallback($$props['items'], () => [], true);

		const mockItems = [
			{
				id: 1,
				title: 'Fantastic Four: First Steps',
				poster_path: '/vkDtTopxIYBqhSGBxXQaAfnCA3Q.jpg',
				backdrop_path: '/yDp5UQHBO2bz0vEo1F0VcDMSvnB.jpg',
				release_date: '2025-07-25',
				vote_average: 0,
				type: 'movie',
				genres: ['Action', 'Sci-Fi'],
				overview: 'Marvel\'s first family finally arrives in the MCU'
			},

			{
				id: 2,
				title: 'Superman',
				poster_path: '/dD7Mll7ByImz2VPmBbKqCbNIvkP.jpg',
				release_date: '2025-07-11',
				vote_average: 0,
				type: 'movie',
				genres: ['Action', 'Adventure'],
				overview: 'James Gunn reboots the Man of Steel for a new era'
			},

			{
				id: 3,
				title: 'Jurassic World Rebirth',
				poster_path: '/tkXD5AxzGMRsKEJarBVVaPcpJuZ.jpg',
				release_date: '2025-07-02',
				vote_average: 0,
				type: 'movie',
				genres: ['Action', 'Sci-Fi'],
				overview: 'Dinosaurs roam again in this epic new chapter'
			},

			{
				id: 4,
				title: 'The Running Man',
				poster_path: '/kwGo0fKRvFhn5ShGniaBWiEjfLs.jpg',
				release_date: '2025-11-07',
				vote_average: 0,
				type: 'movie',
				genres: ['Action', 'Thriller'],
				overview: 'A reimagining of the classic Stephen King story'
			},

			{
				id: 5,
				title: 'Tron: Ares',
				poster_path: '/xjhLjPxHqJxGnMVvEEMsaTdmhel.jpg',
				release_date: '2025-10-10',
				vote_average: 0,
				type: 'movie',
				genres: ['Sci-Fi', 'Action'],
				overview: 'Enter the Grid once more in this stunning sequel'
			},

			{
				id: 6,
				title: 'Wicked Part Two',
				poster_path: '/czM6cxO6djPJjimxD1pyW7GkO3L.jpg',
				release_date: '2025-11-21',
				vote_average: 0,
				type: 'movie',
				genres: ['Fantasy', 'Musical'],
				overview: 'The conclusion to the beloved Oz musical saga'
			}
		];

		// Countdown state
		let countdowns = {};
		let notified = new Set();

		onDestroy(() => {
		});

		function formatDate(dateStr) {
			return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		}

		displayItems = items.length > 0 ? items : mockItems;

		$$renderer.push(`<section class="py-8 svelte-1lte1s4"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 svelte-1lte1s4"><div class="flex items-center justify-between mb-6 svelte-1lte1s4"><div class="flex items-center gap-3 svelte-1lte1s4"><div class="coming-badge svelte-1lte1s4">`);
		Calendar($$renderer, { size: 14 });
		$$renderer.push(`<!----> COMING SOON</div> <h2 class="text-xl md:text-2xl font-extrabold svelte-1lte1s4" style="color: var(--text-primary);">Mark Your Calendar</h2></div> <div class="flex gap-2 svelte-1lte1s4"><button class="nav-btn svelte-1lte1s4">`);
		Chevron_left($$renderer, { size: 18 });
		$$renderer.push(`<!----></button> <button class="nav-btn svelte-1lte1s4">`);
		Chevron_right($$renderer, { size: 18 });
		$$renderer.push(`<!----></button></div></div> <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 scroll-smooth svelte-1lte1s4"><!--[-->`);

		const each_array = ensure_array_like(displayItems);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			const cd = countdowns[item.id];

			$$renderer.push(`<div class="coming-card group svelte-1lte1s4"${attr_style(`--delay: ${stringify(i * 100)}ms`)}><div class="card-poster svelte-1lte1s4"><img${attr('src', item.poster_path
				? `https://image.tmdb.org/t/p/w342${item.poster_path}`
				: '/images/no-poster.svg')}${attr('alt', item.title)} class="poster-img svelte-1lte1s4" loading="lazy"/> <div class="poster-overlay svelte-1lte1s4"><div class="countdown-grid svelte-1lte1s4">`);

			if (cd) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="cd-unit svelte-1lte1s4"><span class="cd-num svelte-1lte1s4">${escape_html(cd.days)}</span> <span class="cd-label svelte-1lte1s4">DAYS</span></div> <div class="cd-sep svelte-1lte1s4">:</div> <div class="cd-unit svelte-1lte1s4"><span class="cd-num svelte-1lte1s4">${escape_html(String(cd.hours).padStart(2, '0'))}</span> <span class="cd-label svelte-1lte1s4">HRS</span></div> <div class="cd-sep svelte-1lte1s4">:</div> <div class="cd-unit svelte-1lte1s4"><span class="cd-num svelte-1lte1s4">${escape_html(String(cd.mins).padStart(2, '0'))}</span> <span class="cd-label svelte-1lte1s4">MIN</span></div> <div class="cd-sep cd-blink svelte-1lte1s4">:</div> <div class="cd-unit svelte-1lte1s4"><span class="cd-num cd-sec svelte-1lte1s4">${escape_html(String(cd.secs).padStart(2, '0'))}</span> <span class="cd-label svelte-1lte1s4">SEC</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div></div> <button${attr_class('notify-btn svelte-1lte1s4', void 0, { 'notified': notified.has(item.id) })}${attr('title', notified.has(item.id) ? 'Cancel notification' : 'Notify me on release')}>`);

			if (notified.has(item.id)) {
				$$renderer.push('<!--[-->');
				Bell_off($$renderer, { size: 14 });
			} else {
				$$renderer.push('<!--[!-->');
				Bell($$renderer, { size: 14 });
			}

			$$renderer.push(`<!--]--></button></div> <div class="card-info svelte-1lte1s4"><h3 class="font-bold text-sm line-clamp-1 group-hover:text-amber-400 transition-colors svelte-1lte1s4" style="color: var(--text-primary);">${escape_html(item.title)}</h3> <div class="flex items-center gap-2 mt-1 svelte-1lte1s4"><span class="release-date svelte-1lte1s4">`);
			Calendar($$renderer, { size: 10 });
			$$renderer.push(`<!----> ${escape_html(formatDate(item.release_date))}</span></div> `);

			if (item.genres) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="flex flex-wrap gap-1 mt-2 svelte-1lte1s4"><!--[-->`);

				const each_array_1 = ensure_array_like(item.genres.slice(0, 2));

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let genre = each_array_1[$$index];

					$$renderer.push(`<span class="genre-tag svelte-1lte1s4">${escape_html(genre)}</span>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> `);

			if (item.overview) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<p class="text-xs mt-2 line-clamp-2 svelte-1lte1s4" style="color: var(--text-muted);">${escape_html(item.overview)}</p>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
		bind_props($$props, { items });
	});
}

function TrendingPulse($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let displayItems;
		let items = fallback($$props['items'], () => [], true);

		const mockItems = [
			{
				id: 1,
				title: 'Thunderbolts*',
				poster_path: '/gbGHezV6yrhua0KfAgwzknWYJSf.jpg',
				backdrop_path: '/yDp5UQHBO2bz0vEo1F0VcDMSvnB.jpg',
				year: 2025,
				vote_average: 8.1,
				type: 'movie',
				viewers: 14523,
				trend_score: 95
			},

			{
				id: 2,
				title: 'Sinners',
				poster_path: '/9xhm6AO1HXIY6JCYVFbOOJLPah.jpg',
				year: 2025,
				vote_average: 7.9,
				type: 'movie',
				viewers: 12847,
				trend_score: 88
			},

			{
				id: 3,
				title: 'Daredevil: Born Again',
				poster_path: '/hJRUMFnifWNaFnGqJLmhIzWMeyI.jpg',
				year: 2025,
				vote_average: 8.5,
				type: 'series',
				viewers: 11205,
				trend_score: 82
			},

			{
				id: 4,
				title: 'Adolescence',
				poster_path: '/v9De2KqsmIxSxNMVGODuBfH5wfj.jpg',
				year: 2025,
				vote_average: 9.0,
				type: 'series',
				viewers: 9832,
				trend_score: 76
			},

			{
				id: 5,
				title: 'The Amateur',
				poster_path: '/wkDBYVy5nkUMwcMzLSJAMiKAdKN.jpg',
				year: 2025,
				vote_average: 7.4,
				type: 'movie',
				viewers: 8491,
				trend_score: 71
			},

			{
				id: 6,
				title: 'White Lotus S3',
				poster_path: '/bE2GiFLLJcOuG1bCOqnahC4bWtN.jpg',
				year: 2025,
				vote_average: 8.2,
				type: 'series',
				viewers: 7644,
				trend_score: 65
			},

			{
				id: 7,
				title: 'Snow White',
				poster_path: '/jFmMFbMEad0fmxl0EKkSAqVjfjT.jpg',
				year: 2025,
				vote_average: 5.8,
				type: 'movie',
				viewers: 6102,
				trend_score: 58
			},

			{
				id: 8,
				title: 'Andor S2',
				poster_path: '/uNMlwRCPlZQhDaJlwL0Ivbu6v4r.jpg',
				year: 2025,
				vote_average: 8.7,
				type: 'series',
				viewers: 5480,
				trend_score: 52
			}
		];

		// Simulate live viewer count fluctuation
		let liveViewers = {};

		let totalViewers = 0;
		let pulseActive = false;

		onDestroy(() => {
		});

		function formatViewers(n) {
			if (n >= 1000) return (n / 1000).toFixed(1) + 'k';

			return n.toString();
		}

		function getHeatColor(score) {
			if (score >= 80) return '#ef4444';
			if (score >= 60) return '#f97316';
			if (score >= 40) return '#eab308';

			return '#22c55e';
		}

		displayItems = items.length > 0 ? items : mockItems;

		$$renderer.push(`<section class="py-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between mb-6"><div class="flex items-center gap-3"><div${attr_class('live-dot svelte-u9ctb6', void 0, { 'pulse': pulseActive })}></div> <h2 class="text-2xl md:text-3xl font-extrabold" style="color: var(--text-primary);">Trending Right Now</h2></div> <div class="total-viewers svelte-u9ctb6">`);
		Eye($$renderer, { size: 14 });
		$$renderer.push(`<!----> <span class="viewers-count svelte-u9ctb6">${escape_html(formatViewers(totalViewers))}</span> <span class="viewers-label svelte-u9ctb6">watching</span></div></div> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"><!--[-->`);

		const each_array = ensure_array_like(displayItems);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			const viewers = liveViewers[item.id] || 0;
			const score = item.trend_score || 50;

			$$renderer.push(`<a${attr('href', item.type === 'movie'
				? `/movie/${item.tmdb_id || item.id}`
				: `/tv/${item.tmdb_id || item.id}`)} class="pulse-card group svelte-u9ctb6"${attr_style(`--delay: ${stringify(i * 60)}ms`)}><div class="card-poster svelte-u9ctb6"><img${attr('src', item.poster_path
				? `https://image.tmdb.org/t/p/w342${item.poster_path}`
				: '/images/no-poster.svg')}${attr('alt', item.title)} class="poster-img svelte-u9ctb6" loading="lazy"/> <div class="heat-border svelte-u9ctb6"${attr_style(`--heat-color: ${stringify(getHeatColor(score))}`)}></div> <div class="live-badge svelte-u9ctb6"><div${attr_class('live-dot-small svelte-u9ctb6', void 0, { 'pulse': pulseActive })}></div> `);

			Eye($$renderer, { size: 10 });
			$$renderer.push(`<!----> <span>${escape_html(formatViewers(viewers))}</span></div> <div class="trend-score svelte-u9ctb6"${attr_style(`background: ${stringify(getHeatColor(score))}20; color: ${stringify(getHeatColor(score))}; border-color: ${stringify(getHeatColor(score))}40`)}>`);
			Flame($$renderer, { size: 10 });
			$$renderer.push(`<!----> ${escape_html(score)}</div> <div class="hover-overlay svelte-u9ctb6"><div class="play-circle svelte-u9ctb6">`);
			Play($$renderer, { size: 24, fill: 'white', class: 'text-white ml-1' });
			$$renderer.push(`<!----></div></div></div> <div class="card-info svelte-u9ctb6"><h3 class="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">${escape_html(item.title)}</h3> <div class="flex items-center justify-between mt-1"><span class="text-xs" style="color: var(--text-muted);">${escape_html(item.year)}</span> <div class="heat-bar svelte-u9ctb6"><div class="heat-fill svelte-u9ctb6"${attr_style(`width: ${stringify(score)}%; background: ${stringify(getHeatColor(score))}`)}></div></div></div></div></a>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
		bind_props($$props, { items });
	});
}

const $$PreviewFeatures = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Feature Preview", "noIndex": true, "data-astro-cid-gm2xlj2g": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 pt-8 pb-4" data-astro-cid-gm2xlj2g> <div class="text-center mb-8" data-astro-cid-gm2xlj2g> <h1 class="text-3xl md:text-4xl font-extrabold" style="color: var(--text-primary);" data-astro-cid-gm2xlj2g>
Feature Preview
</h1> <p class="text-sm mt-2" style="color: var(--text-muted);" data-astro-cid-gm2xlj2g>
Review each section below. All use mock data — pick your favorites to replace Popular TV Series.
</p> </div> <!-- Feature Navigation --> <div class="flex flex-wrap justify-center gap-2 mb-8" data-astro-cid-gm2xlj2g> <a href="#feature-6" class="feature-nav-btn" data-astro-cid-gm2xlj2g>#6 Top 10 This Week</a> <a href="#feature-7" class="feature-nav-btn" data-astro-cid-gm2xlj2g>#7 Collections</a> <a href="#feature-8" class="feature-nav-btn" data-astro-cid-gm2xlj2g>#8 Coming Soon</a> <a href="#feature-1" class="feature-nav-btn" data-astro-cid-gm2xlj2g>#1 Trending Pulse</a> <a href="#feature-2" class="feature-nav-btn" data-astro-cid-gm2xlj2g>#2 Pick Your Mood</a> <a href="#feature-3" class="feature-nav-btn" data-astro-cid-gm2xlj2g>#3 Continue Watching</a> </div> </div>  <div id="feature-6" class="feature-section" data-astro-cid-gm2xlj2g> <div class="feature-label" data-astro-cid-gm2xlj2g> <span class="feature-number" data-astro-cid-gm2xlj2g>#6</span> <span data-astro-cid-gm2xlj2g>Top 10 This Week — Ranked list with movement indicators & large numbers</span> </div> ${renderComponent($$result2, "Top10ThisWeek", Top10ThisWeek, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/components/Top10ThisWeek.svelte", "client:component-export": "default", "data-astro-cid-gm2xlj2g": true })} </div> <div class="section-divider" data-astro-cid-gm2xlj2g></div>  <div id="feature-7" class="feature-section" data-astro-cid-gm2xlj2g> <div class="feature-label" data-astro-cid-gm2xlj2g> <span class="feature-number" data-astro-cid-gm2xlj2g>#7</span> <span data-astro-cid-gm2xlj2g>Collections — Curated thematic bundles with stacked poster art</span> </div> ${renderComponent($$result2, "Collections", Collections, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/components/Collections.svelte", "client:component-export": "default", "data-astro-cid-gm2xlj2g": true })} </div> <div class="section-divider" data-astro-cid-gm2xlj2g></div>  <div id="feature-8" class="feature-section" data-astro-cid-gm2xlj2g> <div class="feature-label" data-astro-cid-gm2xlj2g> <span class="feature-number" data-astro-cid-gm2xlj2g>#8</span> <span data-astro-cid-gm2xlj2g>Coming Soon — Live countdown timers with "Notify Me" buttons</span> </div> ${renderComponent($$result2, "ComingSoon", ComingSoon, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/components/ComingSoon.svelte", "client:component-export": "default", "data-astro-cid-gm2xlj2g": true })} </div> <div class="section-divider" data-astro-cid-gm2xlj2g></div>  <div id="feature-1" class="feature-section" data-astro-cid-gm2xlj2g> <div class="feature-label" data-astro-cid-gm2xlj2g> <span class="feature-number" data-astro-cid-gm2xlj2g>#1</span> <span data-astro-cid-gm2xlj2g>Trending Right Now — Live viewer counts, heat scores & pulse animation</span> </div> ${renderComponent($$result2, "TrendingPulse", TrendingPulse, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/components/TrendingPulse.svelte", "client:component-export": "default", "data-astro-cid-gm2xlj2g": true })} </div> <div class="section-divider" data-astro-cid-gm2xlj2g></div>  <div id="feature-2" class="feature-section" data-astro-cid-gm2xlj2g> <div class="feature-label" data-astro-cid-gm2xlj2g> <span class="feature-number" data-astro-cid-gm2xlj2g>#2</span> <span data-astro-cid-gm2xlj2g>Pick Your Mood — Interactive mood buttons with curated results</span> </div> ${renderComponent($$result2, "PickYourMood", PickYourMood, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/components/PickYourMood.svelte", "client:component-export": "default", "data-astro-cid-gm2xlj2g": true })} </div> <div class="section-divider" data-astro-cid-gm2xlj2g></div>  <div id="feature-3" class="feature-section" data-astro-cid-gm2xlj2g> <div class="feature-label" data-astro-cid-gm2xlj2g> <span class="feature-number" data-astro-cid-gm2xlj2g>#3</span> <span data-astro-cid-gm2xlj2g>Continue Watching — Progress bars, episode tracking & resume</span> </div> ${renderComponent($$result2, "ContinueWatching", ContinueWatching, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/components/ContinueWatching.svelte", "client:component-export": "default", "data-astro-cid-gm2xlj2g": true })} </div> <div class="py-16" data-astro-cid-gm2xlj2g></div> ` })} `;
}, "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/preview-features.astro", void 0);

const $$file = "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/preview-features.astro";
const $$url = "/preview-features";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PreviewFeatures,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
