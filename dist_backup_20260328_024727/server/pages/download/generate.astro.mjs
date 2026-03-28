import { s as supabase } from '../../chunks/supabase_H7J9YlW_.mjs';
import { randomBytes } from 'crypto';
export { r as renderers } from '../../chunks/_@astro-renderers_DbfXOWuU.mjs';

function generateToken() {
  return randomBytes(24).toString("base64url");
}
const GET = async ({ url, redirect, request }) => {
  const linkId = url.searchParams.get("link_id");
  const contentType = url.searchParams.get("type");
  const contentId = url.searchParams.get("id");
  if (!linkId || !contentType || !contentId) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsedLinkId = parseInt(linkId);
  const parsedContentId = parseInt(contentId);
  if (isNaN(parsedLinkId) || parsedLinkId <= 0 || isNaN(parsedContentId) || parsedContentId <= 0) {
    return new Response(JSON.stringify({ error: "Invalid parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!["movie", "episode"].includes(contentType)) {
    return new Response(JSON.stringify({ error: "Invalid content type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { data: link, error } = await supabase.from("download_links").select("*").eq("id", parsedLinkId).single();
    if (error || !link) {
      return new Response(JSON.stringify({ error: "Link not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await supabase.from("download_tokens").insert({
      token,
      link_id: parsedLinkId,
      content_type: contentType,
      content_id: parsedContentId,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress
    });
    await supabase.from("download_links").update({
      click_count: (link.click_count || 0) + 1
    }).eq("id", parsedLinkId);
    return redirect(`/download/${token}`, 302);
  } catch (err) {
    console.error("Download generate error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
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
