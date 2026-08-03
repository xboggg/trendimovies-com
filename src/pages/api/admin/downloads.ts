import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/admin-auth';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

// Below this trigram-similarity score, a title is treated as noise rather
// than a real match. 0.25 (the site's own public-search threshold) is far
// too loose for this admin list -- it let unrelated titles like "The Lodge"
// or "The Shaggy Dog" show up for a query like "the shadows edge". 0.4 still
// tolerates a missing apostrophe/typo but drops the noise.
const SEARCH_SIM_THRESHOLD = 0.5;

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
  const status = url.searchParams.get('status') || '';
  const offset = (page - 1) * limit;

  try {
    let movieContentIds: number[] = [];
    let episodeContentIds: number[] = [];
    // relevance score per "movie:<id>" / "episode:<id>" key, only populated
    // when a free-text search actually ran (search_local was used).
    const relevance = new Map<string, number>();

    if (search || year) {
      const parsedYearFilter = year ? parseInt(year) : null;
      const validYear = parsedYearFilter && parsedYearFilter >= 1900 && parsedYearFilter <= 2100 ? parsedYearFilter : null;
      const isTextSearch = !!search && !/^\d+$/.test(search);

      // Search movies. When there is free-text search input, use the same
      // search_local() RPC the public site search uses -- it matches on
      // trigram similarity, not just a literal substring, so a query like
      // "the shadows edge" still finds "The Shadow's Edge" even though the
      // apostrophe is missing (plain ILIKE would not match that). Results
      // are pre-sorted best-first by the RPC; we also keep the score so the
      // final list can be ordered by relevance instead of upload order.
      if (!contentType || contentType === 'movie') {
        if (isTextSearch) {
          const rpcRes = await fetch(`${POSTGREST_URL}/rpc/search_local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept-Profile': 'public' },
            body: JSON.stringify({ search_query: search, search_type: 'movie', result_limit: 100 })
          });
          const matchingMovies = await rpcRes.json();
          if (Array.isArray(matchingMovies)) {
            for (const m of matchingMovies) {
              if (m.sim < SEARCH_SIM_THRESHOLD) continue;
              if (validYear !== null && m.year !== validYear) continue;
              movieContentIds.push(m.id);
              relevance.set(`movie:${m.id}`, m.sim);
            }
          }
        } else if (validYear !== null) {
          const movieSearchRes = await fetch(
            `${POSTGREST_URL}/movies?select=id,tmdb_id&year=eq.${validYear}&limit=500`,
            { headers: { 'Accept-Profile': 'public' } }
          );
          const matchingMovies = await movieSearchRes.json();
          movieContentIds = Array.isArray(matchingMovies) ? matchingMovies.map((m: any) => m.id) : [];
        }
      }

      // Search series/episodes -- same trigram-based matching as movies above.
      if (!contentType || contentType === 'episode') {
        let seriesIds: number[] = [];
        const seriesRelevance = new Map<number, number>();

        if (isTextSearch) {
          const rpcRes = await fetch(`${POSTGREST_URL}/rpc/search_local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept-Profile': 'public' },
            body: JSON.stringify({ search_query: search, search_type: 'series', result_limit: 50 })
          });
          const matchingSeries = await rpcRes.json();
          if (Array.isArray(matchingSeries)) {
            for (const s of matchingSeries) {
              if (s.sim < SEARCH_SIM_THRESHOLD) continue;
              if (validYear !== null && s.year !== validYear) continue;
              seriesIds.push(s.id);
              seriesRelevance.set(s.id, s.sim);
            }
          }
        } else if (validYear !== null) {
          const seriesSearchRes = await fetch(
            `${POSTGREST_URL}/series?select=id&year=eq.${validYear}&limit=100`,
            { headers: { 'Accept-Profile': 'public' } }
          );
          const matchingSeries = await seriesSearchRes.json();
          seriesIds = Array.isArray(matchingSeries) ? matchingSeries.map((s: any) => s.id) : [];
        }

        if (seriesIds.length > 0) {
          const seasonsRes = await fetch(
            `${POSTGREST_URL}/seasons?select=id,series_id&series_id=in.(${seriesIds.join(',')})`,
            { headers: { 'Accept-Profile': 'public' } }
          );
          const seasons = await seasonsRes.json();
          const seasonToSeries = new Map<number, number>();
          if (Array.isArray(seasons)) {
            seasons.forEach((s: any) => seasonToSeries.set(s.id, s.series_id));
          }
          const seasonIds = [...seasonToSeries.keys()];

          if (seasonIds.length > 0) {
            const episodesRes = await fetch(
              `${POSTGREST_URL}/episodes?select=id,season_id&season_id=in.(${seasonIds.join(',')})`,
              { headers: { 'Accept-Profile': 'public' } }
            );
            const episodes = await episodesRes.json();
            if (Array.isArray(episodes)) {
              for (const e of episodes) {
                episodeContentIds.push(e.id);
                const seriesId = seasonToSeries.get(e.season_id);
                const sim = seriesId != null ? seriesRelevance.get(seriesId) : undefined;
                if (sim !== undefined) relevance.set(`episode:${e.id}`, sim);
              }
            }
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

    const usingRelevanceSort = relevance.size > 0;

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

    if (status === 'active' || status === 'inactive') {
      const val = status === 'active' ? 'true' : 'false';
      queryUrl += `&is_active=eq.${val}`;
      countUrl += `&is_active=eq.${val}`;
    }

    let links: any[];
    let total: number;

    if (usingRelevanceSort) {
      // A free-text search narrowed things down to a specific, ranked set of
      // titles. Fetch every matching link (the candidate pool is already
      // small -- capped at 100 movies + 50 series above), sort by the
      // parent title's relevance score, THEN paginate in memory. Sorting by
      // id (upload order) here would bury the actual best match anywhere
      // among however many links its lower-ranked look-alikes have.
      const allRes = await fetch(`${queryUrl}&limit=5000`, { headers: { 'Accept-Profile': 'public' } });
      let all = await allRes.json();
      if (!Array.isArray(all)) all = [];

      all.sort((a: any, b: any) => {
        const simA = relevance.get(`${a.content_type}:${a.content_id}`) ?? 0;
        const simB = relevance.get(`${b.content_type}:${b.content_id}`) ?? 0;
        if (simB !== simA) return simB - simA;
        return b.id - a.id;
      });

      total = all.length;
      links = all.slice(offset, offset + limit);
    } else {
      queryUrl += `&offset=${offset}&limit=${limit}`;

      const [linksRes, countRes] = await Promise.all([
        fetch(queryUrl, { headers: { 'Accept-Profile': 'public' } }),
        fetch(countUrl, { headers: { 'Accept-Profile': 'public' } })
      ]);

      links = await linksRes.json();
      const countData = await countRes.json();
      total = Array.isArray(countData) ? (countData[0]?.count || 0) : 0;

      if (!Array.isArray(links)) {
        links = [];
      }
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
          movies.forEach((m: any) => movieMap.set(m.id, { title: m.title, year: m.year, tmdb_id: m.tmdb_id }));
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

      // Real views: aggregate page_views (/movie/{tmdb_id}) for the movies on this page.
      const viewsByTmdb = new Map<number, number>();
      const tmdbIds = [...movieMap.values()].map((m: any) => m.tmdb_id).filter((x: any) => x != null);
      if (tmdbIds.length > 0) {
        try {
          const vres = await fetch(`${POSTGREST_URL}/rpc/movie_views_by_tmdb`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept-Profile': 'public' },
            body: JSON.stringify({ ids: tmdbIds.map((x: any) => String(x)) })
          });
          if (vres.ok) {
            const rows = await vres.json();
            if (Array.isArray(rows)) rows.forEach((r: any) => viewsByTmdb.set(Number(r.tmdb_id), Number(r.views)));
          }
        } catch (e) { /* leave views null on failure */ }
      }

      links = links.map((link: any) => {
        if (link.content_type === 'movie') {
          const movie = movieMap.get(link.content_id);
          const views = movie && movie.tmdb_id != null ? (viewsByTmdb.get(Number(movie.tmdb_id)) ?? 0) : null;
          return {
            ...link,
            views,
            content_title: movie ? `${movie.title} (${movie.year})` : `Movie ${link.content_id}`
          };
        } else {
          const episode = episodeMap.get(link.content_id);
          if (episode) {
            return {
              ...link,
              views: null,
              content_title: `${episode.series_title} S${String(episode.season_number).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')} (${episode.series_year})`
            };
          }
          return {
            ...link,
            views: null,
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
