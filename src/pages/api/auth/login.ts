import type { APIRoute } from 'astro';
import { loginUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await loginUser(email, password, ipAddress, userAgent);

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set session cookie
    cookies.set('session', result.session!, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return new Response(JSON.stringify({ success: true, user: result.user }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
