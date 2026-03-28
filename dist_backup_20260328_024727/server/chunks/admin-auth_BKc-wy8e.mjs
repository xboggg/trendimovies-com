import { createHmac } from 'crypto';
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
  if (Object.assign(__vite_import_meta_env__, { ADMIN_PASSWORD_HASH: "$2b$10$5LtcnB0UHBkZw/8A8kE4PehyDwpUxV3SaaXDzhnhFe1NJUg3bxZ9W", ADMIN_SESSION_SECRET: "kLb6+nCT7bqjKQ4GkrHJl62EwgSNYZmCMWOWzbpkluM=", _: process.env._ })[key]) return Object.assign(__vite_import_meta_env__, { ADMIN_PASSWORD_HASH: "$2b$10$5LtcnB0UHBkZw/8A8kE4PehyDwpUxV3SaaXDzhnhFe1NJUg3bxZ9W", ADMIN_SESSION_SECRET: "kLb6+nCT7bqjKQ4GkrHJl62EwgSNYZmCMWOWzbpkluM=", _: process.env._ })[key];
  if (!cachedEnv) {
    cachedEnv = loadEnvFile();
  }
  return cachedEnv[key];
}
const SESSION_SECRET = getEnvVar("ADMIN_SESSION_SECRET");
const SESSION_DURATION = 24 * 60 * 60 * 1e3;
function getSessionSecret() {
  if (!SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET not configured - admin functions disabled");
  }
  return SESSION_SECRET;
}
function createSessionToken() {
  const secret = getSessionSecret();
  const session = {
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  const data = JSON.stringify(session);
  const signature = createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(`${data}.${signature}`).toString("base64");
}
function verifySessionToken(token) {
  try {
    const secret = getSessionSecret();
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const lastDotIndex = decoded.lastIndexOf(".");
    if (lastDotIndex === -1) return null;
    const data = decoded.substring(0, lastDotIndex);
    const signature = decoded.substring(lastDotIndex + 1);
    const expectedSignature = createHmac("sha256", secret).update(data).digest("hex");
    if (signature !== expectedSignature) return null;
    const session = JSON.parse(data);
    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}
function getSessionFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length) {
      cookies[name] = rest.join("=");
    }
  });
  const token = cookies["admin_session"];
  return token ? verifySessionToken(token) : null;
}
async function verifyPassword(password) {
  const bcrypt = await import('bcryptjs');
  const hash = getEnvVar("ADMIN_PASSWORD_HASH");
  if (!hash) {
    console.error("ADMIN_PASSWORD_HASH not set in environment or .env file");
    return false;
  }
  console.log("Found password hash, verifying...");
  return bcrypt.compare(password, hash);
}
function createSessionCookie(token) {
  return `admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
}
function clearSessionCookie() {
  return "admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";
}
function requireAuth(request) {
  const cookieHeader = request.headers.get("cookie");
  const session = getSessionFromCookies(cookieHeader);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return null;
}

export { createSessionToken as a, createSessionCookie as b, clearSessionCookie as c, getSessionFromCookies as g, requireAuth as r, verifyPassword as v };
