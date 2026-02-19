#!/usr/bin/env node
/**
 * Sync Series from Telegram Channel to PostgreSQL
 * ================================================
 * Extracts all unique series from the Telegram SQLite DB,
 * looks them up on TMDB, and inserts into series/seasons/episodes tables.
 *
 * Usage:
 *   node sync-series-from-telegram.js                    # dry-run, all series
 *   node sync-series-from-telegram.js --limit 50         # dry-run, first 50
 *   node sync-series-from-telegram.js --live             # actual insert
 *   node sync-series-from-telegram.js --live --resume    # resume from progress file
 *   node sync-series-from-telegram.js --stats            # show stats only
 *
 * Runs on server: 144.91.71.106
 * Requires: sqlite3 npm package (or use built-in better-sqlite3)
 *
 * Author: Evans Agyemang (xboggg)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const SQLITE_DB = process.env.SQLITE_DB || '/opt/trendimovies/bot/database/movies.db';
const POSTGREST_URL = process.env.POSTGREST_URL || 'http://localhost:3001';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '46300aaf372203a94763f1f46846e843';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const PROGRESS_FILE = path.join(__dirname, 'series-sync-progress.json');
const MISSING_FILE = path.join(__dirname, 'missing-series.json');
const LOG_FILE = path.join(__dirname, 'series-sync.log');

// Rate limiting
const TMDB_DELAY_MS = 260;        // Between individual TMDB calls
const BATCH_PAUSE_MS = 3000;      // Pause every BATCH_SIZE series
const BATCH_SIZE = 50;            // Save progress every N series
const MAX_RETRIES = 3;

// ============================================================
// ARGUMENT PARSING
// ============================================================

const args = process.argv.slice(2);
const isLive = args.includes('--live');
const isResume = args.includes('--resume');
const isStatsOnly = args.includes('--stats');
const limitArg = args.find(a => a.startsWith('--limit'));
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 0;

// ============================================================
// LOGGING
// ============================================================

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

// ============================================================
// SQLite ACCESS (using python3 subprocess since node sqlite3 may not be installed)
// ============================================================

function sqliteQuery(sql) {
  // Write a temp Python script to avoid shell escaping issues
  const tmpFile = '/tmp/_sqlite_query.py';
  const pyScript = `
import sqlite3, json
conn = sqlite3.connect('${SQLITE_DB}')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("""${sql}""")
rows = [dict(r) for r in cur.fetchall()]
print(json.dumps(rows))
conn.close()
`;
  fs.writeFileSync(tmpFile, pyScript);
  const result = execSync(`python3 ${tmpFile}`, { maxBuffer: 100 * 1024 * 1024, timeout: 120000 });
  return JSON.parse(result.toString());
}

// ============================================================
// TMDB API
// ============================================================

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(15000)
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(response.headers.get('retry-after') || '2');
        log(`  TMDB rate limited. Waiting ${retryAfter}s (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (response.status === 404) {
        return null; // Not found
      }

      if (!response.ok) {
        throw new Error(`TMDB ${response.status}: ${response.statusText}`);
      }

      await sleep(TMDB_DELAY_MS); // Rate limiting
      return await response.json();
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      log(`  TMDB error (attempt ${attempt}): ${error.message}. Retrying...`);
      await sleep(1000 * attempt);
    }
  }
}

async function searchTMDBSeries(title) {
  // Try exact search first
  const data = await fetchTMDB('/search/tv', { query: title, include_adult: false });
  if (!data || !data.results || data.results.length === 0) return null;

  // Return first result (most relevant)
  return data.results[0];
}

// ============================================================
// PostgREST API
// ============================================================

function postgrestHeaders() {
  return {
    'Accept-Profile': 'public',
    'Content-Profile': 'public',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

async function dbQuery(table, params = {}) {
  const url = new URL(`${POSTGREST_URL}/${table}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: postgrestHeaders(),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`PostgREST ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function dbInsert(table, data) {
  const response = await fetch(`${POSTGREST_URL}/${table}`, {
    method: 'POST',
    headers: postgrestHeaders(),
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw error;
  }
  return response.json();
}

// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateSlug(title, year) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
  if (year) slug += `-${year}`;
  return slug;
}

function getTrailerKey(videos) {
  if (!videos || videos.length === 0) return null;
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find(v => v.site === 'YouTube');
  return trailer?.key || null;
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (e) { /* ignore */ }
  return { completed: [], failed: [], lastIndex: 0 };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadMissing() {
  try {
    if (fs.existsSync(MISSING_FILE)) {
      return JSON.parse(fs.readFileSync(MISSING_FILE, 'utf-8'));
    }
  } catch (e) { /* ignore */ }
  return [];
}

function saveMissing(missing) {
  fs.writeFileSync(MISSING_FILE, JSON.stringify(missing, null, 2));
}

// ============================================================
// EXTRACT UNIQUE SERIES FROM SQLITE
// ============================================================

function extractUniqueSeries() {
  log('Extracting unique series from SQLite...');

  // Get all series files with their parsed info
  // Strategy: parse S##E## from filenames, group by series name
  // Also check movie_metadata for existing TMDB IDs
  const rows = sqliteQuery(`
    SELECT m.id, m.file_name, m.clean_title, m.year,
           mm.tmdb_id, mm.title as meta_title
    FROM movies m
    LEFT JOIN movie_metadata mm ON m.id = mm.movie_id
    WHERE m.is_series = 1
    ORDER BY m.id
  `);

  log(`  Loaded ${rows.length.toLocaleString()} series file rows from SQLite`);

  // Parse S##E## from filenames and group by series name
  const seriesMap = new Map(); // normalized_name -> { name, tmdb_id, files_count, seasons, year }

  let parsed = 0;
  let unparseable = 0;

  for (const row of rows) {
    const fn = row.file_name || '';
    const match = fn.match(/[. _-]S(\d{1,2})E(\d{1,3})/i);

    if (!match) {
      unparseable++;
      continue;
    }

    parsed++;
    const season = parseInt(match[1]);
    const episode = parseInt(match[2]);

    // Extract series name (everything before S##E##)
    let seriesName = fn.substring(0, match.index);
    seriesName = seriesName.replace(/[._-]/g, ' ').trim();
    seriesName = seriesName.replace(/\b(19|20)\d{2}\b/g, '').trim();
    seriesName = seriesName.replace(/\s+/g, ' ').trim();

    // Use metadata title if available (more accurate)
    const displayName = row.meta_title || seriesName;
    const normalizedKey = seriesName.toLowerCase().replace(/\s+/g, ' ');

    if (!normalizedKey || normalizedKey.length < 2) continue;

    if (!seriesMap.has(normalizedKey)) {
      seriesMap.set(normalizedKey, {
        name: displayName,
        parsedName: seriesName,
        tmdb_id: row.tmdb_id || null,
        year: row.year || null,
        seasons: new Set(),
        episodes: new Set(),
        fileCount: 0,
      });
    }

    const entry = seriesMap.get(normalizedKey);
    entry.fileCount++;
    entry.seasons.add(season);
    entry.episodes.add(`S${season}E${episode}`);

    // Update TMDB ID if we find one (prefer metadata)
    if (row.tmdb_id && !entry.tmdb_id) {
      entry.tmdb_id = row.tmdb_id;
      entry.name = row.meta_title || entry.name;
    }
  }

  // Convert sets to counts for serialization
  const seriesList = [];
  for (const [key, data] of seriesMap) {
    seriesList.push({
      key,
      name: data.name,
      parsedName: data.parsedName,
      tmdb_id: data.tmdb_id,
      year: data.year,
      seasonCount: data.seasons.size,
      episodeCount: data.episodes.size,
      fileCount: data.fileCount,
    });
  }

  // Sort by file count descending (most popular first)
  seriesList.sort((a, b) => b.fileCount - a.fileCount);

  log(`  Parsed ${parsed.toLocaleString()} files, ${unparseable.toLocaleString()} unparseable`);
  log(`  Found ${seriesList.length.toLocaleString()} unique series`);

  const withTmdb = seriesList.filter(s => s.tmdb_id).length;
  log(`  ${withTmdb.toLocaleString()} already have TMDB IDs from metadata`);
  log(`  ${(seriesList.length - withTmdb).toLocaleString()} need TMDB lookup`);

  return seriesList;
}

// ============================================================
// SYNC A SINGLE SERIES TO POSTGRESQL
// ============================================================

async function syncOneSeries(tmdbId) {
  // Check if already exists
  const existing = await dbQuery('series', { tmdb_id: `eq.${tmdbId}`, select: 'id', limit: '1' });
  if (existing.length > 0) {
    return { status: 'exists', seriesId: existing[0].id };
  }

  // Fetch full details from TMDB
  const tvData = await fetchTMDB(`/tv/${tmdbId}`, {
    append_to_response: 'credits,videos,keywords,external_ids'
  });

  if (!tvData) return { status: 'not_found' };

  const year = tvData.first_air_date ? new Date(tvData.first_air_date).getFullYear() : null;

  const seriesData = {
    tmdb_id: tvData.id,
    imdb_id: tvData.external_ids?.imdb_id || null,
    title: tvData.name,
    slug: generateSlug(tvData.name, year),
    original_title: tvData.original_name,
    overview: tvData.overview,
    tagline: tvData.tagline || null,
    first_air_date: tvData.first_air_date || null,
    last_air_date: tvData.last_air_date || null,
    year,
    number_of_seasons: tvData.number_of_seasons,
    number_of_episodes: tvData.number_of_episodes,
    episode_run_time: tvData.episode_run_time || [],
    popularity: tvData.popularity,
    vote_average: tvData.vote_average,
    vote_count: tvData.vote_count,
    poster_path: tvData.poster_path,
    backdrop_path: tvData.backdrop_path,
    trailer_key: getTrailerKey(tvData.videos?.results),
    original_language: tvData.original_language,
    spoken_languages: tvData.spoken_languages || [],
    origin_country: tvData.origin_country || [],
    production_companies: tvData.production_companies || [],
    networks: tvData.networks || [],
    genres: tvData.genres || [],
    cast_data: (tvData.credits?.cast || []).slice(0, 20),
    crew_data: (tvData.credits?.crew || []).filter(c =>
      ['Creator', 'Executive Producer', 'Showrunner'].includes(c.job)
    ).slice(0, 10),
    keywords: tvData.keywords?.results || [],
    watch_providers: {},
    status: tvData.status,
    type: tvData.type,
    is_featured: tvData.popularity > 100
  };

  const [insertedSeries] = await dbInsert('series', seriesData);

  if (!insertedSeries?.id) {
    return { status: 'insert_failed' };
  }

  // Sync seasons and episodes
  let totalEpisodes = 0;
  for (let seasonNum = 1; seasonNum <= tvData.number_of_seasons; seasonNum++) {
    try {
      const seasonData = await fetchTMDB(`/tv/${tmdbId}/season/${seasonNum}`);
      if (!seasonData) continue;

      const [season] = await dbInsert('seasons', {
        series_id: insertedSeries.id,
        tmdb_id: seasonData.id,
        season_number: seasonNum,
        name: seasonData.name,
        overview: seasonData.overview,
        poster_path: seasonData.poster_path,
        air_date: seasonData.air_date || null,
        episode_count: seasonData.episodes?.length || 0
      });

      if (season?.id && seasonData.episodes) {
        const episodes = seasonData.episodes.map(ep => ({
          season_id: season.id,
          series_id: insertedSeries.id,
          tmdb_id: ep.id,
          episode_number: ep.episode_number,
          name: ep.name,
          overview: ep.overview,
          still_path: ep.still_path,
          air_date: ep.air_date || null,
          runtime: ep.runtime || null,
          vote_average: ep.vote_average || null,
          vote_count: ep.vote_count || null,
          has_downloads: false
        }));

        await dbInsert('episodes', episodes);
        totalEpisodes += episodes.length;
      }
    } catch (error) {
      log(`    Error syncing season ${seasonNum}: ${error.message || JSON.stringify(error)}`);
    }
  }

  return {
    status: 'added',
    seriesId: insertedSeries.id,
    title: tvData.name,
    seasons: tvData.number_of_seasons,
    episodes: totalEpisodes
  };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  log('=' .repeat(70));
  log('  Sync Series from Telegram Channel to PostgreSQL');
  log(`  Mode: ${isLive ? 'LIVE' : 'DRY-RUN'}`);
  log(`  Resume: ${isResume ? 'YES' : 'NO'}`);
  if (LIMIT > 0) log(`  Limit: ${LIMIT}`);
  log(`  SQLite: ${SQLITE_DB}`);
  log(`  PostgREST: ${POSTGREST_URL}`);
  log('=' .repeat(70));
  log('');

  // Step 1: Extract unique series from Telegram SQLite
  const allSeries = extractUniqueSeries();

  if (isStatsOnly) {
    log('\n=== STATS ===');
    log(`Total unique series: ${allSeries.length}`);
    log(`With TMDB ID: ${allSeries.filter(s => s.tmdb_id).length}`);
    log(`Need TMDB lookup: ${allSeries.filter(s => !s.tmdb_id).length}`);
    log(`Total episodes (from filenames): ${allSeries.reduce((sum, s) => sum + s.episodeCount, 0)}`);
    log(`Total files: ${allSeries.reduce((sum, s) => sum + s.fileCount, 0)}`);
    log('\nTop 20 series by file count:');
    for (const s of allSeries.slice(0, 20)) {
      log(`  ${s.name.padEnd(40)} | ${s.fileCount} files | ${s.episodeCount} eps | ${s.seasonCount} seasons | tmdb:${s.tmdb_id || 'none'}`);
    }
    return;
  }

  // Apply limit
  let targetSeries = LIMIT > 0 ? allSeries.slice(0, LIMIT) : allSeries;

  // Load progress if resuming
  const progress = isResume ? loadProgress() : { completed: [], failed: [], lastIndex: 0 };
  const completedSet = new Set(progress.completed);
  const missing = isResume ? loadMissing() : [];

  const startIndex = isResume ? progress.lastIndex : 0;
  log(`\nProcessing ${targetSeries.length} series (starting from index ${startIndex})...`);

  const stats = {
    added: 0,
    exists: 0,
    notFound: 0,
    failed: 0,
    skipped: 0,
    totalEpisodes: 0,
  };

  for (let i = startIndex; i < targetSeries.length; i++) {
    const series = targetSeries[i];

    // Skip if already completed in a previous run
    if (completedSet.has(series.key)) {
      stats.skipped++;
      continue;
    }

    try {
      let tmdbId = series.tmdb_id;

      // Step 2: Find TMDB ID if not known
      if (!tmdbId) {
        const searchResult = await searchTMDBSeries(series.parsedName);
        if (!searchResult) {
          stats.notFound++;
          missing.push({
            name: series.name,
            parsedName: series.parsedName,
            fileCount: series.fileCount,
            episodeCount: series.episodeCount,
          });
          progress.completed.push(series.key);
          completedSet.add(series.key);
          if ((i + 1) % 100 === 0) log(`  [${i + 1}/${targetSeries.length}] Not found on TMDB: "${series.parsedName}"`);
          continue;
        }
        tmdbId = searchResult.id;
      }

      // Step 3: Sync to PostgreSQL
      if (isLive) {
        const result = await syncOneSeries(tmdbId);

        if (result.status === 'added') {
          stats.added++;
          stats.totalEpisodes += result.episodes || 0;
          log(`  [${i + 1}/${targetSeries.length}] Added: ${result.title} (${result.seasons} seasons, ${result.episodes} episodes)`);
        } else if (result.status === 'exists') {
          stats.exists++;
        } else if (result.status === 'not_found') {
          stats.notFound++;
          missing.push({ name: series.name, tmdb_id: tmdbId, reason: 'tmdb_404' });
        } else {
          stats.failed++;
          log(`  [${i + 1}/${targetSeries.length}] Insert failed for: ${series.name}`);
        }
      } else {
        // Dry run - just check if TMDB ID is valid
        stats.added++;
        if ((i + 1) % 200 === 0) {
          log(`  [${i + 1}/${targetSeries.length}] Would sync: "${series.name}" (tmdb:${tmdbId})`);
        }
      }

      progress.completed.push(series.key);
      completedSet.add(series.key);

    } catch (error) {
      stats.failed++;
      progress.failed.push({ key: series.key, name: series.name, error: error.message || String(error) });
      log(`  [${i + 1}/${targetSeries.length}] ERROR: ${series.name} - ${error.message || JSON.stringify(error)}`);

      // If it's a duplicate slug error, mark as completed
      if (error.code === '23505') {
        stats.exists++;
        stats.failed--; // Un-count as failure
        progress.completed.push(series.key);
        completedSet.add(series.key);
      }
    }

    // Save progress periodically
    if ((i + 1) % BATCH_SIZE === 0) {
      progress.lastIndex = i + 1;
      if (isLive) {
        saveProgress(progress);
        saveMissing(missing);
      }
      log(`  --- Progress saved at ${i + 1}/${targetSeries.length} ---`);
      await sleep(BATCH_PAUSE_MS);
    }
  }

  // Final save
  progress.lastIndex = targetSeries.length;
  if (isLive) {
    saveProgress(progress);
    saveMissing(missing);
  }

  // Summary
  log('');
  log('=' .repeat(70));
  log('  SYNC SUMMARY');
  log('=' .repeat(70));
  log(`  Mode:            ${isLive ? 'LIVE' : 'DRY-RUN'}`);
  log(`  Total series:    ${targetSeries.length.toLocaleString()}`);
  log(`  Added:           ${stats.added.toLocaleString()}`);
  log(`  Already existed: ${stats.exists.toLocaleString()}`);
  log(`  Not found:       ${stats.notFound.toLocaleString()}`);
  log(`  Failed:          ${stats.failed.toLocaleString()}`);
  log(`  Skipped:         ${stats.skipped.toLocaleString()}`);
  log(`  Total episodes:  ${stats.totalEpisodes.toLocaleString()}`);
  log(`  Missing logged:  ${missing.length.toLocaleString()}`);
  log('=' .repeat(70));

  if (!isLive) {
    log('');
    log('  This was a DRY-RUN. To actually insert, add --live flag.');
    log(`  Example: node ${path.basename(__filename)} --live`);
  }
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  console.error(err);
  process.exit(1);
});
