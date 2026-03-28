import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute, n as renderScript } from '../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BH5Mr41D.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_DbfXOWuU.mjs';

const $$Request = createComponent(async ($$result, $$props, $$slots) => {
  const POSTGREST_URL = "http://localhost:3001";
  let recentRequests = [];
  try {
    const res = await fetch(
      `${POSTGREST_URL}/content_requests?select=id,title,content_type,year,status,created_at&order=created_at.desc&limit=20`
    );
    if (res.ok) {
      recentRequests = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch requests:", e);
  }
  function getStatusBadge(status) {
    switch (status) {
      case "pending":
        return { text: "Pending", class: "bg-yellow-500/20 text-yellow-400" };
      case "approved":
        return { text: "Approved", class: "bg-blue-500/20 text-blue-400" };
      case "uploaded":
        return { text: "Uploaded", class: "bg-green-500/20 text-green-400" };
      case "rejected":
        return { text: "Rejected", class: "bg-red-500/20 text-red-400" };
      default:
        return { text: status, class: "bg-gray-500/20 text-gray-400" };
    }
  }
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Request a Movie", "description": "Request movies or TV series to be added to TrendiMovies" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> <div class="grid md:grid-cols-2 gap-8"> <!-- Request Form --> <div> <h1 class="text-3xl font-bold mb-4" style="color: var(--text-primary);">Request a Movie or Series</h1> <p class="mb-6" style="color: var(--text-secondary);">
Can't find what you're looking for? Request it here!
</p> <div class="rounded-lg p-6" style="background-color: var(--bg-card); border: 1px solid var(--border);"> <form id="request-form" class="space-y-4"> <div> <label for="title" class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
Title <span class="text-red-500">*</span> </label> <input type="text" id="title" name="title" required placeholder="e.g., The Dark Knight" class="w-full px-4 py-2 rounded-lg" style="background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border);"> </div> <div class="grid grid-cols-2 gap-4"> <div> <label for="type" class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
Type
</label> <select id="type" name="type" class="w-full px-4 py-2 rounded-lg" style="background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border);"> <option value="movie">Movie</option> <option value="series">TV Series</option> </select> </div> <div> <label for="year" class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
Year
</label> <input type="number" id="year" name="year" placeholder="2024" min="1900" max="2030" class="w-full px-4 py-2 rounded-lg" style="background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border);"> </div> </div> <div> <label for="imdb" class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
IMDb Link (optional)
</label> <input type="url" id="imdb" name="imdb" placeholder="https://www.imdb.com/title/tt..." class="w-full px-4 py-2 rounded-lg" style="background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border);"> </div> <button type="submit" class="w-full btn-primary py-3 font-semibold">
Submit Request
</button> </form> <div id="success-message" class="hidden text-center py-6"> <div class="text-4xl mb-3">✅</div> <h2 class="text-lg font-bold mb-2" style="color: var(--text-primary);">Request Submitted!</h2> <p class="text-sm" style="color: var(--text-secondary);">
We'll review it and try to add it soon.
</p> <button id="new-request" class="mt-4 btn-secondary text-sm">
Submit Another
</button> </div> </div> <!-- Telegram Link --> <div class="mt-6 text-center"> <a href="https://t.me/+n6x4_P8DROA5ZDY0" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style="background-color: #0088cc;"> <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"> <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path> </svg>
Faster? Join Telegram
</a> </div> </div> <!-- Recent Requests --> <div> <h2 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">Recent Requests</h2> <p class="mb-4 text-sm" style="color: var(--text-secondary);">
Track the status of community requests
</p> <div class="rounded-lg overflow-hidden" style="background-color: var(--bg-card); border: 1px solid var(--border);"> ${recentRequests.length > 0 ? renderTemplate`<div class="divide-y" style="border-color: var(--border);"> ${recentRequests.map((req) => {
    const badge = getStatusBadge(req.status);
    return renderTemplate`<div class="p-4 flex items-center justify-between gap-4"> <div class="flex-1 min-w-0"> <h3 class="font-medium truncate" style="color: var(--text-primary);">${req.title}</h3> <div class="flex items-center gap-2 text-xs mt-1" style="color: var(--text-muted);"> <span class="capitalize">${req.content_type}</span> ${req.year && renderTemplate`<span>• ${req.year}</span>`} <span>• ${formatDate(req.created_at)}</span> </div> </div> <span${addAttribute(`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`, "class")}> ${badge.text} </span> </div>`;
  })} </div>` : renderTemplate`<div class="p-8 text-center" style="color: var(--text-muted);"> <p>No requests yet. Be the first!</p> </div>`} </div> <!-- Status Legend --> <div class="mt-4 flex flex-wrap gap-3 text-xs"> <div class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-yellow-400"></span> <span style="color: var(--text-muted);">Pending Review</span> </div> <div class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-blue-400"></span> <span style="color: var(--text-muted);">Approved</span> </div> <div class="flex items-center gap-1"> <span class="w-2 h-2 rounded-full bg-green-400"></span> <span style="color: var(--text-muted);">Available</span> </div> </div> </div> </div> </div> ${renderScript($$result2, "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/request.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/request.astro", void 0);
const $$file = "C:/Users/CyberAware/OneDrive - Government of Ghana - CAGD/ZeroTrust/Visual Studio Code Workspace/trendimovies-com/src/pages/request.astro";
const $$url = "/request";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Request,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
