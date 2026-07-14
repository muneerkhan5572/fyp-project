# Ecommerce App

E-commerce app with sales prediction (final year project), built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, and Postgres.

## Prerequisites

- Node.js 20+ and npm
- Docker (for the local Postgres database)

## Getting Started

### 1. Environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

Generate a `SESSION_SECRET` (32+ characters):

```bash
openssl rand -base64 32
```

To send password-reset emails, set the `SMTP_*` variables to real credentials
(any SMTP provider works; for local testing use a service like Mailtrap or
Ethereal).

### 2. Start Postgres

```bash
docker compose up -d
```

This starts Postgres using the `POSTGRES_*` values from `.env`. `DATABASE_URL`
must point at the same database.

### 3. Run database migrations

```bash
npm run db:migrate
```

Other database commands:

- `npm run db:generate` — generate a new migration from schema changes
- `npm run db:push` — push the schema directly (useful in early development)

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

Email/password authentication with stateless JWT sessions.

- **Sessions:** a JWT (signed with `jose`, HS256) stored in an httpOnly, secure,
  `SameSite=Lax` cookie. Passwords are hashed with bcrypt.
- **Routes:**
  - `/signup`, `/login`, `/forgot-password`, `/reset-password` — auth pages
    (grouped under `app/(auth)/`)
  - `/dashboard` — protected; requires a valid session
- **Guards:**
  - `proxy.ts` performs optimistic cookie-based redirects (unauthenticated users
    are sent to `/login` from protected routes; authenticated users are sent to
    `/dashboard` from auth pages).
  - `lib/auth/dal.ts` (`verifySession`, `getCurrentUser`) performs the
    authoritative session check close to the data, and is used by protected
    pages and server actions.
- **Password reset:** `forgotPassword` emails a one-hour, single-use reset link
  (a random token; only its hash is stored). `resetPassword` validates the token
  and updates the password.

### Key directories

- `app/actions/auth.ts` — server actions (login, signup, forgot/reset password, logout)
- `lib/auth/` — session, JWT, password hashing, tokens, data access layer
- `lib/db/` — Drizzle client and schema
- `lib/validations/auth.ts` — shared Zod schemas (client + server)
- `lib/email/` — Nodemailer transport and reset email
- `components/*-form.tsx` — TanStack Form + shadcn forms

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run biome:check` — lint/format with Biome
- `npm run ts:check` — TypeScript type check
- `npm run db:generate` / `db:migrate` / `db:push` — Drizzle migrations
