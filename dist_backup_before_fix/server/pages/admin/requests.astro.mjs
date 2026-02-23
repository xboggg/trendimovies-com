import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Bd36yBVL.mjs';
import { c as attr, e as escape_html, d as ensure_array_like, f as attr_class } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { T as Tv, F as Film } from '../../chunks/tv_BwBqCXmW.mjs';
import { C as Check } from '../../chunks/check_CvTx1B39.mjs';
import { X } from '../../chunks/x_BerO-wAW.mjs';
import { L as Loader_circle } from '../../chunks/loader-circle_Cmeteb-C.mjs';
import { T as Trash_2 } from '../../chunks/trash-2_B8kiUTto.mjs';

function RequestsManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let requests = [];
		let loading = false;
		let statusFilter = 'pending';
		let total = 0;
		let updating = null;

		function formatDate(date) {
			return new Date(date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}

		function getStatusBadge(status) {
			switch (status) {
				case 'pending':
					return 'badge-warning';

				case 'approved':
					return 'badge-info';

				case 'completed':
					return 'badge-success';

				case 'rejected':
					return 'badge-error';

				default:
					return '';
			}
		}
		$$renderer.push(`<div class="space-y-6"><div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-4"><div class="flex flex-wrap gap-4 items-center"><div><label class="block text-sm text-[#888] mb-1">Status</label> `);

		$$renderer.select(
			{
				value: statusFilter,
				class: 'bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-white focus:border-[#e50914] focus:outline-none'
			},
			($$renderer) => {
				$$renderer.option({ value: '' }, ($$renderer) => {
					$$renderer.push(`All`);
				});

				$$renderer.option({ value: 'pending' }, ($$renderer) => {
					$$renderer.push(`Pending`);
				});

				$$renderer.option({ value: 'approved' }, ($$renderer) => {
					$$renderer.push(`Approved`);
				});

				$$renderer.option({ value: 'completed' }, ($$renderer) => {
					$$renderer.push(`Completed`);
				});

				$$renderer.option({ value: 'rejected' }, ($$renderer) => {
					$$renderer.push(`Rejected`);
				});
			}
		);

		$$renderer.push(`</div> <button${attr('disabled', loading, true)} class="px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444] disabled:opacity-50 mt-auto">`);

		{
			$$renderer.push('<!--[!-->');
			$$renderer.push(`Refresh`);
		}

		$$renderer.push(`<!--]--></button> <div class="ml-auto text-sm text-[#888]">${escape_html(total)} total requests</div></div></div> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] p-6">`);

		if (requests.length === 0) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<p class="text-center py-12 text-[#666]">No requests found</p>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="space-y-4"><!--[-->`);

			const each_array = ensure_array_like(requests);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let request = each_array[$$index];

				$$renderer.push(`<div class="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]"><div class="flex items-start justify-between gap-4"><div class="flex-1"><div class="flex items-center gap-3 mb-2">`);

				if (request.content_type === 'series') {
					$$renderer.push('<!--[-->');
					Tv($$renderer, { class: 'w-5 h-5 text-green-500' });
				} else {
					$$renderer.push('<!--[!-->');
					Film($$renderer, { class: 'w-5 h-5 text-red-500' });
				}

				$$renderer.push(`<!--]--> <h3 class="font-semibold text-lg">${escape_html(request.title)}</h3> `);

				if (request.year) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<span class="text-[#888]">(${escape_html(request.year)})</span>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> <span${attr_class(`badge ${getStatusBadge(request.status)}`)}>${escape_html(request.status)}</span></div> `);

				if (request.imdb_url) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<a${attr('href', request.imdb_url)} target="_blank" rel="noopener noreferrer" class="text-sm text-blue-400 hover:underline">${escape_html(request.imdb_url)}</a>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> `);

				if (request.notes) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<p class="text-sm text-[#888] mt-2">${escape_html(request.notes)}</p>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> <div class="text-xs text-[#666] mt-2">${escape_html(formatDate(request.created_at))} • IP: ${escape_html(request.ip_address)}</div></div> <div class="flex items-center gap-2">`);

				if (request.status === 'pending') {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<button${attr('disabled', updating === request.id, true)} class="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50" title="Approve">`);
					Check($$renderer, { class: 'w-5 h-5' });
					$$renderer.push(`<!----></button> <button${attr('disabled', updating === request.id, true)} class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50" title="Reject">`);
					X($$renderer, { class: 'w-5 h-5' });
					$$renderer.push(`<!----></button>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> `);

				if (request.status === 'approved') {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<button${attr('disabled', updating === request.id, true)} class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">Mark Complete</button>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--> <button${attr('disabled', updating === request.id, true)} class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50" title="Delete">`);

				if (updating === request.id) {
					$$renderer.push('<!--[-->');
					Loader_circle($$renderer, { class: 'w-5 h-5 animate-spin' });
				} else {
					$$renderer.push('<!--[!-->');
					Trash_2($$renderer, { class: 'w-5 h-5' });
				}

				$$renderer.push(`<!--]--></button></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div> `);

			{
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}

const $$Requests = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Content Requests", "activeTab": "requests" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<p class="text-[#888] mb-6">User-submitted movie and series requests</p> ${renderComponent($$result2, "RequestsManager", RequestsManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/RequestsManager.svelte", "client:component-export": "default" })} ` })}`;
}, "/var/www/trendimovies/src/pages/admin/requests.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/requests.astro";
const $$url = "/admin/requests";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Requests,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
