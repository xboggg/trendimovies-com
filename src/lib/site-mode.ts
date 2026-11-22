// MASTER SWITCH for every file feature (Download, Stream, file addresses, Telegram delivery buttons).
// The setting lives in /var/lib/trendimovies/site_mode.json  {"files_enabled": false}  and is read live (no rebuild needed).
// Change it with: /opt/trendimovies/bin/set_files_mode.sh on|off   (it also updates nginx). Missing/broken file = OFF (the clean setting).
import { readFileSync, statSync } from 'fs';

const FILE = '/var/lib/trendimovies/site_mode.json';
let cache: { mtime: number; on: boolean } | null = null;

export function filesEnabled(): boolean {
  try {
    const m = statSync(FILE).mtimeMs;
    if (cache && cache.mtime === m) return cache.on;
    const d = JSON.parse(readFileSync(FILE, 'utf-8'));
    cache = { mtime: m, on: d.files_enabled === true };
    return cache.on;
  } catch {
    return false;
  }
}
