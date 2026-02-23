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
    max_memory_restart: '500M'
  }]
};
