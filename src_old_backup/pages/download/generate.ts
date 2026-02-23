import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// Generate a random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const GET: APIRoute = async ({ url, redirect }) => {
  const linkId = url.searchParams.get('link_id');
  const contentType = url.searchParams.get('type');
  const contentId = url.searchParams.get('id');

  if (!linkId || !contentType || !contentId) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch the download link
    const { data: link, error } = await supabase
      .from('download_links')
      .select('*')
      .eq('id', parseInt(linkId))
      .single();

    if (error || !link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate token for tracking
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store download token
    await supabase.from('download_tokens').insert({
      token,
      link_id: parseInt(linkId),
      content_type: contentType,
      content_id: parseInt(contentId),
      expires_at: expiresAt.toISOString(),
      ip_address: url.searchParams.get('ip') || null
    });

    // Increment click count
    await supabase.from('download_links').update({
      click_count: (link.click_count || 0) + 1
    }).eq('id', parseInt(linkId));

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
