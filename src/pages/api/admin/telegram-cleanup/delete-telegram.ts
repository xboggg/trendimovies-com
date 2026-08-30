import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/admin-auth';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// IRREVERSIBLE: actually removes the message/file from the Telegram
// channel via delete_telegram_junk.py on server 38 (the only box with the
// bot token + delete permission in that channel). Runs over the same
// passwordless root SSH trust used elsewhere; only ever invoked with
// strictly-validated positive integer ids.
export const POST: APIRoute = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const rawIds = Array.isArray(body?.ids) ? body.ids : [];
    const ids = rawIds
      .map((x: any) => parseInt(x, 10))
      .filter((n: number) => Number.isInteger(n) && n > 0);

    if (!ids.length) {
      return new Response(JSON.stringify({ error: 'ids array required' }), { status: 400 });
    }
    if (ids.length > 200) {
      return new Response(JSON.stringify({ error: 'Max 200 ids per request (Telegram rate limits)' }), { status: 400 });
    }

    const idArg = ids.join(',');
    const { stdout } = await execFileAsync('ssh', [
      'root@38.242.195.0',
      `cd /opt/trendimovies/bot && source /etc/trendimovies/env 2>/dev/null; python3 delete_telegram_junk.py --run --ids "${idArg}"`,
    ], { timeout: 60000 });

    const deletedMatch = stdout.match(/(\d+) deleted, (\d+) failed/);
    const deleted = deletedMatch ? parseInt(deletedMatch[1], 10) : null;
    const failed = deletedMatch ? parseInt(deletedMatch[2], 10) : null;

    return new Response(JSON.stringify({ ok: true, deleted, failed, log: stdout.slice(-2000) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Failed', log: e.stdout?.slice(-2000) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
