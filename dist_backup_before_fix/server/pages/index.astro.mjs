import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { s as sanitize_props, a as spread_props, b as slot, i as fallback, c as attr, e as escape_html, d as ensure_array_like, h as stringify, f as attr_class, j as bind_props, o as attr_style } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { o as onDestroy } from '../chunks/index-server_CS77EolT.mjs';
/* empty css                                 */
import { C as Chevron_left } from '../chunks/chevron-left_DA35Owfk.mjs';
import { C as Chevron_right } from '../chunks/chevron-right_CYTSjxVf.mjs';
import { S as Star } from '../chunks/star_DHTXgEc7.mjs';
import { I as Icon } from '../chunks/tv_BwBqCXmW.mjs';
import { C as Clock } from '../chunks/clock_CjYHN5RC.mjs';
import { C as Calendar } from '../chunks/calendar_D8dvDgub.mjs';
import { P as Play } from '../chunks/play_C2FbJLkE.mjs';
import { C as ContentRow } from '../chunks/ContentRow_DFJtx-HN.mjs';
import { m as getTrendingMovies, q as getNowPlayingMovies, r as getPopularMovies, k as getTopRatedMovies, d as discoverMovies, n as getTrendingTV, u as getPopularTV, v as getOnTheAirTV, e as getMovieGenres, g as getMovieDetails, i as getTVDetails, a as searchMovies } from '../chunks/tmdb_DKnoDzGN.mjs';

function Info($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["circle", { "cx": "12", "cy": "12", "r": "10" }],
		["path", { "d": "M12 16v-4" }],
		["path", { "d": "M12 8h.01" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'info' },
		$$sanitized_props,
		{
			/**
			 * @component @name Info
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJNMTIgMTZ2LTQiIC8+CiAgPHBhdGggZD0iTTEyIDhoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/info
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

function Trophy($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M6 9H4.5a2.5 2.5 0 0 1 0-5H6" }],
		["path", { "d": "M18 9h1.5a2.5 2.5 0 0 0 0-5H18" }],
		["path", { "d": "M4 22h16" }],
		[
			"path",
			{
				"d": "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
			}
		],

		[
			"path",
			{
				"d": "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
			}
		],
		["path", { "d": "M18 2H6v7a6 6 0 0 0 12 0V2Z" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'trophy' },
		$$sanitized_props,
		{
			/**
			 * @component @name Trophy
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiA5SDQuNWEyLjUgMi41IDAgMCAxIDAtNUg2IiAvPgogIDxwYXRoIGQ9Ik0xOCA5aDEuNWEyLjUgMi41IDAgMCAwIDAtNUgxOCIgLz4KICA8cGF0aCBkPSJNNCAyMmgxNiIgLz4KICA8cGF0aCBkPSJNMTAgMTQuNjZWMTdjMCAuNTUtLjQ3Ljk4LS45NyAxLjIxQzcuODUgMTguNzUgNyAyMC4yNCA3IDIyIiAvPgogIDxwYXRoIGQ9Ik0xNCAxNC42NlYxN2MwIC41NS40Ny45OC45NyAxLjIxQzE2LjE1IDE4Ljc1IDE3IDIwLjI0IDE3IDIyIiAvPgogIDxwYXRoIGQ9Ik0xOCAySDZ2N2E2IDYgMCAwIDAgMTIgMFYyWiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/trophy
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

function Users($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
		["circle", { "cx": "9", "cy": "7", "r": "4" }],
		["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
		["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'users' },
		$$sanitized_props,
		{
			/**
			 * @component @name Users
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg2YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iNyIgcj0iNCIgLz4KICA8cGF0aCBkPSJNMjIgMjF2LTJhNCA0IDAgMCAwLTMtMy44NyIgLz4KICA8cGF0aCBkPSJNMTYgMy4xM2E0IDQgMCAwIDEgMCA3Ljc1IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/users
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

function HeroCarousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let carouselItems,
			currentItem,
			backdropUrl,
			posterUrl;

		let featured = fallback($$props['featured'], null);
		let trending = fallback($$props['trending'], () => [], true);
		let currentIndex = 0;

		onDestroy(() => {
		});

		function getHref(item) {
			return item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
		}

		function formatRuntime(minutes) {
			if (!minutes) return '';

			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;

			return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
		}

		function formatVoteCount(count) {
			if (!count) return '0';
			if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;

			return count.toString();
		}

		function formatReleaseDate(dateStr) {
			if (!dateStr) return '';

			return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
		}

		carouselItems = trending.slice(0, 8);
		currentItem = carouselItems[currentIndex] || featured;

		backdropUrl = currentItem?.backdrop_path
			? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
			: '/images/no-backdrop.svg';

		posterUrl = currentItem?.poster_path
			? `https://image.tmdb.org/t/p/w500${currentItem.poster_path}`
			: '/images/no-poster.svg';

		$$renderer.push(`<section class="relative h-[70vh] md:h-[85vh] lg:h-[95vh] overflow-hidden bg-black svelte-1yuhgbq"><div class="absolute inset-0 svelte-1yuhgbq"><!---->`);

		{
			$$renderer.push(`<div class="absolute inset-0 animate-kenburns svelte-1yuhgbq"><img${attr('src', backdropUrl)}${attr('alt', currentItem?.title || 'Featured')} class="w-full h-full object-cover svelte-1yuhgbq"/></div>`);
		}

		$$renderer.push(`<!----> <div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 md:via-black/70 to-black/50 md:to-transparent svelte-1yuhgbq"></div> <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 md:via-black/40 to-transparent svelte-1yuhgbq"></div> <div class="absolute inset-0 bg-gradient-to-b from-black/70 md:from-black/60 via-transparent to-transparent h-40 svelte-1yuhgbq"></div> <div class="absolute inset-0 opacity-[0.03] bg-noise svelte-1yuhgbq"></div> <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50 svelte-1yuhgbq"></div></div> <button class="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center nav-arrow svelte-1yuhgbq">`);
		Chevron_left($$renderer, { size: 24, class: 'text-white md:w-8 md:h-8' });
		$$renderer.push(`<!----></button> <button class="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center nav-arrow svelte-1yuhgbq">`);
		Chevron_right($$renderer, { size: 24, class: 'text-white md:w-8 md:h-8' });
		$$renderer.push(`<!----></button> <div class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 svelte-1yuhgbq"><div class="flex h-full items-center pt-16 md:pt-20 svelte-1yuhgbq">`);

		if (currentItem) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="flex-1 flex items-center gap-12 svelte-1yuhgbq"><div class="flex-1 max-w-2xl svelte-1yuhgbq"><div class="inline-flex items-center gap-2 mb-4 svelte-1yuhgbq"><span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider svelte-1yuhgbq" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #000;">${escape_html(currentItem.type === 'movie' ? 'Movie' : 'Series')}</span> `);

			if (currentItem.year) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<span class="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm svelte-1yuhgbq">${escape_html(currentItem.year)}</span>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div> <h1 class="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 md:mb-4 leading-[1.1] tracking-tight svelte-1yuhgbq"><!---->`);

			{
				$$renderer.push(`<span class="inline-block animate-slideUp svelte-1yuhgbq">${escape_html(currentItem.title)}</span>`);
			}

			$$renderer.push(`<!----></h1> `);

			if (currentItem.tagline) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<p class="text-sm md:text-lg italic text-gray-300 mb-3 md:mb-6 line-clamp-1 svelte-1yuhgbq">"${escape_html(currentItem.tagline)}"</p>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> <div class="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-6 svelte-1yuhgbq"><div class="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 rounded-xl rating-badge svelte-1yuhgbq">`);

			Star($$renderer, {
				size: 16,
				fill: '#fbbf24',
				class: 'text-amber-400 md:w-5 md:h-5'
			});

			$$renderer.push(`<!----> <span class="text-base md:text-xl font-black text-white svelte-1yuhgbq">${escape_html(currentItem.vote_average.toFixed(1))}</span> <span class="text-xs md:text-sm text-gray-400 svelte-1yuhgbq">/10</span></div> `);

			if (currentItem.vote_count) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="hidden sm:flex items-center gap-2 text-gray-300 svelte-1yuhgbq">`);
				Users($$renderer, { size: 14, class: 'md:w-4 md:h-4' });
				$$renderer.push(`<!----> <span class="text-xs md:text-sm svelte-1yuhgbq">${escape_html(formatVoteCount(currentItem.vote_count))} votes</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> `);

			if (currentItem.runtime) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="flex items-center gap-1 md:gap-2 text-gray-300 svelte-1yuhgbq">`);
				Clock($$renderer, { size: 14, class: 'md:w-4 md:h-4' });
				$$renderer.push(`<!----> <span class="text-xs md:text-sm svelte-1yuhgbq">${escape_html(formatRuntime(currentItem.runtime))}</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> `);

			if (currentItem.release_date) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="hidden md:flex items-center gap-2 text-gray-300 svelte-1yuhgbq">`);
				Calendar($$renderer, { size: 16 });
				$$renderer.push(`<!----> <span class="text-sm svelte-1yuhgbq">${escape_html(formatReleaseDate(currentItem.release_date))}</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (currentItem.genres && currentItem.genres.length > 0) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-6 svelte-1yuhgbq"><!--[-->`);

				const each_array = ensure_array_like(currentItem.genres.slice(0, 3));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let genre = each_array[$$index];

					$$renderer.push(`<span class="px-2 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium genre-tag svelte-1yuhgbq">${escape_html(genre.name)}</span>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> <p class="text-gray-300 text-sm md:text-base lg:text-lg mb-4 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl svelte-1yuhgbq">${escape_html(currentItem.overview || 'No description available.')}</p> <div class="flex flex-wrap gap-2 md:gap-4 svelte-1yuhgbq"><a${attr('href', getHref(currentItem))} class="btn-primary svelte-1yuhgbq">`);
			Play($$renderer, { size: 18, fill: 'white', class: 'md:w-[22px] md:h-[22px]' });
			$$renderer.push(`<!----> <span class="hidden sm:inline svelte-1yuhgbq">Watch Now</span> <span class="sm:hidden svelte-1yuhgbq">Watch</span></a> <a${attr('href', getHref(currentItem))} class="btn-secondary svelte-1yuhgbq">`);
			Info($$renderer, { size: 18, class: 'md:w-[22px] md:h-[22px]' });
			$$renderer.push(`<!----> <span class="hidden sm:inline svelte-1yuhgbq">More Info</span> <span class="sm:hidden svelte-1yuhgbq">Info</span></a></div></div> <div class="hidden xl:block flex-shrink-0 svelte-1yuhgbq"><!---->`);

			{
				$$renderer.push(`<div class="poster-card animate-fadeInRight svelte-1yuhgbq"><img${attr('src', posterUrl)}${attr('alt', currentItem.title)} class="w-72 h-auto rounded-2xl shadow-2xl svelte-1yuhgbq"/> <div class="absolute -bottom-4 -right-4 w-24 h-24 rounded-full rating-circle flex items-center justify-center flex-col svelte-1yuhgbq"><span class="text-2xl font-black text-white svelte-1yuhgbq">${escape_html(currentItem.vote_average.toFixed(1))}</span> <span class="text-[10px] text-amber-400 uppercase tracking-wider svelte-1yuhgbq">Rating</span></div></div>`);
			}

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div> <div class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-2 md:gap-3 z-20 svelte-1yuhgbq"><!--[-->`);

		const each_array_1 = ensure_array_like(carouselItems);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let item = each_array_1[index];

			$$renderer.push(`<button class="group relative svelte-1yuhgbq"${attr('aria-label', `Go to slide ${stringify(index + 1)}`)}><div${attr_class(
				`w-1 h-6 md:h-8 rounded-full transition-all duration-300 ${stringify(index === currentIndex
					? 'bg-amber-400 !h-8 md:!h-12'
					: 'bg-white/30 group-hover:bg-white/50')}`,
				'svelte-1yuhgbq'
			)}></div> `);

			if (index === currentIndex) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block svelte-1yuhgbq">${escape_html(item.title)}</div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]--></div> <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/10 svelte-1yuhgbq"><!---->`);

		{
			$$renderer.push(`<div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 animate-progress svelte-1yuhgbq"></div>`);
		}

		$$renderer.push(`<!----></div></div></section>`);
		bind_props($$props, { featured, trending });
	});
}

function FeaturedSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let featuredOscar;
		let oscarMovies = fallback($$props['oscarMovies'], () => [], true);
		let top2026 = fallback($$props['top2026'], () => [], true);
		let top2024_25 = fallback($$props['top2024_25'], () => [], true);
		let top2020_23 = fallback($$props['top2020_23'], () => [], true);
		let boxOffice = fallback($$props['boxOffice'], () => [], true);
		let activeTab = 'boxoffice';
		let isPaused = false;

		function getPosterUrl(path) {
			if (!path) return '/images/no-poster.svg';

			return `https://image.tmdb.org/t/p/w342${path}`;
		}

		function getBackdropUrl(path) {
			if (!path) return '/images/no-backdrop.svg';

			return `https://image.tmdb.org/t/p/w780${path}`;
		}

		featuredOscar = oscarMovies[0];

		$$renderer.push(`<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 svelte-100vxnd"><div class="grid lg:grid-cols-2 gap-6 svelte-100vxnd"><div class="rounded-2xl relative overflow-hidden svelte-100vxnd" style="background-color: var(--bg-card); border: 1px solid var(--border);"><div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 z-10 svelte-100vxnd"></div> `);

		if (featuredOscar) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<a${attr('href', `/movie/${featuredOscar.id}`)} class="block relative h-[400px] overflow-hidden group svelte-100vxnd"><img${attr('src', getBackdropUrl(featuredOscar.backdrop_path || featuredOscar.poster_path))}${attr('alt', featuredOscar.title)} class="w-full h-full object-cover transition-transform group-hover:scale-105 svelte-100vxnd"/> <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent svelte-100vxnd"></div> <div class="absolute bottom-4 left-4 right-4 svelte-100vxnd"><div class="flex items-center gap-2 mb-2 svelte-100vxnd"><span class="px-2 py-1 rounded text-xs font-bold bg-amber-500 text-black svelte-100vxnd">16 Nominations</span> <span class="flex items-center gap-1 text-amber-400 text-sm svelte-100vxnd">`);
			Star($$renderer, { size: 14, fill: 'currentColor' });
			$$renderer.push(`<!----> ${escape_html(featuredOscar.vote_average.toFixed(1))}</span></div> <h3 class="text-2xl font-bold text-white svelte-100vxnd">${escape_html(featuredOscar.title)}</h3></div></a>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="p-4 svelte-100vxnd"><div class="flex items-center justify-between mb-3 svelte-100vxnd"><div class="flex items-center gap-2 svelte-100vxnd">`);
		Trophy($$renderer, { size: 18, class: 'text-amber-400' });
		$$renderer.push(`<!----> <h2 class="text-sm font-bold svelte-100vxnd" style="color: var(--text-primary);">2026 Oscar Nominations</h2></div> <a href="/oscars-2026" class="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors svelte-100vxnd">View All →</a></div> <div class="relative overflow-x-auto hide-scrollbar svelte-100vxnd"><div${attr_class('oscar-scroll-container flex gap-3 svelte-100vxnd', void 0, { 'paused': isPaused })}><!--[-->`);

		const each_array = ensure_array_like(oscarMovies);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let movie = each_array[i];

			$$renderer.push(`<a${attr('href', `/movie/${movie.id}`)} class="flex-shrink-0 w-24 group svelte-100vxnd"><div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-1 svelte-100vxnd"><img${attr('src', getPosterUrl(movie.poster_path))}${attr('alt', movie.title)} class="w-full h-full object-cover transition-transform group-hover:scale-110 svelte-100vxnd"/> <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity svelte-100vxnd"></div></div> <p class="text-[10px] font-medium line-clamp-1 text-center svelte-100vxnd" style="color: var(--text-primary);">${escape_html(movie.title)}</p></a>`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array_1 = ensure_array_like(oscarMovies);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let movie = each_array_1[i];

			$$renderer.push(`<a${attr('href', `/movie/${movie.id}`)} class="flex-shrink-0 w-24 group svelte-100vxnd"><div class="relative aspect-[2/3] rounded-lg overflow-hidden mb-1 svelte-100vxnd"><img${attr('src', getPosterUrl(movie.poster_path))}${attr('alt', movie.title)} class="w-full h-full object-cover transition-transform group-hover:scale-110 svelte-100vxnd"/> <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity svelte-100vxnd"></div></div> <p class="text-[10px] font-medium line-clamp-1 text-center svelte-100vxnd" style="color: var(--text-primary);">${escape_html(movie.title)}</p></a>`);
		}

		$$renderer.push(`<!--]--></div></div></div></div> <div class="rounded-2xl p-5 relative overflow-hidden svelte-100vxnd" style="background-color: var(--bg-card); border: 1px solid var(--border);"><div class="flex flex-wrap gap-1 mb-4 pb-3 svelte-100vxnd" style="border-bottom: 1px solid var(--border);"><button${attr_class('px-3 py-1.5 rounded-lg text-xs font-medium transition-all svelte-100vxnd', void 0, {
			'bg-amber-500': activeTab === 'boxoffice',
			'text-black': activeTab === 'boxoffice'
		})}${attr_style('')}>Box Office</button> <button${attr_class('px-3 py-1.5 rounded-lg text-xs font-medium transition-all svelte-100vxnd', void 0, {
			'bg-amber-500': activeTab === 'top2026',
			'text-black': activeTab === 'top2026'
		})}${attr_style('color: var(--text-secondary); background-color: var(--bg-hover);'
			)}>Top 2026</button> <button${attr_class('px-3 py-1.5 rounded-lg text-xs font-medium transition-all svelte-100vxnd', void 0, {
			'bg-amber-500': activeTab === 'top2024_25',
			'text-black': activeTab === 'top2024_25'
		})}${attr_style('color: var(--text-secondary); background-color: var(--bg-hover);'
			)}>2024-25</button> <button${attr_class('px-3 py-1.5 rounded-lg text-xs font-medium transition-all svelte-100vxnd', void 0, {
			'bg-amber-500': activeTab === 'top2020_23',
			'text-black': activeTab === 'top2020_23'
		})}${attr_style('color: var(--text-secondary); background-color: var(--bg-hover);'
			)}>2020-23</button> <button${attr_class('px-3 py-1.5 rounded-lg text-xs font-medium transition-all svelte-100vxnd', void 0, {
			'bg-amber-500': activeTab === 'franchise',
			'text-black': activeTab === 'franchise'
		})}${attr_style('color: var(--text-secondary); background-color: var(--bg-hover);'
			)}>Franchise</button></div> <div class="min-h-[280px] svelte-100vxnd">`);

		{
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="space-y-2 svelte-100vxnd"><!--[-->`);

			const each_array_2 = ensure_array_like(boxOffice.slice(0, 7));

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let entry = each_array_2[i];

				$$renderer.push(`<a${attr('href', entry.tmdb_id ? `/movie/${entry.tmdb_id}` : '/box-office')} class="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] svelte-100vxnd"><span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold svelte-100vxnd" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">${escape_html(i + 1)}</span> `);

				if (entry.poster_path) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<img${attr('src', getPosterUrl(entry.poster_path))}${attr('alt', entry.title)} class="w-8 h-12 rounded object-cover svelte-100vxnd"/>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> <div class="flex-1 min-w-0 svelte-100vxnd"><p class="text-sm font-medium truncate svelte-100vxnd" style="color: var(--text-primary);">${escape_html(entry.title)}</p> <p class="text-xs svelte-100vxnd" style="color: var(--text-muted);">Weekend: ${escape_html(entry.weekend_gross)}</p></div> <div class="text-right svelte-100vxnd"><p class="text-xs font-semibold text-green-500 svelte-100vxnd">${escape_html(entry.total_gross)}</p> <p class="text-xs svelte-100vxnd" style="color: var(--text-muted);">Total</p></div></a>`);
			}

			$$renderer.push(`<!--]--></div> <a href="/box-office" class="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 mt-3 pt-3 svelte-100vxnd" style="border-top: 1px solid var(--border);">View Full Box Office →</a>`);
		}

		$$renderer.push(`<!--]--></div></div></div></section>`);
		bind_props($$props, { oscarMovies, top2026, top2024_25, top2020_23, boxOffice });
	});
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const POSTGREST_URL = "http://localhost:3001";
  async function getLatestAdditions() {
    try {
      const res = await fetch(
        `${POSTGREST_URL}/movies?has_downloads=eq.true&order=created_at.desc&limit=20&select=tmdb_id,title,year,poster_path,backdrop_path,vote_average,vote_count,popularity,overview`
      );
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch latest additions:", e);
      return [];
    }
  }
  const today = /* @__PURE__ */ new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const threeMonthsLater = new Date(today);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const futureStr = threeMonthsLater.toISOString().split("T")[0];
  const [trending, nowPlaying, popular, topRated, upcomingData, trendingTV, popularTV, onTheAirTV, actionMovies, comedyMovies, movieGenres, latestAdditions] = await Promise.all([
    getTrendingMovies("week"),
    getNowPlayingMovies(),
    getPopularMovies(),
    getTopRatedMovies(),
    discoverMovies({
      "primary_release_date.gte": tomorrowStr,
      "primary_release_date.lte": futureStr,
      sort_by: "popularity.desc"
    }),
    getTrendingTV("week"),
    getPopularTV(),
    getOnTheAirTV(),
    discoverMovies({ with_genres: "28", sort_by: "popularity.desc" }),
    discoverMovies({ with_genres: "35", sort_by: "popularity.desc" }),
    getMovieGenres(),
    getLatestAdditions()
  ]);
  const upcoming = (upcomingData?.results || []).filter((m) => m.poster_path);
  const genreMap = new Map(movieGenres.map((g) => [g.id, g.name]));
  const heroMovieIds = (trending || []).slice(0, 8).map((m) => m.id);
  const heroDetailsPromises = heroMovieIds.map((id) => getMovieDetails(id).catch(() => null));
  const heroDetails = await Promise.all(heroDetailsPromises);
  function transformMovie(m) {
    return {
      id: m.id,
      tmdb_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      vote_average: m.vote_average,
      vote_count: m.vote_count,
      popularity: m.popularity,
      year: m.release_date ? new Date(m.release_date).getFullYear() : null,
      overview: m.overview,
      genre_ids: m.genre_ids,
      type: "movie"
    };
  }
  function transformTV(t) {
    return {
      id: t.id,
      tmdb_id: t.id,
      title: t.name,
      poster_path: t.poster_path,
      backdrop_path: t.backdrop_path,
      vote_average: t.vote_average,
      vote_count: t.vote_count,
      popularity: t.popularity,
      year: t.first_air_date ? new Date(t.first_air_date).getFullYear() : null,
      overview: t.overview,
      type: "series"
    };
  }
  function transformDbMovie(m) {
    return {
      id: m.tmdb_id,
      tmdb_id: m.tmdb_id,
      title: m.title,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      vote_average: m.vote_average || 0,
      vote_count: m.vote_count || 0,
      popularity: m.popularity || 0,
      year: m.year,
      overview: m.overview,
      type: "movie",
      has_downloads: true
    };
  }
  const heroItems = (trending || []).slice(0, 8).map((m, index) => {
    const details = heroDetails[index];
    return {
      id: m.id,
      tmdb_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      vote_average: m.vote_average,
      vote_count: m.vote_count,
      popularity: m.popularity,
      year: m.release_date ? new Date(m.release_date).getFullYear() : null,
      overview: m.overview,
      type: "movie",
      // Full details from API
      tagline: details?.tagline || null,
      runtime: details?.runtime || null,
      release_date: m.release_date || details?.release_date || null,
      genres: details?.genres || (m.genre_ids || []).map((id) => ({ id, name: genreMap.get(id) || "" }))
    };
  });
  const trendingItems = (trending || []).slice(0, 10).map(transformMovie);
  const featured = heroItems[0] || null;
  const nowPlayingItems = (nowPlaying || []).map(transformMovie);
  const popularItems = (popular || []).map(transformMovie);
  const topRatedItems = (topRated || []).map(transformMovie);
  const latestAdditionItems = (latestAdditions || []).map(transformDbMovie);
  const upcomingItems = (upcoming || []).map((m) => ({
    id: m.id,
    tmdb_id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    vote_average: m.vote_average,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null,
    release_date: m.release_date,
    type: "movie"
  }));
  const tvItems = (trendingTV || []).map(transformTV);
  const popularTVItems = (popularTV || []).map(transformTV);
  const onTheAirFiltered = (onTheAirTV || []).filter((t) => t.poster_path);
  const onTheAirDetails = await Promise.all(
    onTheAirFiltered.map((t) => getTVDetails(t.id).catch(() => null))
  );
  const onTheAirItems = onTheAirFiltered.map((t, index) => {
    const base = transformTV(t);
    const details = onTheAirDetails[index];
    const lastEp = details?.last_episode_to_air;
    if (lastEp && lastEp.season_number != null && lastEp.episode_number != null) {
      const s = String(lastEp.season_number).padStart(2, "0");
      const e = String(lastEp.episode_number).padStart(2, "0");
      return { ...base, episode_info: `S${s}E${e}` };
    }
    return base;
  });
  const actionItems = (actionMovies?.results || []).slice(0, 15).map(transformMovie);
  const comedyItems = (comedyMovies?.results || []).slice(0, 15).map(transformMovie);
  const oscarTitles = [
    "Sinners",
    "One Battle After Another",
    "Bugonia",
    "F1",
    "Frankenstein",
    "Hamnet",
    "Marty Supreme",
    "The Secret Agent",
    "Sentimental Value",
    "Train Dreams"
  ];
  async function searchOscarMovie(title) {
    try {
      const result = await searchMovies(title, 1);
      if (result.results && result.results.length > 0) {
        const movie = result.results.find((m) => {
          const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
          return year >= 2024 && year <= 2026;
        }) || result.results[0];
        return transformMovie(movie);
      }
    } catch (e) {
      console.error(`Failed to search Oscar movie ${title}:`, e);
    }
    return null;
  }
  const oscarResults = await Promise.all(oscarTitles.map(searchOscarMovie));
  const oscarMovies = oscarResults.filter((m) => m !== null);
  const [top2026Data, top2024_25Data, top2020_23Data] = await Promise.all([
    discoverMovies({
      "primary_release_date.gte": "2026-01-01",
      "primary_release_date.lte": "2026-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "50"
    }),
    discoverMovies({
      "primary_release_date.gte": "2024-01-01",
      "primary_release_date.lte": "2025-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "200"
    }),
    discoverMovies({
      "primary_release_date.gte": "2020-01-01",
      "primary_release_date.lte": "2023-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": "500"
    })
  ]);
  const top2026 = (top2026Data?.results || []).slice(0, 10).map(transformMovie);
  const top2024_25 = (top2024_25Data?.results || []).slice(0, 10).map(transformMovie);
  const top2020_23 = (top2020_23Data?.results || []).slice(0, 10).map(transformMovie);
  const boxOfficeData = [
    { rank: 1, title: "Wuthering Heights", weekend_gross: "$34.8M", total_gross: "$40.0M", tmdb_id: 0, poster_path: null },
    { rank: 2, title: "GOAT", weekend_gross: "$26.0M", total_gross: "$32.0M", tmdb_id: 0, poster_path: null },
    { rank: 3, title: "Crime 101", weekend_gross: "$15.4M", total_gross: "$17.7M", tmdb_id: 0, poster_path: null },
    { rank: 4, title: "Send Help", weekend_gross: "$8.9M", total_gross: "$49.6M", tmdb_id: 0, poster_path: null },
    { rank: 5, title: "Solo Mio", weekend_gross: "$6.8M", total_gross: "$18.5M", tmdb_id: 0, poster_path: null },
    { rank: 6, title: "Zootopia 2", weekend_gross: "$3.7M", total_gross: "$420.6M", tmdb_id: 0, poster_path: null },
    { rank: 7, title: "Avatar: Fire and Ash", weekend_gross: "$3.3M", total_gross: "$396.5M", tmdb_id: 0, poster_path: null }
  ];
  const boxOfficeWithPosters = await Promise.all(boxOfficeData.map(async (entry) => {
    try {
      const result = await searchMovies(entry.title, 1);
      if (result.results && result.results.length > 0) {
        const movie = result.results[0];
        return { ...entry, tmdb_id: movie.id, poster_path: movie.poster_path };
      }
    } catch (e) {
    }
    return entry;
  }));
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Watch Movies & TV Series Online Free" }, { "default": async ($$result2) => renderTemplate`  ${renderComponent($$result2, "HeroCarousel", HeroCarousel, { "client:load": true, "featured": featured, "trending": heroItems, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/HeroCarousel.svelte", "client:component-export": "default" })}  ${trendingItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:load": true, "title": "Trending This Week", "items": trendingItems, "seeAllLink": "/trending", "autoScroll": true, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${renderComponent($$result2, "FeaturedSection", FeaturedSection, { "client:load": true, "oscarMovies": oscarMovies, "top2026": top2026, "top2024_25": top2024_25, "top2020_23": top2020_23, "boxOffice": boxOfficeWithPosters, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/FeaturedSection.svelte", "client:component-export": "default" })}  ${latestAdditionItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:load": true, "title": "Latest Additions", "items": latestAdditionItems, "seeAllLink": "/movies/latest", "autoScroll": false, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${nowPlayingItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:load": true, "title": "Now Playing in Theaters", "items": nowPlayingItems, "seeAllLink": "/movies?filter=now_playing", "autoScroll": true, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${upcomingItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Coming Soon", "items": upcomingItems, "seeAllLink": "/movies/upcoming", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${popularItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Popular Movies", "items": popularItems, "seeAllLink": "/movies", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${tvItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Trending TV Series", "items": tvItems, "seeAllLink": "/series", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${popularTVItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Popular TV Series", "items": popularTVItems, "seeAllLink": "/series", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${onTheAirItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "New Episodes This Week", "items": onTheAirItems, "seeAllLink": "/series/new-episodes", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${actionItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Action Movies", "items": actionItems, "seeAllLink": "/genre/action", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${comedyItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Comedy Movies", "items": comedyItems, "seeAllLink": "/genre/comedy", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`} ${topRatedItems.length > 0 && renderTemplate`${renderComponent($$result2, "ContentRow", ContentRow, { "client:visible": true, "title": "Top Rated", "items": topRatedItems, "seeAllLink": "/top-rated", "client:component-hydration": "visible", "client:component-path": "/var/www/trendimovies/src/components/ContentRow.svelte", "client:component-export": "default" })}`}` })}`;
}, "/var/www/trendimovies/src/pages/index.astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
