import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_UnkNmAYZ.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Offline = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Offline - TrendiMovies" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="min-h-[60vh] flex items-center justify-center px-4"> <div class="text-center"> <div class="text-6xl mb-6">📡</div> <h1 class="text-3xl font-bold mb-4" style="color: var(--text-primary);">
You're Offline
</h1> <p class="text-lg mb-6" style="color: var(--text-secondary);">
Please check your internet connection and try again.
</p> <button onclick="window.location.reload()" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
Try Again
</button> </div> </section> ` })}`;
}, "/var/www/trendimovies/src/pages/offline.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/offline.astro";
const $$url = "/offline";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Offline,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
