import { v as verifyPassword, a as createSessionToken, b as createSessionCookie } from '../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const POST = async ({ request }) => {
  try {
    const { password } = await request.json();
    if (!password) {
      return new Response(JSON.stringify({ error: "Password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isValid = await verifyPassword(password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = createSessionToken();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": createSessionCookie(token)
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Login failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
