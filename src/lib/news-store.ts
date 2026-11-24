// Admin-side access to the news desk. Uses a direct database connection (the public API role can NOT read news_items).
import pg from 'pg';
import { readFileSync, writeFileSync, existsSync, openSync } from 'fs';
import { spawn } from 'child_process';

const MODE_FILE = '/var/lib/trendimovies/news_mode.json';
export const CATEGORY_KEYS = ['casting', 'trailers', 'release-dates', 'box-office', 'streaming', 'awards', 'behind-the-scenes', 'new-projects'];

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (pool) return pool;
  const conf = readFileSync('/etc/postgrest.conf', 'utf-8');
  const m = conf.match(/^\s*db-uri\s*=\s*"?postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(\w+)"?/m);
  if (!m) throw new Error('no database settings');
  pool = new pg.Pool({ user: m[1], password: decodeURIComponent(m[2]), host: m[3], port: Number(m[4]), database: m[5], max: 3 });
  return pool;
}

export type Mode = { auto_publish: boolean; max_per_run: number; feed_per_day: number };

export function readMode(): Mode {
  const d: Mode = { auto_publish: false, max_per_run: 6, feed_per_day: 4 };
  try { if (existsSync(MODE_FILE)) Object.assign(d, JSON.parse(readFileSync(MODE_FILE, 'utf-8'))); } catch { /* defaults */ }
  return d;
}

export function writeMode(patch: Partial<Mode>): Mode {
  const next = { ...readMode(), ...patch };
  next.auto_publish = !!next.auto_publish;
  writeFileSync(MODE_FILE, JSON.stringify(next, null, 2) + '\n');
  return next;
}

export async function counts() {
  const r = await getPool().query("SELECT status, count(*)::int AS n FROM news_items GROUP BY status");
  const out: Record<string, number> = { draft: 0, published: 0, rejected: 0, skipped: 0 };
  for (const row of r.rows) out[row.status] = row.n;
  return out;
}

export async function list(status: string, limit = 60) {
  const st = ['draft', 'published', 'rejected', 'skipped'].includes(status) ? status : 'draft';
  const order = st === 'published' ? 'published_at DESC NULLS LAST' : 'created_at DESC';
  const r = await getPool().query(
    `SELECT id, slug, title, summary, body, points, category, cover_image, poster_image, related_tmdb_id, related_type, film_title,
            source_name, source_url, origin, origin_text, confidence, status, skip_reason, created_at, published_at
     FROM news_items WHERE status = $1 ORDER BY ${order} LIMIT $2`, [st, limit]);
  return r.rows;
}

function isTakenDownId(id: number): boolean {
  try {
    const list = JSON.parse(readFileSync('/var/lib/trendimovies/takedowns.json', 'utf-8'));
    return Array.isArray(list) && list.some((x: any) => Number(x?.tmdb_id) === id);
  } catch { return false; }
}

const clip = (v: any, n: number) => String(v ?? '').trim().slice(0, n);
const okUrl = (u: string) => !u || /^https?:\/\/[^\s]+$/i.test(u);

export async function update(id: number, p: any) {
  const sets: string[] = []; const vals: any[] = [];
  const add = (col: string, v: any) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
  if (p.title !== undefined) { const t = clip(p.title, 140); if (!t) return { ok: false, error: 'Headline cannot be empty' }; add('title', t); }
  if (p.summary !== undefined) add('summary', clip(p.summary, 300));
  if (p.body !== undefined) { const b = String(p.body).trim().slice(0, 6000); if (b.length < 40) return { ok: false, error: 'Story text is too short' }; add('body', b); }
  if (p.points !== undefined) add('points', (Array.isArray(p.points) ? p.points : []).map((x: any) => clip(x, 160)).filter(Boolean).slice(0, 5));
  if (p.category !== undefined) { if (!CATEGORY_KEYS.includes(p.category)) return { ok: false, error: 'Unknown topic' }; add('category', p.category); }
  if (p.source_name !== undefined) add('source_name', clip(p.source_name, 80) || null);
  if (p.source_url !== undefined) {
    const u = clip(p.source_url, 600);
    if (!okUrl(u)) return { ok: false, error: 'Source link must start with http:// or https://' };
    add('source_url', u || null);
    if (u) add('confidence', 'high');
  }
  if (p.cover_image !== undefined) {
    const c = clip(p.cover_image, 600);
    if (c && !/^https:\/\/image\.tmdb\.org\/t\/p\//.test(c)) return { ok: false, error: 'Pictures must come from TMDB (https://image.tmdb.org/...)' };
    add('cover_image', c || null);
  }
  if (p.related_tmdb_id !== undefined) {
    let fid: number | null = p.related_tmdb_id === null || p.related_tmdb_id === '' ? null : Number(p.related_tmdb_id);
    if (fid !== null && (!Number.isInteger(fid) || fid <= 0)) return { ok: false, error: 'Bad film number' };
    let ftype: string | null = fid ? (p.related_type === 'tv' ? 'tv' : 'movie') : null;
    if (fid && isTakenDownId(fid)) { fid = null; ftype = null; }     // never link a story to a film on the takedown list
    add('related_tmdb_id', fid); add('related_type', ftype);
    add('film_title', fid ? clip(p.film_title, 160) || null : null);
    const ps = clip(p.poster_image, 600);
    if (ps && !/^https:\/\/image\.tmdb\.org\/t\/p\//.test(ps)) return { ok: false, error: 'Pictures must come from TMDB' };
    add('poster_image', fid ? ps || null : null);
  }
  if (!sets.length) return { ok: true };
  add('updated_at', new Date());
  vals.push(id);
  await getPool().query(`UPDATE news_items SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
  return { ok: true };
}

/** Old stories caught up from a channel are saved as drafts WITH their original date. This publishes the ones that have a real source, keeping that date. */
export async function publishDatedDrafts() {
  const r = await getPool().query("UPDATE news_items SET status='published', updated_at = now() WHERE status='draft' AND published_at IS NOT NULL AND source_url IS NOT NULL");
  return { ok: true, n: r.rowCount };
}

// ---------------------------------------------------------------- posts pasted by the editor
export async function addLead(text: string, link: string, postedOn: string) {
  const t = String(text || '').trim();
  if (t.length < 20) return { ok: false, error: 'Paste the whole post first (at least a sentence).' };
  if (t.length > 4000) return { ok: false, error: 'That is too long. Paste one post at a time.' };
  const l = String(link || '').trim();
  if (l && !/^https?:\/\/[^\s]+$/i.test(l)) return { ok: false, error: 'The link must start with http:// or https://' };
  let d: string | null = String(postedOn || '').trim() || null;
  if (d) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) return { ok: false, error: 'That date is not valid' };
    if (Date.parse(d) > Date.now() + 86400000) return { ok: false, error: 'The date cannot be in the future' };
  }
  const pend = await getPool().query("SELECT count(*)::int AS n FROM news_leads WHERE status IN ('new','working')");
  if (pend.rows[0].n >= 10) return { ok: false, error: 'There are already 10 waiting. Give it a few minutes.' };
  await getPool().query('INSERT INTO news_leads (text, link, posted_on) VALUES ($1, $2, $3)', [t, l || null, d]);
  // start the desk now (it keeps its own lock, so it can never run twice at once); the 2-hourly run also picks leads up
  try {
    const out = openSync('/var/log/trendimovies/news_collector.log', 'a');
    const child = spawn('/usr/bin/python3', ['-u', 'news_collector.py', '--leads'], { cwd: '/opt/trendimovies-news', detached: true, stdio: ['ignore', out, out] });
    child.unref();
  } catch { /* the scheduled run will still handle it */ }
  return { ok: true };
}

export async function recentLeads() {
  const r = await getPool().query("SELECT id, left(text, 90) AS text, status, note, item_id, created_at FROM news_leads ORDER BY id DESC LIMIT 6");
  return r.rows;
}

// ---------------------------------------------------------------- sources (channels the desk watches)
const SOURCES_FILE = '/var/lib/trendimovies/news_sources.json';
const STATUS_FILE = '/var/lib/trendimovies/news_sources_status.json';
type Channel = { handle: string; label: string; active: boolean };

function loadSources(): { channels: Channel[] } {
  try { if (existsSync(SOURCES_FILE)) { const d = JSON.parse(readFileSync(SOURCES_FILE, 'utf-8')); if (Array.isArray(d.channels)) return d; } } catch { /* default */ }
  return { channels: [{ handle: 'MOVIES_ETY_G', label: 'Movies ETY', active: true }] };
}
function saveSources(d: { channels: Channel[] }) { writeFileSync(SOURCES_FILE, JSON.stringify(d, null, 2) + '\n'); }

export function readSources() {
  let status: any = {};
  try { if (existsSync(STATUS_FILE)) status = JSON.parse(readFileSync(STATUS_FILE, 'utf-8')); } catch { /* none yet */ }
  const channels = loadSources().channels.map((c) => ({ ...c, status: status['ch:' + c.handle] || null }));
  const feeds = Object.keys(status).filter((k) => k.startsWith('feed:')).map((k) => ({ name: k.slice(5), status: status[k] }));
  return { channels, feeds };
}

/** Accepts https://t.me/Name, t.me/s/Name, @Name or Name. Private invite links (t.me/+xxxx) cannot be read. */
function parseHandle(input: string): { handle?: string; error?: string } {
  let v = String(input || '').trim();
  if (!v) return { error: 'Paste the channel link first' };
  if (/t\.me\/\+|joinchat/i.test(v) || v.startsWith('+')) return { error: 'That is a private invite link. The desk can only read public channels (t.me/Name). Ask the channel owner for the public name.' };
  v = v.replace(/^https?:\/\//i, '').replace(/^t\.me\/(s\/)?/i, '').replace(/^@/, '').split(/[/?#]/)[0];
  if (!/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(v)) return { error: 'That does not look like a channel name' };
  return { handle: v };
}

async function previewWorks(handle: string): Promise<boolean> {
  try {
    const r = await fetch(`https://t.me/s/${handle}`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendiMoviesNewsBot/1.0)' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) return false;
    return (await r.text()).includes('tgme_widget_message_wrap');
  } catch { return false; }
}

export async function addChannel(link: string, label: string) {
  const p = parseHandle(link); if (!p.handle) return { ok: false, error: p.error };
  if (!(await previewWorks(p.handle))) return { ok: false, error: 'Could not read posts from that channel. It may be private, or the name is wrong.' };
  const d = loadSources();
  if (d.channels.some((c) => c.handle.toLowerCase() === p.handle!.toLowerCase())) return { ok: false, error: 'That channel is already in the list' };
  d.channels.push({ handle: p.handle, label: clip(label, 60) || p.handle, active: true });
  saveSources(d);
  return { ok: true };
}

export async function replaceChannel(oldHandle: string, link: string) {
  const p = parseHandle(link); if (!p.handle) return { ok: false, error: p.error };
  if (!(await previewWorks(p.handle))) return { ok: false, error: 'Could not read posts from that new link. It may be private, or the name is wrong. Nothing was changed.' };
  const d = loadSources();
  const c = d.channels.find((x) => x.handle === oldHandle);
  if (!c) return { ok: false, error: 'Channel not found' };
  c.handle = p.handle; c.active = true;
  saveSources(d);
  return { ok: true };
}

export function toggleChannel(handle: string, active: boolean) {
  const d = loadSources();
  const c = d.channels.find((x) => x.handle === handle);
  if (!c) return { ok: false, error: 'Channel not found' };
  c.active = !!active;
  saveSources(d);
  return { ok: true };
}

export async function setStatus(id: number, status: 'draft' | 'published' | 'rejected') {
  if (status === 'published') {
    const r = await getPool().query("UPDATE news_items SET status='published', published_at = COALESCE(published_at, now()), updated_at = now() WHERE id=$1 RETURNING slug", [id]);
    return { ok: r.rowCount === 1, slug: r.rows[0]?.slug };
  }
  const r = await getPool().query("UPDATE news_items SET status=$2, updated_at = now() WHERE id=$1", [id, status]);
  return { ok: r.rowCount === 1 };
}
