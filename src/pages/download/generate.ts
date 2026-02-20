import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { randomBytes } from 'crypto';

// Generate a cryptographically secure random token
function generateToken(): string {
  return randomBytes(24).toString('base64url'); // 32 chars, URL-safe
}

export const GET: APIRoute = async ({ url, redirect, request }) => {
  const linkId = url.searchParams.get('link_id');
  const contentType = url.searchParams.get('type');
  const contentId = url.searchParams.get('id');

  if (!linkId || !contentType || !contentId) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate inputs
  const parsedLinkId = parseInt(linkId);
  const parsedContentId = parseInt(contentId);
  if (isNaN(parsedLinkId) || parsedLinkId <= 0 || isNaN(parsedContentId) || parsedContentId <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!['movie', 'episode'].includes(contentType)) {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch the download link
    const { data: link, error } = await supabase
      .from('download_links')
      .select('*')
      .eq('id', parsedLinkId)
      .single();

    if (error || !link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get real IP address (handle proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || null;

    // Generate token for tracking
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store download token
    await supabase.from('download_tokens').insert({
      token,
      link_id: parsedLinkId,
      content_type: contentType,
      content_id: parsedContentId,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress
    });

    // Increment click count
    await supabase.from('download_links').update({
      click_count: (link.click_count || 0) + 1
    }).eq('id', parsedLinkId);

    // Redirect to download page with ads
    return redirect(`/download/${token}`, 302);
  } catch (err) {
    console.error('Download generate error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
