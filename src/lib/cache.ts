/**
 * TMDB API Cache System
 * Uses file-based caching to reduce API calls and improve performance
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = '/var/www/trendimovies/.cache/tmdb';
const DEFAULT_TTL = 3600000; // 1 hour in milliseconds

// TTL settings for different cache types (in milliseconds)
const CACHE_TTL: Record<string, number> = {
  trending: 1800000,        // 30 minutes - changes frequently
  now_playing: 3600000,     // 1 hour
  upcoming: 7200000,        // 2 hours
  popular: 3600000,         // 1 hour
  top_rated: 86400000,      // 24 hours - rarely changes
  movie_details: 86400000,  // 24 hours
  tv_details: 86400000,     // 24 hours
  season: 86400000,         // 24 hours
  search: 1800000,          // 30 minutes
  genres: 604800000,        // 7 days - rarely changes
  person: 86400000,         // 24 hours
  on_the_air: 3600000,      // 1 hour
  discover: 3600000,        // 1 hour
};

// Ensure cache directory exists
function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Generate cache key from endpoint and params
function getCacheKey(endpoint: string, params: Record<string, string> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');

  const key = `${endpoint}${sortedParams ? '?' + sortedParams : ''}`
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 200);

  return key;
}

// Get TTL based on endpoint type
function getTTL(endpoint: string): number {
  if (endpoint.includes('/trending/')) return CACHE_TTL.trending;
  if (endpoint.includes('/now_playing')) return CACHE_TTL.now_playing;
  if (endpoint.includes('/upcoming')) return CACHE_TTL.upcoming;
  if (endpoint.includes('/popular')) return CACHE_TTL.popular;
  if (endpoint.includes('/top_rated')) return CACHE_TTL.top_rated;
  if (endpoint.match(/\/movie\/\d+/)) return CACHE_TTL.movie_details;
  if (endpoint.match(/\/tv\/\d+\/season/)) return CACHE_TTL.season;
  if (endpoint.match(/\/tv\/\d+/)) return CACHE_TTL.tv_details;
  if (endpoint.includes('/search/')) return CACHE_TTL.search;
  if (endpoint.includes('/genre/')) return CACHE_TTL.genres;
  if (endpoint.includes('/person/')) return CACHE_TTL.person;
  if (endpoint.includes('/on_the_air')) return CACHE_TTL.on_the_air;
  if (endpoint.includes('/discover/')) return CACHE_TTL.discover;

  return DEFAULT_TTL;
}

// Get cached data
export function getCache<T>(endpoint: string, params: Record<string, string> = {}): T | null {
  try {
    ensureCacheDir();
    const key = getCacheKey(endpoint, params);
    const filePath = join(CACHE_DIR, `${key}.json`);

    if (!existsSync(filePath)) {
      return null;
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const cached = JSON.parse(fileContent);

    const ttl = getTTL(endpoint);
    const now = Date.now();

    if (now - cached.timestamp > ttl) {
      // Cache expired
      try {
        unlinkSync(filePath);
      } catch {}
      return null;
    }

    return cached.data as T;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

// Set cache data
export function setCache<T>(endpoint: string, params: Record<string, string> = {}, data: T): void {
  try {
    ensureCacheDir();
    const key = getCacheKey(endpoint, params);
    const filePath = join(CACHE_DIR, `${key}.json`);

    const cacheEntry = {
      timestamp: Date.now(),
      endpoint,
      params,
      data
    };

    writeFileSync(filePath, JSON.stringify(cacheEntry), 'utf-8');
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Clear all cache
export function clearCache(): number {
  try {
    ensureCacheDir();
    const files = readdirSync(CACHE_DIR);
    let cleared = 0;

    for (const file of files) {
      if (file.endsWith('.json')) {
        unlinkSync(join(CACHE_DIR, file));
        cleared++;
      }
    }

    return cleared;
  } catch (error) {
    console.error('Cache clear error:', error);
    return 0;
  }
}

// Clear expired cache entries
export function cleanupCache(): number {
  try {
    ensureCacheDir();
    const files = readdirSync(CACHE_DIR);
    let cleaned = 0;
    const now = Date.now();

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = join(CACHE_DIR, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const cached = JSON.parse(content);
        const ttl = getTTL(cached.endpoint || '');

        if (now - cached.timestamp > ttl) {
          unlinkSync(filePath);
          cleaned++;
        }
      } catch {
        // Remove corrupted cache files
        unlinkSync(filePath);
        cleaned++;
      }
    }

    return cleaned;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}

// Get cache stats
export function getCacheStats(): { files: number; size: number; oldest: number; newest: number } {
  try {
    ensureCacheDir();
    const files = readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
    let totalSize = 0;
    let oldest = Date.now();
    let newest = 0;

    for (const file of files) {
      const filePath = join(CACHE_DIR, file);
      const stats = statSync(filePath);
      totalSize += stats.size;

      try {
        const content = readFileSync(filePath, 'utf-8');
        const cached = JSON.parse(content);
        if (cached.timestamp < oldest) oldest = cached.timestamp;
        if (cached.timestamp > newest) newest = cached.timestamp;
      } catch {}
    }

    return {
      files: files.length,
      size: totalSize,
      oldest: files.length > 0 ? oldest : 0,
      newest: files.length > 0 ? newest : 0
    };
  } catch (error) {
    return { files: 0, size: 0, oldest: 0, newest: 0 };
  }
}
