import { c as clearCache, a as cleanupCache, g as getCacheStats } from '../../../chunks/cache_Del9TFGZ.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  if (action === "clear") {
    const cleared = clearCache();
    return new Response(JSON.stringify({
      success: true,
      message: `Cleared ${cleared} cache files`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  if (action === "cleanup") {
    const cleaned = cleanupCache();
    return new Response(JSON.stringify({
      success: true,
      message: `Cleaned up ${cleaned} expired cache files`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  const stats = getCacheStats();
  return new Response(JSON.stringify({
    success: true,
    cache: {
      files: stats.files,
      sizeKB: Math.round(stats.size / 1024),
      sizeMB: (stats.size / 1024 / 1024).toFixed(2),
      oldestAge: stats.oldest ? Math.round((Date.now() - stats.oldest) / 6e4) + " minutes" : "N/A",
      newestAge: stats.newest ? Math.round((Date.now() - stats.newest) / 6e4) + " minutes" : "N/A"
    }
  }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
