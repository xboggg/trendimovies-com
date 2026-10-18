// Streaming server configurations
export const STREAMING_SERVERS = {
  // Order and providers measured 2026-10-18 (see git log). Every provider
  // that streams also serves pop-under ads; VideoPlayer.svelte sandboxes the
  // iframe so those cannot open. Any domain here (and its redirect target)
  // must also be in nginx frame-src or the player is silently blank.
  server1: {
    id: 'server1',
    name: 'Server 1',
    // VidCore -- played every test title (recent, classic, TV, brand-new).
    getMovieUrl: (tmdbId: number) => `https://vidcore.org/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`,
    idType: 'tmdb' as const,
    sandbox: true
  },
  server2: {
    id: 'server2',
    name: 'Server 2',
    getMovieUrl: (tmdbId: number) => `https://cinesrc.st/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`,
    idType: 'tmdb' as const,
    sandbox: true
  },
  server3: {
    id: 'server3',
    name: 'Server 3',
    getMovieUrl: (tmdbId: number) => `https://vidlink.pro/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
    idType: 'tmdb' as const,
    // VidLink shows "Please Disable Sandbox" (Edmund, 2026-10-18), so it runs
    // unsandboxed -- its pop-ups still open here.
    sandbox: false
  },
  server4: {
    id: 'server4',
    name: 'Server 4',
    // vidsrc.me 301-redirects to vidsrc.sh; both are in nginx frame-src.
    getMovieUrl: (tmdbId: number) => `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    idType: 'tmdb' as const,
    // VidSrc refuses <iframe sandbox> ("can't be embedded in a sandboxed
    // frame"), so it runs unsandboxed -- its pop-ups still open here.
    sandbox: false
  }
};

export type ServerKey = keyof typeof STREAMING_SERVERS;

export function getMovieStreamUrl(server: ServerKey, tmdbId: number, imdbId?: string | null): string | null {
  const serverConfig = STREAMING_SERVERS[server];

  if (serverConfig.idType === 'imdb') {
    if (!imdbId) return null;
    return (serverConfig.getMovieUrl as (id: string) => string)(imdbId);
  }

  return (serverConfig.getMovieUrl as (id: number) => string)(tmdbId);
}

export function getTVStreamUrl(
  server: ServerKey,
  tmdbId: number,
  season: number,
  episode: number,
  imdbId?: string | null
): string | null {
  const serverConfig = STREAMING_SERVERS[server];

  if (serverConfig.idType === 'imdb') {
    if (!imdbId) return null;
    return (serverConfig.getTVUrl as (id: string, s: number, e: number) => string)(imdbId, season, episode);
  }

  return (serverConfig.getTVUrl as (id: number, s: number, e: number) => string)(tmdbId, season, episode);
}

export function getAllServers(): typeof STREAMING_SERVERS {
  return STREAMING_SERVERS;
}

export function getServerNames(): { id: ServerKey; name: string }[] {
  return Object.entries(STREAMING_SERVERS).map(([id, config]) => ({
    id: id as ServerKey,
    name: config.name
  }));
}
