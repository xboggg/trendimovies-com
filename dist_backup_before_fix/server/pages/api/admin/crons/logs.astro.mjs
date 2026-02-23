import fs from 'fs/promises';
import path from 'path';
import { r as requireAuth } from '../../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const LOG_DIR = "/var/www/trendimovies/scripts";
const TEMP_LOG_DIR = "/tmp";
const ALLOWED_LOGS = {
  "series-sync.log": path.join(LOG_DIR, "series-sync.log"),
  "series-sync-temp.log": path.join(TEMP_LOG_DIR, "series-sync.log"),
  "episode-ddl-migration.log": path.join(TEMP_LOG_DIR, "episode-ddl-migration.log")
};
const GET = async ({ request, url }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  const logFile = url.searchParams.get("file") || "series-sync.log";
  const lines = Math.min(parseInt(url.searchParams.get("lines") || "100"), 500);
  const logPath = ALLOWED_LOGS[logFile];
  if (!logPath) {
    return new Response(JSON.stringify({
      error: "Invalid log file",
      availableLogs: Object.keys(ALLOWED_LOGS)
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const content = await fs.readFile(logPath, "utf-8");
    const allLines = content.split("\n");
    const lastLines = allLines.slice(-lines).filter((l) => l.trim());
    return new Response(JSON.stringify({
      file: logFile,
      totalLines: allLines.length,
      lines: lastLines
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      file: logFile,
      error: error.code === "ENOENT" ? "Log file not found" : "Failed to read log",
      lines: []
    }), {
      status: error.code === "ENOENT" ? 404 : 500,
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
