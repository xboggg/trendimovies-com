import Database from 'better-sqlite3';

// Read-only local copy, synced periodically from the master on server
// 38.242.195.0 by sync_sqlite.sh. Never write here directly -- writes go
// through the SSH-based admin endpoints, which target the real master.
const CATALOG_PATH = '/opt/trendimovies/bot/database/movies.db';

let db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!db) {
    db = new Database(CATALOG_PATH, { readonly: true, fileMustExist: true });
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
}

export interface SearchParams {
  search?: string;
  year?: string;
  quality?: string;
  language?: string;
  source?: string;
  duplicatesOnly?: boolean;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  files: CatalogFile[];
  total: number;
}

// Duplicate = same normalized_title + year appearing on more than one
// active (non-subtitle) row. Reuses the SAME normalized_title column the
// assign pipeline itself computes at index time, so "duplicate" here means
// exactly what the assign engine would also consider the same title --
// no separate fuzzy-matching logic to keep in sync with it.
function duplicateGroupsWhere(): string {
  return `
    normalized_title IN (
      SELECT normalized_title FROM movies
      WHERE normalized_title IS NOT NULL AND normalized_title != ''
        AND file_name NOT LIKE '%.srt' AND file_name NOT LIKE '%.sub'
      GROUP BY normalized_title, year
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
  if (search.trim()) {
    where.push(`(file_name LIKE ? OR clean_title LIKE ? OR normalized_title LIKE ?)`);
    const s = `%${search.trim()}%`;
    args.push(s, s, s);
  }
  if (year) {
    where.push(`year = ?`);
    args.push(parseInt(year, 10));
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
    ? 'normalized_title ASC, year ASC, id DESC'
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
    const counts = conn
      .prepare(
        `SELECT normalized_title, year, COUNT(*) as cnt FROM movies
         WHERE normalized_title IS NOT NULL AND normalized_title != ''
           AND file_name NOT LIKE '%.srt' AND file_name NOT LIKE '%.sub'
         GROUP BY normalized_title, year HAVING COUNT(*) > 1`
      )
      .all() as { normalized_title: string; year: number | null; cnt: number }[];
    const countMap = new Map(counts.map((c) => [`${c.normalized_title}|${c.year}`, c.cnt]));
    for (const r of rows) {
      r.dup_count = countMap.get(`${r.normalized_title}|${r.year}`) || 1;
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
