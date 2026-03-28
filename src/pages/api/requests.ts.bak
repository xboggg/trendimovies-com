import type { APIRoute } from 'astro';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    const { title, type, year, imdb, notes } = body;

    if (!title || !type) {
      return new Response(JSON.stringify({ error: 'Title and type are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limit: Check if same IP submitted in last 5 minutes
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';

    const recentCheck = await fetch(
      `${POSTGREST_URL}/content_requests?ip_address=eq.${ip}&created_at=gte.${new Date(Date.now() - 5 * 60 * 1000).toISOString()}&select=count`,
      { headers: { 'Accept-Profile': 'public' } }
    );
    const recentCount = await recentCheck.json();

    if (recentCount?.[0]?.count > 3) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a few minutes.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert the request
    const requestData = {
      title: title.trim().substring(0, 255),
      content_type: type === 'series' ? 'series' : 'movie',
      year: year ? parseInt(year) : null,
      imdb_url: imdb?.trim().substring(0, 500) || null,
      notes: notes?.trim().substring(0, 1000) || null,
      status: 'pending',
      ip_address: ip.substring(0, 45)
    };

    const response = await fetch(`${POSTGREST_URL}/content_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to save request:', error);
      return new Response(JSON.stringify({ error: 'Failed to save request' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Request error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  const status = url.searchParams.get('status') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    let queryUrl = `${POSTGREST_URL}/content_requests?select=*&order=created_at.desc&offset=${offset}&limit=${limit}`;
    let countUrl = `${POSTGREST_URL}/content_requests?select=count`;

    if (status) {
      queryUrl += `&status=eq.${status}`;
      countUrl += `&status=eq.${status}`;
    }

    const [dataRes, countRes] = await Promise.all([
      fetch(queryUrl, { headers: { 'Accept-Profile': 'public' } }),
      fetch(countUrl, { headers: { 'Accept-Profile': 'public' } })
    ]);

    const requests = await dataRes.json();
    const countData = await countRes.json();
    const total = countData?.[0]?.count || 0;

    return new Response(JSON.stringify({
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'ID and status required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(`${POSTGREST_URL}/content_requests?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'public'
      },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to update' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(`${POSTGREST_URL}/content_requests?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'Accept-Profile': 'public' }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to delete' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
