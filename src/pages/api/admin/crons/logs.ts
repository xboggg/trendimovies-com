import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '../../../../lib/admin-auth';

const LOG_DIR = '/var/www/trendimovies/scripts';
const TEMP_LOG_DIR = '/tmp';

const ALLOWED_LOGS: Record<string, string> = {
  'series-sync.log': path.join(LOG_DIR, 'series-sync.log'),
  'series-sync-temp.log': path.join(TEMP_LOG_DIR, 'series-sync.log'),
  'episode-ddl-migration.log': path.join(TEMP_LOG_DIR, 'episode-ddl-migration.log'),
};

export const GET: APIRoute = async ({ request, url }) => {
  // Auth check
  const authError = requireAuth(request);
  if (authError) return authError;

  const logFile = url.searchParams.get('file') || 'series-sync.log';
  const lines = Math.min(parseInt(url.searchParams.get('lines') || '100'), 500); // Cap at 500 lines

  // Check if log file is allowed
  const logPath = ALLOWED_LOGS[logFile];
  if (!logPath) {
    return new Response(JSON.stringify({
      error: 'Invalid log file',
      availableLogs: Object.keys(ALLOWED_LOGS)
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const allLines = content.split('\n');
    const lastLines = allLines.slice(-lines).filter(l => l.trim());

    return new Response(JSON.stringify({
      file: logFile,
      totalLines: allLines.length,
      lines: lastLines
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      file: logFile,
      error: error.code === 'ENOENT' ? 'Log file not found' : 'Failed to read log',
      lines: []
    }), {
      status: error.code === 'ENOENT' ? 404 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
