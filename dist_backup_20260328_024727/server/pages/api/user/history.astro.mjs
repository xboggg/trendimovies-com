import { v as validateSession, d as getWatchHistory, e as addToHistory } from '../../../chunks/auth_C6MnPdwZ.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ request, cookies }) => {
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
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const history = await getWatchHistory(user.id, limit);
    return new Response(JSON.stringify({ success: true, history }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get history error:", error);
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
    const added = await addToHistory(user.id, contentType, tmdbId, title, posterPath);
    return new Response(JSON.stringify({ success: added }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Add to history error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
