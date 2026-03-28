import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = "/var/www/trendimovies/.cache/tmdb";
const DEFAULT_TTL = 36e5;
const CACHE_TTL = {
  trending: 18e5,
  // 30 minutes - changes frequently
  now_playing: 36e5,
  // 1 hour
  upcoming: 72e5,
  // 2 hours
  popular: 36e5,
  // 1 hour
  top_rated: 864e5,
  // 24 hours - rarely changes
  movie_details: 864e5,
  // 24 hours
  tv_details: 864e5,
  // 24 hours
  season: 864e5,
  // 24 hours
  search: 18e5,
  // 30 minutes
  genres: 6048e5,
  // 7 days - rarely changes
  person: 864e5,
  // 24 hours
  on_the_air: 36e5,
  // 1 hour
  discover: 36e5
  // 1 hour
};
function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}
function getCacheKey(endpoint, params = {}) {
  const sortedParams = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const key = `${endpoint}${sortedParams ? "?" + sortedParams : ""}`.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 200);
  return key;
}
function getTTL(endpoint) {
  if (endpoint.includes("/trending/")) return CACHE_TTL.trending;
  if (endpoint.includes("/now_playing")) return CACHE_TTL.now_playing;
  if (endpoint.includes("/upcoming")) return CACHE_TTL.upcoming;
  if (endpoint.includes("/popular")) return CACHE_TTL.popular;
  if (endpoint.includes("/top_rated")) return CACHE_TTL.top_rated;
  if (endpoint.match(/\/movie\/\d+/)) return CACHE_TTL.movie_details;
  if (endpoint.match(/\/tv\/\d+\/season/)) return CACHE_TTL.season;
  if (endpoint.match(/\/tv\/\d+/)) return CACHE_TTL.tv_details;
  if (endpoint.includes("/search/")) return CACHE_TTL.search;
  if (endpoint.includes("/genre/")) return CACHE_TTL.genres;
  if (endpoint.includes("/person/")) return CACHE_TTL.person;
  if (endpoint.includes("/on_the_air")) return CACHE_TTL.on_the_air;
  if (endpoint.includes("/discover/")) return CACHE_TTL.discover;
  return DEFAULT_TTL;
}
function getCache(endpoint, params = {}) {
  try {
    ensureCacheDir();
    const key = getCacheKey(endpoint, params);
    const filePath = join(CACHE_DIR, `${key}.json`);
    if (!existsSync(filePath)) {
      return null;
    }
    const fileContent = readFileSync(filePath, "utf-8");
    const cached = JSON.parse(fileContent);
    const ttl = getTTL(endpoint);
    const now = Date.now();
    if (now - cached.timestamp > ttl) {
      try {
        unlinkSync(filePath);
      } catch {
      }
      return null;
    }
    return cached.data;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}
function setCache(endpoint, params = {}, data) {
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
    writeFileSync(filePath, JSON.stringify(cacheEntry), "utf-8");
  } catch (error) {
    console.error("Cache write error:", error);
  }
}
function clearCache() {
  try {
    ensureCacheDir();
    const files = readdirSync(CACHE_DIR);
    let cleared = 0;
    for (const file of files) {
      if (file.endsWith(".json")) {
        unlinkSync(join(CACHE_DIR, file));
        cleared++;
      }
    }
    return cleared;
  } catch (error) {
    console.error("Cache clear error:", error);
    return 0;
  }
}
function cleanupCache() {
  try {
    ensureCacheDir();
    const files = readdirSync(CACHE_DIR);
    let cleaned = 0;
    const now = Date.now();
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const filePath = join(CACHE_DIR, file);
      try {
        const content = readFileSync(filePath, "utf-8");
        const cached = JSON.parse(content);
        const ttl = getTTL(cached.endpoint || "");
        if (now - cached.timestamp > ttl) {
          unlinkSync(filePath);
          cleaned++;
        }
      } catch {
        unlinkSync(filePath);
        cleaned++;
      }
    }
    return cleaned;
  } catch (error) {
    console.error("Cache cleanup error:", error);
    return 0;
  }
}
function getCacheStats() {
  try {
    ensureCacheDir();
    const files = readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"));
    let totalSize = 0;
    let oldest = Date.now();
    let newest = 0;
    for (const file of files) {
      const filePath = join(CACHE_DIR, file);
      const stats = statSync(filePath);
      totalSize += stats.size;
      try {
        const content = readFileSync(filePath, "utf-8");
        const cached = JSON.parse(content);
        if (cached.timestamp < oldest) oldest = cached.timestamp;
        if (cached.timestamp > newest) newest = cached.timestamp;
      } catch {
      }
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

export { cleanupCache as a, getCache as b, clearCache as c, getCacheStats as g, setCache as s };
