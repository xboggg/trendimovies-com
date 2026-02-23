import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, q as defineScriptVars, g as addAttribute, m as maybeRenderHead } from '../../chunks/astro/server_Di6iaaQd.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_B64ZId-j.mjs';
import { s as supabase } from '../../chunks/supabase_H7J9YlW_.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$token = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$token;
  const { token } = Astro2.params;
  const { data: tokenData } = await supabase.from("download_tokens").select("*, download_links(*)").eq("token", token).single();
  const isValid = tokenData && new Date(tokenData.expires_at) > /* @__PURE__ */ new Date();
  const link = tokenData?.download_links;
  let downloadUrl = link?.url || "";
  if (downloadUrl.startsWith("http://127.0.0.1:8765") || downloadUrl.includes("/tgstream/stream/")) {
    const streamId = downloadUrl.split("/").pop();
    downloadUrl = `/api/stream/${streamId}`;
  }
  let contentTitle = "Download";
  if (isValid && link) {
    if (tokenData.content_type === "movie") {
      const { data: movie } = await supabase.from("movies").select("title").eq("id", tokenData.content_id).single();
      if (movie) contentTitle = movie.title;
    } else if (tokenData.content_type === "episode") {
      const POSTGREST_URL = "http://localhost:3001";
      try {
        const epResp = await fetch(
          `${POSTGREST_URL}/episodes?id=eq.${tokenData.content_id}&select=name,episode_number,season_id,series_id`,
          { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(5e3) }
        );
        if (epResp.ok) {
          const epData = await epResp.json();
          if (epData.length > 0) {
            const ep = epData[0];
            const seasonResp = await fetch(
              `${POSTGREST_URL}/seasons?id=eq.${ep.season_id}&select=season_number`,
              { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(5e3) }
            );
            const seasonData = seasonResp.ok ? await seasonResp.json() : [];
            const seasonNum = seasonData.length > 0 ? seasonData[0].season_number : 0;
            const seriesResp = await fetch(
              `${POSTGREST_URL}/series?id=eq.${ep.series_id}&select=title`,
              { headers: { "Accept-Profile": "public" }, signal: AbortSignal.timeout(5e3) }
            );
            const seriesData = seriesResp.ok ? await seriesResp.json() : [];
            const seriesTitle = seriesData.length > 0 ? seriesData[0].title : "Series";
            const sNum = String(seasonNum).padStart(2, "0");
            const eNum = String(ep.episode_number).padStart(2, "0");
            contentTitle = `${seriesTitle} S${sNum}E${eNum}${ep.name ? ` - ${ep.name}` : ""}`;
          }
        }
      } catch (e) {
        console.error("Error fetching episode info:", e);
      }
    }
  }
  function getQualityLabel(quality) {
    switch (quality) {
      case "2160p":
        return "4K Ultra HD";
      case "1080p":
        return "Full HD";
      case "720p":
        return "HD";
      default:
        return quality;
    }
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `Download ${contentTitle}` }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="min-h-[60vh] flex items-center justify-center px-4"> <div class="max-w-md w-full text-center"> ', " </div> </div> <script>(function(){", "\n    if (downloadUrl) {\n      let countdown = 5;\n      const countdownEl = document.getElementById('countdown');\n      const countdownContainer = document.getElementById('countdown-container');\n      const downloadBtn = document.getElementById('download-btn');\n\n      const timer = setInterval(() => {\n        countdown--;\n        if (countdownEl) countdownEl.textContent = countdown.toString();\n\n        if (countdown <= 0) {\n          clearInterval(timer);\n          if (countdownContainer) countdownContainer.style.display = 'none';\n          if (downloadBtn) downloadBtn.style.display = 'block';\n          // Auto-start download\n          window.open(downloadUrl, '_blank');\n        }\n      }, 1000);\n    }\n  })();</script> "])), maybeRenderHead(), !isValid ? renderTemplate`<div class="rounded-lg p-8" style="background-color: var(--bg-card); border: 1px solid var(--border);"> <div class="text-4xl mb-4">❌</div> <h1 class="text-xl font-bold mb-2" style="color: var(--text-primary);">Link Expired or Invalid</h1> <p class="mb-4" style="color: var(--text-secondary);">
This download link has expired or is invalid. Please go back and try again.
</p> <a href="/" class="btn-primary inline-block">
Back to Home
</a> </div>` : renderTemplate`<div class="rounded-lg p-8" style="background-color: var(--bg-card); border: 1px solid var(--border);"> <div class="text-4xl mb-4">📥</div> <h1 class="text-xl font-bold mb-2" style="color: var(--text-primary);">${contentTitle}</h1> <p class="text-sm mb-1" style="color: var(--text-secondary);">
Quality: ${getQualityLabel(link.quality)} </p> ${link.file_size && renderTemplate`<p class="text-sm mb-4" style="color: var(--text-muted);">
Size: ${link.file_size} </p>`} <!-- Countdown Timer --> <div id="countdown-container" class="mb-6"> <p class="text-sm mb-2" style="color: var(--text-secondary);">
Your download will start in
</p> <div id="countdown" class="text-3xl font-bold" style="color: var(--accent);">
5
</div> </div> <!-- Ad Placeholder --> <div class="mb-6 p-4 rounded" style="background-color: var(--bg-secondary); border: 1px dashed var(--border);"> <p class="text-xs" style="color: var(--text-muted);">Advertisement</p> <!-- Insert ad code here --> </div> <!-- Download Button (hidden initially) --> <div id="download-btn" style="display: none;"> <a${addAttribute(downloadUrl, "href")} target="_blank" rel="noopener noreferrer" class="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path> <polyline points="7 10 12 15 17 10"></polyline> <line x1="12" y1="15" x2="12" y2="3"></line> </svg>
Download Now
</a> </div> <p class="text-xs mt-4" style="color: var(--text-muted);">
If download doesn't start, click the button above.
</p> </div>`, defineScriptVars({ downloadUrl })) })}`;
}, "/var/www/trendimovies/src/pages/download/[token].astro", void 0);
const $$file = "/var/www/trendimovies/src/pages/download/[token].astro";
const $$url = "/download/[token]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$token,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
