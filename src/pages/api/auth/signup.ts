import type { APIRoute } from 'astro';
import { createUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await createUser(email, password, displayName);

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, user: result.user }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
