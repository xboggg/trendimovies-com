import { s as sanitize_props, k as rest_props, i as fallback, l as attributes, g as clsx, d as ensure_array_like, m as element, b as slot, j as bind_props, a as spread_props } from './_@astro-renderers_DbfXOWuU.mjs';

/**
 * @license lucide-svelte v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const defaultAttributes = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
};

function Icon($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);

	const $$restProps = rest_props($$sanitized_props, [
		'name',
		'color',
		'size',
		'strokeWidth',
		'absoluteStrokeWidth',
		'iconNode'
	]);

	$$renderer.component(($$renderer) => {
		let name = fallback($$props['name'], undefined);
		let color = fallback($$props['color'], 'currentColor');
		let size = fallback($$props['size'], 24);
		let strokeWidth = fallback($$props['strokeWidth'], 2);
		let absoluteStrokeWidth = fallback($$props['absoluteStrokeWidth'], false);
		let iconNode = fallback($$props['iconNode'], () => [], true);

		const mergeClasses = (...classes) => classes.filter((className, index, array) => {
			return Boolean(className) && array.indexOf(className) === index;
		}).join(' ');

		$$renderer.push(`<svg${attributes(
			{
				...defaultAttributes,
				...$$restProps,
				width: size,
				height: size,
				stroke: color,
				'stroke-width': absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
				class: clsx(mergeClasses('lucide-icon', 'lucide', name ? `lucide-${name}` : '', $$sanitized_props.class))
			},
			void 0,
			void 0,
			void 0,
			3
		)}><!--[-->`);

		const each_array = ensure_array_like(iconNode);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [tag, attrs] = each_array[$$index];

			element($$renderer, tag, () => {
				$$renderer.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
			});
		}

		$$renderer.push(`<!--]--><!--[-->`);
		slot($$renderer, $$props, 'default', {});
		$$renderer.push(`<!--]--></svg>`);

		bind_props($$props, {
			name,
			color,
			size,
			strokeWidth,
			absoluteStrokeWidth,
			iconNode
		});
	});
}

function Film($$renderer, $$props) {
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
			{ "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
		],
		["path", { "d": "M7 3v18" }],
		["path", { "d": "M3 7.5h4" }],
		["path", { "d": "M3 12h18" }],
		["path", { "d": "M3 16.5h4" }],
		["path", { "d": "M17 3v18" }],
		["path", { "d": "M17 7.5h4" }],
		["path", { "d": "M17 16.5h4" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'film' },
		$$sanitized_props,
		{
			/**
			 * @component @name Film
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik03IDN2MTgiIC8+CiAgPHBhdGggZD0iTTMgNy41aDQiIC8+CiAgPHBhdGggZD0iTTMgMTJoMTgiIC8+CiAgPHBhdGggZD0iTTMgMTYuNWg0IiAvPgogIDxwYXRoIGQ9Ik0xNyAzdjE4IiAvPgogIDxwYXRoIGQ9Ik0xNyA3LjVoNCIgLz4KICA8cGF0aCBkPSJNMTcgMTYuNWg0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/film
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

function Tv($$renderer, $$props) {
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
			{
				"width": "20",
				"height": "15",
				"x": "2",
				"y": "7",
				"rx": "2",
				"ry": "2"
			}
		],
		["polyline", { "points": "17 2 12 7 7 2" }]
	];

	Icon($$renderer, spread_props([
		{ name: 'tv' },
		$$sanitized_props,
		{
			/**
			 * @component @name Tv
			 * @description Lucide SVG icon component, renders SVG Element with children.
			 *
			 * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHg9IjIiIHk9IjciIHJ4PSIyIiByeT0iMiIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxNyAyIDEyIDcgNyAyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/tv
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

export { Film as F, Icon as I, Tv as T };
