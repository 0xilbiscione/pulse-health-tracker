// PM2 process definitions for the Pulse health tracker + its Cloudflare tunnel.
//   pm2 start ecosystem.config.cjs
// The tunnel token is read from ~/.cloudflared/fit-token (chmod 600) and passed
// to cloudflared via the TUNNEL_TOKEN env var so it never appears in process args.
const fs = require("fs");
const os = require("os");
const path = require("path");

const TUNNEL_TOKEN = fs
  .readFileSync(path.join(os.homedir(), ".cloudflared", "fit-token"), "utf8")
  .trim();

const PROJECT = "/home/homepc/sample";

module.exports = {
  apps: [
    {
      name: "pulse-web",
      cwd: PROJECT,
      script: path.join(PROJECT, "node_modules/next/dist/bin/next"),
      args: "start",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        // Dedicated host port to stay clear of the Docker `platform` stack.
        // The Cloudflare tunnel public hostname must point to http://localhost:3010.
        PORT: "3010",
      },
      autorestart: true,
      max_restarts: 10,
      time: true,
    },
    {
      name: "pulse-tunnel",
      script: path.join(os.homedir(), ".local/bin/cloudflared"),
      args: "tunnel --no-autoupdate run",
      interpreter: "none",
      env: {
        TUNNEL_TOKEN,
      },
      autorestart: true,
      max_restarts: 20,
      restart_delay: 3000,
      time: true,
    },
  ],
};
