import { v as validateSession } from '../../../chunks/auth_C6MnPdwZ.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get("session")?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, user: null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      cookies.delete("session", { path: "/" });
      return new Response(JSON.stringify({ success: false, user: null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true, user }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return new Response(JSON.stringify({ success: false, user: null }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
