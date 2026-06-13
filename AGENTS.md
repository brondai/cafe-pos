# Cafe POS Agent Guide

This file is the standing project guide for Codex and other coding agents working on this repository.

## Project Summary

Cafe POS is a point-of-sale app for cafe operations.

Current stack:

- Frontend: Vite, React, TypeScript
- UI: Radix/shadcn-style components, Tailwind CSS
- Backend: Express as a thin listener
- API: tRPC
- Validation: Zod
- Database: PostgreSQL
- ORM: Prisma 7
- Local database: PostgreSQL on `localhost:5432`, database `cafe_pos`
- Planning/docs: Notion
- Execution tracking: GitHub Issues

## Current Architecture

Frontend lives under `src/`.

Backend lives under `server/`:

- `server/src/app.ts`: Express app setup
- `server/src/index.ts`: server entry point
- `server/src/env.ts`: environment validation
- `server/src/trpc`: tRPC setup, context, root router
- `server/src/modules`: business modules
- `server/src/db`: Prisma client
- `server/src/auth`: auth context helpers
- `server/prisma/schema.prisma`: Prisma schema
- `server/prisma/migrations`: database migrations

Express should stay thin. Put business logic in modules and expose it through tRPC routers.

## Product Workflow

Use this workflow:

1. Product planning and docs live in Notion.
2. Engineering tasks live in GitHub Issues.
3. Track task status, priority, phase, and area in the Cafe POS Tasks database.
4. Implementation should follow one clear GitHub Issue at a time.
5. Durable technical decisions and product/architecture docs should be recorded in Notion.
6. Use `AGENTS.md` for standing agent rules and repo workflow changes; update it when those instructions change.
7. Do not create a local `docs/` folder for durable project documentation unless the user explicitly asks for repo-local docs.
8. Do not maintain the archived Notion Backlog page; use GitHub Issues and the Cafe POS Tasks database instead.
9. Completed milestones should update Notion Completed Work, Notion task status, and GitHub issue status.

Current Notion hub:

- Cafe POS: https://app.notion.com/p/37ee4d28e88581db9a2dd900e4148fca
- Cafe POS Tasks: https://app.notion.com/p/5c9c4daeae544ced87fa26cbe4e0c091

Current GitHub repo:

- https://github.com/brondai/cafe-pos

## Current Work Queue

Completed:

- GitHub issue #1: Phase 0 backend foundation
- GitHub issue #2: Design the core POS data model

Next:

- #3 Add menu database models and seed data
- #4 Add order and payment database models
- #5 Add tRPC menu router
- #6 Add tRPC order router
- #7 Replace menu mock data with tRPC data
- #8 Persist active orders
- #9 Complete payment from frontend

Before implementing issue #3, inspect the Notion task page for issue #2's core POS data model,
the physical menu references in `reference/menu/`, and the existing frontend types/data.

## Commands

Common commands:

```bash
npm run dev
npm run dev:server
npm run build
npm run lint
npm run typecheck:server
npm run db:generate
npm run db:migrate
npm run db:studio
```

Local development uses:

```bash
prisma migrate dev
```

Production later should use:

```bash
prisma migrate deploy
```

## Database Rules

- Use Prisma migrations for schema changes.
- Do not edit generated Prisma client files.
- Do not reset, drop, truncate, or rewrite local/production data without explicit user approval.
- For new schema work, document the model intent before editing `schema.prisma`.
- Keep migration names clear and short.
- Run `npm run db:generate` after Prisma schema changes.
- Run `npm run typecheck:server` after backend changes.

## Backend Rules

- Keep Express limited to transport concerns: CORS, health route, tRPC middleware, server listen.
- Put business logic in `server/src/modules/<module>`.
- Use Zod for procedure inputs and outputs.
- Export module routers and compose them in `server/src/trpc/router.ts`.
- Use tRPC context for shared dependencies like auth and Prisma.
- Keep auth placeholder logic clearly separated until real auth is implemented.

## Frontend Rules

- Preserve the existing POS workflows while moving data to backend gradually.
- Use the existing UI/component patterns before introducing new abstractions.
- Use the existing `TRPCProvider` and `trpc` client for backend calls.
- Handle loading, empty, and error states when replacing local data with remote data.
- Avoid broad UI redesigns unless the issue explicitly calls for it.

## Verification Expectations

For backend/schema work, prefer:

```bash
npm run db:generate
npm run typecheck:server
npm run build
```

Run `npm run lint` when relevant, but note that existing UI lint issues may already be present in `src/components/ui/*`.

For local API verification:

```bash
curl -s http://localhost:4000/health
curl -s http://localhost:4000/trpc/health.check
```

## Git And Safety

- Do not revert user changes unless explicitly asked.
- Do not use destructive git commands without explicit approval.
- Keep edits scoped to the active issue.
- Prefer small, reviewable changes.
- If creating branches, use the `codex/` prefix unless the user asks otherwise.

## Production Notes

Production database should likely be managed PostgreSQL, not a local database on the app server.

Production backup plan should include:

- managed automatic backups
- 7-30 day retention where possible
- manual monthly export once real sales data exists
- backup before major migrations
- occasional restore tests

Do not introduce production infrastructure until the core POS data model and database-backed workflows are stable enough to justify staging/production setup.
