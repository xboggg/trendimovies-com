import { s as sanitize_props, a as spread_props, b as slot, c as attr, e as escape_html, o as attr_style, h as stringify, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
/* empty css                         */
import { P as Play } from './play_C2FbJLkE.mjs';
import { C as Clock } from './clock_CjYHN5RC.mjs';
import { I as Icon } from './tv_BwBqCXmW.mjs';
import { S as Star } from './star_DHTXgEc7.mjs';

function Trending_up($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["polyline", { "points": "22 7 13.5 15.5 8.5 10.5 2 17" }],
		["polyline", { "points": "16 7 22 7 22 13" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'trending-up' },
		$$sanitized_props,
		{
			/**
			 * @component @name TrendingUp
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIyMiA3IDEzLjUgMTUuNSA4LjUgMTAuNSAyIDE3IiAvPgogIDxwb2x5bGluZSBwb2ludHM9IjE2IDcgMjIgNyAyMiAxMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/trending-up
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

function MovieCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // Format release date as "Feb 14, 2026"
			displayDate,
			posterUrl,
			movieId,
			href,
			ratingColor;

		let item = $$props['item'];

		function formatReleaseDate(dateStr) {
			if (!dateStr) return '';

			return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		}

		function formatRuntime(minutes) {
			if (!minutes) return '';

			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;

			return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
		}

		displayDate = item.release_date
			? formatReleaseDate(item.release_date)
			: item.year || 'N/A';

		posterUrl = item.poster_path
			? `https://image.tmdb.org/t/p/w500${item.poster_path}`
			: '/images/no-poster.svg';

		movieId = item.tmdb_id || item.id;
		href = item.type === 'movie' ? `/movie/${movieId}` : `/tv/${movieId}`;

		ratingColor = item.vote_average >= 7
			? '#22c55e'
			: item.vote_average >= 5 ? '#eab308' : '#ef4444';

		$$renderer.push(`<a${attr('href', href)} class="group relative block rounded-xl overflow-hidden movie-card svelte-156698q"><div class="aspect-[2/3] relative overflow-hidden"><img${attr('src', posterUrl)}${attr('alt', item.title)} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/> <div class="absolute top-2 left-2 z-10"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider type-badge svelte-156698q">${escape_html(item.type === 'movie' ? 'Movie' : 'Series')}</span></div> `);

		if (item.episode_info) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="absolute top-2 right-2 z-10"><span class="px-2 py-0.5 rounded text-[10px] font-bold episode-badge svelte-156698q">${escape_html(item.episode_info)}</span></div>`);
		} else if (item.has_downloads) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<div class="absolute top-2 right-2 z-10"><span class="px-2 py-0.5 rounded text-[10px] font-bold quality-badge svelte-156698q">HD</span></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="absolute bottom-2 right-2 z-10 rating-circle svelte-156698q"${attr_style(`--rating-color: ${stringify(ratingColor)}`)}><svg class="w-10 h-10 -rotate-90"><circle cx="20" cy="20" r="16" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.1)" stroke-width="3"></circle><circle cx="20" cy="20" r="16" fill="none"${attr('stroke', ratingColor)} stroke-width="3"${attr('stroke-dasharray', `${stringify(item.vote_average / 10 * 100.5)} 100.5`)} stroke-linecap="round"></circle></svg> <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">${escape_html(item.vote_average.toFixed(1))}</span></div> <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4"><div class="play-button mb-3 svelte-156698q">`);
		Play($$renderer, { size: 28, class: 'text-white ml-1', fill: 'white' });
		$$renderer.push(`<!----></div> <h3 class="text-white font-bold text-center text-sm line-clamp-2 mb-2">${escape_html(item.title)}</h3> <div class="flex items-center gap-3 text-xs text-gray-300">`);

		if (displayDate) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<span>${escape_html(displayDate)}</span>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		if (item.runtime) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<span class="flex items-center gap-1">`);
			Clock($$renderer, { size: 10 });
			$$renderer.push(`<!----> ${escape_html(formatRuntime(item.runtime))}</span>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div></div> <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div></div> <div class="p-3 info-section svelte-156698q"><h3 class="font-semibold text-sm line-clamp-1 mb-1.5 group-hover:text-amber-400 transition-colors" style="color: var(--text-primary);">${escape_html(item.title)}</h3> <div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><span style="color: var(--text-secondary);">${escape_html(displayDate)}</span> `);

		if (item.popularity && item.popularity > 100) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<span class="flex items-center gap-0.5 text-amber-400">`);
			Trending_up($$renderer, { size: 10 });
			$$renderer.push(`<!----> Hot</span>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-1">`);
		Star($$renderer, { size: 12, class: 'text-amber-400', fill: '#fbbf24' });
		$$renderer.push(`<!----> <span style="color: var(--text-secondary);">${escape_html(item.vote_average.toFixed(1))}</span></div></div></div> <div class="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-400/50 transition-all duration-300 pointer-events-none"></div></a>`);
		bind_props($$props, { item });
	});
}

export { MovieCard as M };
