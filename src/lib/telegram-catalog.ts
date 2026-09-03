import Database from 'better-sqlite3';

// Read-only local copy, synced periodically from the master on server
// 38.242.195.0 by sync_sqlite.sh. Never write here directly -- writes go
// through the SSH-based admin endpoints, which target the real master.
const CATALOG_PATH = '/opt/trendimovies/bot/database/movies.db';

let db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!db) {
    db = new Database(CATALOG_PATH, { readonly: true, fileMustExist: true });
    // For the movie/series type filter -- is_series is known-unreliable
    // (~93k mis-flagged, same issue the search bot works around with a
    // SxxExx regex fallback), so OR it with a filename pattern match here too.
    db.function('regexp', { deterministic: true }, (pattern: unknown, text: unknown) => {
      try {
        return new RegExp(String(pattern), 'i').test(String(text ?? '')) ? 1 : 0;
      } catch {
        return 0;
      }
    });
  }
  return db;
}

export interface CatalogFile {
  id: number;
  message_id: number;
  file_name: string;
  file_size: number;
  year: number | null;
  quality: string | null;
  source: string | null;
  language: string | null;
  normalized_title: string | null;
  added_date: string | null;
  is_deleted: number;
  telegram_deleted_at: string | null;
  dup_count?: number;
  dup_group_ids?: number[];
  dup_newest_id?: number;
}

export interface SearchParams {
  search?: string;
  year?: string;
  quality?: string;
  language?: string;
  source?: string;
  type?: string; // 'movie' | 'series' | ''
  duplicatesOnly?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

// SxxExx (with tolerant separators/case, e.g. "S01E02", "S1.E2", "s01 e02")
const EPISODE_PATTERN = 'S[0-9]{1,2}[.\\-_ ]?E[0-9]{1,3}';

export interface SearchResult {
  files: CatalogFile[];
  total: number;
}

// Duplicate = same normalized_title + year + file_size appearing on more
// than one active (non-subtitle) row. Title+year alone would also flag
// legitimately different quality versions of the same movie (a 720p and a
// 1080p rip aren't duplicates); requiring the same file_size too narrows
// this to genuinely redundant re-uploads -- same rip indexed twice, or the
// exact same release re-shared. Reuses the SAME normalized_title column
// the assign pipeline itself computes at index time.
function duplicateGroupsWhere(): string {
  return `
    (normalized_title, year, file_size) IN (
      SELECT normalized_title, year, file_size FROM movies
      WHERE normalized_title IS NOT NULL AND normalized_title != ''
        AND file_name NOT LIKE '%.srt' AND file_name NOT LIKE '%.sub'
      GROUP BY normalized_title, year, file_size
      HAVING COUNT(*) > 1
    )
  `;
}

export function searchCatalog(params: SearchParams): SearchResult {
  const {
    search = '',
    year = '',
    quality = '',
    language = '',
    source = '',
    type = '',
    duplicatesOnly = false,
    includeDeleted = false,
    page = 1,
    limit = 50,
  } = params;

  const conn = getDb();
  const where: string[] = [`file_name NOT LIKE '%.srt'`, `file_name NOT LIKE '%.sub'`];
  const args: any[] = [];

  if (!includeDeleted) {
    where.push(`(is_deleted = 0 OR is_deleted IS NULL)`);
  }

  let effectiveYear = year;
  if (search.trim()) {
    let searchText = search.trim();
    // Typing "title 2020" together (the natural way to search) previously
    // matched nothing: filenames use dots/dashes ("The.Gentlemen.2020..."),
    // never a literal space-separated "title 2020" substring, and the Year
    // field is a separate column the title text never contains. If the
    // query ends with a standalone plausible year and the Year field isn't
    // already set, split it out and apply it as a year filter instead.
    const trailingYearMatch = searchText.match(/^(.*\S)\s+(19\d{2}|20\d{2})$/);
    if (trailingYearMatch && !effectiveYear) {
      searchText = trailingYearMatch[1];
      effectiveYear = trailingYearMatch[2];
    }
    // Real filenames separate words with dots/dashes/underscores, not
    // spaces. Convert whitespace in the query to a wildcard so "the
    // gentlemen" matches "The.Gentlemen.2020..." regardless of punctuation.
    const wildcardSearch = searchText.replace(/[\s.\-_]+/g, '%');
    where.push(`(file_name LIKE ? OR clean_title LIKE ? OR normalized_title LIKE ?)`);
    const s = `%${wildcardSearch}%`;
    args.push(s, s, s);
  }
  if (effectiveYear) {
    where.push(`year = ?`);
    args.push(parseInt(effectiveYear, 10));
  }
  if (quality) {
    where.push(`quality = ?`);
    args.push(quality);
  }
  if (language) {
    where.push(`language = ?`);
    args.push(language);
  }
  if (source) {
    where.push(`source = ?`);
    args.push(source);
  }
  if (type === 'series') {
    where.push(`(is_series = 1 OR file_name REGEXP '${EPISODE_PATTERN}')`);
  } else if (type === 'movie') {
    where.push(`(is_series = 0 OR is_series IS NULL) AND file_name NOT REGEXP '${EPISODE_PATTERN}'`);
  }
  if (duplicatesOnly) {
    where.push(duplicateGroupsWhere());
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const countRow = conn
    .prepare(`SELECT COUNT(*) as cnt FROM movies ${whereSql}`)
    .get(...args) as { cnt: number };
  const total = countRow.cnt;

  const orderBy = duplicatesOnly
    ? 'normalized_title ASC, year ASC, file_size ASC, id DESC'
    : 'added_date DESC';

  const rows = conn
    .prepare(
      `SELECT id, message_id, file_name, file_size, year, quality, source, language,
              normalized_title, added_date, is_deleted, telegram_deleted_at
       FROM movies ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
    .all(...args, limit, offset) as CatalogFile[];

  if (duplicatesOnly && rows.length) {
    // For each distinct group represented on this page, fetch its full
    // sibling list (id + added_date) so the UI can offer a one-click
    // "keep newest, select the rest" action without a second round-trip.
    // Scoped to just the groups on the current page (not a global scan) --
    // the (normalized_title, year, file_size) index makes each lookup cheap.
    const siblingsStmt = conn.prepare(
      `SELECT id, added_date FROM movies
       WHERE normalized_title = ? AND file_size = ? AND (year = ? OR (year IS NULL AND ? IS NULL))
         AND file_name NOT LIKE '%.srt' AND file_name NOT LIKE '%.sub'
       ORDER BY added_date DESC, id DESC`
    );
    const groupCache = new Map<string, { id: number; added_date: string | null }[]>();
    for (const r of rows) {
      const key = `${r.normalized_title}|${r.year}|${r.file_size}`;
      if (!groupCache.has(key)) {
        const members = siblingsStmt.all(r.normalized_title, r.file_size, r.year, r.year) as
          { id: number; added_date: string | null }[];
        groupCache.set(key, members);
      }
      const members = groupCache.get(key)!;
      if (members.length > 1) {
        r.dup_count = members.length;
        r.dup_group_ids = members.map((m) => m.id);
        r.dup_newest_id = members[0].id; // ORDER BY added_date DESC -> first = newest
      }
    }
  }

  return { files: rows, total };
}

export function getDistinctValues(column: 'quality' | 'language' | 'source' | 'year'): string[] {
  const conn = getDb();
  const rows = conn
    .prepare(
      `SELECT DISTINCT ${column} as v FROM movies WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column} DESC LIMIT 200`
    )
    .all() as { v: string }[];
  return rows.map((r) => String(r.v));
}
