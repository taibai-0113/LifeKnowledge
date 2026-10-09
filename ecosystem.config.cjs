// PM2 process definition for the LifeKnowledge Next.js server.
//
// Two deliberate choices:
//  - exec_mode "fork" with a single instance. The knowledge layer keeps its
//    data in process memory, so running several workers would give each one
//    its own copy and the site would disagree with itself.
//  - The Node server binds 127.0.0.1 only. Nginx is the public entry point,
//    so port 3000 never has to be reachable from the internet.
//
// Start with:  pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "life-knowledge",
      cwd: "/var/www/life-knowledge",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      kill_timeout: 20000,
      listen_timeout: 10000,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      out_file: "/var/log/life-knowledge/out.log",
      error_file: "/var/log/life-knowledge/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
