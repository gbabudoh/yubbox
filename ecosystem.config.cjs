// PM2 process config — run with: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'yubbox',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './',
      instances: 'max',       // one worker per CPU core
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart automatically if it crashes
      autorestart: true,
      watch: false,
      // Log rotation handled by pm2-logrotate module
      error_file: './logs/pm2-error.log',
      out_file:   './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
