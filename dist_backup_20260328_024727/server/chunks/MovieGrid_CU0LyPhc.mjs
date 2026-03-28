import { i as fallback, d as ensure_array_like, c as attr, e as escape_html, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
import { S as Star } from './star_DHTXgEc7.mjs';

function MovieGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = fallback($$props['items'], () => [], true);

		function getPosterUrl(path) {
			if (!path) return '/images/no-poster.svg';

			return `https://image.tmdb.org/t/p/w342${path}`;
		}

		function getLink(item) {
			return item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
		}

		$$renderer.push(`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"><!--[-->`);

		const each_array = ensure_array_like(items);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<a${attr('href', getLink(item))} class="group relative rounded-lg overflow-hidden transition-transform hover:scale-105" style="background-color: var(--bg-card);"><div class="aspect-[2/3] relative"><img${attr('src', getPosterUrl(item.poster_path))}${attr('alt', item.title)} class="w-full h-full object-cover"${attr('loading', index < 12 ? 'eager' : 'lazy')}/> <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div> `);

			if (index < 10) {
				$$renderer.push('<!--[-->');
				$$renderer.push(`<div class="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">${escape_html(index + 1)}</div>`);
			} else {
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]--> <div class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1" style="background-color: rgba(0,0,0,0.7); color: #fbbf24;">`);
			Star($$renderer, { size: 10, fill: 'currentColor' });
			$$renderer.push(`<!----> ${escape_html(item.vote_average.toFixed(1))}</div> <div class="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform"><p class="text-white text-sm font-semibold line-clamp-2">${escape_html(item.title)}</p> <p class="text-gray-400 text-xs mt-1">${escape_html(item.year || 'TBA')}</p></div></div> <div class="p-3"><h3 class="font-medium text-sm line-clamp-2" style="color: var(--text-primary);">${escape_html(item.title)}</h3> <p class="text-xs mt-1" style="color: var(--text-muted);">${escape_html(item.year || 'TBA')}</p></div></a>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (items.length === 0) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<div class="text-center py-12" style="color: var(--text-secondary);"><p>No items found.</p></div>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]-->`);
		bind_props($$props, { items });
	});
}

export { MovieGrid as M };
