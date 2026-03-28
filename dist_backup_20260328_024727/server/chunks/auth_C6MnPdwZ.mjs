import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

const POSTGREST_URL = "http://localhost:3001";
let JWT_SECRET;
try {
  JWT_SECRET = readFileSync("/etc/trendimovies/jwt_secret", "utf-8").trim();
} catch {
  JWT_SECRET = process.env.POSTGREST_JWT_SECRET || "";
  if (!JWT_SECRET) console.warn("WARNING: No JWT secret found for PostgREST auth");
}
function getAuthHeaders() {
  if (!JWT_SECRET) return { "Content-Type": "application/json" };
  const token = jwt.sign({ role: "web_auth" }, JWT_SECRET, { expiresIn: "5m" });
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}
function getAuthHeadersWithPrefer(prefer) {
  const headers = getAuthHeaders();
  headers["Prefer"] = prefer;
  return headers;
}
async function hashPasswordBcrypt(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPasswordAny(password, storedHash) {
  if (storedHash.startsWith("$2")) {
    return bcrypt.compare(password, storedHash);
  }
  const [hash, salt] = storedHash.split(":");
  if (!salt) return false;
  const { createHash } = await import('crypto');
  const computed = createHash("sha256").update(password + salt).digest("hex");
  return computed === hash;
}
function generateSessionToken() {
  return randomBytes(32).toString("hex");
}
async function createUser(email, password, displayName) {
  try {
    const existingRes = await fetch(`${POSTGREST_URL}/users?email=eq.${encodeURIComponent(email)}`);
    const existing = await existingRes.json();
    if (existing.length > 0) {
      return { success: false, error: "Email already registered" };
    }
    const passwordHash = await hashPasswordBcrypt(password);
    const res = await fetch(`${POSTGREST_URL}/users`, {
      method: "POST",
      headers: getAuthHeadersWithPrefer("return=representation"),
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        display_name: displayName || email.split("@")[0]
      })
    });
    if (!res.ok) {
      const error = await res.text();
      return { success: false, error: `Failed to create user: ${error}` };
    }
    const users = await res.json();
    const user = users[0];
    delete user.password_hash;
    return { success: true, user };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Server error" };
  }
}
async function loginUser(email, password, ipAddress, userAgent) {
  try {
    const res = await fetch(`${POSTGREST_URL}/users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`);
    const users = await res.json();
    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" };
    }
    const user = users[0];
    if (!user.is_active) {
      return { success: false, error: "Account is disabled" };
    }
    const isValid = await verifyPasswordAny(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }
    if (!user.password_hash.startsWith("$2")) {
      const newHash = await hashPasswordBcrypt(password);
      await fetch(`${POSTGREST_URL}/users?id=eq.${user.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ password_hash: newHash })
      });
    }
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
    await fetch(`${POSTGREST_URL}/user_sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      })
    });
    await fetch(`${POSTGREST_URL}/users?id=eq.${user.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ last_login: (/* @__PURE__ */ new Date()).toISOString() })
    });
    delete user.password_hash;
    return { success: true, user, session: sessionToken };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Server error" };
  }
}
async function validateSession(sessionToken) {
  try {
    if (!sessionToken) {
      return { valid: false };
    }
    const res = await fetch(`${POSTGREST_URL}/user_sessions?session_token=eq.${sessionToken}&select=*,users(*)`);
    const sessions = await res.json();
    if (sessions.length === 0) {
      return { valid: false };
    }
    const session = sessions[0];
    if (new Date(session.expires_at) < /* @__PURE__ */ new Date()) {
      await fetch(`${POSTGREST_URL}/user_sessions?session_token=eq.${sessionToken}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      return { valid: false };
    }
    const user = session.users;
    if (!user || !user.is_active) {
      return { valid: false };
    }
    delete user.password_hash;
    return { valid: true, user };
  } catch (error) {
    console.error("Validate session error:", error);
    return { valid: false };
  }
}
async function logoutUser(sessionToken) {
  try {
    await fetch(`${POSTGREST_URL}/user_sessions?session_token=eq.${sessionToken}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
async function getWatchlist(userId) {
  try {
    const res = await fetch(`${POSTGREST_URL}/watchlist?user_id=eq.${userId}&order=added_at.desc`);
    return await res.json();
  } catch (error) {
    console.error("Get watchlist error:", error);
    return [];
  }
}
async function addToWatchlist(userId, contentType, tmdbId, title, posterPath) {
  try {
    const res = await fetch(`${POSTGREST_URL}/watchlist`, {
      method: "POST",
      headers: getAuthHeadersWithPrefer("resolution=ignore-duplicates"),
      body: JSON.stringify({
        user_id: userId,
        content_type: contentType,
        tmdb_id: tmdbId,
        title,
        poster_path: posterPath
      })
    });
    return res.ok;
  } catch (error) {
    console.error("Add to watchlist error:", error);
    return false;
  }
}
async function removeFromWatchlist(userId, contentType, tmdbId) {
  try {
    await fetch(`${POSTGREST_URL}/watchlist?user_id=eq.${userId}&content_type=eq.${contentType}&tmdb_id=eq.${tmdbId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return false;
  }
}
async function getFavorites(userId) {
  try {
    const res = await fetch(`${POSTGREST_URL}/favorites?user_id=eq.${userId}&order=added_at.desc`);
    return await res.json();
  } catch (error) {
    console.error("Get favorites error:", error);
    return [];
  }
}
async function addToFavorites(userId, contentType, tmdbId, title, posterPath) {
  try {
    const res = await fetch(`${POSTGREST_URL}/favorites`, {
      method: "POST",
      headers: getAuthHeadersWithPrefer("resolution=ignore-duplicates"),
      body: JSON.stringify({
        user_id: userId,
        content_type: contentType,
        tmdb_id: tmdbId,
        title,
        poster_path: posterPath
      })
    });
    return res.ok;
  } catch (error) {
    console.error("Add to favorites error:", error);
    return false;
  }
}
async function removeFromFavorites(userId, contentType, tmdbId) {
  try {
    await fetch(`${POSTGREST_URL}/favorites?user_id=eq.${userId}&content_type=eq.${contentType}&tmdb_id=eq.${tmdbId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return false;
  }
}
async function addToHistory(userId, contentType, tmdbId, title, posterPath) {
  try {
    const res = await fetch(`${POSTGREST_URL}/watch_history`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        content_type: contentType,
        tmdb_id: tmdbId,
        title,
        poster_path: posterPath
      })
    });
    return res.ok;
  } catch (error) {
    console.error("Add to history error:", error);
    return false;
  }
}
async function getWatchHistory(userId, limit = 20) {
  try {
    const res = await fetch(`${POSTGREST_URL}/watch_history?user_id=eq.${userId}&order=watched_at.desc&limit=${limit}`);
    return await res.json();
  } catch (error) {
    console.error("Get history error:", error);
    return [];
  }
}

export { logoutUser as a, addToFavorites as b, createUser as c, getWatchHistory as d, addToHistory as e, removeFromWatchlist as f, getFavorites as g, getWatchlist as h, addToWatchlist as i, loginUser as l, removeFromFavorites as r, validateSession as v };
