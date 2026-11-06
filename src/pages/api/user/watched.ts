import type { APIRoute } from 'astro';
import { validateSession, getWatched, addToWatched, removeFromWatched } from '../../../lib/auth';

// Get watched
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

    const watched = await getWatched(user.id);
    return new Response(JSON.stringify({ success: true, watched }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get watched error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Mark as watched
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

    const added = await addToWatched(user.id, contentType, tmdbId, title, posterPath);
    return new Response(JSON.stringify({ success: added }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Add to watched error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Unmark as watched
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

    const removed = await removeFromWatched(user.id, contentType, tmdbId);
    return new Response(JSON.stringify({ success: removed }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Remove from watched error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
