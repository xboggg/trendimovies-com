import { b as getMovies } from '../../../chunks/admin-queries_SEI3HfdQ.mjs';
import { r as requireAuth } from '../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const GET = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const search = url.searchParams.get("search") || "";
  const filter = url.searchParams.get("filter") || "all";
  try {
    const data = await getMovies({ page, limit, search, filter });
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch movies", movies: [], total: 0 }), {
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
