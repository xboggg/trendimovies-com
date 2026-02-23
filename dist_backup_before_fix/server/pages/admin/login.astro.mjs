import { e as createComponent, l as renderHead, n as renderScript, r as renderTemplate, h as createAstro } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import 'clsx';
import { g as getSessionFromCookies } from '../../chunks/admin-auth_BKc-wy8e.mjs';
/* empty css                                    */
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const session = getSessionFromCookies(Astro2.request.headers.get("cookie"));
  if (session) {
    return Astro2.redirect("/admin");
  }
  return renderTemplate`<html lang="en" class="dark" data-astro-cid-rf56lckb> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow"><title>Admin Login | TrendiMovies</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-rf56lckb> <div class="login-container" data-astro-cid-rf56lckb> <div class="logo" data-astro-cid-rf56lckb> <h1 data-astro-cid-rf56lckb>Trendi<span data-astro-cid-rf56lckb>Movies</span></h1> <p data-astro-cid-rf56lckb>Admin Dashboard</p> </div> <div id="error" class="error-message" data-astro-cid-rf56lckb></div> <form id="loginForm" data-astro-cid-rf56lckb> <div class="form-group" data-astro-cid-rf56lckb> <label for="password" data-astro-cid-rf56lckb>Password</label> <input type="password" id="password" name="password" placeholder="Enter admin password" required autocomplete="current-password" data-astro-cid-rf56lckb> </div> <button type="submit" class="submit-btn" id="submitBtn" data-astro-cid-rf56lckb>
Sign In
</button> </form> </div> ${renderScript($$result, "/var/www/trendimovies/src/pages/admin/login.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/var/www/trendimovies/src/pages/admin/login.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
