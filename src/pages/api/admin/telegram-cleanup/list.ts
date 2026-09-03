import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/admin-auth';
import { searchCatalog, getDistinctValues } from '../../../../lib/telegram-catalog';

const POSTGREST_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://localhost:3001';

async function pg(pathSuffix: string) {
  const res = await fetch(`${POSTGREST_URL}/${pathSuffix}`, {
    headers: { 'Accept-Profile': 'public' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  return res.json();
}

// Cross-reference a page of telegram_file_ids against download_links and
// subtitle_links (both keyed by telegram_file_id = the SQLite movies.id as
// text) to tell the admin which catalog files are actually powering a live
// download/subtitle button on the site right now, and what for.
async function enrichAssignedStatus(ids: number[]) {
  if (!ids.length) return new Map<number, { assigned: boolean; label: string | null }>();
  const idList = ids.join(',');

  const [dlRows, subRows] = await Promise.all([
    pg(`download_links?telegram_file_id=in.(${idList})&is_active=eq.true&select=telegram_file_id,content_type,content_id,quality`),
    pg(`subtitle_links?telegram_file_id=in.(${idList})&is_active=eq.true&select=telegram_file_id,content_type,content_id,quality`),
  ]);

  const allRows = [...(dlRows || []), ...(subRows || [])];
  const map = new Map<number, { assigned: boolean; label: string | null }>();
  if (!allRows.length) return map;

  const movieIds = [...new Set(allRows.filter((r: any) => r.content_type === 'movie').map((r: any) => r.content_id))];
  const episodeIds = [...new Set(allRows.filter((r: any) => r.content_type === 'episode').map((r: any) => r.content_id))];

  const [movies, episodes] = await Promise.all([
    movieIds.length ? pg(`movies?id=in.(${movieIds.join(',')})&select=id,title,year`) : [],
    episodeIds.length ? pg(`episodes?id=in.(${episodeIds.join(',')})&select=id,episode_number,season_id,seasons(season_number,series_id,series(title))`) : [],
  ]);

  const movieMap = new Map((movies || []).map((m: any) => [m.id, `${m.title} (${m.year || '?'})`]));
  const episodeMap = new Map(
    (episodes || []).map((e: any) => {
      const seriesTitle = e.seasons?.series?.title || 'Series';
      const sn = e.seasons?.season_number ?? '?';
      const en = e.episode_number ?? '?';
      return [e.id, `${seriesTitle} S${String(sn).padStart(2, '0')}E${String(en).padStart(2, '0')}`];
    })
  );

  for (const r of allRows) {
    const fid = parseInt(r.telegram_file_id, 10);
    if (!fid) continue;
    const contentLabel = r.content_type === 'movie' ? movieMap.get(r.content_id) : episodeMap.get(r.content_id);
    const kind = r.quality ? `[${r.quality}]` : '';
    map.set(fid, { assigned: true, label: contentLabel ? `${contentLabel} ${kind}`.trim() : `${r.content_type} #${r.content_id}` });
  }
  return map;
}

export const GET: APIRoute = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const search = url.searchParams.get('search') || '';
    const year = url.searchParams.get('year') || '';
    const quality = url.searchParams.get('quality') || '';
    const language = url.searchParams.get('language') || '';
    const source = url.searchParams.get('source') || '';
    const type = url.searchParams.get('type') || '';
    const duplicatesOnly = url.searchParams.get('duplicates') === 'true';
    const includeDeleted = url.searchParams.get('includeDeleted') === 'true';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
    const filtersOnly = url.searchParams.get('filtersOnly') === 'true';

    if (filtersOnly) {
      return new Response(
        JSON.stringify({
          qualities: getDistinctValues('quality'),
          languages: getDistinctValues('language'),
          sources: getDistinctValues('source'),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { files, total } = searchCatalog({
      search, year, quality, language, source, type, duplicatesOnly, includeDeleted, page, limit,
    });

    const assignedMap = await enrichAssignedStatus(files.map((f) => f.id));
    const enriched = files.map((f) => ({
      ...f,
      assigned: assignedMap.get(f.id)?.assigned || false,
      assigned_label: assignedMap.get(f.id)?.label || null,
    }));

    return new Response(
      JSON.stringify({ files: enriched, total, page, totalPages: Math.ceil(total / limit) }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, files: [], total: 0 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
