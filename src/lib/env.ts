import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env file at runtime for SSR (since import.meta.env is build-time only)
function loadEnvFile(): Record<string, string> {
  const envVars: Record<string, string> = {};

  const possiblePaths = [
    join(process.cwd(), '.env'),
    '/var/www/trendimovies/.env'
  ];

  for (const envPath of possiblePaths) {
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
              const key = trimmed.substring(0, eqIndex).trim();
              let value = trimmed.substring(eqIndex + 1).trim();
              if ((value.startsWith('"') && value.endsWith('"')) ||
                  (value.startsWith("'") && value.endsWith("'"))) {
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

let cachedEnv: Record<string, string> | null = null;

export function getEnvVar(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  if ((import.meta.env as any)[key]) return (import.meta.env as any)[key];

  if (!cachedEnv) {
    cachedEnv = loadEnvFile();
  }
  return cachedEnv[key];
}

export const TMDB_API_KEY = getEnvVar('TMDB_API_KEY');
