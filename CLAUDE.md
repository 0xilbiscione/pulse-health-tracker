# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FitBase** (package name `health-tracker`, PM2 name `pulse-web`) — a multi-user health tracker in the MetricBase ecosystem. Next.js 15 (App Router) + TypeScript, Prisma + **SQLite**, Auth.js v5 (credentials), Tailwind v4, Recharts. Live at https://fit.metricbase.org. Package manager: **npm**.

## Commands

```bash
npm run dev                  # dev server on :3000
npm run build                # prisma generate + next build
npm run start                # run the production build
npm run lint                 # next lint
npm run seed                 # RESET + seed demo user with 30 days of data (tsx prisma/seed.ts)
npm run db:migrate           # prisma migrate dev (creates prisma/dev.db)
npm run db:reset             # prisma migrate reset --force (drops & recreates the DB)
npx prisma studio            # browse the SQLite DB
```

There is **no test suite** (no framework installed). Validate changes with `npm run build` (which type-checks) or `npx tsc --noEmit`. `prisma generate` runs automatically on `postinstall` and inside `build`.

Demo login after seeding: `demo@health.app` / `demo1234`.

## Architecture

### Data model (`prisma/schema.prisma`)

Three models: `User`, `HealthEntry`, `Goal`. The core constraint is **`@@unique([userId, date])` on `HealthEntry` — one entry per user per day.** All writes are upserts against that key. `Goal` is `@@unique([userId, metric])`.

### Logical-day convention (`lib/dates.ts`) — important

Entries are keyed by a "logical day" normalized to **UTC midnight** so the unique constraint behaves predictably across timezones. Always go through the helpers: `toStorageDate(isoDate)` (YYYY-MM-DD → UTC-midnight `Date` for storage), `storageDateToIso(date)` (back to YYYY-MM-DD), `todayIso()`. Never construct entry dates with raw `new Date()`.

### Additive vs replace fields (`lib/metrics.ts` + `lib/entryMerge.ts`) — important

Saving the daily form multiple times in one day **merges** rather than overwrites, via `mergeEntryData(existing, submitted)`:
- Fields in `ADDITIVE_ENTRY_FIELDS` (steps, distance, active/workout minutes, calories, macros, water) are **added** to the day's running total; a null/empty submission leaves the existing total untouched.
- All other fields (weight, blood pressure, sleep, mood/energy/stress ratings) are **last-write replace** — summing would be meaningless.

The "Set total" toggle in the form lets the user edit a running total directly instead of adding. `mergeEntryData` is pure and the natural place for unit tests if any are added.

### Metric registry (`lib/metrics.ts`)

`METRICS` is the single source of truth tying each goal metric to its entry field, label, unit, color, default target, and `direction` (`atLeast` for steps/water/sleep; `atMost` for calories/weight). The dashboard, goals page, and insights all read from here — add or change a tracked metric **here first**, then the UI stays in sync.

### Auth split (Auth.js v5)

- `lib/auth.config.ts` — **edge-safe** config (no Prisma, no bcrypt), `providers: []`, JWT strategy, injects `user.id` into the token/session. Consumed by `src/middleware.ts`.
- `lib/auth.ts` — full server config that spreads `authConfig` and adds the Credentials provider (bcrypt password check against `User.passwordHash`).
- `src/middleware.ts` gates `/dashboard`, `/log`, `/goals`, `/insights` (redirects to `/login?callbackUrl=`) and bounces signed-in users away from `/login`/`/signup`. Keep the `PROTECTED` list and the `config.matcher` in sync.
- Server code gets the user via `requireUserId()` (`lib/session.ts`), which throws if unauthenticated — callers assume they run inside protected routes.

### Mutations = Server Actions

Writes live in `src/app/actions/*` (`entries.ts`, `goals.ts`, `auth.ts`) as `"use server"` functions, validated with Zod (`lib/validators.ts`) and calling `revalidatePath` after mutating. There is no REST API beyond the NextAuth handler at `app/api/auth/[...nextauth]/route.ts`. Route groups: `(auth)` for login/signup, `(app)` for the authenticated shell.

### Computed views

`lib/insights.ts` and `lib/metrics.ts` derive dashboard cards, week-over-week deltas, goal progress, streaks, and weekly insight bullets from raw entries — these are computed on read, not stored.

## Deployment

Production runs under **PM2** via `ecosystem.config.cjs` (`pm2 start ecosystem.config.cjs`), exposing two processes:
- `pulse-web` — `next start` on **PORT 3010** (deliberately clear of the Docker `platform` stack).
- `pulse-tunnel` — `cloudflared` reading its token from `~/.cloudflared/fit-token`; the public hostname must point to `http://localhost:3010`.

`/userguidelines` is rewritten to the static `/userguidelines.html` (see `next.config.ts`).

## Environment (`.env`, see `.env.example`)

- `DATABASE_URL` — `file:./dev.db` (SQLite).
- `AUTH_SECRET` — `openssl rand -hex 32`.
- `AUTH_URL` — public canonical HTTPS origin (needed behind the tunnel for correct secure cookies); omit for plain local dev.
