/**
 * User Authentication System
 * Handles signup, login, sessions, and user data
 */

import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

const POSTGREST_URL = 'http://localhost:3001';

// Load JWT secret for PostgREST authenticated requests
let JWT_SECRET: string;
try {
  JWT_SECRET = readFileSync('/etc/trendimovies/jwt_secret', 'utf-8').trim();
} catch {
  JWT_SECRET = process.env.POSTGREST_JWT_SECRET || '';
  if (!JWT_SECRET) console.warn('WARNING: No JWT secret found for PostgREST auth');
}

// Generate a short-lived JWT for PostgREST write operations
function getAuthHeaders(): Record<string, string> {
  if (!JWT_SECRET) return { 'Content-Type': 'application/json' };
  const token = jwt.sign({ role: 'web_auth' }, JWT_SECRET, { expiresIn: '5m' });
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function getAuthHeadersWithPrefer(prefer: string): Record<string, string> {
  const headers = getAuthHeaders();
  headers['Prefer'] = prefer;
  return headers;
}

// Hash password using bcrypt (secure)
export async function hashPasswordBcrypt(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password - supports both bcrypt and legacy SHA-256
export async function verifyPasswordAny(password: string, storedHash: string): Promise<boolean> {
  // Bcrypt hashes start with $2b$ or $2a$
  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(password, storedHash);
  }
  // Legacy SHA-256: format is hash:salt
  const [hash, salt] = storedHash.split(':');
  if (!salt) return false;
  const { createHash } = await import('crypto');
  const computed = createHash('sha256').update(password + salt).digest('hex');
  return computed === hash;
}

// Generate session token
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

// Create new user
export async function createUser(email: string, password: string, displayName?: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Check if email already exists
    const existingRes = await fetch(`${POSTGREST_URL}/users?email=eq.${encodeURIComponent(email)}`);
    const existing = await existingRes.json();

    if (existing.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password using bcrypt
    const passwordHash = await hashPasswordBcrypt(password);

    // Create user
    const res = await fetch(`${POSTGREST_URL}/users`, {
      method: 'POST',
      headers: getAuthHeadersWithPrefer('return=representation'),
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        display_name: displayName || email.split('@')[0]
      })
    });

    if (!res.ok) {
      const error = await res.text();
      return { success: false, error: `Failed to create user: ${error}` };
    }

    const users = await res.json();
    const user = users[0];

    // Remove password hash from response
    delete user.password_hash;

    return { success: true, user };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: 'Server error' };
  }
}

// Login user
export async function loginUser(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; user?: any; session?: string; error?: string }> {
  try {
    // Find user by email
    const res = await fetch(`${POSTGREST_URL}/users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}`);
    const users = await res.json();

    if (users.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = users[0];

    if (!user.is_active) {
      return { success: false, error: 'Account is disabled' };
    }

    // Verify password (supports both bcrypt and legacy SHA-256)
    const isValid = await verifyPasswordAny(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Rehash legacy SHA-256 passwords to bcrypt on successful login
    if (!user.password_hash.startsWith('$2')) {
      const newHash = await hashPasswordBcrypt(password);
      await fetch(`${POSTGREST_URL}/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password_hash: newHash })
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await fetch(`${POSTGREST_URL}/user_sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      })
    });

    // Update last login
    await fetch(`${POSTGREST_URL}/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ last_login: new Date().toISOString() })
    });

    // Remove password hash from response
    delete user.password_hash;

    return { success: true, user, session: sessionToken };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Server error' };
  }
}

// Validate session and get user
export async function validateSession(sessionToken: string): Promise<{ valid: boolean; user?: any }> {
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

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await fetch(`${POSTGREST_URL}/user_sessions?session_token=eq.${sessionToken}`, {
        method: 'DELETE',
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
    console.error('Validate session error:', error);
    return { valid: false };
  }
}

// Logout user (delete session)
export async function logoutUser(sessionToken: string): Promise<boolean> {
  try {
    await fetch(`${POSTGREST_URL}/user_sessions?session_token=eq.${sessionToken}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

// Get user's watchlist
export async function getWatchlist(userId: number): Promise<any[]> {
  try {
    const res = await fetch(`${POSTGREST_URL}/watchlist?user_id=eq.${userId}&order=added_at.desc`);
    return await res.json();
  } catch (error) {
    console.error('Get watchlist error:', error);
    return [];
  }
}

// Add to watchlist
export async function addToWatchlist(userId: number, contentType: 'movie' | 'series', tmdbId: number, title: string, posterPath: string): Promise<boolean> {
  try {
    const res = await fetch(`${POSTGREST_URL}/watchlist`, {
      method: 'POST',
      headers: getAuthHeadersWithPrefer('resolution=ignore-duplicates'),
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
    console.error('Add to watchlist error:', error);
    return false;
  }
}

// Remove from watchlist
export async function removeFromWatchlist(userId: number, contentType: 'movie' | 'series', tmdbId: number): Promise<boolean> {
  try {
    await fetch(`${POSTGREST_URL}/watchlist?user_id=eq.${userId}&content_type=eq.${contentType}&tmdb_id=eq.${tmdbId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return false;
  }
}

// Get user's favorites
export async function getFavorites(userId: number): Promise<any[]> {
  try {
    const res = await fetch(`${POSTGREST_URL}/favorites?user_id=eq.${userId}&order=added_at.desc`);
    return await res.json();
  } catch (error) {
    console.error('Get favorites error:', error);
    return [];
  }
}

// Add to favorites
export async function addToFavorites(userId: number, contentType: 'movie' | 'series', tmdbId: number, title: string, posterPath: string): Promise<boolean> {
  try {
    const res = await fetch(`${POSTGREST_URL}/favorites`, {
      method: 'POST',
      headers: getAuthHeadersWithPrefer('resolution=ignore-duplicates'),
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
    console.error('Add to favorites error:', error);
    return false;
  }
}

// Remove from favorites
export async function removeFromFavorites(userId: number, contentType: 'movie' | 'series', tmdbId: number): Promise<boolean> {
  try {
    await fetch(`${POSTGREST_URL}/favorites?user_id=eq.${userId}&content_type=eq.${contentType}&tmdb_id=eq.${tmdbId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return true;
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return false;
  }
}

// Add to watch history
export async function addToHistory(userId: number, contentType: 'movie' | 'series', tmdbId: number, title: string, posterPath: string): Promise<boolean> {
  try {
    const res = await fetch(`${POSTGREST_URL}/watch_history`, {
      method: 'POST',
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
    console.error('Add to history error:', error);
    return false;
  }
}

// Get user's watch history
export async function getWatchHistory(userId: number, limit: number = 20): Promise<any[]> {
  try {
    const res = await fetch(`${POSTGREST_URL}/watch_history?user_id=eq.${userId}&order=watched_at.desc&limit=${limit}`);
    return await res.json();
  } catch (error) {
    console.error('Get history error:', error);
    return [];
  }
}

// Check if item is in watchlist
export async function isInWatchlist(userId: number, contentType: 'movie' | 'series', tmdbId: number): Promise<boolean> {
  try {
    const res = await fetch(`${POSTGREST_URL}/watchlist?user_id=eq.${userId}&content_type=eq.${contentType}&tmdb_id=eq.${tmdbId}`);
    const items = await res.json();
    return items.length > 0;
  } catch (error) {
    return false;
  }
}

// Check if item is in favorites
export async function isInFavorites(userId: number, contentType: 'movie' | 'series', tmdbId: number): Promise<boolean> {
  try {
    const res = await fetch(`${POSTGREST_URL}/favorites?user_id=eq.${userId}&content_type=eq.${contentType}&tmdb_id=eq.${tmdbId}`);
    const items = await res.json();
    return items.length > 0;
  } catch (error) {
    return false;
  }
}
