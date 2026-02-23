import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Bd36yBVL.mjs';
import { C as ContentTable } from '../../chunks/ContentTable_ZbrU-3Uf.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Series = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Series", "activeTab": "series" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ContentTable", ContentTable, { "client:load": true, "type": "series", "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/ContentTable.svelte", "client:component-export": "default" })} ` })}`;
}, "/var/www/trendimovies/src/pages/admin/series.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/series.astro";
const $$url = "/admin/series";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Series,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
