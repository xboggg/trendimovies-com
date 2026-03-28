import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_UnkNmAYZ.mjs';
import { S as Search } from '../chunks/search_D80B1tnI.mjs';
import { s as sanitize_props, a as spread_props, b as slot } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';
import { I as Icon, F as Film, T as Tv } from '../chunks/tv_BwBqCXmW.mjs';
import { T as Trending_up } from '../chunks/trending-up_DlofYxrt.mjs';

function House($$renderer, $$props) {
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
			{ "d": "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }
		],

		[
			"path",
			{
				"d": "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'house' },
		$$sanitized_props,
		{
			/**
			 * @component @name House
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgMjF2LThhMSAxIDAgMCAwLTEtMWgtNGExIDEgMCAwIDAtMSAxdjgiIC8+CiAgPHBhdGggZD0iTTMgMTBhMiAyIDAgMCAxIC43MDktMS41MjhsNy01Ljk5OWEyIDIgMCAwIDEgMi41ODIgMGw3IDUuOTk5QTIgMiAwIDAgMSAyMSAxMHY5YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/house
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

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Page Not Found", "noIndex": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[70vh] flex items-center justify-center px-4"> <div class="text-center max-w-lg"> <h1 class="text-6xl md:text-8xl font-black mb-4" style="color: var(--accent);">404</h1> <h2 class="text-2xl md:text-3xl font-bold mb-4" style="color: var(--text-primary);">Page Not Found</h2> <p class="text-lg mb-8" style="color: var(--text-secondary);">
The page you're looking for doesn't exist or may have been moved. 
        Try searching for what you need or browse our collection.
</p> <!-- Search Bar --> <form action="/search" method="get" class="mb-8"> <div class="flex max-w-md mx-auto rounded-lg overflow-hidden" style="border: 1px solid var(--border);"> <input type="text" name="q" placeholder="Search movies & TV series..." class="flex-1 px-4 py-3 text-sm outline-none" style="background-color: var(--bg-card); color: var(--text-primary);"> <button type="submit" class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white transition-colors"> ${renderComponent($$result2, "Search", Search, { "size": 20, "client:load": true, "client:component-hydration": "load", "client:component-path": "lucide-svelte", "client:component-export": "Search" })} </button> </div> </form> <!-- Quick Links --> <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto"> <a href="/" class="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:bg-[var(--bg-hover)]" style="background-color: var(--bg-card); border: 1px solid var(--border);"> ${renderComponent($$result2, "Home", House, { "size": 24, "style": "color: var(--accent);", "client:load": true, "client:component-hydration": "load", "client:component-path": "lucide-svelte", "client:component-export": "Home" })} <span class="text-sm font-medium" style="color: var(--text-primary);">Home</span> </a> <a href="/movies" class="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:bg-[var(--bg-hover)]" style="background-color: var(--bg-card); border: 1px solid var(--border);"> ${renderComponent($$result2, "Film", Film, { "size": 24, "style": "color: var(--accent);", "client:load": true, "client:component-hydration": "load", "client:component-path": "lucide-svelte", "client:component-export": "Film" })} <span class="text-sm font-medium" style="color: var(--text-primary);">Movies</span> </a> <a href="/series" class="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:bg-[var(--bg-hover)]" style="background-color: var(--bg-card); border: 1px solid var(--border);"> ${renderComponent($$result2, "Tv", Tv, { "size": 24, "style": "color: var(--accent);", "client:load": true, "client:component-hydration": "load", "client:component-path": "lucide-svelte", "client:component-export": "Tv" })} <span class="text-sm font-medium" style="color: var(--text-primary);">TV Series</span> </a> <a href="/trending" class="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors hover:bg-[var(--bg-hover)]" style="background-color: var(--bg-card); border: 1px solid var(--border);"> ${renderComponent($$result2, "TrendingUp", Trending_up, { "size": 24, "style": "color: var(--accent);", "client:load": true, "client:component-hydration": "load", "client:component-path": "lucide-svelte", "client:component-export": "TrendingUp" })} <span class="text-sm font-medium" style="color: var(--text-primary);">Trending</span> </a> </div> </div> </div> ` })}`;
}, "/var/www/trendimovies/src/pages/404.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
