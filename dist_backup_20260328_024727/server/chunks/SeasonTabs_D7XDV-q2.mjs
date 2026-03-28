import { i as fallback, e as escape_html, h as stringify, d as ensure_array_like, f as attr_class, c as attr, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
/* empty css                          */
/* empty css                          */
import { P as Play } from './play_C2FbJLkE.mjs';
import { C as Chevron_down } from './BaseLayout_UnkNmAYZ.mjs';
import { C as Calendar } from './calendar_D8dvDgub.mjs';
import { C as Clock } from './clock_CjYHN5RC.mjs';
import { S as Star } from './star_DHTXgEc7.mjs';
import { D as Download } from './download_CqztGVIg.mjs';
import { F as File_text } from './globe_C6bzvC3l.mjs';

function SeasonTabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let currentEpisodes, activeSeasonsData;
		let seriesId = $$props['seriesId'];
		let tmdbId = $$props['tmdbId'];
		let imdbId = fallback($$props['imdbId'], null);
		let seasons = fallback($$props['seasons'], () => [], true);
		let episodesBySeason = fallback($$props['episodesBySeason'], () => ({}), true);
		let downloadsByEpisode = fallback($$props['downloadsByEpisode'], () => ({}), true);
		let subtitlesByEpisode = fallback($$props['subtitlesByEpisode'], () => ({}), true);
		let activeSeason = seasons.length > 0 ? seasons[0].season_number : 1;
		let playingEpisode = null;

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

		function getLinkColor(link) {
			if (link.language_tag) return "bg-violet-600 hover:bg-violet-700";

			return getQualityColor(link.quality);
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

		function getEpisodeSubtitles(episodeId) {
			return subtitlesByEpisode[episodeId] || [];
		}

		currentEpisodes = episodesBySeason[activeSeason] || [];
		activeSeasonsData = seasons.find((s) => s.season_number === activeSeason);

		$$renderer.push(`<div><div class="flex items-center gap-4 mb-6"><div class="flex items-center gap-2">`);
		Play($$renderer, { size: 20, style: 'color: var(--accent);' });
		$$renderer.push(`<!----> <h2 class="text-xl font-bold" style="color: var(--text-primary);">Episodes</h2></div> <div class="season-dropdown relative svelte-3dl70z"><button class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" style="background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);"><span class="font-medium" style="color: var(--accent);">Season ${escape_html(activeSeason)}</span> `);

		if (activeSeasonsData?.episode_count) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<span class="text-sm" style="color: var(--text-secondary);">(${escape_html(activeSeasonsData.episode_count)} episodes)</span>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		Chevron_down($$renderer, {
			size: 18,
			class: `transition-transform ${stringify('')}`,
			style: 'color: var(--text-secondary);'
		});

		$$renderer.push(`<!----></button> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="space-y-4"><!--[-->`);

		const each_array_1 = ensure_array_like(currentEpisodes);

		for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
			let episode = each_array_1[$$index_3];
			const epDownloads = getEpisodeDownloads(episode.id);
			epDownloads.length > 0;

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
			$$renderer.push(`<!----> Watch</button> <!--[-->`);

			const each_array_2 = ensure_array_like(epDownloads);

			for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
				let link = each_array_2[$$index_1];

				$$renderer.push(`<a${attr('href', link.url)} target="_blank" rel="noopener noreferrer"${attr_class(`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${stringify(getLinkColor(link))}`, 'svelte-3dl70z')}>`);
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

				$$renderer.push(`<!--]--> `);

				if (link.language_tag) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<span class="text-xs opacity-90 border-l border-white/30 pl-2 ml-1">${escape_html(link.language_tag)}</span>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--></a>`);
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_3 = ensure_array_like(getEpisodeSubtitles(episode.id));

			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
				let sub = each_array_3[$$index_2];

				$$renderer.push(`<a${attr('href', `https://trendimovies.com/tgstream/stream/${stringify(sub.telegram_file_id)}`)} download="" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors bg-cyan-600 hover:bg-cyan-700">`);
				File_text($$renderer, { size: 14 });
				$$renderer.push(`<!----> <span>SRT</span> `);

				if (sub.file_size) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<span class="opacity-75 text-xs">(${escape_html(sub.file_size)})</span>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--></a>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
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
			downloadsByEpisode,
			subtitlesByEpisode
		});
	});
}

export { SeasonTabs as S };
