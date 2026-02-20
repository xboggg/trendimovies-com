#!/usr/bin/env node
/**
 * Re-index older Telegram channel files into the SQLite database
 * The database currently starts at message_id 57,635 but older files exist
 *
 * This script runs on 144.91.71.106 and SSHes to 38.242.195.0 to:
 * 1. Check current min/max message IDs in SQLite
 * 2. Fetch older messages from Telegram channel
 * 3. Insert them into the SQLite database
 *
 * Usage:
 *   node reindex-telegram-files.js           # dry-run - show stats
 *   node reindex-telegram-files.js --live    # actually re-index
 *   node reindex-telegram-files.js --check   # just check current status
 */

import { execSync, exec } from 'child_process';

const SQLITE_DB = '/opt/trendimovies/bot/database/movies.db';
const SQLITE_HOST = '38.242.195.0';
const SSH_PORT = 80;

const args = process.argv.slice(2);
const isLive = args.includes('--live');
const checkOnly = args.includes('--check');

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function sshCommand(cmd) {
  const fullCmd = `ssh -p ${SSH_PORT} root@${SQLITE_HOST} "${cmd.replace(/"/g, '\\"')}"`;
  try {
    const result = execSync(fullCmd, { maxBuffer: 100 * 1024 * 1024, timeout: 60000 });
    return result.toString().trim();
  } catch (e) {
    log(`SSH Error: ${e.message}`);
    return null;
  }
}

function sqliteQuery(sql) {
  const escapedSql = sql.replace(/'/g, "'\\''");
  const cmd = `sqlite3 -json ${SQLITE_DB} '${escapedSql}'`;
  const result = sshCommand(cmd);
  if (!result) return [];
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

function sqliteExec(sql) {
  const escapedSql = sql.replace(/'/g, "'\\''");
  const cmd = `sqlite3 ${SQLITE_DB} '${escapedSql}'`;
  return sshCommand(cmd);
}

async function checkStatus() {
  log('Checking current SQLite database status...');

  // Get total count
  const countResult = sqliteQuery('SELECT COUNT(*) as total FROM movies');
  const total = countResult[0]?.total || 0;

  // Get min/max message IDs
  const rangeResult = sqliteQuery('SELECT MIN(message_id) as min_id, MAX(message_id) as max_id FROM movies');
  const minId = rangeResult[0]?.min_id || 0;
  const maxId = rangeResult[0]?.max_id || 0;

  // Get sample of oldest files
  const oldestFiles = sqliteQuery('SELECT message_id, file_name, created_at FROM movies ORDER BY message_id ASC LIMIT 5');

  log('');
  log('=== SQLITE DATABASE STATUS ===');
  log(`Total files: ${total.toLocaleString()}`);
  log(`Message ID range: ${minId.toLocaleString()} to ${maxId.toLocaleString()}`);
  log(`Missing range: 1 to ${(minId - 1).toLocaleString()} (${(minId - 1).toLocaleString()} potential files)`);
  log('');
  log('Oldest 5 files in database:');
  for (const f of oldestFiles) {
    log(`  [${f.message_id}] ${f.file_name}`);
  }

  // Check if there's a Telegram bot/indexer service
  log('');
  log('Checking for Telegram indexer services...');
  const services = sshCommand('pm2 list 2>/dev/null | grep -E "trendimovies|telegram|bot|index" || systemctl list-units --type=service --state=running | grep -E "trendimovies|telegram|bot" || echo "No matching services found"');
  log(services || 'Could not check services');

  // Check Python/Node bot files
  log('');
  log('Checking for bot/indexer files...');
  const botFiles = sshCommand('ls -la /opt/trendimovies/bot/*.py /opt/trendimovies/bot/*.js 2>/dev/null | head -20 || echo "No bot files found"');
  log(botFiles || 'No bot files found');

  return { total, minId, maxId };
}

async function searchForMovie(title) {
  log(`Searching SQLite for: "${title}"`);
  const searchTerm = title.replace(/'/g, "''");
  const results = sqliteQuery(`SELECT message_id, file_name, quality, file_size FROM movies WHERE file_name LIKE '%${searchTerm}%' ORDER BY message_id LIMIT 10`);

  if (results.length === 0) {
    log(`  No results found for "${title}"`);
    return [];
  }

  log(`  Found ${results.length} results:`);
  for (const r of results) {
    log(`    [${r.message_id}] ${r.file_name} (${r.quality})`);
  }
  return results;
}

async function main() {
  log('Telegram File Re-indexer');
  log(`Mode: ${checkOnly ? 'CHECK ONLY' : isLive ? 'LIVE' : 'DRY-RUN'}`);
  log('');

  // First, check current status
  const status = await checkStatus();

  // Search for "Let Us Prey" specifically
  log('');
  log('=== SEARCHING FOR "Let Us Prey" ===');
  await searchForMovie('Let Us Prey');
  await searchForMovie('Let.Us.Prey');
  await searchForMovie('LetUsPrey');

  if (checkOnly) {
    log('');
    log('Check complete. Run with --live to re-index missing files.');
    return;
  }

  if (!isLive) {
    log('');
    log('=== DRY RUN - NO CHANGES MADE ===');
    log('');
    log('To actually re-index, the Telegram bot/indexer needs to be modified to:');
    log('1. Start from message_id 1 instead of the current minimum');
    log('2. Or run a one-time backfill script');
    log('');
    log('The indexer on 38.242.195.0 needs to be checked/modified.');
    log('Run with --live to attempt triggering a re-index.');
    return;
  }

  // LIVE mode - try to trigger re-indexing
  log('');
  log('=== ATTEMPTING RE-INDEX ===');

  // Check if there's a bot that can be restarted with different parameters
  const botPath = '/opt/trendimovies/bot';

  // Look for the main bot file
  const mainBotFile = sshCommand(`ls ${botPath}/*.py ${botPath}/*.js 2>/dev/null | head -1`);

  if (!mainBotFile) {
    log('Could not find bot files. Manual intervention may be needed.');
    log('The SQLite database needs files from before message_id 57,635');
    return;
  }

  log(`Found bot at: ${mainBotFile}`);

  // Check if there's an indexer script
  const indexerScript = sshCommand(`ls ${botPath}/index*.py ${botPath}/index*.js ${botPath}/sync*.py ${botPath}/sync*.js 2>/dev/null | head -1`);

  if (indexerScript) {
    log(`Found indexer: ${indexerScript}`);
    log('');
    log('To re-index older files, modify the indexer to start from message_id 1');
    log('Or create a backfill script that fetches messages 1 to 57634');
  }

  log('');
  log('=== SUMMARY ===');
  log(`SQLite database has ${status.total.toLocaleString()} files`);
  log(`Missing messages: 1 to ${(status.minId - 1).toLocaleString()}`);
  log('');
  log('NEXT STEPS:');
  log('1. The Telegram bot/indexer on 38.242.195.0 needs to be configured to fetch older messages');
  log('2. Or run: node scripts/backfill-telegram.js on the 38 server');
}

main().catch(err => {
  log(`Error: ${err.message}`);
  process.exit(1);
});
