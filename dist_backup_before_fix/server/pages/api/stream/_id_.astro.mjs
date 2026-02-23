export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ params }) => {
  const { id } = params;
  if (!id || !/^\d+$/.test(id)) {
    return new Response("Invalid file ID", { status: 400 });
  }
  try {
    const telegramUrl = `https://trendimovies.com/tgstream/stream/${id}`;
    const response = await fetch(telegramUrl, {
      signal: AbortSignal.timeout(3e4)
      // 30 second timeout for initial connection
    });
    if (!response.ok) {
      if (response.status === 404) {
        return new Response("File not found", { status: 404 });
      }
      return new Response("File unavailable", { status: 502 });
    }
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": response.headers.get("content-disposition") || `attachment; filename="download-${id}"`,
        "Content-Length": response.headers.get("content-length") || "",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error(`[Stream Proxy] Error for ID ${id}:`, error.message);
    if (error.name === "TimeoutError") {
      return new Response("File server timeout", { status: 504 });
    }
    return new Response("Internal server error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
