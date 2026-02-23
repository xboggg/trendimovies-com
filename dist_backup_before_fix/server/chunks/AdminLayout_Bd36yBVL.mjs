import { e as createComponent, l as renderHead, k as renderComponent, o as Fragment, r as renderTemplate, h as createAstro, p as renderSlot } from './astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { g as getSessionFromCookies } from './admin-auth_BKc-wy8e.mjs';
import { s as sanitize_props, a as spread_props, b as slot, i as fallback, d as ensure_array_like, c as attr, f as attr_class, e as escape_html, j as bind_props } from './_@astro-renderers_DbfXOWuU.mjs';
import { I as Icon, F as Film, T as Tv } from './tv_BwBqCXmW.mjs';
import { D as Download } from './download_CqztGVIg.mjs';
import { C as Clock } from './clock_CjYHN5RC.mjs';
import { C as Chevron_right } from './chevron-right_CYTSjxVf.mjs';
/* empty css                         */
/* empty css                         */

function Activity($$renderer, $$props) {
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
				"d": "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'activity' },
		$$sanitized_props,
		{
			/**
			 * @component @name Activity
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjIgMTJoLTIuNDhhMiAyIDAgMCAwLTEuOTMgMS40NmwtMi4zNSA4LjM2YS4yNS4yNSAwIDAgMS0uNDggMEw5LjI0IDIuMThhLjI1LjI1IDAgMCAwLS40OCAwbC0yLjM1IDguMzZBMiAyIDAgMCAxIDQuNDkgMTJIMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/activity
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

function Layout_dashboard($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		[
			"rect",
			{ "width": "7", "height": "9", "x": "3", "y": "3", "rx": "1" }
		],

		[
			"rect",
			{ "width": "7", "height": "5", "x": "14", "y": "3", "rx": "1" }
		],

		[
			"rect",
			{ "width": "7", "height": "9", "x": "14", "y": "12", "rx": "1" }
		],

		[
			"rect",
			{ "width": "7", "height": "5", "x": "3", "y": "16", "rx": "1" }
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'layout-dashboard' },
		$$sanitized_props,
		{
			/**
			 * @component @name LayoutDashboard
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI5IiB4PSIzIiB5PSIzIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIxNCIgeT0iMyIgcng9IjEiIC8+CiAgPHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iOSIgeD0iMTQiIHk9IjEyIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIzIiB5PSIxNiIgcng9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/layout-dashboard
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

function Link_2($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M9 17H7A5 5 0 0 1 7 7h2" }],
		["path", { "d": "M15 7h2a5 5 0 1 1 0 10h-2" }],
		["line", { "x1": "8", "x2": "16", "y1": "12", "y2": "12" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'link-2' },
		$$sanitized_props,
		{
			/**
			 * @component @name Link2
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAxN0g3QTUgNSAwIDAgMSA3IDdoMiIgLz4KICA8cGF0aCBkPSJNMTUgN2gyYTUgNSAwIDEgMSAwIDEwaC0yIiAvPgogIDxsaW5lIHgxPSI4IiB4Mj0iMTYiIHkxPSIxMiIgeTI9IjEyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/link-2
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

function Log_out($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	/**
	 * @license lucide-svelte v0.468.0 - ISC
	 *
	 * This source code is licensed under the ISC license.
	 * See the LICENSE file in the root directory of this source tree.
	 */
	const iconNode = [
		["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
		["polyline", { "points": "16 17 21 12 16 7" }],
		["line", { "x1": "21", "x2": "9", "y1": "12", "y2": "12" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'log-out' },
		$$sanitized_props,
		{
			/**
			 * @component @name LogOut
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDQiIC8+CiAgPHBvbHlsaW5lIHBvaW50cz0iMTYgMTcgMjEgMTIgMTYgNyIgLz4KICA8bGluZSB4MT0iMjEiIHgyPSI5IiB5MT0iMTIiIHkyPSIxMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/log-out
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

function Message_square($$renderer, $$props) {
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
				"d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
			}
		]
	];

	Icon($$renderer, spread_props([
		{ name: 'message-square' },
		$$sanitized_props,
		{
			/**
			 * @component @name MessageSquare
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTVhMiAyIDAgMCAxLTIgMkg3bC00IDRWNWEyIDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/message-square
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

function Sidebar($$renderer, $$props) {
	let activeTab = fallback($$props['activeTab'], 'dashboard');

	const navItems = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			href: '/admin',
			icon: Layout_dashboard
		},

		{
			id: 'movies',
			label: 'Movies',
			href: '/admin/movies',
			icon: Film
		},

		{
			id: 'series',
			label: 'Series',
			href: '/admin/series',
			icon: Tv
		},

		{
			id: 'downloads',
			label: 'Downloads',
			href: '/admin/downloads',
			icon: Download
		},

		{
			id: 'requests',
			label: 'Requests',
			href: '/admin/requests',
			icon: Message_square
		},

		{
			id: 'crons',
			label: 'Cron Jobs',
			href: '/admin/crons',
			icon: Clock
		},

		{
			id: 'assign',
			label: 'Manual Assign',
			href: '/admin/manual-assign',
			icon: Link_2
		}
	];

	$$renderer.push(`<aside class="fixed left-0 top-0 h-screen w-64 bg-[#141414] border-r border-[#2a2a2a] flex flex-col z-50"><div class="p-5 border-b border-[#2a2a2a]"><a href="/admin" class="flex items-center gap-2"><div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e50914] to-[#b20710] flex items-center justify-center">`);
	Activity($$renderer, { size: 22, class: 'text-white' });
	$$renderer.push(`<!----></div> <div><h2 class="text-lg font-bold text-white">TrendiMovies</h2> <p class="text-xs text-[#666]">Admin Panel</p></div></a></div> <nav class="flex-1 p-3 space-y-1 overflow-y-auto admin-scrollbar"><p class="px-3 py-2 text-xs font-semibold text-[#666] uppercase tracking-wider">Menu</p> <!--[-->`);

	const each_array = ensure_array_like(navItems);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<a${attr('href', item.href)}${attr_class('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative', void 0, {
			'bg-[#e50914]': activeTab === item.id,
			'text-white': activeTab === item.id,
			'text-[#a0a0a0]': activeTab !== item.id,
			'hover:bg-[#1f1f1f]': activeTab !== item.id,
			'hover:text-white': activeTab !== item.id
		})}>`);

		$$renderer.push('<!---->');
		item.icon?.($$renderer, { size: 20 });
		$$renderer.push(`<!----> <span class="font-medium">${escape_html(item.label)}</span> `);

		if (activeTab === item.id) {
			$$renderer.push('<!--[-->');
			Chevron_right($$renderer, { size: 16, class: 'ml-auto' });
		} else {
			$$renderer.push('<!--[!-->');
		}

		$$renderer.push(`<!--]--></a>`);
	}

	$$renderer.push(`<!--]--></nav> <div class="p-3 border-t border-[#2a2a2a]"><a href="/" target="_blank" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> <span class="font-medium">View Site</span></a> <button class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors mt-1 cursor-pointer">`);
	Log_out($$renderer, { size: 20 });
	$$renderer.push(`<!----> <span class="font-medium">Logout</span></button></div></aside>`);
	bind_props($$props, { activeTab });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title, activeTab = "dashboard", showHeader = true } = Astro2.props;
  const session = getSessionFromCookies(Astro2.request.headers.get("cookie"));
  const isAuthenticated = !!session;
  return renderTemplate`<html lang="en" class="dark" data-astro-cid-2kanml4j> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow"><title>${title} | TrendiMovies Admin</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">${renderHead()}</head> <body class="admin-scrollbar" data-astro-cid-2kanml4j> ${isAuthenticated ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-2kanml4j": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Sidebar", Sidebar, { "client:load": true, "activeTab": activeTab, "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/Sidebar.svelte", "client:component-export": "default", "data-astro-cid-2kanml4j": true })} <main class="admin-main" data-astro-cid-2kanml4j> ${showHeader && renderTemplate`<header class="admin-header" data-astro-cid-2kanml4j> <h1 data-astro-cid-2kanml4j>${title}</h1> </header>`} <div class="admin-content" data-astro-cid-2kanml4j> ${renderSlot($$result2, $$slots["default"])} </div> </main> ` })}` : renderTemplate(_a || (_a = __template([`<script>
      window.location.href = '/admin/login';
    <\/script>
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;" data-astro-cid-2kanml4j>
Redirecting to login...
</div>`])))} </body></html>`;
}, "/var/www/trendimovies/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $, Activity as A, Link_2 as L };
