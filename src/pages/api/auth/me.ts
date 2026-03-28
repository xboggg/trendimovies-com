import type { APIRoute } from 'astro';
import { validateSession } from '../../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;

    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, user: null }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { valid, user } = await validateSession(sessionToken);

    if (!valid || !user) {
      // Clear invalid session
      cookies.delete('session', { path: '/' });
      return new Response(JSON.stringify({ success: false, user: null }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, user }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return new Response(JSON.stringify({ success: false, user: null }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
