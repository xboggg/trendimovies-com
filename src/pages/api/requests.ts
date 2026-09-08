import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
let _apiJwt = '';
try { _apiJwt = readFileSync('/etc/trendimovies/jwt_secret', 'utf-8').trim(); } catch {}
function _apiAuth(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (_apiJwt) h['Authorization'] = 'Bearer ' + jwt.sign({ role: 'web_auth' }, _apiJwt, { expiresIn: '5m' });
  if (extra) Object.assign(h, extra);
  return h;
}
import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/admin-auth';

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

    // Resolve the CURRENT real title for any request linked to a matched
    // movie via tmdb_id (added 2026-09-08). content_requests.title is
    // whatever the requester originally typed and is never edited after
    // creation -- so a fulfilled request with e.g. a misspelled title
    // would otherwise show/notify that original text forever, even though
    // the real movie was correctly found and added under its real name.
    // Best-effort: a lookup failure falls back to the stored title rather
    // than failing the whole request list.
    if (Array.isArray(requests)) {
      const tmdbIds = [...new Set(requests.map((r: any) => r.tmdb_id).filter((id: any) => id))];
      if (tmdbIds.length > 0) {
        try {
          const movieRes = await fetch(
            `${POSTGREST_URL}/movies?tmdb_id=in.(${tmdbIds.join(',')})&select=tmdb_id,title,year`,
            { headers: { 'Accept-Profile': 'public' } }
          );
          if (movieRes.ok) {
            const movies = await movieRes.json();
            const byTmdbId = new Map(movies.map((m: any) => [m.tmdb_id, m]));
            for (const req of requests) {
              const movie = req.tmdb_id ? byTmdbId.get(req.tmdb_id) : null;
              if (movie) {
                req.title = movie.title;
                if (movie.year) req.year = movie.year;
              }
            }
          }
        } catch {
          // Resolution is best-effort; fall back to the stored title.
        }
      }
    }

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
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, tmdb_id: overrideTmdbId } = body;

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

    const updatePayload: Record<string, any> = { status, updated_at: new Date().toISOString() };

    // Require a real, matched movie before allowing "completed" (added
    // 2026-09-08). Previously this just flipped the status with no check
    // at all -- a request could be marked completed with nothing actually
    // added to the catalog (found via a real case: "Aloevera" (2020) was
    // marked completed and its requester notified, but no movie or file
    // for it existed anywhere). Also fixes the notification-title bug:
    // linking tmdb_id here is what lets /api/requests GET resolve the
    // real current title instead of echoing the raw stored request text.
    if (status === 'completed') {
      const reqRes = await fetch(
        `${POSTGREST_URL}/content_requests?id=eq.${id}&select=title,year,content_type`,
        { headers: { 'Accept-Profile': 'public' } }
      );
      const reqData = await reqRes.json();
      const reqRow = Array.isArray(reqData) ? reqData[0] : null;
      const table = reqRow?.content_type === 'series' ? 'series' : 'movies';

      let matchedTmdbId: number | null = null;

      if (overrideTmdbId) {
        // Admin explicitly picked a title -- verify it actually exists in
        // the catalog for this request's content_type.
        const checkRes = await fetch(
          `${POSTGREST_URL}/${table}?tmdb_id=eq.${overrideTmdbId}&select=tmdb_id`,
          { headers: { 'Accept-Profile': 'public' } }
        );
        const checkData = await checkRes.json();
        if (Array.isArray(checkData) && checkData.length > 0) {
          matchedTmdbId = overrideTmdbId;
        } else {
          return new Response(JSON.stringify({
            error: `No ${table === 'series' ? 'series' : 'movie'} in the catalog with tmdb_id ${overrideTmdbId}.`
          }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
      } else if (reqRow?.title) {
        // No explicit link given -- try the same title+year match
        // auto_fulfill_requests() uses, so a title already in the
        // catalog under a normal spelling still auto-links cleanly.
        const yearFilter = reqRow.year
          ? `&year=gte.${reqRow.year - 1}&year=lte.${reqRow.year + 1}`
          : '';
        const matchRes = await fetch(
          `${POSTGREST_URL}/${table}?title=ilike.${encodeURIComponent(reqRow.title)}${yearFilter}&select=tmdb_id&limit=1`,
          { headers: { 'Accept-Profile': 'public' } }
        );
        const matchData = await matchRes.json();
        if (Array.isArray(matchData) && matchData.length > 0) {
          matchedTmdbId = matchData[0].tmdb_id;
        }
      }

      if (!matchedTmdbId) {
        return new Response(JSON.stringify({
          error: `No matching ${table === 'series' ? 'series' : 'movie'} found in the catalog ` +
                 'for this request. Add it first, or pass tmdb_id to link one manually.'
        }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }

      updatePayload.tmdb_id = matchedTmdbId;
      updatePayload.fulfilled_at = new Date().toISOString();
    }

    const response = await fetch(`${POSTGREST_URL}/content_requests?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'public'
      },
      body: JSON.stringify(updatePayload)
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
  const authError = requireAuth(request);
  if (authError) return authError;

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
