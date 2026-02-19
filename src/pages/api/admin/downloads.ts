import type { APIRoute } from 'astro';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const contentType = url.searchParams.get('content_type') || '';
  const source = url.searchParams.get('source') || '';
  const offset = (page - 1) * limit;

  try {
    let contentIds: number[] = [];

    // If search provided, first find matching movies/content by title
    if (search) {
      // Search movies by title
      const movieSearchRes = await fetch(
        `${POSTGREST_URL}/movies?select=tmdb_id&title=ilike.*${encodeURIComponent(search)}*&limit=100`,
        { headers: { 'Accept-Profile': 'public' } }
      );
      const matchingMovies = await movieSearchRes.json();
      contentIds = (matchingMovies || []).map((m: any) => m.tmdb_id);

      // If no results and search looks like a number, treat it as content_id
      if (contentIds.length === 0 && /^\d+$/.test(search)) {
        contentIds = [parseInt(search)];
      }

      // If still no matches, return empty
      if (contentIds.length === 0) {
        return new Response(JSON.stringify({
          links: [],
          total: 0,
          page,
          totalPages: 0
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Build query URL
    let queryUrl = `${POSTGREST_URL}/download_links?select=*&order=id.desc`;
    let countUrl = `${POSTGREST_URL}/download_links?select=count`;

    // Add content_id filter if searching
    if (contentIds.length > 0) {
      const idsFilter = `content_id=in.(${contentIds.join(',')})`;
      queryUrl += `&${idsFilter}`;
      countUrl += `&${idsFilter}`;
    }

    if (contentType) {
      queryUrl += `&content_type=eq.${contentType}`;
      countUrl += `&content_type=eq.${contentType}`;
    }
    if (source) {
      queryUrl += `&source=eq.${source}`;
      countUrl += `&source=eq.${source}`;
    }

    queryUrl += `&offset=${offset}&limit=${limit}`;

    const [linksRes, countRes] = await Promise.all([
      fetch(queryUrl, { headers: { 'Accept-Profile': 'public' } }),
      fetch(countUrl, { headers: { 'Accept-Profile': 'public' } })
    ]);

    let links = await linksRes.json();
    const countData = await countRes.json();
    const total = countData?.[0]?.count || 0;

    // Enrich links with movie titles
    if (links && links.length > 0) {
      const movieIds = [...new Set(links.filter((l: any) => l.content_type === 'movie').map((l: any) => l.content_id))];

      if (movieIds.length > 0) {
        const moviesRes = await fetch(
          `${POSTGREST_URL}/movies?select=tmdb_id,title&tmdb_id=in.(${movieIds.join(',')})`,
          { headers: { 'Accept-Profile': 'public' } }
        );
        const movies = await moviesRes.json();
        const movieMap = new Map((movies || []).map((m: any) => [m.tmdb_id, m.title]));

        links = links.map((link: any) => ({
          ...link,
          content_title: link.content_type === 'movie' ? movieMap.get(link.content_id) || `Movie ${link.content_id}` : `Episode ${link.content_id}`
        }));
      }
    }

    return new Response(JSON.stringify({
      links,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message || 'Failed to fetch links'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
