import type { APIRoute } from 'astro';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const TGSTREAM_BASE = 'https://trendimovies.com/tgstream/stream';
const TMDB_API_KEY = process.env.TMDB_API_KEY || import.meta.env.TMDB_API_KEY || '46300aaf372203a94763f1f46846e843';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper: Generate URL-safe slug from title (includes TMDB ID for uniqueness)
function generateSlug(title: string, year: number | null, tmdbId: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  // Include TMDB ID to guarantee uniqueness (e.g., "kill-2024-1160018")
  return year ? `${base}-${year}-${tmdbId}` : `${base}-${tmdbId}`;
}

// Helper: Import movie from TMDB if not in database
async function importMovieFromTMDB(tmdbId: number): Promise<boolean> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`, {
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return false;
    const movie = await res.json();

    const year = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : null;
    const slug = generateSlug(movie.title, year, tmdbId);

    const movieData = {
      tmdb_id: movie.id,
      slug: slug,
      title: movie.title,
      original_title: movie.original_title || movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date || null,
      year: year,
      runtime: movie.runtime || null,
      vote_average: movie.vote_average || 0,
      vote_count: movie.vote_count || 0,
      popularity: movie.popularity || 0,
      genres: movie.genres?.map((g: any) => g.name).join(', ') || '',
      tagline: movie.tagline || '',
      status: movie.status || 'Released',
      original_language: movie.original_language || 'en',
      budget: movie.budget || 0,
      revenue: movie.revenue || 0,
      imdb_id: movie.imdb_id || null,
      has_downloads: true,
      view_count: 0
    };

    const insertRes = await fetch(`${POSTGREST_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(movieData)
    });
    console.log(`Imported movie: ${movie.title} (${tmdbId}) - ${insertRes.ok ? 'success' : 'failed'}`);
    return insertRes.ok;
  } catch (err) {
    console.error(`Error importing movie ${tmdbId}:`, err);
    return false;
  }
}

// Helper: Check if movie exists in database
async function movieExists(tmdbId: number): Promise<boolean> {
  try {
    const res = await fetch(`${POSTGREST_URL}/movies?tmdb_id=eq.${tmdbId}&select=tmdb_id`, {
      headers: { 'Accept-Profile': 'public' }
    });
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      content_type,
      content_id,
      source,
      quality,
      file_size,
      telegram_file_id,
      url,
    } = body;

    // Validate required fields
    if (!content_type || !content_id || !source || !quality) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: content_type, content_id, source, quality'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['movie', 'episode'].includes(content_type)) {
      return new Response(JSON.stringify({
        error: 'content_type must be "movie" or "episode"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['telegram', 'cinematika', 'torrent'].includes(source)) {
      return new Response(JSON.stringify({
        error: 'source must be "telegram", "cinematika", or "torrent"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['720p', '1080p', '2160p', 'hdrip'].includes(quality)) {
      return new Response(JSON.stringify({
        error: 'quality must be "720p", "1080p", "2160p", or "hdrip"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build the download URL
    let downloadUrl = url;
    if (source === 'telegram') {
      if (!telegram_file_id) {
        return new Response(JSON.stringify({
          error: 'telegram_file_id required for telegram source'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      downloadUrl = `${TGSTREAM_BASE}/${telegram_file_id}`;
    }

    if (!downloadUrl) {
      return new Response(JSON.stringify({
        error: 'url required for non-telegram sources'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // AUTO-IMPORT: If movie doesn't exist in database, import from TMDB
    if (content_type === 'movie') {
      const exists = await movieExists(parseInt(content_id));
      if (!exists) {
        console.log(`Movie ${content_id} not in database, importing from TMDB...`);
        const imported = await importMovieFromTMDB(parseInt(content_id));
        if (!imported) {
          return new Response(JSON.stringify({
            error: 'Movie not in database and failed to import from TMDB. Please try again.'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // CHECK FOR DUPLICATES: Prevent adding same quality/source for same content
    const duplicateCheck = await fetch(
      `${POSTGREST_URL}/download_links?content_type=eq.${content_type}&content_id=eq.${content_id}&quality=eq.${quality}&source=eq.${source}&select=id`,
      { headers: { 'Accept-Profile': 'public' } }
    );
    const existingLinks = await duplicateCheck.json();
    if (Array.isArray(existingLinks) && existingLinks.length > 0) {
      return new Response(JSON.stringify({
        error: `A ${quality} link from ${source} already exists for this content. Delete the existing link first if you want to replace it.`
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert into download_links
    const linkData = {
      content_type,
      content_id: parseInt(content_id),
      source,
      quality,
      file_size: file_size || null,
      url: downloadUrl,
      telegram_file_id: telegram_file_id?.toString() || null,
      is_active: true,
      click_count: 0,
      language: 'en',
      has_subtitle: false
    };

    const response = await fetch(`${POSTGREST_URL}/download_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(linkData)
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await response.json();

    // Update has_downloads flag on the content
    if (content_type === 'movie') {
      await fetch(`${POSTGREST_URL}/movies?tmdb_id=eq.${content_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Profile': 'public'
        },
        body: JSON.stringify({ has_downloads: true })
      });
    } else if (content_type === 'episode') {
      await fetch(`${POSTGREST_URL}/episodes?id=eq.${content_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Profile': 'public'
        },
        body: JSON.stringify({ has_downloads: true })
      });
    }

    return new Response(JSON.stringify({
      success: true,
      link: Array.isArray(result) ? result[0] : result
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create link'
    }), {
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
      return new Response(JSON.stringify({ error: 'Missing link id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the link first to check content_type and content_id
    const getRes = await fetch(`${POSTGREST_URL}/download_links?id=eq.${id}`, {
      headers: { 'Accept-Profile': 'public' }
    });
    const links = await getRes.json();
    const link = links?.[0];

    if (!link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the link
    const response = await fetch(`${POSTGREST_URL}/download_links?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'Accept-Profile': 'public' }
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if there are any remaining links for this content
    const remainingRes = await fetch(
      `${POSTGREST_URL}/download_links?content_type=eq.${link.content_type}&content_id=eq.${link.content_id}&select=count`,
      { headers: { 'Accept-Profile': 'public' } }
    );
    const remaining = await remainingRes.json();
    const remainingCount = remaining?.[0]?.count || 0;

    // If no links remain, update has_downloads to false
    if (remainingCount === 0) {
      if (link.content_type === 'movie') {
        await fetch(`${POSTGREST_URL}/movies?tmdb_id=eq.${link.content_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Profile': 'public'
          },
          body: JSON.stringify({ has_downloads: false })
        });
      } else if (link.content_type === 'episode') {
        await fetch(`${POSTGREST_URL}/episodes?id=eq.${link.content_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Profile': 'public'
          },
          body: JSON.stringify({ has_downloads: false })
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message || 'Failed to delete link'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
