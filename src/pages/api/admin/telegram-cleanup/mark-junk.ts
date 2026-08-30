import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/admin-auth';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Reversible: flips is_deleted on the MASTER catalog (server 38.242.195.0),
// not the local read-only synced copy this app reads for browsing/search.
// Runs over the same passwordless root SSH trust sync_sqlite.sh already
// uses between these two boxes -- no new network surface, no new secret.
// Only ever called with strictly-validated positive integer ids, so the
// SQL fragment built from them can't be used for injection.
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const rawIds = Array.isArray(body?.ids) ? body.ids : [];
    const unmark = body?.unmark === true;

    const ids = rawIds
      .map((x: any) => parseInt(x, 10))
      .filter((n: number) => Number.isInteger(n) && n > 0);

    if (!ids.length) {
      return new Response(JSON.stringify({ error: 'ids array required' }), { status: 400 });
    }
    if (ids.length > 500) {
      return new Response(JSON.stringify({ error: 'Max 500 ids per request' }), { status: 400 });
    }

    const idList = ids.join(',');
    const value = unmark ? 0 : 1;
    const sql = `UPDATE movies SET is_deleted=${value} WHERE id IN (${idList});`;

    await execFileAsync('ssh', [
      'root@38.242.195.0',
      `sqlite3 /opt/trendimovies/bot/database/movies.db "${sql}"`,
    ], { timeout: 15000 });

    return new Response(JSON.stringify({ ok: true, count: ids.length, unmarked: unmark }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
