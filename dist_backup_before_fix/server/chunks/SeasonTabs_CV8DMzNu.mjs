import { s as sanitize_props, a as spread_props, b as slot, i as fallback, d as ensure_array_like, f as attr_class, o as attr_style, h as stringify, e as escape_html, c as attr, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
/* empty css                          */
import { P as Play } from './play_C2FbJLkE.mjs';
import { C as Calendar } from './calendar_D8dvDgub.mjs';
import { C as Clock } from './clock_CjYHN5RC.mjs';
import { S as Star } from './star_DHTXgEc7.mjs';
import { D as Download } from './download_CqztGVIg.mjs';
import { I as Icon } from './tv_BwBqCXmW.mjs';
import { C as Chevron_down } from './BaseLayout_B64ZId-j.mjs';

function Chevron_up($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [["path", { "d": "m18 15-6-6-6 6" }]];

	Icon($$renderer, spread_props([
		{ name: 'chevron-up' },
		$$sanitized_props,
		{
			/**
			 * @component @name ChevronUp
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTggMTUtNi02LTYgNiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/chevron-up
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

function SeasonTabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentEpisodes;
		let seriesId = $$props['seriesId'];
		let tmdbId = $$props['tmdbId'];
		let imdbId = fallback($$props['imdbId'], null);
		let seasons = fallback($$props['seasons'], () => [], true);
		let episodesBySeason = fallback($$props['episodesBySeason'], () => ({}), true);
		let downloadsByEpisode = fallback($$props['downloadsByEpisode'], () => ({}), true);
		let activeSeason = seasons.length > 0 ? seasons[0].season_number : 1;
		let playingEpisode = null;
		let expandedDownloads = null;

		function getStillUrl(path) {
			return path
				? `https://image.tmdb.org/t/p/w300${path}`
				: '/images/no-still.jpg';
		}

		function formatDate(dateStr) {
			if (!dateStr) return 'TBA';

			return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
		}

		function getVariantLabel(variant) {
			switch (variant) {
				case 'bluray':
					return 'BluRay';

				case 'webrip':
					return 'WEBRip';

				case 'webdl':
					return 'WEB-DL';

				case 'hdtv':
					return 'HDTV';

				case 'hdrip':
					return 'HDRip';

				default:
					return '';
			}
		}

		function getQualityColor(quality) {
			switch (quality) {
				case '720p':
					return 'bg-green-600 hover:bg-green-700';

				case '1080p':
					return 'bg-blue-600 hover:bg-blue-700';

				case '2160p':
					return 'bg-purple-600 hover:bg-purple-700';

				default:
					return 'bg-gray-600 hover:bg-gray-700';
			}
		}

		function getEpisodeDownloads(episodeId) {
			return downloadsByEpisode[episodeId] || [];
		}

		currentEpisodes = episodesBySeason[activeSeason] || [];

		$$renderer.push(`<div><div class="flex flex-wrap gap-2 mb-6 border-b" style="border-color: var(--border);"><!--[-->`);

		const each_array = ensure_array_like(seasons);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let season = each_array[$$index];

			$$renderer.push(`<button${attr_class('px-4 py-2 font-medium transition-colors border-b-2 -mb-px', void 0, {
				'border-[var(--accent)]': activeSeason === season.season_number,
				'text-[var(--accent)]': activeSeason === season.season_number,
				'border-transparent': activeSeason !== season.season_number
			})}${attr_style(`color: ${stringify(activeSeason === season.season_number ? 'var(--accent)' : 'var(--text-secondary)')};`)}>${escape_html(season.name || `Season ${season.season_number}`)}</button>`);
		}

		$$renderer.push(`<!--]--></div> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="space-y-4"><!--[-->`);

		const each_array_1 = ensure_array_like(currentEpisodes);

		for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
			let episode = each_array_1[$$index_2];
			const epDownloads = getEpisodeDownloads(episode.id);
			const hasDownloads = epDownloads.length > 0;

			$$renderer.push(`<div${attr_class('flex flex-col sm:flex-row gap-4 p-4 rounded-lg transition-colors', void 0, {
				'ring-2': playingEpisode?.season === activeSeason && playingEpisode?.episode === episode.episode_number,
				'ring-[var(--accent)]': playingEpisode?.season === activeSeason && playingEpisode?.episode === episode.episode_number
			})} style="background-color: var(--bg-card); border: 1px solid var(--border);"><div class="relative flex-shrink-0 w-full sm:w-48 aspect-video sm:aspect-[16/10] rounded overflow-hidden"><img${attr('src', getStillUrl(episode.still_path))}${attr('alt', episode.name || `Episode ${episode.episode_number}`)} class="w-full h-full object-cover"/> <button class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"><div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color: var(--accent);">`);

			Play($$renderer, { size: 24, class: 'text-white ml-1', fill: 'white' });
			$$renderer.push(`<!----></div></button> <div class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white" style="background-color: var(--accent);">E${escape_html(episode.episode_number)}</div></div> <div class="flex-1 min-w-0"><h4 class="font-semibold mb-1 line-clamp-1" style="color: var(--text-primary);">${escape_html(episode.name || `Episode ${episode.episode_number}`)}</h4> <div class="flex flex-wrap items-center gap-3 mb-2 text-sm" style="color: var(--text-secondary);">`);

			if (episode.air_date) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="flex items-center gap-1">`);
				Calendar($$renderer, { size: 14 });
				$$renderer.push(`<!----> <span>${escape_html(formatDate(episode.air_date))}</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> `);

			if (episode.runtime) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="flex items-center gap-1">`);
				Clock($$renderer, { size: 14 });
				$$renderer.push(`<!----> <span>${escape_html(episode.runtime)} min</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> `);

			if (episode.vote_average) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="flex items-center gap-1">`);
				Star($$renderer, { size: 14, class: 'text-yellow-400', fill: 'currentColor' });
				$$renderer.push(`<!----> <span>${escape_html(episode.vote_average.toFixed(1))}</span></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div> <p class="text-sm line-clamp-2 mb-3" style="color: var(--text-secondary);">${escape_html(episode.overview || 'No description available.')}</p> <div class="flex flex-wrap gap-2"><button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style="background-color: var(--accent);">`);
			Play($$renderer, { size: 16 });
			$$renderer.push(`<!----> Watch</button> `);

			if (hasDownloads) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<button class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors" style="background-color: var(--bg-hover); color: var(--text-primary);">`);
				Download($$renderer, { size: 16 });
				$$renderer.push(`<!----> Downloads (${escape_html(epDownloads.length)}) `);

				if (expandedDownloads === episode.id) {
					$$renderer.push('<!--[-->');
					Chevron_up($$renderer, { size: 14 });
				} else {
					$$renderer.push('<!--[!-->');
					Chevron_down($$renderer, { size: 14 });
				}

				$$renderer.push(`<!--]--></button>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (hasDownloads && expandedDownloads === episode.id) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="mt-3 flex flex-wrap gap-2"><!--[-->`);

				const each_array_2 = ensure_array_like(epDownloads);

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let link = each_array_2[$$index_1];

					$$renderer.push(`<button${attr_class(`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${stringify(getQualityColor(link.quality))}`)}>`);
					Download($$renderer, { size: 14 });
					$$renderer.push(`<!----> <span>${escape_html(link.quality)}</span> `);

					if (link.variant) {
						$$renderer.push('<!--[-->');
						$$renderer.push(`<span class="opacity-75 text-xs">${escape_html(getVariantLabel(link.variant))}</span>`);
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--> `);

					if (link.file_size) {
						$$renderer.push('<!--[-->');
						$$renderer.push(`<span class="opacity-75 text-xs">(${escape_html(link.file_size)})</span>`);
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--></button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (currentEpisodes.length === 0) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="text-center py-12" style="color: var(--text-secondary);"><p>No episodes available for this season yet.</p></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div></div>`);

		bind_props($$props, {
			seriesId,
			tmdbId,
			imdbId,
			seasons,
			episodesBySeason,
			downloadsByEpisode
		});
	});
}

export { SeasonTabs as S };
