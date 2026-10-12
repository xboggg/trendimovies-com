import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'node:fs';

// ============================================================================
// Digital & HD release dates as JSON, for the Telegram bot.
//
// WHY THIS EXISTS
//   /m <film> told members "HD/digital copies aren't out yet" for films whose
//   HD date this site already shows. The bot asks TMDB, and TMDB simply has
//   no digital (type 4) entry for many titles -- "Other Mommy" (2026) returns
//   an EMPTY release_dates list, while /digital-releases knows it lands on
//   Monday November 16, 2026, because that page scrapes dvdsreleasedates.com.
//
//   So the bot needs the source this site already has.
//
// READS THE CACHE, NEVER SCRAPES
//   digital-releases.astro writes .cache/tmdb/dvdsrd_<year>_<month>.json as it
//   renders. This endpoint only READS those files. It cannot trigger a scrape,
//   cannot block, and cannot slow that page down -- if a month has never been
//   cached it is simply absent from the response.
//
//   ?title=Other%20Mommy  -> { match: {...} | null }
//   (no params)           -> { count, releases: [...] }
// ============================================================================

const CACHE_DIR = '/var/www/trendimovies/.cache/tmdb';
const YEARS = [2026, 2027];

const MONTH_NUM: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

/** Normalised form used only for matching one title against another. */
function norm(s: string): string {
  return (s || '')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * "Monday November 16, 2026" -> "2026-11-16".
 *
 * Parsed from the TEXT rather than reusing the cache's own `iso` field: that
 * one is built with new Date(...).toISOString(), which shifts the day back in
 * any timezone west of UTC -- "Tuesday November 3, 2026" is stored as
 * 2026-11-02. The bot quotes this date to members, so it has to be right.
 */
function toIso(dateText: string): string | null {
  const m = (dateText || '').match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return null;
  const mm = MONTH_NUM[m[1].toLowerCase()];
  if (!mm) return null;
  return `${m[3]}-${mm}-${String(m[2]).padStart(2, '0')}`;
}

type Release = { title: string; date: string; iso: string | null };

function loadAll(): Release[] {
  const out: Release[] = [];
  for (const year of YEARS) {
    for (let mo = 1; mo <= 12; mo++) {
      const file = `${CACHE_DIR}/dvdsrd_${year}_${mo}.json`;
      if (!existsSync(file)) continue;
      try {
        const groups = JSON.parse(readFileSync(file, 'utf-8'))?.data;
        if (!Array.isArray(groups)) continue;
        for (const g of groups) {
          const iso = toIso(g?.date);
          for (const mv of g?.movies || []) {
            if (mv?.title) out.push({ title: String(mv.title), date: g.date, iso });
          }
        }
      } catch {
        // A single unreadable month must not take the endpoint down.
      }
    }
  }
  return out;
}

export const GET: APIRoute = async ({ url }) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800',
      },
    });

  let releases: Release[];
  try {
    releases = loadAll();
  } catch {
    return json({ count: 0, releases: [], error: 'cache unavailable' }, 200);
  }

  const wanted = (url.searchParams.get('title') || '').trim();
  if (!wanted) return json({ count: releases.length, releases });

  const q = norm(wanted);
  if (!q) return json({ match: null });

  // Exact normalised title only. A looser rule would quote a confident HD
  // date for the wrong film, which is worse than quoting none.
  const hits = releases.filter((r) => norm(r.title) === q);
  if (!hits.length) return json({ match: null });

  // Soonest date wins when a title appears in more than one month.
  hits.sort((a, b) => (a.iso || '9999').localeCompare(b.iso || '9999'));
  return json({ match: hits[0] });
};
