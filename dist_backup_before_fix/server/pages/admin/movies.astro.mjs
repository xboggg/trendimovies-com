import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Bd36yBVL.mjs';
import { C as ContentTable } from '../../chunks/ContentTable_ZbrU-3Uf.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Movies = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Movies", "activeTab": "movies" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ContentTable", ContentTable, { "client:load": true, "type": "movies", "client:component-hydration": "load", "client:component-path": "/var/www/trendimovies/src/components/admin/ContentTable.svelte", "client:component-export": "default" })} ` })}`;
}, "/var/www/trendimovies/src/pages/admin/movies.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/movies.astro";
const $$url = "/admin/movies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Movies,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
