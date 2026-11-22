// Films reported by rights holders. The LIVE list is /var/lib/trendimovies/takedowns.json, managed on the admin page /admin/takedowns
// (see src/lib/takedowns-store.ts). The ids below are only a safety net if that file is missing.
import { takenDownIds } from '../lib/takedowns-store';

export const TAKEDOWN_TMDB_IDS: Record<number, string> = {
  1686178: 'Savage Mountain (2026) - Sky UK Limited via MarkScan, OVH notice 2026-11-21',
  1291595: 'Insidious: Out of the Further (2026) - Sony Pictures via Midnight Labs, OVH notice',
  1423191: 'Resident Evil (2026) - Columbia Pictures via Midnight Labs, OVH notice',
};

export function isTakenDown(tmdbId: number | string | null | undefined): boolean {
  if (!tmdbId) return false;
  const n = Number(tmdbId);
  return Object.prototype.hasOwnProperty.call(TAKEDOWN_TMDB_IDS, n) || takenDownIds().has(n);
}
