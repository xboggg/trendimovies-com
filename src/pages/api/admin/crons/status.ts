import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export const GET: APIRoute = async () => {
  try {
    // Check running processes for known scripts
    let runningScripts: any[] = [];
    try {
      const { stdout } = await execAsync('ps aux | grep -E "(sync-series|migrate-episode|telegram_file_api)" | grep -v grep', {
        timeout: 5000
      });

      runningScripts = stdout.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            pid: parts[1],
            cpu: parts[2],
            mem: parts[3],
            command: parts.slice(10).join(' ').substring(0, 100)
          };
        });
    } catch {
      // No processes found or grep failed
    }

    // Read progress files
    let seriesSyncProgress: any = null;
    try {
      const progressContent = await fs.readFile('/var/www/trendimovies/scripts/series-sync-progress.json', 'utf-8');
      seriesSyncProgress = JSON.parse(progressContent);
    } catch { /* File doesn't exist */ }

    // Read missing series count
    let missingSeriesCount = 0;
    try {
      const missingContent = await fs.readFile('/var/www/trendimovies/scripts/missing-series.json', 'utf-8');
      const missingData = JSON.parse(missingContent);
      missingSeriesCount = Array.isArray(missingData) ? missingData.length : 0;
    } catch { /* File doesn't exist */ }

    return new Response(JSON.stringify({
      runningScripts,
      progress: {
        seriesSync: seriesSyncProgress,
        missingSeriesCount
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message,
      runningScripts: [],
      progress: {}
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
