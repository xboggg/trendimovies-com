import type { APIRoute } from 'astro';
import { validateSession, getWatchHistory, addToHistory } from '../../../lib/auth';

// Get watch history
export const GET: APIRoute = async ({ request, cookies }) => {
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
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const history = await getWatchHistory(user.id, limit);
    return new Response(JSON.stringify({ success: true, history }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get history error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Add to history
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

    const added = await addToHistory(user.id, contentType, tmdbId, title, posterPath);
    return new Response(JSON.stringify({ success: added }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Add to history error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
