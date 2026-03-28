import type { APIRoute } from 'astro';
import { validateSession, getFavorites, addToFavorites, removeFromFavorites } from '../../../lib/auth';

// Get favorites
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const favorites = await getFavorites(user.id);
    return new Response(JSON.stringify({ success: true, favorites }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Add to favorites
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { contentType, tmdbId, title, posterPath } = body;

    if (!contentType || !tmdbId || !title) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const added = await addToFavorites(user.id, contentType, tmdbId, title, posterPath);
    return new Response(JSON.stringify({ success: added }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Remove from favorites
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;
    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { valid, user } = await validateSession(sessionToken);
    if (!valid || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const contentType = url.searchParams.get('contentType') as 'movie' | 'series';
    const tmdbId = parseInt(url.searchParams.get('tmdbId') || '0');

    if (!contentType || !tmdbId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required params' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const removed = await removeFromFavorites(user.id, contentType, tmdbId);
    return new Response(JSON.stringify({ success: removed }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
