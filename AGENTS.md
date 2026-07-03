<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`decida` is a single Next.js 16 app (App Router, React 19, Prisma 7 over PostgreSQL, optional OpenAI). Scripts live in `package.json`; the assessment flow is under `src/app/analizar/*`.

Services and how to run them (the update script only runs `pnpm install`; start services yourself):

- PostgreSQL: needed for everything. The daemon `dockerd` runs as root here, so use `sudo docker compose up -d` to start it (the `pnpm db:up` script omits `sudo` and will fail unless you have docker socket permissions). Container `decida-postgres` exposes `localhost:5432` (user/pass/db all `decida`).
- Dev server: `pnpm dev` → http://localhost:3000 (Turbopack).
- Lint: `pnpm lint`. Note the repo currently has one pre-existing eslint error and warnings unrelated to setup.

Non-obvious gotchas:

- `.env` is required and gitignored. `prisma.config.ts` calls `env("DATABASE_URL")`, so the `postinstall` (`prisma generate`) — and thus `pnpm install` — fails if `.env` is missing. Keep a `.env` present (copy from `.env.example` and set `DATABASE_URL=postgresql://decida:decida@localhost:5432/decida?schema=public`).
- The committed migration in `prisma/migrations/` is OUT OF SYNC with `prisma/schema.prisma` (it is missing `asmt_name` and `asmt_phone` on `assessments`). Running `prisma migrate deploy` leaves the DB missing columns and the app crashes when submitting the contact step. Use `pnpm db:push` to sync the dev database to `schema.prisma`.
- `OPENAI_API_KEY` is optional: idea summary/refinement and the report have deterministic fallbacks, so the flow completes without it (AI content is degraded). The payment step is a simulated beta ("pago simulado") — no real payment integration.
