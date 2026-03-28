import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_UnkNmAYZ.mjs';
import { v as validateSession } from '../chunks/auth_C6MnPdwZ.mjs';
/* empty css                                 */
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const sessionToken = Astro2.cookies.get("session")?.value;
  if (sessionToken) {
    const { valid } = await validateSession(sessionToken);
    if (valid) {
      return Astro2.redirect("/profile");
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "Login | TrendiMovies", "description": "Login to your TrendiMovies account", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center px-4 py-12" style="background: var(--bg-primary);" data-astro-cid-sgpqyurt> <div class="w-full max-w-md" data-astro-cid-sgpqyurt> <div class="auth-card rounded-2xl p-8" style="background: var(--bg-secondary); border: 1px solid var(--border-color);" data-astro-cid-sgpqyurt> <!-- Tabs --> <div class="flex mb-8 rounded-lg overflow-hidden" style="background: var(--bg-tertiary);" data-astro-cid-sgpqyurt> <button id="loginTab" class="flex-1 py-3 text-center font-semibold transition-all tab-active" style="color: var(--text-primary);" data-astro-cid-sgpqyurt>
Login
</button> <button id="signupTab" class="flex-1 py-3 text-center font-semibold transition-all" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>
Sign Up
</button> </div> <!-- Login Form --> <form id="loginForm" class="space-y-5" data-astro-cid-sgpqyurt> <div data-astro-cid-sgpqyurt> <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>Email</label> <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" placeholder="Enter your email" data-astro-cid-sgpqyurt> </div> <div data-astro-cid-sgpqyurt> <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>Password</label> <input type="password" name="password" required class="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" placeholder="Enter your password" data-astro-cid-sgpqyurt> </div> <div id="loginError" class="hidden text-red-500 text-sm" data-astro-cid-sgpqyurt></div> <button type="submit" class="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style="background: linear-gradient(135deg, #dc2626, #991b1b);" data-astro-cid-sgpqyurt>
Login
</button> </form> <!-- Signup Form --> <form id="signupForm" class="space-y-5 hidden" data-astro-cid-sgpqyurt> <div data-astro-cid-sgpqyurt> <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>Display Name</label> <input type="text" name="displayName" class="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" placeholder="Choose a display name" data-astro-cid-sgpqyurt> </div> <div data-astro-cid-sgpqyurt> <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>Email</label> <input type="email" name="email" required class="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" placeholder="Enter your email" data-astro-cid-sgpqyurt> </div> <div data-astro-cid-sgpqyurt> <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>Password</label> <input type="password" name="password" required minlength="6" class="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" placeholder="Min 6 characters" data-astro-cid-sgpqyurt> </div> <div data-astro-cid-sgpqyurt> <label class="block text-sm font-medium mb-2" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>Confirm Password</label> <input type="password" name="confirmPassword" required class="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" placeholder="Confirm your password" data-astro-cid-sgpqyurt> </div> <div id="signupError" class="hidden text-red-500 text-sm" data-astro-cid-sgpqyurt></div> <button type="submit" class="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50" style="background: linear-gradient(135deg, #dc2626, #991b1b);" data-astro-cid-sgpqyurt>
Create Account
</button> </form> <p class="mt-6 text-center text-sm" style="color: var(--text-secondary);" data-astro-cid-sgpqyurt>
By continuing, you agree to our Terms of Service and Privacy Policy.
</p> </div> </div> </main> ` })}  ${renderScript($$result, "/var/www/trendimovies/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "/var/www/trendimovies/src/pages/login.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
