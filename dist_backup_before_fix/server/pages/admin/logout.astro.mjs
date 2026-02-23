import { e as createComponent } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import 'clsx';
import { c as clearSessionCookie } from '../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Logout = createComponent(($$result, $$props, $$slots) => {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/admin/login",
      "Set-Cookie": clearSessionCookie()
    }
  });
}, "/var/www/trendimovies/src/pages/admin/logout.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/logout.astro";
const $$url = "/admin/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logout,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
