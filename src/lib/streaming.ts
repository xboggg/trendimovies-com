// Streaming server configurations
export const STREAMING_SERVERS = {
  server1: {
    id: 'server1',
    name: 'Server 1',
    getMovieUrl: (tmdbId: number) => `https://vidlink.pro/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
    idType: 'tmdb' as const
  },
  server2: {
    id: 'server2',
    name: 'Server 2',
    getMovieUrl: (tmdbId: number) => `https://cinesrc.st/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`,
    idType: 'tmdb' as const
  },
  server3: {
    id: 'server3',
    name: 'Server 3',
    getMovieUrl: (tmdbId: number) => `https://www.vidbinge.to/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://www.vidbinge.to/tv/${tmdbId}/${season}/${episode}`,
    idType: 'tmdb' as const
  },
  server4: {
    id: 'server4',
    name: 'Server 4',
    getMovieUrl: (tmdbId: number) => `https://vidfast.pro/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}`,
    idType: 'tmdb' as const
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
