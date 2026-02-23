import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Bd36yBVL.mjs';
import { f as attr_class, h as stringify, d as ensure_array_like, e as escape_html, c as attr } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { S as Search } from '../../chunks/search_D80B1tnI.mjs';
import { C as Check } from '../../chunks/check_CvTx1B39.mjs';
import { F as Film, T as Tv } from '../../chunks/tv_BwBqCXmW.mjs';
import { D as Download } from '../../chunks/download_CqztGVIg.mjs';

function AssignmentForm($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let searchQuery = '';
		let telegramQuery = '';
		let selectedQuality = '1080p';
		let source = 'telegram';

		// Search results
		let telegramFiles = [];

		let tmdbResults = [];

		// Selected items
		let selectedFile = null;

		// Loading states
		let searchingTelegram = false;

		let searchingTmdb = false;

		function formatFileSize(size) {
			return size || 'Unknown size';
		}

		function getPosterUrl(path) {
			return path
				? `https://image.tmdb.org/t/p/w92${path}`
				: '/images/no-poster.jpg';
		}

		$$renderer.push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="space-y-6"><div class="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]"><h3 class="text-lg font-semibold mb-4">1. Select Source</h3> <div class="flex gap-2 mb-4"><button${attr_class(`px-4 py-2 rounded-lg font-medium transition-colors ${stringify('bg-[#e50914] text-white'
			)}`)}>Telegram</button> <button${attr_class(`px-4 py-2 rounded-lg font-medium transition-colors ${stringify('bg-[#2a2a2a] text-gray-400 hover:bg-[#333]')}`)}>Cinematika</button> <button${attr_class(`px-4 py-2 rounded-lg font-medium transition-colors ${stringify('bg-[#2a2a2a] text-gray-400 hover:bg-[#333]')}`)}>Torrent</button></div> <div class="mb-4"><label class="text-sm text-gray-400 block mb-2">Quality</label> <div class="flex gap-2"><!--[-->`);

		const each_array = ensure_array_like(['720p', '1080p', '2160p', 'hdrip']);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let q = each_array[$$index];

			$$renderer.push(`<button${attr_class(`px-3 py-1.5 rounded text-sm font-medium transition-colors ${stringify(selectedQuality === q
				? 'bg-blue-600 text-white'
				: 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]')}`)}>${escape_html(q)}</button>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		{
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div><label class="text-sm text-gray-400 block mb-2">Search Telegram Files</label> <div class="flex gap-2"><input type="text"${attr('value', telegramQuery)} placeholder="Enter movie/series title..." class="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e50914]"/> <button${attr('disabled', searchingTelegram, true)} class="px-4 py-2 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2">`);

			{
				$$renderer.push('<!--[!-->');
				Search($$renderer, { size: 16 });
			}

			$$renderer.push(`<!--]--> Search</button></div></div> `);

			if (telegramFiles.length > 0) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="mt-4 max-h-80 overflow-y-auto space-y-2"><!--[-->`);

				const each_array_1 = ensure_array_like(telegramFiles);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let file = each_array_1[$$index_1];

					$$renderer.push(`<button${attr_class(`w-full text-left p-3 rounded-lg border transition-colors ${stringify(selectedFile?.id === file.id
						? 'bg-[#e50914]/20 border-[#e50914]'
						: 'bg-[#0a0a0a] border-[#333] hover:border-[#555]')}`)}><div class="flex items-start justify-between gap-2"><div class="min-w-0 flex-1"><p class="text-sm font-medium truncate">${escape_html(file.file_name)}</p> <div class="flex items-center gap-2 mt-1 text-xs text-gray-500"><span class="px-2 py-0.5 bg-[#2a2a2a] rounded">${escape_html(file.quality)}</span> <span>${escape_html(formatFileSize(file.file_size))}</span> `);

					if (file.year) {
						$$renderer.push('<!--[-->');
						$$renderer.push(`<span>${escape_html(file.year)}</span>`);
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (selectedFile?.id === file.id) {
						$$renderer.push('<!--[-->');
						Check($$renderer, { size: 16, class: 'text-[#e50914] flex-shrink-0' });
					} else {
						$$renderer.push('<!--[!-->');
					}

					$$renderer.push(`<!--]--></div></button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="space-y-6"><div class="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]"><h3 class="text-lg font-semibold mb-4">2. Select Content</h3> `);

		{
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="flex gap-2 mb-4"><input type="text"${attr('value', searchQuery)} placeholder="Search TMDB for movie or series..." class="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e50914]"/> <button${attr('disabled', searchingTmdb, true)} class="px-4 py-2 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2">`);

			{
				$$renderer.push('<!--[!-->');
				Search($$renderer, { size: 16 });
			}

			$$renderer.push(`<!--]--> Search</button></div> `);

			if (tmdbResults.length > 0) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="max-h-96 overflow-y-auto space-y-2"><!--[-->`);

				const each_array_4 = ensure_array_like(tmdbResults);

				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let result = each_array_4[$$index_4];

					$$renderer.push(`<button class="w-full text-left p-3 rounded-lg border border-[#333] hover:border-[#555] bg-[#0a0a0a] transition-colors"><div class="flex items-center gap-3"><img${attr('src', getPosterUrl(result.poster_path))}${attr('alt', result.title)} class="w-12 h-16 object-cover rounded"/> <div class="flex-1 min-w-0"><div class="flex items-center gap-2">`);

					if (result.media_type === 'movie') {
						$$renderer.push('<!--[-->');
						Film($$renderer, { size: 14, class: 'text-blue-400' });
					} else {
						$$renderer.push('<!--[!-->');
						Tv($$renderer, { size: 14, class: 'text-green-400' });
					}

					$$renderer.push(`<!--]--> <span class="text-xs uppercase text-gray-500">${escape_html(result.media_type)}</span></div> <p class="font-medium truncate">${escape_html(result.title)}</p> <p class="text-sm text-gray-500">${escape_html(result.year)}</p></div></div></button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> <div class="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]"><h3 class="text-lg font-semibold mb-4">3. Assign Link</h3> <div class="space-y-2 mb-4 text-sm"><div class="flex justify-between"><span class="text-gray-500">Source:</span> <span class="font-medium">${escape_html(source)}</span></div> <div class="flex justify-between"><span class="text-gray-500">Quality:</span> <span class="font-medium">${escape_html(selectedQuality)}</span></div> <div class="flex justify-between"><span class="text-gray-500">File:</span> <span class="font-medium truncate max-w-48">`);

		{
			$$renderer.push('<!--[-->');
			$$renderer.push(`${escape_html('Not selected')}`);
		}

		$$renderer.push(`<!--]--></span></div> <div class="flex justify-between"><span class="text-gray-500">Content:</span> <span class="font-medium">${escape_html('Not selected')} `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></span></div></div> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <button${attr('disabled', true, true)} class="w-full py-3 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-[#b20710] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">`);

		{
			$$renderer.push('<!--[!-->');
			Download($$renderer, { size: 18 });
			$$renderer.push(`<!----> Assign Download Link`);
		}

		$$renderer.push(`<!--]--></button></div></div></div>`);
	});
}

const $$ManualAssign = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Manual Link Assignment", "activeTab": "manual-assign" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <p class="text-gray-400">
Manually assign download links to movies and episodes from Telegram, Cinematika, or torrent sources.
</p> <!-- Instructions --> <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"> <h3 class="font-semibold text-blue-400 mb-2">How to use:</h3> <ol class="text-sm text-blue-300/80 space-y-1 list-decimal list-inside"> <li>Select the source type (Telegram, Cinematika, or Torrent)</li> <li>Choose the quality (720p, 1080p, 2160p, or HDRip)</li> <li>Search for and select a file from Telegram, or enter a direct URL</li> <li>Search TMDB and select the movie or TV series</li> <li>For TV series, select the season and episode</li> <li>Click "Assign Download Link" to create the link</li> </ol> </div> <!-- Assignment Form --> ${renderComponent($$result2, "AssignmentForm", AssignmentForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/AssignmentForm.svelte", "client:component-export": "default" })} </div> ` })}`;
}, "/var/www/trendimovies/src/pages/admin/manual-assign.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/manual-assign.astro";
const $$url = "/admin/manual-assign";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ManualAssign,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
