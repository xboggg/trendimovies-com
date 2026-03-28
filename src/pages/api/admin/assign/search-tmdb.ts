import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/admin-auth';
import { TMDB_API_KEY } from '../../../../lib/env';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Normalize query to handle & vs and, special characters, etc.
function normalizeQuery(q: string): string[] {
  const queries: string[] = [q];
  
  // If contains "and", also try with "&"
  if (/\band\b/i.test(q)) {
    queries.push(q.replace(/\band\b/gi, '&'));
  }
  
  // If contains "&", also try with "and"
  if (q.includes('&')) {
    queries.push(q.replace(/&/g, 'and'));
  }
  
  // Also try without & or and entirely (just spaces)
  if (/\band\b/i.test(q) || q.includes('&')) {
    queries.push(q.replace(/\s*&\s*/g, ' ').replace(/\s+and\s+/gi, ' '));
  }
  
  return [...new Set(queries)]; // Remove duplicates
}

export const GET: APIRoute = async ({ request, url }) => {
  // Auth check
  const authError = requireAuth(request);
  if (authError) return authError;

  let query = url.searchParams.get('query') || url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'movie';

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ results: [], message: 'Query too short' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Limit query length to prevent abuse
  if (query.length > 100) {
    query = query.substring(0, 100);
  }

  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ results: [], error: 'TMDB API not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if query looks like an IMDb ID (tt followed by numbers)
  const imdbMatch = query.match(/^tt\d{6,}$/i);
  if (imdbMatch) {
    try {
      const findUrl = `${TMDB_BASE_URL}/find/${query}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
      const findResponse = await fetch(findUrl, { signal: AbortSignal.timeout(10000) });
      
      if (findResponse.ok) {
        const findData = await findResponse.json();
        const movieResults = findData.movie_results || [];
        const tvResults = findData.tv_results || [];
        
        const formattedResults = [
          ...movieResults.map((item: any) => ({
            id: item.id,
            title: item.title,
            original_title: item.original_title,
            year: item.release_date?.substring(0, 4) || null,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : null,
            overview: item.overview?.substring(0, 150) || '',
            vote_average: item.vote_average || 0,
            media_type: 'movie'
          })),
          ...tvResults.map((item: any) => ({
            id: item.id,
            title: item.name,
            original_title: item.original_name,
            year: item.first_air_date?.substring(0, 4) || null,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : null,
            overview: item.overview?.substring(0, 150) || '',
            vote_average: item.vote_average || 0,
            media_type: 'tv'
          }))
        ];
        
        if (formattedResults.length > 0) {
          return new Response(JSON.stringify({ results: formattedResults }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (e) {
      console.error('IMDb lookup failed:', e);
    }
  }

  // Extract year from query (e.g., "shelter 2026" -> query="shelter", year=2026)
  let year: string | null = null;
  const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
    query = query.replace(yearMatch[0], '').trim();
  }

  // If query becomes empty after removing year, return empty
  if (!query || query.length < 1) {
    return new Response(JSON.stringify({ results: [], message: 'Query too short after extracting year' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const endpoint = type === 'tv' ? 'search/tv' : 'search/movie';
    
    // Get all query variations (and vs &)
    const queryVariations = normalizeQuery(query);
    
    let allResults: any[] = [];
    const seenIds = new Set<number>();
    
    // Try each query variation
    for (const q of queryVariations) {
      let apiUrl = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&include_adult=false`;

      // Add year filter if extracted
      if (year) {
        apiUrl += type === 'tv' ? `&first_air_date_year=${year}` : `&year=${year}`;
      }

      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });

      if (response.ok) {
        const data = await response.json();
        const results = (data.results || []);
        
        // Add unique results
        for (const item of results) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            allResults.push(item);
          }
        }
      }
      
      // If we found results, no need to try more variations
      if (allResults.length > 0) break;
    }

    // If no results with year filter, try without year
    if (allResults.length === 0 && year) {
      for (const q of queryVariations) {
        const noYearUrl = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&include_adult=false`;
        const noYearResponse = await fetch(noYearUrl, { signal: AbortSignal.timeout(10000) });
        
        if (noYearResponse.ok) {
          const noYearData = await noYearResponse.json();
          const results = (noYearData.results || []);
          
          for (const item of results) {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              allResults.push(item);
            }
          }
        }
        
        if (allResults.length > 0) break;
      }
    }

    // Format results
    let formattedResults = allResults.slice(0, 20).map((item: any) => {
      const itemYear = (type === 'tv' ? item.first_air_date : item.release_date)?.substring(0, 4) || null;
      return {
        id: item.id,
        title: type === 'tv' ? item.name : item.title,
        original_title: type === 'tv' ? item.original_name : item.original_title,
        year: itemYear,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : null,
        overview: item.overview?.substring(0, 150) || '',
        vote_average: item.vote_average || 0,
        media_type: type
      };
    });

    // If year was specified, prefer exact matches but include others
    if (year) {
      const exactMatches = formattedResults.filter((item: any) => item.year === year);
      const otherMatches = formattedResults.filter((item: any) => item.year !== year);
      formattedResults = [...exactMatches, ...otherMatches.slice(0, 5)];
    }

    // Sort by vote_average
    formattedResults.sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));

    return new Response(JSON.stringify({ results: formattedResults }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('TMDB search error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to search TMDB',
      results: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
