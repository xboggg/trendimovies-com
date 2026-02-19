#!/usr/bin/env node
/**
 * Sync Movie Download Links from Telegram SQLite to PostgreSQL
 * Uses SSH to query the remote SQLite database on 38.242.195.0
 *
 * Usage:
 *   node sync-movies-ddl.js           # dry-run
 *   node sync-movies-ddl.js --live    # insert links
 */

import { execSync } from 'child_process';

const SQLITE_DB = '/opt/trendimovies/bot/database/movies.db';
const SQLITE_HOST = '38.242.195.0';
const POSTGREST_URL = 'http://localhost:3001';
const TGSTREAM_BASE = 'https://trendimovies.com/tgstream/stream';

const args = process.argv.slice(2);
const isLive = args.includes('--live');

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function sqliteQuery(sql) {
  // Escape single quotes for shell
  const escapedSql = sql.replace(/'/g, "'\\''");
  const cmd = `ssh -p 80 root@${SQLITE_HOST} "sqlite3 -json ${SQLITE_DB} '${escapedSql}'"`;
  try {
    const result = execSync(cmd, { maxBuffer: 100 * 1024 * 1024, timeout: 30000 });
    const output = result.toString().trim();
    return output ? JSON.parse(output) : [];
  } catch (e) {
    return [];
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return null;
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes >= 1048576) return Math.round(bytes / 1048576) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ +/g, ' ').trim();
}

function titleMatch(movieTitle, fileName) {
  const normalizedMovie = normalizeTitle(movieTitle);
  const normalizedFile = normalizeTitle(fileName.split('.').slice(0, -1).join(' '));
  const movieWords = normalizedMovie.split(' ').filter(w => w.length > 2);
  let matchCount = 0;
  for (const word of movieWords) {
    if (normalizedFile.includes(word)) matchCount++;
  }
  return matchCount >= Math.ceil(movieWords.length * 0.6);
}

async function main() {
  log('Starting movie DDL sync...');
  log(`Mode: ${isLive ? 'LIVE' : 'DRY-RUN'}`);

  const moviesRes = await fetch(`${POSTGREST_URL}/movies?select=tmdb_id,title,year&has_downloads=eq.false&year=gte.2020&order=year.desc,title`);
  const movies = await moviesRes.json();
  log(`Found ${movies.length} movies without DDL`);

  let matched = 0, inserted = 0;

  for (const movie of movies) {
    // Escape title for SQL
    const searchTitle = movie.title.replace(/'/g, "''").replace(/[^a-zA-Z0-9 ']/g, '');
    const sql = `SELECT id, file_name, quality, file_size FROM movies WHERE file_name LIKE '%${searchTitle}%' AND year = ${movie.year} AND is_series = 0 AND file_name NOT LIKE '%.srt' ORDER BY CASE quality WHEN '2160p' THEN 1 WHEN '1080p' THEN 2 WHEN '720p' THEN 3 ELSE 4 END, file_size DESC LIMIT 20`;

    const files = sqliteQuery(sql);
    if (files.length === 0) continue;

    // Find best file per quality
    const qualityBest = {};
    for (const file of files) {
      if (!titleMatch(movie.title, file.file_name)) continue;
      if (!['720p', '1080p', '2160p'].includes(file.quality)) continue;
      if (!qualityBest[file.quality] || file.file_size > qualityBest[file.quality].file_size) {
        qualityBest[file.quality] = file;
      }
    }

    const bestFiles = Object.values(qualityBest);
    if (bestFiles.length === 0) continue;

    matched++;
    log(`MATCH: ${movie.title} (${movie.year}) - ${bestFiles.length} qualities`);

    if (isLive) {
      for (const file of bestFiles) {
        const linkData = {
          content_type: 'movie',
          content_id: movie.tmdb_id,
          source: 'telegram',
          quality: file.quality,
          file_size: formatFileSize(file.file_size),
          url: `${TGSTREAM_BASE}/${file.id}`,
          is_active: true,
          language: 'en'
        };

        try {
          const res = await fetch(`${POSTGREST_URL}/download_links`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(linkData)
          });
          if (res.ok) {
            inserted++;
            log(`  + ${file.quality} (${formatFileSize(file.file_size)})`);
          }
        } catch (e) {
          log(`  ! Error: ${e.message}`);
        }
      }

      // Update has_downloads flag
      await fetch(`${POSTGREST_URL}/movies?tmdb_id=eq.${movie.tmdb_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ has_downloads: true })
      });
    }
  }

  log('');
  log('=== SUMMARY ===');
  log(`Without DDL: ${movies.length}, Matched: ${matched}, Inserted: ${inserted}`);
}

main().catch(console.error);
