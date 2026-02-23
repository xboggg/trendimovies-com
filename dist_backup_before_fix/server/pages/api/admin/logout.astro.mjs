import { c as clearSessionCookie } from '../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const POST = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie()
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
