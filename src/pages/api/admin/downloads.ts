import type { APIRoute } from 'astro';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const contentType = url.searchParams.get('content_type') || '';
  const source = url.searchParams.get('source') || '';
  const year = url.searchParams.get('year') || '';
  const offset = (page - 1) * limit;

  try {
    let contentIds: number[] = [];

    // If search or year provided, first find matching movies/content
    if (search || year) {
      // Build movie search query
      let movieSearchUrl = `${POSTGREST_URL}/movies?select=tmdb_id`;

      if (search) {
        // Replace spaces with * wildcards for PostgREST ilike pattern matching
        // Also escape any special regex characters
        const cleanSearch = search.replace(/[%_]/g, '\\$&').replace(/\s+/g, '*');
        movieSearchUrl += `&title=ilike.*${cleanSearch}*`;
      }
      if (year) {
        movieSearchUrl += `&year=eq.${parseInt(year)}`;
      }
      movieSearchUrl += '&limit=500';

      const movieSearchRes = await fetch(movieSearchUrl, { headers: { 'Accept-Profile': 'public' } });
      const matchingMovies = await movieSearchRes.json();
      contentIds = Array.isArray(matchingMovies) ? matchingMovies.map((m: any) => m.tmdb_id) : [];

      // If no results and search looks like a number (and no year filter), treat it as content_id
      if (contentIds.length === 0 && search && /^\d+$/.test(search) && !year) {
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
    const total = Array.isArray(countData) ? (countData[0]?.count || 0) : 0;

    // Ensure links is an array
    if (!Array.isArray(links)) {
      links = [];
    }

    // Enrich links with movie titles
    if (links.length > 0) {
      const movieIds = [...new Set(links.filter((l: any) => l.content_type === 'movie').map((l: any) => l.content_id))];

      if (movieIds.length > 0) {
        const moviesRes = await fetch(
          `${POSTGREST_URL}/movies?select=tmdb_id,title,year&tmdb_id=in.(${movieIds.join(',')})`,
          { headers: { 'Accept-Profile': 'public' } }
        );
        const movies = await moviesRes.json();
        const movieMap = new Map(Array.isArray(movies) ? movies.map((m: any) => [m.tmdb_id, { title: m.title, year: m.year }]) : []);

        links = links.map((link: any) => {
          if (link.content_type === 'movie') {
            const movie = movieMap.get(link.content_id);
            return {
              ...link,
              content_title: movie ? `${movie.title} (${movie.year})` : `Movie ${link.content_id}`
            };
          }
          return {
            ...link,
            content_title: `Episode ${link.content_id}`
          };
        });
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
