import { i as fallback, e as escape_html, c as attr, f as attr_class, d as ensure_array_like, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
import { o as onDestroy } from './index-server_CS77EolT.mjs';
import { M as MovieCard } from './MovieCard_CFWSEGer.mjs';
/* empty css                         */
import { C as Chevron_left } from './chevron-left_DA35Owfk.mjs';
import { C as Chevron_right } from './chevron-right_CYTSjxVf.mjs';

function ContentRow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let title = $$props['title'];
		let items = fallback($$props['items'], () => [], true);
		let seeAllLink = fallback($$props['seeAllLink'], '');
		let autoScroll = fallback($$props['autoScroll'], false);

		onDestroy(() => {
		});

		$$renderer.push(`<section class="py-6"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between mb-4"><h2 class="text-xl md:text-2xl font-bold" style="color: var(--text-primary);">${escape_html(title)}</h2> `);

		if (seeAllLink) {
			$$renderer.push('<!--[-->');
			$$renderer.push(`<a${attr('href', seeAllLink)} class="text-sm font-medium hover:underline" style="color: var(--accent);">See All</a>`);
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></div> <div class="relative group"><button class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);">`);
		Chevron_left($$renderer, { size: 24, style: 'color: var(--text-primary);' });
		$$renderer.push(`<!----></button> <div${attr_class('flex gap-4 overflow-x-auto hide-scrollbar pb-4 svelte-87356l', void 0, { 'scroll-smooth': !autoScroll })}><!--[-->`);

		const each_array = ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">`);
			MovieCard($$renderer, { item });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div> <button class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style="background-color: var(--bg-card); box-shadow: 0 4px 20px var(--shadow);">`);
		Chevron_right($$renderer, { size: 24, style: 'color: var(--text-primary);' });
		$$renderer.push(`<!----></button></div></div></section>`);
		bind_props($$props, { title, items, seeAllLink, autoScroll });
	});
}

export { ContentRow as C };
