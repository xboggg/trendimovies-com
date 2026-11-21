// Films reported by rights holders. For these TMDB ids the movie page offers NO Download and NO Stream (the page itself stays, as an
// information page). File URLs are also blocked in nginx (410) and the link engine will not link them (MOVIE_TAKEDOWN_KEYS in
// /opt/trendimovies/bot/trendimovies_cron.py). To add one: add the TMDB id + a note here, add the title+year there, put the file
// ids in the nginx TAKEDOWN BLOCKS list, switch off the download_links rows. See the runbook (SERVER_DOCUMENTATION.md), addendum 2026-11-21.
export const TAKEDOWN_TMDB_IDS: Record<number, string> = {
  1686178: 'Savage Mountain (2026) - Sky UK Limited via MarkScan, OVH notice 2026-11-21',
  1291595: 'Insidious: Out of the Further (2026) - Sony Pictures via Midnight Labs, OVH notice',
  1423191: 'Resident Evil (2026) - Columbia Pictures via Midnight Labs, OVH notice',
};

export function isTakenDown(tmdbId: number | string | null | undefined): boolean {
  return !!tmdbId && Object.prototype.hasOwnProperty.call(TAKEDOWN_TMDB_IDS, Number(tmdbId));
}
