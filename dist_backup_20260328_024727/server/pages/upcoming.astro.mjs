import { e as createComponent, h as createAstro } from '../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import 'clsx';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Upcoming = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Upcoming;
  const today = /* @__PURE__ */ new Date();
  const monthName = today.toLocaleDateString("en-US", { month: "long" }).toLowerCase();
  const year = today.getFullYear();
  const slug = `${monthName}-${year}`;
  return Astro2.redirect(`/upcoming/${slug}`);
}, "/var/www/trendimovies/src/pages/upcoming.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/upcoming.astro";
const $$url = "/upcoming";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Upcoming,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
