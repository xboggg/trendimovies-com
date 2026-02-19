import type { APIRoute } from 'astro';
import { spawn } from 'child_process';

const SCRIPTS_DIR = '/var/www/trendimovies/scripts';

const ALLOWED_SCRIPTS: Record<string, { command: string; args: string[]; name: string }> = {
  'sync-series': {
    command: 'node',
    args: ['sync-series-from-telegram.js', '--live'],
    name: 'Series Sync'
  },
  'migrate-episode': {
    command: 'python3',
    args: ['migrate-episode-ddl.py', '--live'],
    name: 'Episode DDL Migration'
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { script } = await request.json();

    if (!script || !ALLOWED_SCRIPTS[script]) {
      return new Response(JSON.stringify({
        error: 'Invalid script',
        availableScripts: Object.keys(ALLOWED_SCRIPTS)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { command, args, name } = ALLOWED_SCRIPTS[script];

    // Spawn detached process
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
      cwd: SCRIPTS_DIR
    });

    child.unref();

    return new Response(JSON.stringify({
      success: true,
      message: `Started ${name}`,
      pid: child.pid,
      script,
      command: `${command} ${args.join(' ')}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message || 'Failed to trigger script'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
