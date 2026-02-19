import type { APIRoute } from 'astro';
import { verifyPassword, createSessionToken, createSessionCookie } from '../../../lib/admin-auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();

    if (!password) {
      return new Response(JSON.stringify({ error: 'Password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isValid = await verifyPassword(password);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = createSessionToken();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createSessionCookie(token)
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
