# Sales Analytics

A sales prediction / analytics platform (final year project) — **not a
storefront**. Store owners sign up, organize their data into named datasets,
upload or manually enter products, sales, and traffic, and get dashboards,
trends, and rule-based slow-mover / high-demand classification.

Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Drizzle
ORM, and Postgres, plus a Python/Flask microservice (`ml-service/`) for the AI
features: demand forecasting, forecast-driven classification, stock-out risk
alerts, and semantic product search.

## Prerequisites

- Node.js 20+ and pnpm
- Python 3.12+ (for `ml-service/`)
- Docker (for the local Postgres database)

## Getting Started

### 1. Environment variables

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

### 3. Apply the schema

```bash
pnpm db:push
```

This is the convention used throughout development (`drizzle-kit push`,
applied directly against the dev database). `pnpm db:generate` /
`pnpm db:migrate` are available if you'd rather work from versioned migration
files.

### 4. (Optional) Seed demo data

```bash
pnpm db:seed
```

Creates a demo user and a "Demo Store" dataset with 45 products and ~12
months of seasonal sales and traffic data — enough to see every dashboard,
chart, and classification badge populated, and enough rows to exercise
pagination on the products/sales/traffic tables. Safe to re-run — it upserts
rather than duplicating. Prints the demo login credentials when done.

### 5. Start the ML service

```bash
cd ml-service
python3.12 -m venv venv
venv/bin/pip install -r requirements.txt
cp .env.example .env   # set ML_SERVICE_API_KEY to match the value in the app's .env
venv/bin/python app.py
```

Runs on `http://localhost:5001` by default (`PORT` in `ml-service/.env`). Flask
is fully stateless — it never touches Postgres directly; Next.js gathers data
via Drizzle, POSTs it to Flask, and persists whatever comes back. The app's
`ML_SERVICE_URL`/`ML_SERVICE_API_KEY` (in `.env`, validated via `env.ts`) must
point at this service and share its API key. `sentence-transformers` pulls in
PyTorch, so the first install is slow.

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Datasets** — every user can create multiple named datasets (e.g. "Shop A
  2024"); all data is scoped to one dataset at a time via
  `/dashboard/[datasetId]/...`.
- **Products** — catalog CRUD with search, category filter, and sorting.
- **Sales & traffic** — manual per-row entry (with duplicate product+date
  detection) for daily sales and page-view records.
- **CSV import** — bulk upload for products, sales, or traffic, with
  row-level validation reports (bad dates, unknown SKUs, missing columns,
  etc.), idempotent re-uploads, and import history. Templates are available
  in-app on the Import page.
- **Dashboards** — KPIs, revenue/units trend, traffic trend, top products,
  and category breakdown, filterable by date range (30/90 days, 1 year, all
  time). Each product also has its own detail page with sales and views
  trends.
- **Classification** — automatic slow-mover / high-demand / normal labeling
  based on sales velocity (units/day) over a trailing window anchored on the
  dataset's own most recent sale date — never today's real-world date, so
  historical datasets still classify correctly. Thresholds and the window
  length are configurable per dataset. Uses a product's latest demand
  forecast when one exists, falling back to historical velocity otherwise.
- **Demand forecasting** — a Random Forest model (with a Linear Regression
  baseline for comparison), trained per dataset on sales history, predicts
  daily quantity/revenue for each product with 10th/90th-percentile
  confidence bands. Products need at least 28 days of sales history.
- **Stock-out risk alerts** — walks a product's forecast against its current
  stock to flag out-of-stock, at-risk (with an estimated stock-out date), or
  sufficient — shown on the dashboard overview and each product's page.
- **Semantic product search** — search products by description instead of
  exact name/SKU match (e.g. "cheap kitchen items"), powered by sentence
  embeddings and cosine similarity.
- **Settings** — rename a dataset, tune classification thresholds, or delete
  a dataset (with all of its products/sales/traffic/import history).

### CSV formats

| Import | Required columns |
|---|---|
| Products | `name,sku,category,price,cost,stock` (`category`/`cost`/`stock` optional) |
| Sales | `sku,date,quantity,revenue` |
| Traffic | `sku,date,views` |

Dates are `YYYY-MM-DD`. Sales/traffic rows reference products by SKU, so
products must be imported (or created) first — an unresolvable SKU is
reported as a row-level error, not a failed import. Re-importing the same
file updates existing rows instead of duplicating them.

### Classification rule

For each product, `velocity = units sold in the trailing window / window
days` (default window: 30 days, ending on the dataset's most recent sale
date — not `now()`). A product is **high demand** at or above the
high-demand threshold (default 3 units/day), a **slow mover** below the
slow-mover threshold (default 0.33 units/day), **normal** in between, and
shows **no sales data** if it has never sold. Edit thresholds per dataset
under Settings.

## Authentication

Email/password authentication with stateless JWT sessions.

- **Sessions:** a JWT (signed with `jose`, HS256) stored in an httpOnly, secure,
  `SameSite=Lax` cookie. Passwords are hashed with bcrypt.
- **Routes:**
  - `/signup`, `/login`, `/forgot-password`, `/reset-password` — auth pages
    (grouped under `app/(auth)/`)
  - `/dashboard` and everything under it — protected; requires a valid session
- **Guards:**
  - `proxy.ts` performs optimistic cookie-based redirects (unauthenticated users
    are sent to `/login` from protected routes; authenticated users are sent to
    `/dashboard` from auth pages).
  - `lib/auth/dal.ts` (`verifySession`, `getCurrentUser`) performs the
    authoritative session check close to the data, and is used by protected
    pages and server actions.
  - `lib/datasets/dal.ts` (`requireDataset`, `getOwnedDataset`) performs the
    equivalent ownership check for dataset-scoped routes — every page and
    action under `/dashboard/[datasetId]` re-derives that the dataset belongs
    to the current user.
- **Password reset:** `forgotPassword` emails a one-hour, single-use reset link
  (a random token; only its hash is stored). `resetPassword` validates the token
  and updates the password.

## Key directories

- `app/actions/` — server actions (auth, datasets, products, sales, traffic, imports)
- `app/dashboard/[datasetId]/` — the dataset-scoped workspace (overview,
  products, sales, traffic, import, settings, and per-product detail pages)
- `lib/auth/` — session, JWT, password hashing, tokens, data access layer
- `lib/datasets/`, `lib/products/`, `lib/sales/`, `lib/traffic/` — per-feature
  data access layers
- `lib/imports/` — CSV parsing, per-row Zod schemas, and the batched
  upsert/validation engine
- `lib/analytics/` — KPI/trend/top-product/category queries, date-range
  presets, velocity classification, and stock-out risk
- `lib/forecasts/` — forecast generation orchestration and data access layer
- `lib/ml/` — fetch wrappers for the `ml-service` HTTP API (forecasting, search)
- `lib/db/` — Drizzle client, schema, and shared error helpers
- `ml-service/` — the Flask microservice: demand forecasting
  (scikit-learn) and semantic search (sentence-transformers). Stateless,
  called server-to-server over HTTP with a shared-secret header.
- `lib/validations/` — shared Zod schemas (client + server)
- `components/charts/` — shared Recharts-based chart primitives
- `components/analytics/`, `components/products/`, `components/sales/`,
  `components/traffic/`, `components/imports/`, `components/datasets/` —
  feature-specific UI
- `components/data-table/` — shared TanStack Table primitives (client-side
  sort/filter/paginate for Products; server-paginated `<Link>` navigation for
  Sales/Traffic)
- `components/ui/` — shadcn components (generated; never hand-edited —
  compose instead)
- `scripts/seed.ts` — demo dataset generator

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm biome:check` — lint + format (writes fixes)
- `pnpm ts:check` — TypeScript type check
- `pnpm db:generate` / `db:migrate` / `db:push` — Drizzle schema management
- `pnpm db:studio` — Drizzle Studio (browse the database)
- `pnpm db:seed` — seed a demo user/dataset with 12 months of sales/traffic
