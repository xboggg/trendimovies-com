const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

interface FetchOptions {
  timeout?: number;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 30000 } = options;
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

    // Fetch real analytics from page_views
    const analyticsQueries = [
      // Total page views (from materialized view - fast)
      fetchWithTimeout(`${POSTGREST_URL}/rpc/total_page_views`),
      // Today's views (small subset, fast)
      fetchWithTimeout(`${POSTGREST_URL}/page_views?select=count&viewed_at=gte.${new Date().toISOString().slice(0, 10)}`),
      // Last 7 days views (from materialized view - fast)
      fetchWithTimeout(`${POSTGREST_URL}/rpc/week_page_views`),
      // Top 10 most viewed movies (from page_views, real data)
      fetchWithTimeout(`${POSTGREST_URL}/rpc/top_viewed_movies`, { timeout: 15000 }),
      // Top 10 most viewed series (from page_views, real data)
      fetchWithTimeout(`${POSTGREST_URL}/rpc/top_viewed_series`, { timeout: 15000 }),
      // Views by country (top 10)
      fetchWithTimeout(`${POSTGREST_URL}/rpc/views_by_country`, { timeout: 15000 }),
      // Views by device type
      fetchWithTimeout(`${POSTGREST_URL}/rpc/views_by_device`, { timeout: 15000 }),
      // Daily views last 14 days
      fetchWithTimeout(`${POSTGREST_URL}/rpc/daily_views_trend`, { timeout: 15000 }),
      // Download click stats by quality
      fetchWithTimeout(`${POSTGREST_URL}/rpc/download_stats_by_quality`, { timeout: 15000 }),
      // Download click stats by source
      fetchWithTimeout(`${POSTGREST_URL}/rpc/download_stats_by_source`, { timeout: 15000 }),
      // Unique visitors (sessions) last 7 days
      fetchWithTimeout(`${POSTGREST_URL}/rpc/unique_visitors_7d`, { timeout: 15000 }),
    ];

    let totalViews = 0, todayViews = 0, weekViews = 0;
    let realTopMovies: any[] = [], realTopSeries: any[] = [];
    let viewsByCountry: any[] = [], viewsByDevice: any[] = [];
    let dailyTrend: any[] = [];
    let dlByQuality: Record<string, number> = { '720p': 0, '1080p': 0, '2160p': 0 };
    let dlBySource: Record<string, number> = { telegram: 0, cinematika: 0, torrent: 0 };
    let uniqueVisitors = 0;

    try {
      const aRes = await Promise.allSettled(analyticsQueries);

      if (aRes[0].status === 'fulfilled') { const d = await aRes[0].value.json(); totalViews = typeof d === 'number' ? d : (d?.[0]?.count || 0); }
      if (aRes[1].status === 'fulfilled') todayViews = (await aRes[1].value.json())?.[0]?.count || 0;
      if (aRes[2].status === 'fulfilled') { const d = await aRes[2].value.json(); weekViews = typeof d === 'number' ? d : (d?.[0]?.count || 0); }
      if (aRes[3].status === 'fulfilled') realTopMovies = (await aRes[3].value.json()) || [];
      if (aRes[4].status === 'fulfilled') realTopSeries = (await aRes[4].value.json()) || [];
      if (aRes[5].status === 'fulfilled') viewsByCountry = (await aRes[5].value.json()) || [];
      if (aRes[6].status === 'fulfilled') viewsByDevice = (await aRes[6].value.json()) || [];
      if (aRes[7].status === 'fulfilled') dailyTrend = (await aRes[7].value.json()) || [];
      if (aRes[8].status === 'fulfilled') {
        const qData = (await aRes[8].value.json()) || [];
        for (const row of qData) dlByQuality[row.quality] = row.total_links || 0;
      }
      if (aRes[9].status === 'fulfilled') {
        const sData = (await aRes[9].value.json()) || [];
        for (const row of sData) dlBySource[row.source] = row.total_links || 0;
      }
      if (aRes[10].status === 'fulfilled') uniqueVisitors = (await aRes[10].value.json()) || 0;
    } catch (e) {
      console.error('Analytics queries failed (non-fatal):', e);
    }

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
        byQuality: dlByQuality,
        bySource: dlBySource,
        byContentType: { movie: movieLinksTotal, episode: episodeLinksTotal },
      },
      topViewed: {
        movies: realTopMovies.length > 0 ? realTopMovies : (topViewedMovies || []),
        series: realTopSeries.length > 0 ? realTopSeries : (topViewedSeries || []),
      },
      analytics: {
        totalViews,
        todayViews,
        weekViews,
        uniqueVisitors,
        viewsByCountry,
        viewsByDevice,
        dailyTrend,
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
    const movieIds = movies.map((m: any) => m.id).filter(Boolean);
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
        has_downloads: movieIdsWithDDL.has(m.id)
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
  filter?: string;
} = {}) {
  const { page = 1, limit = 50, search = '', filter = 'all' } = options;
  const offset = (page - 1) * limit;

  let queryUrl = `${POSTGREST_URL}/series?select=id,tmdb_id,title,year,poster_path,number_of_seasons,number_of_episodes,view_count,slug&order=created_at.desc`;
  let countUrl = `${POSTGREST_URL}/series?select=count`;

  if (search) {
    const cleanSearch = search.replace(/[%_]/g, '\\$&').replace(/\s+/g, '*');
    queryUrl += `&title=ilike.*${cleanSearch}*`;
    countUrl += `&title=ilike.*${cleanSearch}*`;
  }

  queryUrl += `&offset=${offset}&limit=${limit}`;

  const [seriesRes, countRes] = await Promise.all([
    fetchWithTimeout(queryUrl),
    fetchWithTimeout(countUrl)
  ]);

  let series = await seriesRes.json();
  const countData = await countRes.json();
  const total = countData[0]?.count || 0;

  // Enrich series with episode stats
  if (series && series.length > 0) {
    const seriesIds = series.map((s: any) => s.id);

    // Get episode counts and download counts per series
    const enrichPromises = seriesIds.map(async (sid: number) => {
      const [epCountRes, epWithDlRes] = await Promise.all([
        fetchWithTimeout(`${POSTGREST_URL}/episodes?select=count&series_id=eq.${sid}`),
        fetchWithTimeout(`${POSTGREST_URL}/episodes?select=count&series_id=eq.${sid}&has_downloads=eq.true`),
      ]);
      const epCount = (await epCountRes.json())?.[0]?.count || 0;
      const epWithDl = (await epWithDlRes.json())?.[0]?.count || 0;
      return { id: sid, total_episodes: epCount, episodes_with_dl: epWithDl };
    });

    const enrichData = await Promise.all(enrichPromises);
    const enrichMap = new Map(enrichData.map(e => [e.id, e]));

    series = series.map((s: any) => ({
      ...s,
      total_episodes_actual: enrichMap.get(s.id)?.total_episodes || 0,
      episodes_with_dl: enrichMap.get(s.id)?.episodes_with_dl || 0,
      episodes_without_dl: (enrichMap.get(s.id)?.total_episodes || 0) - (enrichMap.get(s.id)?.episodes_with_dl || 0),
      has_downloads: (enrichMap.get(s.id)?.episodes_with_dl || 0) > 0,
    }));

    // Apply filter
    if (filter === 'with_ddl') {
      series = series.filter((s: any) => s.has_downloads);
    } else if (filter === 'without_ddl') {
      series = series.filter((s: any) => !s.has_downloads);
    }
  }

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
