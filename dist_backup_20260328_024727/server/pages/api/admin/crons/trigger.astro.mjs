import { spawn } from 'child_process';
import { r as requireAuth } from '../../../../chunks/admin-auth_BKc-wy8e.mjs';
export { r as renderers } from '../../../../chunks/_@astro-renderers_DbfXOWuU.mjs';

const SCRIPTS_DIR = "/var/www/trendimovies/scripts";
const ALLOWED_SCRIPTS = {
  "sync-series": {
    command: "node",
    args: ["sync-series-from-telegram.js", "--live"],
    name: "Series Sync"
  },
  "migrate-episode": {
    command: "python3",
    args: ["migrate-episode-ddl.py", "--live"],
    name: "Episode DDL Migration"
  }
};
const runningScripts = /* @__PURE__ */ new Map();
const POST = async ({ request }) => {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { script } = await request.json();
    if (!script || !ALLOWED_SCRIPTS[script]) {
      return new Response(JSON.stringify({
        error: "Invalid script",
        availableScripts: Object.keys(ALLOWED_SCRIPTS)
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const lastRun = runningScripts.get(script);
    if (lastRun && Date.now() - lastRun < 3e4) {
      return new Response(JSON.stringify({
        error: "Script already triggered recently. Wait 30 seconds."
      }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { command, args, name } = ALLOWED_SCRIPTS[script];
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      cwd: SCRIPTS_DIR
    });
    child.unref();
    runningScripts.set(script, Date.now());
    return new Response(JSON.stringify({
      success: true,
      message: `Started ${name}`,
      pid: child.pid,
      script,
      command: `${command} ${args.join(" ")}`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to trigger script"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
