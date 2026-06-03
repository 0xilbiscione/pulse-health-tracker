# Pulse — Health Tracker

A multi-user health tracking web app with a dashboard. Track **activity, body
measurements, nutrition & water, and sleep & mood**; set goals; and see your
trends, streaks, and weekly insights.

Built with **Next.js 15 (App Router) + TypeScript**, **Prisma + SQLite**,
**Auth.js (credentials)**, **Tailwind CSS v4**, and **Recharts**.

> **Live:** https://fit.metricbase.org — served via a Cloudflare Tunnel, managed
> by pm2 (see [Deployment](#deployment)). Public user guide:
> https://fit.metricbase.org/userguidelines

## Features

- 🔐 **Multi-user auth** — email/password sign-up & login; each user's data is private
- 📝 **Fast daily logging** — one tabbed form (Activity / Body / Nutrition / Sleep & Mood); one entry per day (edit in place)
- 📊 **Dashboard** — today's stat cards with week-over-week deltas, goal progress rings, trend charts, and a logging streak
- 🎯 **Goals** — toggle goals on/off and set daily targets (steps, water, sleep, active minutes, calories, weight)
- 🔥 **Streaks** — logging streak + per-goal streaks
- ✨ **Insights** — weekly averages vs the prior week, trend arrows, and auto-generated insight bullets
- 📖 **Printable user guide** — self-contained help page at `/userguidelines`

## Quick start (local dev)

```bash
npm install
npx prisma migrate dev      # creates prisma/dev.db
npm run seed                # demo user + 30 days of sample data
npm run dev                 # http://localhost:3000
```

### Demo login

```
email:    demo@health.app
password: demo1234
```

Or click **Create one** on the login page to make a fresh account (starts empty
with a few sensible default goals).

## Scripts

| Script               | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server                          |
| `npm run build`      | Generate Prisma client + production build     |
| `npm run start`      | Run the production build                      |
| `npm run seed`       | Reset & seed the demo user with 30 days       |
| `npm run db:migrate` | Run Prisma migrations                         |
| `npm run db:reset`   | Drop & recreate the database                  |

## Environment

Config lives in `.env` (see `.env.example`):

| Var            | Purpose                                                            |
| -------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | SQLite file path (`file:./dev.db`)                                |
| `AUTH_SECRET`  | Auth.js signing secret — generate with `openssl rand -hex 32`     |
| `AUTH_URL`     | Public canonical URL (`https://fit.metricbase.org`) so Auth.js issues correct secure cookies behind the HTTPS tunnel |

## Routes

```
/                      → redirects to /dashboard or /login
/login, /signup        → auth (public)
/dashboard             → stat cards, goal rings, trend charts, streaks, insights
/log                   → tabbed daily entry form (date-pickable)
/goals                 → set/toggle daily targets
/insights              → weekly averages, totals, daily bar charts
/userguidelines        → printable HTML user guide (public; rewrite → /userguidelines.html)
```

`/dashboard`, `/log`, `/goals`, `/insights` are protected by `src/middleware.ts`.

## Project structure

```
prisma/
  schema.prisma          # User, HealthEntry (1/day), Goal
  seed.ts                # demo data
public/
  userguidelines.html    # self-contained printable user guide
next.config.ts           # rewrite: /userguidelines → /userguidelines.html
ecosystem.config.cjs     # pm2 process defs (app + cloudflare tunnel)
src/
  lib/
    auth.ts              # Auth.js (Credentials) — full server config
    auth.config.ts       # edge-safe config shared with middleware (trustHost)
    prisma.ts            # Prisma singleton
    metrics.ts           # central metric definitions (label/unit/color/goal direction)
    insights.ts          # pure helpers: averages, trends, streaks, goal progress, insight text
    validators.ts        # Zod schemas (entry, goal, signup, login)
  app/
    (auth)/login, signup
    (app)/dashboard, log, goals, insights   # protected by middleware
    actions/             # server actions: entries, goals, auth
  components/
    ui/                  # Card, Button, Field, StatCard, ProgressRing, Badge
    charts/              # TrendChart, MiniBarChart (Recharts)
    dashboard/, forms/, shell/
```

## Deployment

The production instance runs on the host under **pm2** and is exposed publicly
through a **Cloudflare Tunnel** — no inbound ports are opened on the machine.

**Topology**

```
Browser ──HTTPS──> Cloudflare ──tunnel──> cloudflared (pulse-tunnel)
                                              │
                                              └─> http://localhost:3010  (pulse-web, Next.js prod)
```

- **App port:** host **`3010`** (set in `ecosystem.config.cjs`). Pick any free
  port to avoid conflicts with other services on the host.
- **Tunnel:** the Cloudflare public hostname `fit.metricbase.org` must point to
  `http://localhost:3010` (configured in the Cloudflare Zero Trust dashboard).
  The connector token is read from `~/.cloudflared/fit-token` (chmod 600) and
  passed to `cloudflared` via the `TUNNEL_TOKEN` env var, so it never appears in
  process args.

**pm2 processes** (`pm2 status`)

| name           | runs                                   | listens / connects        |
| -------------- | -------------------------------------- | ------------------------- |
| `pulse-web`    | `next start`                           | host `:3010`              |
| `pulse-tunnel` | `cloudflared tunnel run` (TUNNEL_TOKEN) | outbound to Cloudflare    |

**First-time setup on a host**

```bash
npm install && npm run build
npx prisma migrate dev && npm run seed        # if no DB yet
printf '%s' '<CONNECTOR_TOKEN>' > ~/.cloudflared/fit-token && chmod 600 ~/.cloudflared/fit-token
pm2 start ecosystem.config.cjs
pm2 save
# enable boot persistence (needs sudo):
sudo env PATH=$PATH:$(dirname "$(which node)") pm2 startup systemd -u "$USER" --hp "$HOME"
```

**Redeploy after code changes**

```bash
npm run build
pm2 restart pulse-web
```

**pm2 cheat sheet**

```bash
pm2 status                 # overview
pm2 logs pulse-web         # app logs
pm2 logs pulse-tunnel      # tunnel logs
pm2 restart pulse-web      # restart app (after a rebuild)
pm2 resurrect              # restore saved process list
```

Boot persistence is handled by the systemd unit `pm2-homepc.service` (enabled),
which runs `pm2 resurrect` from `~/.pm2/dump.pm2` on startup.

## Notes

- The data model keeps **one `HealthEntry` per user per day** (upsert on
  `[userId, date]`), which makes logging simple and dashboard aggregation a single query.
- Auth config is **split**: `auth.config.ts` is edge-safe (no Prisma/bcrypt) and
  shared with middleware; `auth.ts` adds the Credentials provider for the server.
  `trustHost: true` + `AUTH_URL` make secure cookies work behind the tunnel.
- SQLite (`prisma/dev.db`) is the current store; the Prisma datasource can be
  pointed at Postgres later if you outgrow it.
