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