import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Bd36yBVL.mjs';
import { g as getDownloadStats } from '../../chunks/admin-queries_SEI3HfdQ.mjs';
import { c as attr, d as ensure_array_like, e as escape_html, f as attr_class } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { S as Search } from '../../chunks/search_D80B1tnI.mjs';
import { E as External_link } from '../../chunks/external-link_BC2jCZnV.mjs';
import { L as Loader_circle } from '../../chunks/loader-circle_Cmeteb-C.mjs';
import { T as Trash_2 } from '../../chunks/trash-2_B8kiUTto.mjs';

function DownloadLinksManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let searchQuery = '';
		let contentType = 'all';
		let source = 'all';
		let yearFilter = '';
		let links = [];
		let loading = false;
		let deleting = null;
		let total = 0;

		// Generate year options (current year down to 1950)
		const currentYear = new Date().getFullYear();

		const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

		$$renderer.push(`<div class="space-y-6"><div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4"><div class="flex flex-wrap gap-4 items-end"><div class="flex-1 min-w-[200px]"><label class="block text-sm text-[#888] mb-1">Search by Movie Title or ID</label> <div class="relative">`);

		Search($$renderer, {
			class: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]'
		});

		$$renderer.push(`<!----> <input type="text"${attr('value', searchQuery)} placeholder="Enter movie title (e.g. Mercy, Moana)..." class="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-[#666] focus:border-[#e50914] focus:outline-none"/></div></div> <div><label class="block text-sm text-[#888] mb-1">Year</label> `);

		$$renderer.select(
			{
				value: yearFilter,
				class: 'bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none'
			},
			($$renderer) => {
				$$renderer.option({ value: '' }, ($$renderer) => {
					$$renderer.push(`All Years`);
				});

				$$renderer.push(`<!--[-->`);

				const each_array = ensure_array_like(years);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let year = each_array[$$index];

					$$renderer.option({ value: year.toString() }, ($$renderer) => {
						$$renderer.push(`${escape_html(year)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`</div> <div><label class="block text-sm text-[#888] mb-1">Content Type</label> `);

		$$renderer.select(
			{
				value: contentType,
				class: 'bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none'
			},
			($$renderer) => {
				$$renderer.option({ value: 'all' }, ($$renderer) => {
					$$renderer.push(`All Types`);
				});

				$$renderer.option({ value: 'movie' }, ($$renderer) => {
					$$renderer.push(`Movies`);
				});

				$$renderer.option({ value: 'episode' }, ($$renderer) => {
					$$renderer.push(`Episodes`);
				});
			}
		);

		$$renderer.push(`</div> <div><label class="block text-sm text-[#888] mb-1">Source</label> `);

		$$renderer.select(
			{
				value: source,
				class: 'bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none'
			},
			($$renderer) => {
				$$renderer.option({ value: 'all' }, ($$renderer) => {
					$$renderer.push(`All Sources`);
				});

				$$renderer.option({ value: 'telegram' }, ($$renderer) => {
					$$renderer.push(`Telegram`);
				});

				$$renderer.option({ value: 'cinematika' }, ($$renderer) => {
					$$renderer.push(`Cinematika`);
				});

				$$renderer.option({ value: 'torrent' }, ($$renderer) => {
					$$renderer.push(`Torrent`);
				});
			}
		);

		$$renderer.push(`</div> <button${attr('disabled', loading, true)} class="px-6 py-2 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#b20710] disabled:opacity-50 flex items-center gap-2">`);

		{
			$$renderer.push('<!--[!-->');
			Search($$renderer, { class: 'w-4 h-4' });
		}

		$$renderer.push(`<!--]--> Search</button></div></div> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Download Links</h3> <span class="text-sm text-[#888]">${escape_html(total.toLocaleString())} total</span></div> `);

		if (links.length === 0) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<p class="text-center py-12 text-[#666]">No download links found</p>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="overflow-x-auto"><table class="admin-table"><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Source</th><th>Quality</th><th>Size</th><th>Clicks</th><th>Status</th><th>Actions</th></tr></thead><tbody><!--[-->`);

			const each_array_1 = ensure_array_like(links);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let link = each_array_1[$$index_1];

				$$renderer.push(`<tr><td class="font-mono text-sm">${escape_html(link.id)}</td><td><span${attr_class(`badge ${link.content_type === 'movie' ? 'badge-error' : 'badge-success'}`)}>${escape_html(link.content_type)}</span></td><td class="max-w-[200px] truncate"${attr('title', link.content_title || `ID: ${link.content_id}`)}>${escape_html(link.content_title || link.content_id)}</td><td class="capitalize">${escape_html(link.source)}</td><td><span${attr_class(`badge ${link.quality === '720p'
					? 'badge-success'
					: link.quality === '1080p' ? 'badge-info' : 'badge-warning'}`)}>${escape_html(link.quality)}</span></td><td>${escape_html(link.file_size || '-')}</td><td class="font-semibold">${escape_html((link.click_count || 0).toLocaleString())}</td><td><span${attr_class(`badge ${link.is_active ? 'badge-success' : 'badge-error'}`)}>${escape_html(link.is_active ? 'Active' : 'Inactive')}</span></td><td><div class="flex items-center gap-2"><a${attr('href', link.url)} target="_blank" rel="noopener noreferrer" class="p-1.5 hover:bg-[#333] rounded-lg transition-colors" title="Open URL">`);

				External_link($$renderer, { class: 'w-4 h-4' });
				$$renderer.push(`<!----></a> <button${attr('disabled', deleting === link.id, true)} class="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50" title="Delete">`);

				if (deleting === link.id) {
					$$renderer.push('<!--[-->');
					Loader_circle($$renderer, { class: 'w-4 h-4 animate-spin' });
				} else {
					$$renderer.push('<!--[!-->');
					Trash_2($$renderer, { class: 'w-4 h-4' });
				}

				$$renderer.push(`<!--]--></button></div></td></tr>`);
			}

			$$renderer.push(`<!--]--></tbody></table></div> `);

			{
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}

const $$Downloads = createComponent(async ($$result, $$props, $$slots) => {
  const stats = await getDownloadStats();
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Download Analytics", "activeTab": "downloads" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-5"> <p class="text-sm text-[#666] mb-1">Total Clicks</p> <p class="text-3xl font-bold">${stats.totalClicks.toLocaleString()}</p> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-5"> <p class="text-sm text-[#666] mb-1">Total Links</p> <p class="text-3xl font-bold">${stats.totalLinks.toLocaleString()}</p> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-5"> <p class="text-sm text-[#666] mb-1">Avg Clicks/Link</p> <p class="text-3xl font-bold"> ${stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : "0"} </p> </div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-5"> <p class="text-sm text-[#666] mb-1">Most Popular</p> <p class="text-3xl font-bold"> ${Object.entries(stats.byQuality).sort((a, b) => b[1].clicks - a[1].clicks)[0]?.[0] || "N/A"} </p> </div> </div>  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> <!-- By Quality --> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">By Quality</h3> <div class="space-y-4"> ${Object.entries(stats.byQuality).map(([quality, data]) => renderTemplate`<div> <div class="flex justify-between text-sm mb-1"> <span class="font-medium">${quality}</span> <span class="text-[#666]">${data.count.toLocaleString()} links</span> </div> <div class="flex items-center gap-3"> <div class="flex-1 progress-bar"> <div class="progress-bar-fill"${addAttribute(`width: ${stats.totalClicks > 0 ? data.clicks / stats.totalClicks * 100 : 0}%`, "style")}></div> </div> <span class="text-sm font-medium w-20 text-right">${data.clicks.toLocaleString()}</span> </div> </div>`)} </div> </div> <!-- By Source --> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">By Source</h3> <div class="space-y-4"> ${Object.entries(stats.bySource).map(([source, data]) => renderTemplate`<div> <div class="flex justify-between text-sm mb-1"> <span class="font-medium capitalize">${source}</span> <span class="text-[#666]">${data.count.toLocaleString()} links</span> </div> <div class="flex items-center gap-3"> <div class="flex-1 progress-bar"> <div class="progress-bar-fill"${addAttribute(`width: ${stats.totalClicks > 0 ? data.clicks / stats.totalClicks * 100 : 0}%; background: ${source === "telegram" ? "linear-gradient(90deg, #3b82f6, #1d4ed8)" : source === "cinematika" ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #f97316, #ea580c)"}`, "style")}></div> </div> <span class="text-sm font-medium w-20 text-right">${data.clicks.toLocaleString()}</span> </div> </div>`)} </div> </div> <!-- By Content Type --> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6"> <h3 class="text-lg font-semibold mb-4">By Content Type</h3> <div class="space-y-4"> ${Object.entries(stats.byContentType).map(([type, data]) => renderTemplate`<div> <div class="flex justify-between text-sm mb-1"> <span class="font-medium capitalize">${type}s</span> <span class="text-[#666]">${data.count.toLocaleString()} links</span> </div> <div class="flex items-center gap-3"> <div class="flex-1 progress-bar"> <div class="progress-bar-fill"${addAttribute(`width: ${stats.totalClicks > 0 ? data.clicks / stats.totalClicks * 100 : 0}%; background: ${type === "movie" ? "linear-gradient(90deg, #ef4444, #dc2626)" : "linear-gradient(90deg, #22c55e, #16a34a)"}`, "style")}></div> </div> <span class="text-sm font-medium w-20 text-right">${data.clicks.toLocaleString()}</span> </div> </div>`)} </div> </div> </div>  ${renderComponent($$result2, "DownloadLinksManager", DownloadLinksManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/DownloadLinksManager.svelte", "client:component-export": "default" })} ` })}`;
}, "/var/www/trendimovies/src/pages/admin/downloads.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/downloads.astro";
const $$url = "/admin/downloads";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Downloads,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
