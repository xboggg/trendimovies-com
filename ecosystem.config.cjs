module.exports = {
  apps: [{
    name: 'trendimovies-astro',
    script: './dist/server/entry.mjs',
    cwd: '/var/www/trendimovies',
    env: {
      PORT: 4000,
      NODE_ENV: 'production'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    kill_timeout: 5000,
    wait_ready: false,
    max_restarts: 50,
    min_uptime: 5000,
    restart_delay: 3000
  }]
};
