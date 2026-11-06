import { fetchFromTMDB } from './tmdb';
import { getAuthHeaders } from './auth';

// "Part of a series of films": the other films in a TMDB collection, and which
// of them are in our library (a film row with at least one active file).
// Fails quietly to "no collection", so the movie page never breaks.
const POSTGREST_URL = 'http://localhost:3001';

export interface CollectionPart {
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_path: string | null;
  inLibrary: boolean;
  isCurrent: boolean;
}
export interface CollectionInfo {
  name: string;
  parts: CollectionPart[];
}

export async function getCollection(collectionId: number, currentTmdbId: number): Promise<CollectionInfo | null> {
  try {
    const c: any = await fetchFromTMDB(`/collection/${collectionId}`);
    const today = new Date().toISOString().slice(0, 10);
    // Films that have not come out yet are left out: nothing to watch.
    const raw = (c?.parts || [])
      .filter((p: any) => p.id === currentTmdbId || (p.release_date && p.release_date <= today))
      .sort((a: any, b: any) => String(a.release_date || '9999').localeCompare(String(b.release_date || '9999')))
      .slice(0, 24);
    if (raw.length < 2) return null;

    const ids = raw.map((p: any) => p.id);
    const inLib = new Set<number>();
    try {
      const mres = await fetch(`${POSTGREST_URL}/movies?tmdb_id=in.(${ids.join(',')})&select=id,tmdb_id`, { headers: getAuthHeaders() });
      const movies: any = await mres.json();
      if (Array.isArray(movies) && movies.length) {
        const byInternal = new Map<number, number>(movies.map((m: any) => [m.id, m.tmdb_id]));
        const lres = await fetch(
          `${POSTGREST_URL}/download_links?content_type=eq.movie&is_active=eq.true&content_id=in.(${[...byInternal.keys()].join(',')})&select=content_id`,
          { headers: getAuthHeaders() }
        );
        const links: any = await lres.json();
        if (Array.isArray(links)) for (const l of links) { const t = byInternal.get(l.content_id); if (t) inLib.add(t); }
      }
    } catch (e) {}

    return {
      name: String(c?.name || '').replace(/\s+Collection$/i, '') || 'this series',
      parts: raw.map((p: any) => ({
        tmdb_id: p.id,
        title: p.title,
        year: p.release_date ? parseInt(String(p.release_date).slice(0, 4), 10) : null,
        poster_path: p.poster_path || null,
        inLibrary: inLib.has(p.id),
        isCurrent: p.id === currentTmdbId,
      })),
    };
  } catch (e) {
    return null;
  }
}
