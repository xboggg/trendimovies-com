import { v as validateSession, f as removeFromWatchlist, h as getWatchlist, i as addToWatchlist } from '../../../chunks/auth_C6MnPdwZ.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get("session")?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const watchlist = await getWatchlist(user.id);
    return new Response(JSON.stringify({ success: true, watchlist }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get("session")?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { contentType, tmdbId, title, posterPath } = body;
    if (!contentType || !tmdbId || !title) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const added = await addToWatchlist(user.id, contentType, tmdbId, title, posterPath);
    return new Response(JSON.stringify({ success: added }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Add to watchlist error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get("session")?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const url = new URL(request.url);
    const contentType = url.searchParams.get("contentType");
    const tmdbId = parseInt(url.searchParams.get("tmdbId") || "0");
    if (!contentType || !tmdbId) {
      return new Response(JSON.stringify({ success: false, error: "Missing required params" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const removed = await removeFromWatchlist(user.id, contentType, tmdbId);
    return new Response(JSON.stringify({ success: removed }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
