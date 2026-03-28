import { s as sanitize_props, a as spread_props, b as slot, i as fallback, d as ensure_array_like, o as attr_style, h as stringify, e as escape_html, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
import { D as Download } from './download_CqztGVIg.mjs';
import { I as Icon } from './tv_BwBqCXmW.mjs';

function Magnet($$renderer, $$props) {
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
				"d": "m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"
			}
		],
		["path", { "d": "m5 8 4 4" }],
		["path", { "d": "m12 15 4 4" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'magnet' },
		$$sanitized_props,
		{
			/**
			 * @component @name Magnet
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNiAxNS00LTQgNi43NS02Ljc3YTcuNzkgNy43OSAwIDAgMSAxMSAxMUwxMyAyMmwtNC00IDYuMzktNi4zNmEyLjE0IDIuMTQgMCAwIDAtMy0zTDYgMTUiIC8+CiAgPHBhdGggZD0ibTUgOCA0IDQiIC8+CiAgPHBhdGggZD0ibTEyIDE1IDQgNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/magnet
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

function DownloadSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // Sort all DDL links by quality: 720p -> 1080p -> 2160p
			sortedDdlLinks,
			// Torrent links sorted: 720p first, then 1080p variants
			torrentLinks,
			hasAnyLinks;

		let links = fallback($$props['links'], () => [], true);
		let title = fallback($$props['title'], '');

		function getVariantLabel(link) {
			if (link.variant === 'webdl') return 'WEB-DL';
			if (link.variant === 'webrip') return 'WEBRip';
			if (link.variant === 'bluray') return 'BluRay';

			return '';
		}

		sortedDdlLinks = links.filter((l) => l.type === 'ddl').sort((a, b) => {
			const order = { '720p': 0, '1080p': 1, '2160p': 2 };

			return (order[a.quality] ?? 3) - (order[b.quality] ?? 3);
		});

		// Torrent links sorted: 720p first, then 1080p variants
		torrentLinks = links.filter((l) => l.type === 'torrent').sort((a, b) => {
			const order = { '720p': 0, '1080p': 1, '2160p': 2 };

			if (a.quality !== b.quality) {
				return (order[a.quality] ?? 3) - (order[b.quality] ?? 3);
			}

			if (a.variant === 'webdl') return 1;
			if (b.variant === 'webdl') return -1;

			return 0;
		});

		hasAnyLinks = links.length > 0;

		if (hasAnyLinks) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="space-y-4">`);

			if (sortedDdlLinks.length > 0) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);"><h3 class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">`);
				Download($$renderer, { size: 16, class: 'text-green-500' });
				$$renderer.push(`<!----> Download</h3> <div class="flex flex-wrap gap-2"><!--[-->`);

				const each_array = ensure_array_like(sortedDdlLinks);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let link = each_array[$$index];

					$$renderer.push(`<button class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"${attr_style(`background: ${stringify(link.quality === '720p' ? '#22c55e' : '#3b82f6')};`)}>`);
					Download($$renderer, { size: 14 });
					$$renderer.push(`<!----> <span>${escape_html(link.quality)}</span> `);

					if (link.file_size) {
						$$renderer.push('<!--[-->');
						$$renderer.push(`<span class="opacity-75">(${escape_html(link.file_size)})</span>`);
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--></button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> `);

			if (torrentLinks.length > 0) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="rounded-xl p-4" style="background: var(--bg-card); border: 1px solid var(--border);"><h3 class="text-sm font-bold mb-3 flex items-center gap-2" style="color: var(--text-primary);">`);
				Magnet($$renderer, { size: 16, class: 'text-red-500' });
				$$renderer.push(`<!----> Torrent</h3> <div class="flex flex-wrap gap-2"><!--[-->`);

				const each_array_1 = ensure_array_like(torrentLinks);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let link = each_array_1[$$index_1];

					$$renderer.push(`<button class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer" style="background: #dc2626;">`);
					Magnet($$renderer, { size: 14 });
					$$renderer.push(`<!----> <span>${escape_html(link.quality)}</span> `);

					if (getVariantLabel(link)) {
						$$renderer.push('<!--[-->');
						$$renderer.push(`<span class="opacity-75">${escape_html(getVariantLabel(link))}</span>`);
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--> `);

					if (link.file_size) {
						$$renderer.push('<!--[-->');
						$$renderer.push(`<span class="opacity-75">(${escape_html(link.file_size)})</span>`);
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--></button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="rounded-xl p-6 text-center" style="background: var(--bg-card); border: 1px solid var(--border);">`);

			Download($$renderer, {
				size: 28,
				class: 'mx-auto mb-2 opacity-40',
				style: 'color: var(--text-muted);'
			});

			$$renderer.push(`<!----> <p class="text-sm" style="color: var(--text-secondary);">Downloads coming soon</p></div>`);
		}

		$$renderer.push(`<!--]-->`);
		bind_props($$props, { links, title });
	});
}

export { DownloadSection as D };
