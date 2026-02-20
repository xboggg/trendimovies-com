#!/usr/bin/env node
/**
 * Box Office Sync Script
 * Scrapes weekend box office data from The Numbers and stores in PostgreSQL
 * Run weekly on Monday via cron: 0 8 * * 1 node /var/www/trendimovies/scripts/sync-box-office.js
 */

import pg from 'pg';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const { Pool } = pg;

// Configuration
const DB_CONFIG = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'trendimovies',
  user: process.env.PGUSER || 'trendimovies',
  password: process.env.PGPASSWORD || ''
};

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const THE_NUMBERS_URL = 'https://www.the-numbers.com/weekend-box-office-chart';

const pool = new Pool(DB_CONFIG);

// Parse currency string to number
function parseCurrency(str) {
  if (!str) return null;
  const cleaned = str.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Search TMDB for movie to get tmdb_id and poster
async function searchTMDB(title) {
  if (!TMDB_API_KEY) return null;

  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // Find best match (prefer 2025-2026 releases)
      const movie = data.results.find(m => {
        const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
        return year >= 2024 && year <= 2026;
      }) || data.results[0];

      return {
        tmdb_id: movie.id,
        poster_path: movie.poster_path
      };
    }
  } catch (e) {
    console.error(`TMDB search failed for "${title}":`, e.message);
  }
  return null;
}

// Scrape box office data from The Numbers
async function scrapeBoxOffice() {
  console.log('Fetching box office data from The Numbers...');

  try {
    const res = await fetch(THE_NUMBERS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Find the current weekend dates from the page
    const weekendText = $('h1').text() || '';
    const dateMatch = weekendText.match(/(\w+\s+\d+)[-–](\d+),\s*(\d{4})/);

    let weekStart, weekEnd;
    if (dateMatch) {
      const month = dateMatch[1].split(' ')[0];
      const startDay = parseInt(dateMatch[1].split(' ')[1]);
      const endDay = parseInt(dateMatch[2]);
      const year = parseInt(dateMatch[3]);

      const monthNum = new Date(`${month} 1, 2000`).getMonth();
      weekStart = new Date(year, monthNum, startDay);
      weekEnd = new Date(year, monthNum, endDay);
    } else {
      // Default to last weekend
      const now = new Date();
      const dayOfWeek = now.getDay();
      weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - dayOfWeek - 1); // Last Sunday
      weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 2); // Last Friday
    }

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    console.log(`Weekend: ${weekStartStr} to ${weekEndStr}`);

    const entries = [];

    // Parse the table rows
    $('table tbody tr').each((i, row) => {
      if (i >= 10) return; // Top 10 only

      const cells = $(row).find('td');
      if (cells.length < 7) return;

      const rank = parseInt($(cells[0]).text().trim()) || (i + 1);
      const title = $(cells[2]).text().trim();
      const weekendGross = parseCurrency($(cells[4]).text());
      const totalGross = parseCurrency($(cells[6]).text());
      const weeksText = $(cells[7]).text().trim();
      const weeks = parseInt(weeksText) || 1;

      if (title) {
        entries.push({
          rank,
          movie_title: title,
          three_day_gross: weekendGross,
          four_day_gross: null, // Not always available
          total_gross: totalGross,
          weeks_in_release: weeks,
          week_start: weekStartStr,
          week_end: weekEndStr
        });
      }
    });

    console.log(`Parsed ${entries.length} entries`);
    return entries;

  } catch (e) {
    console.error('Scraping failed:', e.message);
    return [];
  }
}

// Store entries in database
async function storeEntries(entries) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const entry of entries) {
      // Search TMDB for movie info
      const tmdbInfo = await searchTMDB(entry.movie_title);

      const query = `
        INSERT INTO box_office_weekly
          (week_start, week_end, rank, movie_title, tmdb_id, poster_path, three_day_gross, four_day_gross, total_gross, weeks_in_release)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (week_start, rank) DO UPDATE SET
          movie_title = EXCLUDED.movie_title,
          tmdb_id = COALESCE(EXCLUDED.tmdb_id, box_office_weekly.tmdb_id),
          poster_path = COALESCE(EXCLUDED.poster_path, box_office_weekly.poster_path),
          three_day_gross = EXCLUDED.three_day_gross,
          four_day_gross = EXCLUDED.four_day_gross,
          total_gross = EXCLUDED.total_gross,
          weeks_in_release = EXCLUDED.weeks_in_release,
          updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(query, [
        entry.week_start,
        entry.week_end,
        entry.rank,
        entry.movie_title,
        tmdbInfo?.tmdb_id || null,
        tmdbInfo?.poster_path || null,
        entry.three_day_gross,
        entry.four_day_gross,
        entry.total_gross,
        entry.weeks_in_release
      ]);

      console.log(`  ${entry.rank}. ${entry.movie_title} - $${(entry.three_day_gross / 1000000).toFixed(1)}M`);
    }

    await client.query('COMMIT');
    console.log('Database updated successfully');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Database error:', e.message);
    throw e;
  } finally {
    client.release();
  }
}

// Main function
async function main() {
  console.log('=== Box Office Sync ===');
  console.log(new Date().toISOString());

  try {
    const entries = await scrapeBoxOffice();

    if (entries.length === 0) {
      console.log('No entries to store');
      return;
    }

    await storeEntries(entries);
    console.log('Sync complete!');

  } catch (e) {
    console.error('Sync failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
