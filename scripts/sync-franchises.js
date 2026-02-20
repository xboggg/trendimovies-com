#!/usr/bin/env node
/**
 * Franchise Sync Script
 * Syncs franchise/collection data from TMDB and stores in PostgreSQL
 * Run weekly via cron: 0 9 * * 0 node /var/www/trendimovies/scripts/sync-franchises.js
 */

import pg from 'pg';
import fetch from 'node-fetch';

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
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const pool = new Pool(DB_CONFIG);

// Franchise collection IDs from TMDB
const FRANCHISE_COLLECTIONS = [
  { name: 'Marvel Cinematic Universe', slug: 'mcu', collectionId: 529892 },
  { name: 'DC Extended Universe', slug: 'dceu', collectionId: 209131 },
  { name: 'Star Wars', slug: 'star-wars', collectionId: 10 },
  { name: 'Harry Potter / Wizarding World', slug: 'wizarding-world', collectionId: 1241 },
  { name: 'Fast & Furious', slug: 'fast-furious', collectionId: 9485 },
  { name: 'Jurassic Park / World', slug: 'jurassic', collectionId: 328 },
  { name: 'James Bond 007', slug: 'james-bond', collectionId: 645 },
  { name: 'Mission: Impossible', slug: 'mission-impossible', collectionId: 87359 },
  { name: 'Transformers', slug: 'transformers', collectionId: 8650 },
  { name: 'Spider-Man', slug: 'spider-man', collectionId: 531241 },
  { name: 'X-Men', slug: 'x-men', collectionId: 748 },
  { name: 'Planet of the Apes', slug: 'planet-apes', collectionId: 1709 },
  { name: 'The Lord of the Rings', slug: 'lotr', collectionId: 119 },
  { name: 'Pirates of the Caribbean', slug: 'pirates', collectionId: 295 },
  { name: 'John Wick', slug: 'john-wick', collectionId: 404609 },
  { name: 'The Conjuring Universe', slug: 'conjuring', collectionId: 313086 },
  { name: 'Despicable Me / Minions', slug: 'minions', collectionId: 86066 },
  { name: 'Toy Story', slug: 'toy-story', collectionId: 10194 },
  { name: 'Avatar', slug: 'avatar', collectionId: 87096 },
  { name: 'Shrek', slug: 'shrek', collectionId: 2150 },
  { name: 'The Hunger Games', slug: 'hunger-games', collectionId: 131635 },
  { name: 'The Hobbit / Middle-earth', slug: 'hobbit', collectionId: 121938 },
  { name: 'Indiana Jones', slug: 'indiana-jones', collectionId: 84 },
  { name: 'Ice Age', slug: 'ice-age', collectionId: 8354 },
  { name: 'Kung Fu Panda', slug: 'kung-fu-panda', collectionId: 77816 },
  { name: 'How to Train Your Dragon', slug: 'httyd', collectionId: 89137 },
  { name: 'The Purge', slug: 'purge', collectionId: 256322 },
  { name: 'Insidious', slug: 'insidious', collectionId: 228446 },
  { name: 'Paranormal Activity', slug: 'paranormal-activity', collectionId: 41437 },
  { name: 'Alien', slug: 'alien', collectionId: 8091 }
];

// Fetch collection from TMDB
async function fetchCollection(collectionId) {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY not set');
    return null;
  }

  try {
    const url = `${TMDB_BASE_URL}/collection/${collectionId}?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Failed to fetch collection ${collectionId}: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (e) {
    console.error(`Error fetching collection ${collectionId}:`, e.message);
    return null;
  }
}

// Sync a single franchise
async function syncFranchise(client, franchise) {
  console.log(`\nSyncing: ${franchise.name}`);

  const collection = await fetchCollection(franchise.collectionId);
  if (!collection) {
    console.log(`  Skipping - failed to fetch`);
    return;
  }

  const movies = collection.parts || [];
  const totalMovies = movies.length;

  // Calculate total box office (if we had the data)
  // For now, just set to 0 - could be enhanced with additional API calls

  // Upsert franchise
  const franchiseQuery = `
    INSERT INTO franchises (name, slug, tmdb_collection_id, logo_path, description, total_movies, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      tmdb_collection_id = EXCLUDED.tmdb_collection_id,
      logo_path = COALESCE(EXCLUDED.logo_path, franchises.logo_path),
      description = EXCLUDED.description,
      total_movies = EXCLUDED.total_movies,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id
  `;

  const franchiseResult = await client.query(franchiseQuery, [
    franchise.name,
    franchise.slug,
    franchise.collectionId,
    collection.poster_path,
    collection.overview,
    totalMovies
  ]);

  const franchiseId = franchiseResult.rows[0].id;
  console.log(`  Franchise ID: ${franchiseId}, Movies: ${totalMovies}`);

  // Sort movies by release date
  movies.sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  // Upsert movies
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];

    const movieQuery = `
      INSERT INTO franchise_movies (franchise_id, tmdb_id, title, poster_path, release_date, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (franchise_id, tmdb_id) DO UPDATE SET
        title = EXCLUDED.title,
        poster_path = EXCLUDED.poster_path,
        release_date = EXCLUDED.release_date,
        sort_order = EXCLUDED.sort_order
    `;

    await client.query(movieQuery, [
      franchiseId,
      movie.id,
      movie.title,
      movie.poster_path,
      movie.release_date || null,
      i + 1
    ]);
  }

  console.log(`  Synced ${movies.length} movies`);
}

// Main sync function
async function main() {
  console.log('=== Franchise Sync ===');
  console.log(new Date().toISOString());

  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY environment variable not set');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const franchise of FRANCHISE_COLLECTIONS) {
      await syncFranchise(client, franchise);

      // Rate limiting - TMDB allows 40 requests per 10 seconds
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    await client.query('COMMIT');
    console.log('\n=== Sync Complete ===');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Sync failed:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
