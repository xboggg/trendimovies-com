import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_SUPABASE_ANON_KEY": "not-needed-for-local", "PUBLIC_SUPABASE_URL": "http://localhost:3001", "SITE": undefined, "SSR": true};
function loadEnvFile() {
  const envVars = {};
  const possiblePaths = [
    join(process.cwd(), ".env"),
    "/var/www/trendimovies/.env"
  ];
  for (const envPath of possiblePaths) {
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const eqIndex = trimmed.indexOf("=");
            if (eqIndex > 0) {
              const key = trimmed.substring(0, eqIndex).trim();
              let value = trimmed.substring(eqIndex + 1).trim();
              if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
              }
              envVars[key] = value;
            }
          }
        }
        break;
      } catch (e) {
        console.error(`Failed to read .env from ${envPath}:`, e);
      }
    }
  }
  return envVars;
}
let cachedEnv = null;
function getEnvVar(key) {
  if (process.env[key]) return process.env[key];
  if (Object.assign(__vite_import_meta_env__, { TMDB_API_KEY: "46300aaf372203a94763f1f46846e843", _: process.env._ })[key]) return Object.assign(__vite_import_meta_env__, { TMDB_API_KEY: "46300aaf372203a94763f1f46846e843", _: process.env._ })[key];
  if (!cachedEnv) {
    cachedEnv = loadEnvFile();
  }
  return cachedEnv[key];
}
const TMDB_API_KEY = getEnvVar("TMDB_API_KEY");

export { TMDB_API_KEY as T };
