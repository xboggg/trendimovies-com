import { createHmac } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env file at runtime for SSR (since import.meta.env is build-time only)
function loadEnvFile(): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Try multiple locations for .env file
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
              // Remove surrounding quotes if present
              if ((value.startsWith('"') && value.endsWith('"')) ||
                  (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
              }
              envVars[key] = value;
            }
          }
        }
        break; // Found and loaded .env, stop looking
      } catch (e) {
        console.error(`Failed to read .env from ${envPath}:`, e);
      }
    }
  }

  return envVars;
}

// Cache loaded env vars
let cachedEnv: Record<string, string> | null = null;
function getEnvVar(key: string): string | undefined {
  // First check process.env
  if (process.env[key]) return process.env[key];

  // Then check import.meta.env (build-time)
  if ((import.meta.env as any)[key]) return (import.meta.env as any)[key];

  // Finally, load from .env file
  if (!cachedEnv) {
    cachedEnv = loadEnvFile();
  }
  return cachedEnv[key];
}

const SESSION_SECRET = getEnvVar('ADMIN_SESSION_SECRET');
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Security: Require session secret to be set in environment
function getSessionSecret(): string {
  if (!SESSION_SECRET) {
    throw new Error('ADMIN_SESSION_SECRET not configured - admin functions disabled');
  }
  return SESSION_SECRET;
}

export interface AdminSession {
  createdAt: number;
  expiresAt: number;
}

export function createSessionToken(): string {
  const secret = getSessionSecret();
  const session: AdminSession = {
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  const data = JSON.stringify(session);
  const signature = createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(`${data}.${signature}`).toString('base64');
}

export function verifySessionToken(token: string): AdminSession | null {
  try {
    const secret = getSessionSecret();
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const lastDotIndex = decoded.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const data = decoded.substring(0, lastDotIndex);
    const signature = decoded.substring(lastDotIndex + 1);
    const expectedSignature = createHmac('sha256', secret).update(data).digest('hex');

    if (signature !== expectedSignature) return null;

    const session: AdminSession = JSON.parse(data);
    if (Date.now() > session.expiresAt) return null;

    return session;
  } catch {
    return null;
  }
}

export function getSessionFromCookies(cookieHeader: string | null): AdminSession | null {
  if (!cookieHeader) return null;

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length) {
      cookies[name] = rest.join('=');
    }
  });

  const token = cookies['admin_session'];
  return token ? verifySessionToken(token) : null;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  const hash = getEnvVar('ADMIN_PASSWORD_HASH');

  if (!hash) {
    console.error('ADMIN_PASSWORD_HASH not set in environment or .env file');
    return false;
  }

  console.log('Found password hash, verifying...');
  return bcrypt.compare(password, hash);
}

export function createSessionCookie(token: string): string {
  return `admin_session=${token}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=86400`;
}

export function clearSessionCookie(): string {
  return 'admin_session=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0';
}

// Helper for API routes: returns 401 Response if not authenticated, null if authenticated
export function requireAuth(request: Request): Response | null {
  const cookieHeader = request.headers.get('cookie');
  const session = getSessionFromCookies(cookieHeader);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return null; // Authenticated - continue
}
