import type { APIRoute } from 'astro';
import { logoutUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('session')?.value;

    if (sessionToken) {
      await logoutUser(sessionToken);
    }

    // Clear session cookie
    cookies.delete('session', { path: '/' });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
