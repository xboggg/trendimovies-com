import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';
import { requireAuth } from '../../../../lib/admin-auth';

const execAsync = promisify(exec);

// Telegram API service (if available)
const TELEGRAM_API = 'http://127.0.0.1:8765';

// Direct SQLite access via SSH
const SQLITE_DB = '/opt/trendimovies/bot/database/movies.db';
const SQLITE_HOST = '38.242.195.0';
const SSH_PORT = 80;

export const GET: APIRoute = async ({ request, url }) => {
  // Auth check
  const authError = requireAuth(request);
  if (authError) return authError;

  const query = url.searchParams.get('query') || url.searchParams.get('q') || '';
  const year = url.searchParams.get('year') || '';
  const quality = url.searchParams.get('quality') || '';
  const useDirect = url.searchParams.get('direct') === 'true';

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ files: [], message: 'Query too short' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Limit query length
  if (query.length > 100) {
    return new Response(JSON.stringify({ files: [], message: 'Query too long' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Try direct SQLite query first
  try {
    const files = await searchSQLiteDirect(query, year, quality);
    if (files.length > 0) {
      return new Response(JSON.stringify({ files, source: 'sqlite_direct' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (sqliteError: any) {
    console.error('SQLite direct search failed:', sqliteError.message);
  }

  // Fallback to Telegram API if direct query failed or returned no results
  if (!useDirect) {
    try {
      const searchParams = new URLSearchParams({ title: query });
      if (year) searchParams.append('year', year);

      const response = await fetch(`${TELEGRAM_API}/search/movies?${searchParams}`, {
        signal: AbortSignal.timeout(25000)
      });

      if (response.ok) {
        const data = await response.json();
        let files = (data.results || data.files || []).map((f: any) => ({
          id: f.message_id || f.id,
          message_id: f.message_id,
          file_name: f.file_name || f.filename,
          file_size: formatFileSize(f.file_size),
          quality: f.quality || extractQuality(f.file_name || f.filename || ''),
          year: f.year || extractYear(f.file_name || f.filename || '')
        }));

        if (quality) {
          files = files.filter((f: any) =>
            f.quality?.toLowerCase().includes(quality.toLowerCase())
          );
        }

        files = files.slice(0, 50);

        if (files.length > 0) {
          return new Response(JSON.stringify({ files, source: 'telegram_api' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (apiError: any) {
      console.error('Telegram API search failed:', apiError.message);
    }
  }

  // No results from either source
  return new Response(JSON.stringify({
    files: [],
    message: 'No Telegram files found matching your query. The file may exist in the channel but not yet indexed.'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

async function searchSQLiteDirect(query: string, year?: string, quality?: string): Promise<any[]> {
  // Sanitize input: only allow alphanumeric, spaces, and basic punctuation
  const sanitizedQuery = query.replace(/[^a-zA-Z0-9\s.\-_]/g, '');
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return [];
  }

  // Build search term: replace separators with % wildcard for flexible matching
  const searchTerm = sanitizedQuery
    .replace(/[\s.\-_]+/g, '%');

  // Validate year if provided
  let yearFilter = '';
  if (year) {
    const parsedYear = parseInt(year);
    if (parsedYear >= 1900 && parsedYear <= 2100) {
      yearFilter = ` AND year = ${parsedYear}`;
    }
  }

  // Build SQL query (values are sanitized above)
  const sql = `SELECT id, message_id, file_name, file_size, quality, year
             FROM movies
             WHERE file_name LIKE '%${searchTerm}%' ESCAPE '\\\\'
             AND file_name NOT LIKE '%.srt'
             AND file_name NOT LIKE '%.sub'${yearFilter}
             ORDER BY
             CASE quality
               WHEN '2160p' THEN 1
               WHEN '1080p' THEN 2
               WHEN '720p' THEN 3
               ELSE 4
             END,
             file_size DESC
             LIMIT 50`;

  // Escape for shell - use base64 encoding to avoid shell injection
  const base64Sql = Buffer.from(sql).toString('base64');
  const sshCmd = `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p ${SSH_PORT} root@${SQLITE_HOST} "echo '${base64Sql}' | base64 -d | sqlite3 -json ${SQLITE_DB}"`;

  try {
    const { stdout } = await execAsync(sshCmd, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });
    const trimmed = stdout.trim();
    if (!trimmed) return [];

    let results = JSON.parse(trimmed);

    // Format results
    let files = results.map((f: any) => ({
      id: f.message_id || f.id,
      message_id: f.message_id,
      file_name: f.file_name,
      file_size: formatFileSize(f.file_size),
      quality: f.quality || extractQuality(f.file_name || ''),
      year: f.year || extractYear(f.file_name || '')
    }));

    // Filter by quality if specified
    if (quality) {
      const validQualities = ['720p', '1080p', '2160p', '4k', 'hdrip', 'bluray', 'webrip'];
      const cleanQuality = quality.toLowerCase();
      if (validQualities.some(q => cleanQuality.includes(q))) {
        files = files.filter((f: any) =>
          f.quality?.toLowerCase().includes(cleanQuality)
        );
      }
    }

    return files;
  } catch (error: any) {
    console.error('SQLite SSH query error:', error.message);
    throw error;
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function extractQuality(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('2160p') || lower.includes('4k')) return '2160p';
  if (lower.includes('1080p')) return '1080p';
  if (lower.includes('720p')) return '720p';
  if (lower.includes('hdrip')) return 'hdrip';
  if (lower.includes('bdrip') || lower.includes('bluray')) return 'bluray';
  if (lower.includes('webrip') || lower.includes('web-dl')) return 'webrip';
  return '';
}

function extractYear(filename: string): number | null {
  const match = filename.match(/[.\-_\s](\d{4})[.\-_\s]/);
  if (match) {
    const year = parseInt(match[1]);
    if (year >= 1900 && year <= 2030) return year;
  }
  return null;
}
