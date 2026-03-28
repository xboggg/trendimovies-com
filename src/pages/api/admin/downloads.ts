import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

export const GET: APIRoute = async ({ request, url }) => {
  // Auth check
  const authError = requireAuth(request);
  if (authError) return authError;

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const search = url.searchParams.get('search') || '';
  const contentType = url.searchParams.get('content_type') || '';
  const source = url.searchParams.get('source') || '';
  const year = url.searchParams.get('year') || '';
  const offset = (page - 1) * limit;

  try {
    let movieContentIds: number[] = [];
    let episodeContentIds: number[] = [];

    if (search || year) {
      const cleanSearch = search.replace(/[%_]/g, '\\$&').replace(/\s+/g, '*');

      // Search movies
      if (!contentType || contentType === 'movie') {
        let movieSearchUrl = `${POSTGREST_URL}/movies?select=id,tmdb_id`;
        if (search) {
          movieSearchUrl += `&title=ilike.*${cleanSearch}*`;
        }
        if (year) {
          const parsedYear = parseInt(year);
          if (parsedYear >= 1900 && parsedYear <= 2100) {
            movieSearchUrl += `&year=eq.${parsedYear}`;
          }
        }
        movieSearchUrl += '&limit=500';

        const movieSearchRes = await fetch(movieSearchUrl, { headers: { 'Accept-Profile': 'public' } });
        const matchingMovies = await movieSearchRes.json();
        movieContentIds = Array.isArray(matchingMovies) ? matchingMovies.map((m: any) => m.id) : [];
      }

      // Search series/episodes
      if (!contentType || contentType === 'episode') {
        let seriesSearchUrl = `${POSTGREST_URL}/series?select=id`;
        if (search) {
          seriesSearchUrl += `&title=ilike.*${cleanSearch}*`;
        }
        if (year) {
          const parsedYear = parseInt(year);
          if (parsedYear >= 1900 && parsedYear <= 2100) {
            seriesSearchUrl += `&year=eq.${parsedYear}`;
          }
        }
        seriesSearchUrl += '&limit=100';

        const seriesSearchRes = await fetch(seriesSearchUrl, { headers: { 'Accept-Profile': 'public' } });
        const matchingSeries = await seriesSearchRes.json();
        const seriesIds = Array.isArray(matchingSeries) ? matchingSeries.map((s: any) => s.id) : [];

        if (seriesIds.length > 0) {
          const seasonsRes = await fetch(
            `${POSTGREST_URL}/seasons?select=id&series_id=in.(${seriesIds.join(',')})`,
            { headers: { 'Accept-Profile': 'public' } }
          );
          const seasons = await seasonsRes.json();
          const seasonIds = Array.isArray(seasons) ? seasons.map((s: any) => s.id) : [];

          if (seasonIds.length > 0) {
            const episodesRes = await fetch(
              `${POSTGREST_URL}/episodes?select=id&season_id=in.(${seasonIds.join(',')})`,
              { headers: { 'Accept-Profile': 'public' } }
            );
            const episodes = await episodesRes.json();
            episodeContentIds = Array.isArray(episodes) ? episodes.map((e: any) => e.id) : [];
          }
        }
      }

      // If search is a number, treat as content_id
      if (movieContentIds.length === 0 && episodeContentIds.length === 0 && search && /^\d+$/.test(search) && !year) {
        if (!contentType || contentType === 'movie') {
          movieContentIds = [parseInt(search)];
        }
        if (!contentType || contentType === 'episode') {
          episodeContentIds = [parseInt(search)];
        }
      }

      if (movieContentIds.length === 0 && episodeContentIds.length === 0) {
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

    let queryUrl = `${POSTGREST_URL}/download_links?select=*&order=id.desc`;
    let countUrl = `${POSTGREST_URL}/download_links?select=count`;

    if (movieContentIds.length > 0 || episodeContentIds.length > 0) {
      let orConditions: string[] = [];

      if (movieContentIds.length > 0 && (!contentType || contentType === 'movie')) {
        orConditions.push(`and(content_type.eq.movie,content_id.in.(${movieContentIds.join(',')}))`);
      }
      if (episodeContentIds.length > 0 && (!contentType || contentType === 'episode')) {
        orConditions.push(`and(content_type.eq.episode,content_id.in.(${episodeContentIds.join(',')}))`);
      }

      if (orConditions.length > 0) {
        const orFilter = `or=(${orConditions.join(',')})`;
        queryUrl += `&${orFilter}`;
        countUrl += `&${orFilter}`;
      }
    } else if (contentType && ['movie', 'episode'].includes(contentType)) {
      queryUrl += `&content_type=eq.${contentType}`;
      countUrl += `&content_type=eq.${contentType}`;
    }

    if (source && ['telegram', 'cinematika', 'torrent'].includes(source)) {
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

    if (!Array.isArray(links)) {
      links = [];
    }

    if (links.length > 0) {
      const movieIds = [...new Set(links.filter((l: any) => l.content_type === 'movie').map((l: any) => l.content_id))];
      const episodeIds = [...new Set(links.filter((l: any) => l.content_type === 'episode').map((l: any) => l.content_id))];

      const movieMap = new Map();
      const episodeMap = new Map();

      if (movieIds.length > 0) {
        const moviesRes = await fetch(
          `${POSTGREST_URL}/movies?select=id,tmdb_id,title,year&id=in.(${movieIds.join(',')})`,
          { headers: { 'Accept-Profile': 'public' } }
        );
        const movies = await moviesRes.json();
        if (Array.isArray(movies)) {
          movies.forEach((m: any) => movieMap.set(m.id, { title: m.title, year: m.year }));
        }
      }

      if (episodeIds.length > 0) {
        const episodesRes = await fetch(
          `${POSTGREST_URL}/episodes?select=id,episode_number,season_id&id=in.(${episodeIds.join(',')})`,
          { headers: { 'Accept-Profile': 'public' } }
        );
        const episodes = await episodesRes.json();

        if (Array.isArray(episodes) && episodes.length > 0) {
          const seasonIds = [...new Set(episodes.map((e: any) => e.season_id))];
          const seasonsRes = await fetch(
            `${POSTGREST_URL}/seasons?select=id,season_number,series_id&id=in.(${seasonIds.join(',')})`,
            { headers: { 'Accept-Profile': 'public' } }
          );
          const seasons = await seasonsRes.json();
          const seasonMap = new Map();

          if (Array.isArray(seasons) && seasons.length > 0) {
            const seriesIds = [...new Set(seasons.map((s: any) => s.series_id))];
            const seriesRes = await fetch(
              `${POSTGREST_URL}/series?select=id,title,year&id=in.(${seriesIds.join(',')})`,
              { headers: { 'Accept-Profile': 'public' } }
            );
            const seriesData = await seriesRes.json();
            const seriesMap = new Map();
            if (Array.isArray(seriesData)) {
              seriesData.forEach((s: any) => seriesMap.set(s.id, { title: s.title, year: s.year }));
            }

            seasons.forEach((s: any) => {
              const series = seriesMap.get(s.series_id);
              seasonMap.set(s.id, {
                season_number: s.season_number,
                series_title: series?.title || 'Unknown',
                series_year: series?.year
              });
            });
          }

          episodes.forEach((e: any) => {
            const season = seasonMap.get(e.season_id);
            episodeMap.set(e.id, {
              episode_number: e.episode_number,
              season_number: season?.season_number,
              series_title: season?.series_title,
              series_year: season?.series_year
            });
          });
        }
      }

      links = links.map((link: any) => {
        if (link.content_type === 'movie') {
          const movie = movieMap.get(link.content_id);
          return {
            ...link,
            content_title: movie ? `${movie.title} (${movie.year})` : `Movie ${link.content_id}`
          };
        } else {
          const episode = episodeMap.get(link.content_id);
          if (episode) {
            return {
              ...link,
              content_title: `${episode.series_title} S${String(episode.season_number).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')} (${episode.series_year})`
            };
          }
          return {
            ...link,
            content_title: `Episode ${link.content_id}`
          };
        }
      });
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
      error: 'Failed to fetch links'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
