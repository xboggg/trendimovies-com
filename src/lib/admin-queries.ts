const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

interface FetchOptions {
  timeout?: number;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 10000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Profile': 'public' }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getDashboardStats() {
  try {
    // Use RPC or efficient count queries - avoid fetching all records
    const queries = [
      // Total counts (these return single row with count)
      fetchWithTimeout(`${POSTGREST_URL}/movies?select=count`),
      fetchWithTimeout(`${POSTGREST_URL}/series?select=count`),
      fetchWithTimeout(`${POSTGREST_URL}/episodes?select=count`),

      // Download links count
      fetchWithTimeout(`${POSTGREST_URL}/download_links?select=count`),

      // Count of movie links (not fetching all, just count)
      fetchWithTimeout(`${POSTGREST_URL}/download_links?select=count&content_type=eq.movie`),

      // Count of episode links
      fetchWithTimeout(`${POSTGREST_URL}/download_links?select=count&content_type=eq.episode`),

      // Movies with has_downloads=true (pre-computed flag)
      fetchWithTimeout(`${POSTGREST_URL}/movies?select=count&has_downloads=eq.true`),

      // Episodes with has_downloads=true
      fetchWithTimeout(`${POSTGREST_URL}/episodes?select=count&has_downloads=eq.true`),

      // Top 10 most viewed movies
      fetchWithTimeout(`${POSTGREST_URL}/movies?select=id,tmdb_id,title,year,view_count,poster_path&order=view_count.desc&limit=10`),

      // Top 10 most viewed series
      fetchWithTimeout(`${POSTGREST_URL}/series?select=id,tmdb_id,title,year,view_count,poster_path&order=view_count.desc&limit=10`),
    ];

    const responses = await Promise.all(queries);
    const [
      totalMoviesRes, totalSeriesRes, totalEpisodesRes,
      downloadLinksCountRes,
      movieLinksCountRes, episodeLinksCountRes,
      moviesWithDDLRes, episodesWithDDLRes,
      topViewedMoviesRes, topViewedSeriesRes
    ] = responses;

    const [
      totalMovies, totalSeries, totalEpisodes,
      downloadLinksCount,
      movieLinksCount, episodeLinksCount,
      moviesWithDDL, episodesWithDDL,
      topViewedMovies, topViewedSeries
    ] = await Promise.all([
      totalMoviesRes.json(),
      totalSeriesRes.json(),
      totalEpisodesRes.json(),
      downloadLinksCountRes.json(),
      movieLinksCountRes.json(),
      episodeLinksCountRes.json(),
      moviesWithDDLRes.json(),
      episodesWithDDLRes.json(),
      topViewedMoviesRes.json(),
      topViewedSeriesRes.json()
    ]);

    const totalMoviesCount = totalMovies?.[0]?.count || 0;
    const totalEpisodesCount = totalEpisodes?.[0]?.count || 0;
    const totalLinksCount = downloadLinksCount?.[0]?.count || 0;
    const moviesWithDDLCount = moviesWithDDL?.[0]?.count || 0;
    const episodesWithDDLCount = episodesWithDDL?.[0]?.count || 0;
    const movieLinksTotal = movieLinksCount?.[0]?.count || 0;
    const episodeLinksTotal = episodeLinksCount?.[0]?.count || 0;

    return {
      totals: {
        movies: totalMoviesCount,
        series: totalSeries?.[0]?.count || 0,
        episodes: totalEpisodesCount,
        downloadLinks: totalLinksCount,
      },
      ddlCoverage: {
        moviesWithDDL: moviesWithDDLCount,
        moviesWithoutDDL: totalMoviesCount - moviesWithDDLCount,
        episodesWithDDL: episodesWithDDLCount,
        episodesWithoutDDL: totalEpisodesCount - episodesWithDDLCount,
      },
      linkCounts: {
        movieLinks: movieLinksTotal,
        episodeLinks: episodeLinksTotal,
      },
      downloads: {
        totalClicks: 0,
        byQuality: { '720p': 0, '1080p': 0, '2160p': 0 },
        bySource: { telegram: 0, cinematika: 0, torrent: 0 },
        byContentType: { movie: 0, episode: 0 },
      },
      topViewed: {
        movies: topViewedMovies || [],
        series: topViewedSeries || [],
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totals: { movies: 0, series: 0, episodes: 0, downloadLinks: 0 },
      ddlCoverage: { moviesWithDDL: 0, moviesWithoutDDL: 0, episodesWithDDL: 0, episodesWithoutDDL: 0 },
      linkCounts: { movieLinks: 0, episodeLinks: 0 },
      downloads: { totalClicks: 0, byQuality: {}, bySource: {}, byContentType: {} },
      topViewed: { movies: [], series: [] },
    };
  }
}

export async function getMovies(options: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'with_ddl' | 'without_ddl';
} = {}) {
  const { page = 1, limit = 50, search = '', filter = 'all' } = options;
  const offset = (page - 1) * limit;

  // Get movies
  let queryUrl = `${POSTGREST_URL}/movies?select=id,tmdb_id,title,year,poster_path,has_downloads,view_count&order=created_at.desc`;
  let countUrl = `${POSTGREST_URL}/movies?select=count`;

  if (search) {
    queryUrl += `&title=ilike.*${encodeURIComponent(search)}*`;
    countUrl += `&title=ilike.*${encodeURIComponent(search)}*`;
  }

  // Note: We'll filter by DDL status after fetching since has_downloads may be stale
  queryUrl += `&offset=${offset}&limit=${limit}`;

  const [moviesRes, countRes] = await Promise.all([
    fetchWithTimeout(queryUrl),
    fetchWithTimeout(countUrl)
  ]);

  let movies = await moviesRes.json();
  const countData = await countRes.json();
  let total = countData[0]?.count || 0;

  // Get actual DDL status from download_links table
  if (movies && movies.length > 0) {
    const movieIds = movies.map((m: any) => m.tmdb_id).filter(Boolean);
    if (movieIds.length > 0) {
      // Get all movie download links to check which movies have DDL
      const ddlRes = await fetchWithTimeout(
        `${POSTGREST_URL}/download_links?select=content_id&content_type=eq.movie&content_id=in.(${movieIds.join(',')})`
      );
      const ddlLinks = await ddlRes.json();
      const movieIdsWithDDL = new Set((ddlLinks || []).map((l: any) => l.content_id));

      // Update has_downloads based on actual download_links
      movies = movies.map((m: any) => ({
        ...m,
        has_downloads: movieIdsWithDDL.has(m.tmdb_id)
      }));
    }
  }

  // Apply DDL filter if requested (after determining actual DDL status)
  if (filter === 'with_ddl') {
    movies = movies.filter((m: any) => m.has_downloads);
  } else if (filter === 'without_ddl') {
    movies = movies.filter((m: any) => !m.has_downloads);
  }

  return {
    movies,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getSeries(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const { page = 1, limit = 50, search = '' } = options;
  const offset = (page - 1) * limit;

  let queryUrl = `${POSTGREST_URL}/series?select=id,tmdb_id,title,year,poster_path,number_of_seasons,number_of_episodes,view_count&order=created_at.desc`;
  let countUrl = `${POSTGREST_URL}/series?select=count`;

  if (search) {
    queryUrl += `&title=ilike.*${encodeURIComponent(search)}*`;
    countUrl += `&title=ilike.*${encodeURIComponent(search)}*`;
  }

  queryUrl += `&offset=${offset}&limit=${limit}`;

  const [seriesRes, countRes] = await Promise.all([
    fetchWithTimeout(queryUrl),
    fetchWithTimeout(countUrl)
  ]);

  const series = await seriesRes.json();
  const countData = await countRes.json();
  const total = countData[0]?.count || 0;

  return {
    series,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getDownloadStats() {
  const response = await fetchWithTimeout(
    `${POSTGREST_URL}/download_links?select=id,content_type,content_id,source,quality,click_count,file_size,is_active&order=click_count.desc&limit=100`
  );
  const links = await response.json();

  const byQuality: Record<string, { count: number; clicks: number }> = {};
  const bySource: Record<string, { count: number; clicks: number }> = {};
  const byContentType: Record<string, { count: number; clicks: number }> = {};
  let totalClicks = 0;

  for (const link of links || []) {
    const clicks = link.click_count || 0;
    totalClicks += clicks;

    // By quality
    if (!byQuality[link.quality]) {
      byQuality[link.quality] = { count: 0, clicks: 0 };
    }
    byQuality[link.quality].count++;
    byQuality[link.quality].clicks += clicks;

    // By source
    if (!bySource[link.source]) {
      bySource[link.source] = { count: 0, clicks: 0 };
    }
    bySource[link.source].count++;
    bySource[link.source].clicks += clicks;

    // By content type
    if (!byContentType[link.content_type]) {
      byContentType[link.content_type] = { count: 0, clicks: 0 };
    }
    byContentType[link.content_type].count++;
    byContentType[link.content_type].clicks += clicks;
  }

  return {
    totalClicks,
    totalLinks: links?.length || 0,
    byQuality,
    bySource,
    byContentType,
    topLinks: (links || []).slice(0, 20),
  };
}
