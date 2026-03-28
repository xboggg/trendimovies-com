import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_BLisAWxb.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_UnkNmAYZ.mjs';
import { v as validateSession, h as getWatchlist, g as getFavorites, d as getWatchHistory } from '../chunks/auth_C6MnPdwZ.mjs';
/* empty css                                   */
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Astro = createAstro();
const $$Profile = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Profile;
  const sessionToken = Astro2.cookies.get("session")?.value;
  if (!sessionToken) {
    return Astro2.redirect("/login");
  }
  const { valid, user } = await validateSession(sessionToken);
  if (!valid || !user) {
    Astro2.cookies.delete("session", { path: "/" });
    return Astro2.redirect("/login");
  }
  const watchlist = await getWatchlist(user.id);
  const favorites = await getFavorites(user.id);
  const history = await getWatchHistory(user.id, 10);
  const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
  return renderTemplate`${renderComponent($$result, "Layout", $$BaseLayout, { "title": "My Profile | TrendiMovies", "description": "Your TrendiMovies profile", "data-astro-cid-wwes6yjo": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen px-4 py-8" style="background: var(--bg-primary);" data-astro-cid-wwes6yjo> <div class="max-w-6xl mx-auto" data-astro-cid-wwes6yjo> <!-- Profile Header --> <div class="flex items-center justify-between mb-8 p-6 rounded-2xl" style="background: var(--bg-secondary); border: 1px solid var(--border-color);" data-astro-cid-wwes6yjo> <div class="flex items-center gap-4" data-astro-cid-wwes6yjo> <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style="background: linear-gradient(135deg, #dc2626, #991b1b);" data-astro-cid-wwes6yjo> ${user.display_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()} </div> <div data-astro-cid-wwes6yjo> <h1 class="text-2xl font-bold" style="color: var(--text-primary);" data-astro-cid-wwes6yjo>${user.display_name || "User"}</h1> <p class="text-sm" style="color: var(--text-secondary);" data-astro-cid-wwes6yjo>${user.email}</p> </div> </div> <button id="logoutBtn" class="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);" data-astro-cid-wwes6yjo>
Logout
</button> </div> <!-- Tabs --> <div class="flex gap-2 mb-6 overflow-x-auto pb-2" data-astro-cid-wwes6yjo> <button class="profile-tab active px-6 py-2 rounded-lg font-medium whitespace-nowrap" data-tab="watchlist" data-astro-cid-wwes6yjo>
Watchlist (${watchlist.length})
</button> <button class="profile-tab px-6 py-2 rounded-lg font-medium whitespace-nowrap" data-tab="favorites" data-astro-cid-wwes6yjo>
Favorites (${favorites.length})
</button> <button class="profile-tab px-6 py-2 rounded-lg font-medium whitespace-nowrap" data-tab="history" data-astro-cid-wwes6yjo>
History (${history.length})
</button> </div> <!-- Watchlist --> <div id="watchlist-content" class="tab-content" data-astro-cid-wwes6yjo> ${watchlist.length === 0 ? renderTemplate`<div class="text-center py-12 rounded-xl" style="background: var(--bg-secondary); border: 1px solid var(--border-color);" data-astro-cid-wwes6yjo> <p class="text-lg mb-4" style="color: var(--text-secondary);" data-astro-cid-wwes6yjo>Your watchlist is empty</p> <a href="/movies" class="inline-block px-6 py-2 rounded-lg text-white font-medium" style="background: linear-gradient(135deg, #dc2626, #991b1b);" data-astro-cid-wwes6yjo>
Browse Movies
</a> </div>` : renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" data-astro-cid-wwes6yjo> ${watchlist.map((item) => renderTemplate`<a${addAttribute(`/${item.content_type === "movie" ? "movie" : "tv"}/${item.tmdb_id}`, "href")} class="group relative rounded-lg overflow-hidden" style="background: var(--bg-secondary);" data-astro-cid-wwes6yjo> <img${addAttribute(item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : "/placeholder.jpg", "src")}${addAttribute(item.title, "alt")} class="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-105" loading="lazy" data-astro-cid-wwes6yjo> <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" data-astro-cid-wwes6yjo> <div class="absolute bottom-0 left-0 right-0 p-3" data-astro-cid-wwes6yjo> <p class="text-white text-sm font-medium line-clamp-2" data-astro-cid-wwes6yjo>${item.title}</p> <span class="text-xs text-gray-300 capitalize" data-astro-cid-wwes6yjo>${item.content_type}</span> </div> </div> <button class="remove-item absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" data-type="watchlist"${addAttribute(item.content_type, "data-content-type")}${addAttribute(item.tmdb_id, "data-tmdb-id")} title="Remove from watchlist" data-astro-cid-wwes6yjo> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-wwes6yjo> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-astro-cid-wwes6yjo></path> </svg> </button> </a>`)} </div>`} </div> <!-- Favorites --> <div id="favorites-content" class="tab-content hidden" data-astro-cid-wwes6yjo> ${favorites.length === 0 ? renderTemplate`<div class="text-center py-12 rounded-xl" style="background: var(--bg-secondary); border: 1px solid var(--border-color);" data-astro-cid-wwes6yjo> <p class="text-lg mb-4" style="color: var(--text-secondary);" data-astro-cid-wwes6yjo>No favorites yet</p> <a href="/movies" class="inline-block px-6 py-2 rounded-lg text-white font-medium" style="background: linear-gradient(135deg, #dc2626, #991b1b);" data-astro-cid-wwes6yjo>
Browse Movies
</a> </div>` : renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" data-astro-cid-wwes6yjo> ${favorites.map((item) => renderTemplate`<a${addAttribute(`/${item.content_type === "movie" ? "movie" : "tv"}/${item.tmdb_id}`, "href")} class="group relative rounded-lg overflow-hidden" style="background: var(--bg-secondary);" data-astro-cid-wwes6yjo> <img${addAttribute(item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : "/placeholder.jpg", "src")}${addAttribute(item.title, "alt")} class="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-105" loading="lazy" data-astro-cid-wwes6yjo> <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" data-astro-cid-wwes6yjo> <div class="absolute bottom-0 left-0 right-0 p-3" data-astro-cid-wwes6yjo> <p class="text-white text-sm font-medium line-clamp-2" data-astro-cid-wwes6yjo>${item.title}</p> <span class="text-xs text-gray-300 capitalize" data-astro-cid-wwes6yjo>${item.content_type}</span> </div> </div> <button class="remove-item absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" data-type="favorites"${addAttribute(item.content_type, "data-content-type")}${addAttribute(item.tmdb_id, "data-tmdb-id")} title="Remove from favorites" data-astro-cid-wwes6yjo> <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-wwes6yjo> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-astro-cid-wwes6yjo></path> </svg> </button> </a>`)} </div>`} </div> <!-- History --> <div id="history-content" class="tab-content hidden" data-astro-cid-wwes6yjo> ${history.length === 0 ? renderTemplate`<div class="text-center py-12 rounded-xl" style="background: var(--bg-secondary); border: 1px solid var(--border-color);" data-astro-cid-wwes6yjo> <p class="text-lg mb-4" style="color: var(--text-secondary);" data-astro-cid-wwes6yjo>No watch history yet</p> <a href="/movies" class="inline-block px-6 py-2 rounded-lg text-white font-medium" style="background: linear-gradient(135deg, #dc2626, #991b1b);" data-astro-cid-wwes6yjo>
Start Watching
</a> </div>` : renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" data-astro-cid-wwes6yjo> ${history.map((item) => renderTemplate`<a${addAttribute(`/${item.content_type === "movie" ? "movie" : "tv"}/${item.tmdb_id}`, "href")} class="group relative rounded-lg overflow-hidden" style="background: var(--bg-secondary);" data-astro-cid-wwes6yjo> <img${addAttribute(item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : "/placeholder.jpg", "src")}${addAttribute(item.title, "alt")} class="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-105" loading="lazy" data-astro-cid-wwes6yjo> <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" data-astro-cid-wwes6yjo> <div class="absolute bottom-0 left-0 right-0 p-3" data-astro-cid-wwes6yjo> <p class="text-white text-sm font-medium line-clamp-2" data-astro-cid-wwes6yjo>${item.title}</p> <span class="text-xs text-gray-300" data-astro-cid-wwes6yjo>${new Date(item.watched_at).toLocaleDateString()}</span> </div> </div> </a>`)} </div>`} </div> </div> </main> ` })}  ${renderScript($$result, "/var/www/trendimovies/src/pages/profile.astro?astro&type=script&index=0&lang.ts")}`;
}, "/var/www/trendimovies/src/pages/profile.astro", void 0);

const $$file = "/var/www/trendimovies/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
