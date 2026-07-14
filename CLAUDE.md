@AGENTS.md

# Project
E-commerce app with sales prediction (final year project).

# Stack
- TypeScript (strict — no `.js`/`.jsx` files)
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Zod (validation/schemas)
- TanStack Table
- TanStack Form

# Package Manager
npm / npx only — do not use yarn, pnpm, or bun.

# Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — biome check
- `npm run format` — biome format --write

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