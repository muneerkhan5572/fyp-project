@AGENTS.md

# Project
Sales prediction / analytics platform (final year project) — **not a storefront**.
Store owners sign up, organize data into named datasets, upload or manually enter
products/sales/traffic, and get dashboards, trends, and rule-based slow-mover /
high-demand classification. AI-based forecasting is deferred; the current scope
is entirely non-AI CRUD, CSV import, and analytics.

# Stack
- TypeScript (strict — no `.js`/`.jsx` files)
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui (built on Base UI, not Radix — see Gotchas)
- Postgres + Drizzle ORM
- Zod (validation/schemas)
- TanStack Table, TanStack Form
- Recharts (via shadcn `chart`), papaparse (CSV import)

# Package Manager
pnpm only — do not use npm, yarn, or bun. Use `pnpm exec`/`pnpm dlx` instead of `npx`.

# Commands
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm biome:check` — lint + format (writes fixes)
- `pnpm ts:check` — TypeScript type check
- `pnpm db:push` — push schema changes to the database
- `pnpm db:seed` — seed a demo user/dataset with 12 months of sales/traffic (see README)

# Workflow Rules
- Never run `git commit` yourself. Always prepare/stage changes and give me a commit message to review — I commit manually.
- Do not touch files outside the scope of the current task.

# Architecture Rules
- Prefer Next.js Server Actions over API routes.
- Fall back to Next.js Route Handlers (API routes) only when Server Actions genuinely can't do the job (e.g. webhooks, external consumers, streaming).
- Strictly follow the existing folder structure — don't introduce new top-level patterns without asking.
- Use the latest stable versions/patterns for all tools in the stack — no legacy APIs.

# Authentication
- Auth is email/password with stateless JWT sessions (jose HS256) in an httpOnly/secure/SameSite=Lax cookie. Postgres + Drizzle, bcrypt hashing.
- Core lives in `lib/auth/` (`dal.ts`, `session.ts`, `jwt.ts`, `password.ts`, `tokens.ts`), server actions in `app/actions/auth.ts`, shared Zod schemas in `lib/validations/auth.ts`, route guard in root `proxy.ts`.
- Every new page and server action MUST integrate with this system:
  - Protected page → `await verifySession()` at the top of the Server Component, then `getCurrentUser()` for user data (never expose the password hash — use the DTO it returns). Also add the route prefix to `protectedRoutes` in `proxy.ts`.
  - Auth-only page (visible only when logged out) → add its prefix to `authRoutes` in `proxy.ts`.
  - Server action that reads/mutates user data → call `verifySession()` (and any role check) inside the action; treat it like a public endpoint.
  - The `proxy.ts` check is optimistic/defense-in-depth only — the authoritative check is always the DAL (`verifySession`/`getCurrentUser`) close to the data. Never rely on the proxy or client-side checks alone.
- New forms → TanStack Form + a shared Zod schema, reusing `components/form/text-field.tsx` and the `FieldError` primitive.

# Dataset Scoping
- All product/sales/traffic/import data belongs to a named **dataset**, scoped by URL: `/dashboard/[datasetId]/...`.
- `lib/datasets/dal.ts`: `requireDataset(datasetId)` — session + ownership check, calls `notFound()` on a miss. Used at the top of `app/dashboard/[datasetId]/layout.tsx` and every scoped page. `getOwnedDataset(datasetId, userId)` is the non-throwing variant for use inside server actions (return `{ error }` instead of calling `notFound()`).
- Every new page/action under `[datasetId]` MUST re-derive ownership via one of the above — never trust a `datasetId` param without checking it belongs to the current user.
- Next.js boundary rule (confirmed against `node_modules/next/dist/docs/`): a segment's `not-found.tsx`/`error.tsx` does **not** wrap that same segment's own `layout.tsx`. Since `requireDataset`'s `notFound()` fires inside `[datasetId]/layout.tsx`, its `not-found.tsx` lives one level up, at `app/dashboard/not-found.tsx`.
- CSV import (`lib/imports/`) is the bulk-entry path; manual CRUD forms are the row-level fix-up path. Both funnel through the same tables and the same `isUniqueViolation` (`lib/db/errors.ts`) duplicate-detection helper — Drizzle wraps driver errors in `DrizzleQueryError`, so check `error.cause instanceof postgres.PostgresError`, not the raw caught error.

# Environment Variables
- Never read `process.env` directly in code.
- Always import env vars from `env.ts`, which manages and validates them via `@t3-oss/env-nextjs`.
- Any new env var must be added to the schema in `env.ts` first, then imported from there wherever needed.

# Code Style
- No comments in code — code should be self-explanatory through naming and structure.
- Modular code: small, single-responsibility files/functions.
- Follow DRY — extract shared logic instead of duplicating.
- Follow standard Next.js/TS best practices and file-naming conventions.

# Design
- Minimal, modern UI.
- Build with shadcn components + Tailwind utilities — avoid custom CSS unless necessary.

# Docs
- Keep README.md and any setup/instruction docs up to date as the project evolves.