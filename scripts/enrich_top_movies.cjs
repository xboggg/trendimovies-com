#!/usr/bin/env node
/**
 * One-time enrichment script.
 * Parses Top_Movies_By_Year.txt -> looks up each movie on TMDB -> checks if it
 * exists in our PostgreSQL DB -> writes a JSON cache that the website ships.
 *
 * Output: src/data/top_movies_by_year.json
 *
 * Run:  TMDB_API_KEY=xxx node scripts/enrich_top_movies.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY env var required');
  process.exit(1);
}

const TXT_PATH = path.join(__dirname, 'Top_Movies_By_Year.txt');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'top_movies_by_year.json');

const PG_DSN = process.env.PG_DSN || 'postgres://trendimovies:NGCuEAVA1URIYmKn5d9ZT6xSXVM9JoV@127.0.0.1:5432/trendimovies';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tmdbSearch(title, year) {
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] || null;
  } catch (e) {
    console.error(`TMDB error for "${title}" (${year}): ${e.message}`);
    return null;
  }
}

function parseTxt(content) {
  const lines = content.split('\n');
  const byYear = {};
  let currentYear = null;

  for (const line of lines) {
    const trimmed = line.trim();

    const yearMatch = trimmed.match(/^TOP MOVIES (\d{4})$/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1], 10);
      byYear[currentYear] = [];
      continue;
    }

    if (!currentYear) continue;

    // "1. Movie Title (imdb: 7.5, PG)"
    const movieMatch = trimmed.match(/^(\d+)\.\s+(.+?)\s*\(imdb:\s*([\d.]+|N\/A),\s*([^)]+)\)\s*$/);
    if (movieMatch) {
      byYear[currentYear].push({
        rank: parseInt(movieMatch[1], 10),
        title: movieMatch[2].trim(),
        imdb: movieMatch[3] === 'N/A' ? null : parseFloat(movieMatch[3]),
        rating: movieMatch[4].trim(),
      });
    }
  }
  return byYear;
}

async function main() {
  const content = fs.readFileSync(TXT_PATH, 'utf-8');
  const byYear = parseTxt(content);

  const allYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);
  const totalMovies = allYears.reduce((sum, y) => sum + byYear[y].length, 0);
  console.log(`Parsed ${totalMovies} movies across ${allYears.length} years`);

  // Connect to PG to check which titles we have
  const pg = new Client({ connectionString: PG_DSN });
  await pg.connect();

  const dbTitlesByYear = {};
  for (const y of allYears) {
    const r = await pg.query('SELECT id, tmdb_id, title, year, slug, poster_path FROM movies WHERE year = $1', [y]);
    dbTitlesByYear[y] = r.rows;
  }
  console.log('Loaded existing site movies for cross-reference');

  const out = {};
  let processed = 0;
  let enrichedFromTmdb = 0;
  let matchedToDb = 0;

  for (const year of allYears) {
    const list = byYear[year];
    out[year] = [];

    for (const m of list) {
      processed++;
      if (processed % 50 === 0) {
        console.log(`  ${processed}/${totalMovies} (TMDB hits: ${enrichedFromTmdb}, DB matches: ${matchedToDb})`);
      }

      // Try to match by title to our DB first (cheap)
      const normTitle = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
      let dbMatch = (dbTitlesByYear[year] || []).find(row => {
        const dbNorm = (row.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        return dbNorm === normTitle;
      });

      // Get TMDB data
      const tmdb = await tmdbSearch(m.title, year);
      await sleep(40); // gentle rate limiting

      if (tmdb) enrichedFromTmdb++;

      // If no DB match by title, try via TMDB id
      if (!dbMatch && tmdb) {
        const r = await pg.query('SELECT id, tmdb_id, title, slug, poster_path FROM movies WHERE tmdb_id = $1 LIMIT 1', [tmdb.id]);
        if (r.rows[0]) dbMatch = r.rows[0];
      }

      if (dbMatch) matchedToDb++;

      out[year].push({
        rank: m.rank,
        title: m.title,
        imdb: m.imdb,
        rating: m.rating,
        tmdb_id: tmdb?.id || null,
        poster_path: tmdb?.poster_path || null,
        backdrop_path: tmdb?.backdrop_path || null,
        overview: tmdb?.overview || null,
        release_date: tmdb?.release_date || null,
        vote_average: tmdb?.vote_average ?? null,
        in_db: !!dbMatch,
        db_id: dbMatch?.id || null,
        db_slug: dbMatch?.slug || null,
      });
    }
  }

  await pg.end();

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({
    generated_at: new Date().toISOString(),
    source: 'www.dvdsreleasedates.com',
    years: allYears,
    by_year: out,
  }, null, 2));

  console.log(`\nDone. Wrote ${OUT_PATH}`);
  console.log(`  Total movies: ${processed}`);
  console.log(`  TMDB enriched: ${enrichedFromTmdb}`);
  console.log(`  Matched to DB: ${matchedToDb}`);
}

main().catch(e => { console.error(e); process.exit(1); });
