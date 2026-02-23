import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { r as requireAuth } from '../../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const execAsync = promisify(exec);
const GET = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    let runningScripts = [];
    try {
      const { stdout } = await execAsync('ps aux | grep -E "(sync-series|migrate-episode|telegram_file_api)" | grep -v grep', {
        timeout: 5e3
      });
      runningScripts = stdout.split("\n").filter((line) => line.trim()).map((line) => {
        const parts = line.split(/\s+/);
        return {
          pid: parts[1],
          cpu: parts[2],
          mem: parts[3],
          command: parts.slice(10).join(" ").substring(0, 100)
        };
      });
    } catch {
    }
    let seriesSyncProgress = null;
    try {
      const progressContent = await fs.readFile("/var/www/trendimovies/scripts/series-sync-progress.json", "utf-8");
      seriesSyncProgress = JSON.parse(progressContent);
    } catch {
    }
    let missingSeriesCount = 0;
    try {
      const missingContent = await fs.readFile("/var/www/trendimovies/scripts/missing-series.json", "utf-8");
      const missingData = JSON.parse(missingContent);
      missingSeriesCount = Array.isArray(missingData) ? missingData.length : 0;
    } catch {
    }
    return new Response(JSON.stringify({
      runningScripts,
      progress: {
        seriesSync: seriesSyncProgress,
        missingSeriesCount
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to fetch status",
      runningScripts: [],
      progress: {}
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
