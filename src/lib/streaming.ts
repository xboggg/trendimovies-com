// Streaming server configurations
export const STREAMING_SERVERS = {
  server1: {
    id: 'server1',
    name: 'Server 1',
    getMovieUrl: (tmdbId: number) => `https://vidsrc.icu/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`,
    idType: 'tmdb' as const
  },
  server2: {
    id: 'server2',
    name: 'Server 2',
    getMovieUrl: (tmdbId: number) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
    idType: 'tmdb' as const
  },
  server3: {
    id: 'server3',
    name: 'Server 3',
    getMovieUrl: (tmdbId: number) => `https://moviesapi.club/movie/${tmdbId}`,
    getTVUrl: (tmdbId: number, season: number, episode: number) =>
      `https://moviesapi.club/tv/${tmdbId}/${season}/${episode}`,
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
