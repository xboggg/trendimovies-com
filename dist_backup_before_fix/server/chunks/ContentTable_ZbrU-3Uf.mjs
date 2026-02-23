import { i as fallback, c as attr, e as escape_html, j as bind_props, d as ensure_array_like } from './_@astro-renderers_DbfXOWuU.mjs';
import { S as Search } from './search_D80B1tnI.mjs';
import { C as Check } from './check_CvTx1B39.mjs';
import { X } from './x_BerO-wAW.mjs';
import { E as External_link } from './external-link_BC2jCZnV.mjs';
import { C as Chevron_left } from './chevron-left_DA35Owfk.mjs';
import { C as Chevron_right } from './chevron-right_CYTSjxVf.mjs';

function ContentTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let type = fallback($$props['type'], 'movies');
		let items = [];
		let total = 0;
		let page = 1;
		let totalPages = 1;
		let loading = true;
		let search = '';
		let filter = 'all';

		async function fetchData() {
			loading = true;

			const params = new URLSearchParams({ page: page.toString(), limit: '50', search, filter });

			try {
				const res = await fetch(`/api/admin/${type}?${params}`);
				const data = await res.json();

				items = data[type] || data.movies || data.series || [];
				total = data.total || 0;
				totalPages = data.totalPages || 1;
			} catch(e) {
				items = [];
				total = 0;
			}

			loading = false;
		}

		// Initial load
		fetchData();

		function getPosterUrl(path) {
			if (!path) return '/images/no-poster.svg';

			return `https://image.tmdb.org/t/p/w92${path}`;
		}

		$$renderer.push(`<div><div class="flex flex-col sm:flex-row gap-4 mb-6"><div class="flex-1 relative">`);

		Search($$renderer, {
			size: 18,
			class: 'absolute left-3 top-1/2 -translate-y-1/2 text-[#666]'
		});

		$$renderer.push(`<!----> <input type="text"${attr('value', search)} placeholder="Search by title..." class="input pl-10"/></div> `);

		if (type === 'movies') {
			$$renderer.push('<!--[-->');

			$$renderer.select({ value: filter, class: 'select w-auto' }, ($$renderer) => {
				$$renderer.option({ value: 'all' }, ($$renderer) => {
					$$renderer.push(`All Movies`);
				});

				$$renderer.option({ value: 'with_ddl' }, ($$renderer) => {
					$$renderer.push(`With DDL`);
				});

				$$renderer.option({ value: 'without_ddl' }, ($$renderer) => {
					$$renderer.push(`Without DDL`);
				});
			});
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> <button class="btn btn-primary">Search</button></div> <div class="text-sm text-[#666] mb-4">Showing ${escape_html(items.length)} of ${escape_html(total.toLocaleString())} ${escape_html(type)}</div> <div class="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden">`);

		if (loading) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="p-8 text-center text-[#666]"><div class="animate-spin w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full mx-auto mb-4"></div> Loading...</div>`);
		} else if (items.length === 0) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<div class="p-8 text-center text-[#666]">No ${escape_html(type)} found</div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="overflow-x-auto"><table class="admin-table"><thead><tr><th>Poster</th><th>Title</th><th>Year</th>`);

			if (type === 'series') {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<th>Seasons</th> <th>Episodes</th>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--><th>DDL</th><th>Views</th><th>Actions</th></tr></thead><tbody><!--[-->`);

			const each_array = ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<tr><td><img${attr('src', getPosterUrl(item.poster_path))}${attr('alt', item.title)} class="w-10 h-14 rounded object-cover"/></td><td class="font-medium">${escape_html(item.title)}</td><td>${escape_html(item.year || '-')}</td>`);

				if (type === 'series') {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<td>${escape_html(item.number_of_seasons || '-')}</td> <td>${escape_html(item.number_of_episodes || '-')}</td>`);
				} else {
					$$renderer.push('<!--[!-->');
				}

				$$renderer.push(`<!--]--><td>`);

				if (item.has_downloads) {
					$$renderer.push('<!--[-->');
					$$renderer.push(`<span class="badge badge-success">`);
					Check($$renderer, { size: 12, class: 'mr-1' });
					$$renderer.push(`<!----> Yes</span>`);
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push(`<span class="badge badge-error">`);
					X($$renderer, { size: 12, class: 'mr-1' });
					$$renderer.push(`<!----> No</span>`);
				}

				$$renderer.push(`<!--]--></td><td>${escape_html((item.view_count || 0).toLocaleString())}</td><td><a${attr('href', type === 'movies'
					? `/movie/${item.tmdb_id}`
					: `/s/${item.slug || item.tmdb_id}`)} target="_blank" class="btn btn-ghost p-2" title="View on site">`);

				External_link($$renderer, { size: 16 });
				$$renderer.push(`<!----></a></td></tr>`);
			}

			$$renderer.push(`<!--]--></tbody></table></div> <div class="flex items-center justify-between p-4 border-t border-[#2a2a2a]"><div class="text-sm text-[#666]">Page ${escape_html(page)} of ${escape_html(totalPages)}</div> <div class="flex gap-2"><button${attr('disabled', page <= 1, true)} class="btn btn-secondary">`);
			Chevron_left($$renderer, { size: 18 });
			$$renderer.push(`<!----> Previous</button> <button${attr('disabled', page >= totalPages, true)} class="btn btn-secondary">Next `);
			Chevron_right($$renderer, { size: 18 });
			$$renderer.push(`<!----></button></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, { type });
	});
}

export { ContentTable as C };
