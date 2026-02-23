import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_B64ZId-j.mjs';
import { s as sanitize_props, a as spread_props, b as slot, i as fallback, c as attr, f as attr_class, e as escape_html, d as ensure_array_like, j as bind_props } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { M as MovieCard } from '../chunks/MovieCard_CFWSEGer.mjs';
import { S as Search } from '../chunks/search_D80B1tnI.mjs';
import { I as Icon } from '../chunks/tv_BwBqCXmW.mjs';

function Filter($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		[
			"polygon",
			{ "points": "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'filter' },
		$$sanitized_props,
		{
			/**
			 * @component @name Filter
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWdvbiBwb2ludHM9IjIyIDMgMiAzIDEwIDEyLjQ2IDEwIDE5IDE0IDIxIDE0IDEyLjQ2IDIyIDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/filter
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

function SearchResults($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let // Update URL without reload
		hasFilters;

		let initialQuery = fallback($$props['initialQuery'], '');
		let initialType = fallback($$props['initialType'], 'all');
		let initialYear = fallback($$props['initialYear'], '');
		let initialGenre = fallback($$props['initialGenre'], '');
		let initialLanguage = fallback($$props['initialLanguage'], '');
		let query = initialQuery;
		let type = initialType;
		let year = initialYear;
		let genre = initialGenre;
		let language = initialLanguage;
		let results = [];
		let totalResults = 0;
		let showFilters = false;
		Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

		hasFilters = type !== 'all' || year || genre || language;

		$$renderer.push(`<div><div class="flex gap-4 mb-6"><div class="flex-1 relative">`);

		Search($$renderer, {
			size: 20,
			class: 'absolute left-4 top-1/2 -translate-y-1/2',
			style: 'color: var(--text-muted);'
		});

		$$renderer.push(`<!----> <input type="text"${attr('value', query)} placeholder="Search movies, TV series, actors..." class="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-colors" style="background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);"/></div> <button${attr_class('flex items-center gap-2 px-4 py-3 rounded-lg transition-colors', void 0, { 'ring-2': showFilters, 'ring-[var(--accent)]': showFilters })} style="background-color: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary);">`);
		Filter($$renderer, { size: 20 });
		$$renderer.push(`<!----> <span class="hidden sm:inline">Filters</span> `);

		if (hasFilters) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<span class="w-2 h-2 rounded-full" style="background-color: var(--accent);"></span>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></button></div> `);

		{
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		if (query && true) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<p class="mb-4" style="color: var(--text-secondary);">Found ${escape_html(totalResults)} result${escape_html('s' )}</p>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--> `);

		if (results.length > 0) {
			$$renderer.push('<!--[1-->');
			$$renderer.push(`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"><!--[-->`);

			const each_array_4 = ensure_array_like(results);

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let item = each_array_4[$$index_4];

				MovieCard($$renderer, { item });
			}

			$$renderer.push(`<!--]--></div> `);

			{
				$$renderer.push('<!--[!-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (query && true) {
			$$renderer.push('<!--[2-->');
			$$renderer.push(`<div class="text-center py-16"><p class="text-xl mb-2" style="color: var(--text-primary);">No results found</p> <p style="color: var(--text-secondary);">Try different keywords or adjust your filters</p></div>`);
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push(`<div class="text-center py-16">`);

			Search($$renderer, {
				size: 64,
				class: 'mx-auto mb-4',
				style: 'color: var(--text-muted);'
			});

			$$renderer.push(`<!----> <p class="text-xl mb-2" style="color: var(--text-primary);">Start searching</p> <p style="color: var(--text-secondary);">Enter a movie name, TV series, or actor to find content</p></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		bind_props($$props, {
			initialQuery,
			initialType,
			initialYear,
			initialGenre,
			initialLanguage
		});
	});
}

const $$Astro = createAstro();
const $$Search = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Search;
  const query = Astro2.url.searchParams.get("q") || "";
  const type = Astro2.url.searchParams.get("type") || "all";
  const year = Astro2.url.searchParams.get("year") || "";
  const genre = Astro2.url.searchParams.get("genre") || "";
  const language = Astro2.url.searchParams.get("language") || "";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": query ? `Search: ${query}` : "Search", "description": "Search for movies and TV series" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <h1 class="text-3xl font-bold mb-8" style="color: var(--text-primary);"> ${query ? `Results for "${query}"` : "Search"} </h1> ${renderComponent($$result2, "SearchResults", SearchResults, { "client:load": true, "initialQuery": query, "initialType": type, "initialYear": year, "initialGenre": genre, "initialLanguage": language, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/SearchResults.svelte", "client:component-export": "default" })} </div> ` })}`;
}, "/var/www/trendimovies/src/pages/search.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
