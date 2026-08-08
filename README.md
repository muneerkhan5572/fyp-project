# E-commerce Product Demand Prediction (EPDP)

A sales prediction / analytics platform (final year project) — **not a
storefront**. Store owners sign up, organize their data into named datasets,
upload or manually enter products, sales, traffic, and reviews, and get
dashboards, rule-based classification, AI-driven demand forecasting, and
marketing recommendations.

Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Drizzle
ORM, and Postgres (with pgvector), plus a Python/Flask microservice
(`services/ml-service/`) for the AI features: forecasting, semantic search,
and review sentiment scoring.

## Prerequisites

- Node.js 20+ and pnpm
- Python 3.12+ (for `services/ml-service/`)
- Docker (for the local Postgres database)

## Getting Started

Run these steps in order.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create your `.env` from the template:

```bash
cp .env.example .env
```

Generate a `SESSION_SECRET` (32+ characters) and paste it into `.env`:

```bash
openssl rand -base64 32
```

To send password-reset emails, set the `SMTP_*` variables in `.env` to real
credentials (any SMTP provider works; Mailtrap or Ethereal are fine for local
testing). Leave them blank if you don't need that flow locally.

### 3. Start Postgres

```bash
docker compose up -d
```

This starts Postgres using the `POSTGRES_*` values from `.env`. `DATABASE_URL`
must point at the same database.

### 4. Enable pgvector

Semantic product search stores embeddings in a native Postgres `vector`
column, so the extension must exist **before** the schema is pushed:

```bash
pnpm exec tsx --env-file=.env scripts/enable-pgvector.ts
```

### 5. Apply the schema

```bash
pnpm db:push
```

This is the convention used throughout development (`drizzle-kit push`,
applied directly against the dev database). `pnpm db:generate` /
`pnpm db:migrate` are available if you'd rather work from versioned migration
files.

### 6. Start the ML service

The Flask service handles forecasting, semantic search embeddings, and review
sentiment scoring. It never touches Postgres directly — Next.js gathers data
via Drizzle, POSTs it to Flask, and persists whatever comes back.

Move into the microservice's own directory (it has its own dependency tree,
separate from the Next.js app):

```bash
cd services/ml-service
```

Create an isolated Python environment so its dependencies don't collide with
system Python:

```bash
python3.12 -m venv venv
```

Install its dependencies into that environment (slow the first time — pulls
in PyTorch for `sentence-transformers`/`transformers`):

```bash
venv/bin/pip install -r requirements.txt
```

Create the service's own env file (separate from the app's `.env`):

```bash
cp .env.example .env
```

Open `services/ml-service/.env` and set `ML_SERVICE_API_KEY` to match the
same value used in the app's `.env`. Then start the service:

```bash
venv/bin/python app.py
```

Runs on `http://localhost:5001` by default (`PORT` in
`services/ml-service/.env`). The embedding and sentiment models download from
Hugging Face on first use (needs internet access).

Return to the repository root before continuing:

```bash
cd ../..
```

### 7. (Optional) Seed demo data

```bash
pnpm db:seed
```

Creates a demo user and a "Demo Store" dataset with 45 products and ~12
months of seasonal sales/traffic data — enough to populate every dashboard,
chart, and classification badge, with enough rows to exercise pagination.
Safe to re-run — it upserts rather than duplicating. Prints the demo login
credentials when done.

### 8. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Datasets** — every user can create multiple named datasets (e.g. "Shop A
  2024"); all data is scoped to one dataset at a time via
  `/dashboard/[datasetId]/...`.
- **Products** — catalog CRUD with exact, semantic, or voice search, category
  filter, and sorting.
- **Sales & traffic** — manual per-row entry (with duplicate product+date
  detection) for daily sales and page-view records.
- **Reviews** — manual entry or CSV import of customer reviews, scored for
  sentiment via the ML service on import.
- **CSV import** — bulk upload for products, sales, traffic, or reviews, with
  row-level validation reports, drag-and-drop file selection, idempotent
  re-uploads, and import history. Templates available in-app on the Import
  page.
- **Dashboards** — KPIs, revenue/units/traffic trends, top products, and
  category breakdown, filterable by date range. Each product has its own
  detail page with sales/views trends.
- **Classification** — automatic slow-mover / high-demand / normal labeling
  by sales velocity over a trailing window anchored on the dataset's own most
  recent sale date (not today's real-world date, so historical datasets still
  classify correctly). Thresholds and window length are configurable per
  dataset. Uses a product's latest demand forecast when one exists, falling
  back to historical velocity otherwise.
- **Demand forecasting** — a Random Forest model (with a Linear Regression
  baseline for comparison), trained per dataset on sales history, predicts
  daily quantity/revenue with 10th/90th-percentile confidence bands. Products
  need at least 28 days of sales history.
- **Stock-out risk alerts** — compares a product's forecast to its current
  stock to flag out-of-stock, at-risk (with an estimated stock-out date), or
  sufficient, on the Analytics page and each product's page.
- **Semantic product search** — search by description instead of exact
  name/SKU match, powered by sentence embeddings (pgvector, cosine
  similarity). Supports voice input via the browser's speech recognition API.
- **Review sentiment analysis** — products with sustained negative sentiment
  surface as sentiment alerts on the Analytics page.
- **Marketing recommendations** — rule-based suggestions for slow-mover
  products: `fix-quality` (negative sentiment), `bundle` (pair with a strong
  same-category product), `clearance` (stock far outpacing sales), or
  `discount` (based on margin).
- **Settings** — rename a dataset, tune classification thresholds, or delete
  a dataset (with all of its products/sales/traffic/reviews/import history).

### CSV formats

| Import | Required columns | Notes |
|---|---|---|
| Products | `name,sku,category,price,cost,stock` | `category`/`cost`/`stock` optional |
| Sales | `sku,date,quantity,revenue` | |
| Traffic | `sku,date,views` | |
| Reviews | `sku,review_date,review_text,rating` | scored for sentiment on import |

Dates are `YYYY-MM-DD`. Sales/traffic/review rows reference products by SKU,
so products must be imported (or created) first — an unresolvable SKU is
reported as a row-level error, not a failed import. Re-importing the same
file updates existing rows instead of duplicating them.

### Classification rule

For each product, `velocity = units sold in the trailing window / window
days` (default window: 30 days, ending on the dataset's most recent sale
date — not `now()`). **High demand** at or above the high-demand threshold
(default 3 units/day), **slow mover** below the slow-mover threshold (default
0.33 units/day), **normal** in between, **no sales data** if it has never
sold. Edit thresholds per dataset under Settings.

## Authentication

Email/password authentication with stateless JWT sessions.

- **Sessions:** a JWT (signed with `jose`, HS256) stored in an httpOnly, secure,
  `SameSite=Lax` cookie. Passwords are hashed with bcrypt.
- **Routes:** `/signup`, `/login`, `/forgot-password`, `/reset-password` are
  public auth pages (`app/(auth)/`); `/dashboard` and everything under it is
  protected.
- **Guards:**
  - `proxy.ts` performs optimistic cookie-based redirects.
  - `lib/auth/dal.ts` (`verifySession`, `getCurrentUser`) is the authoritative
    session check, used by protected pages and server actions.
  - `lib/datasets/dal.ts` (`requireDataset`, `getOwnedDataset`) is the
    equivalent ownership check for dataset-scoped routes — every page and
    action under `/dashboard/[datasetId]` re-derives that the dataset belongs
    to the current user.
- **Password reset:** `forgotPassword` emails a one-hour, single-use reset link
  (only its hash is stored); `resetPassword` validates the token and updates
  the password.

## Key directories

- `app/actions/` — server actions (auth, datasets, products, sales, traffic, reviews, imports)
- `app/dashboard/[datasetId]/` — the dataset-scoped workspace
- `lib/auth/` — session, JWT, password hashing, tokens, data access layer
- `lib/datasets/`, `lib/products/`, `lib/sales/`, `lib/traffic/` — per-feature
  data access layers
- `lib/imports/` — CSV parsing, per-row Zod schemas, and the batched
  upsert/validation engine
- `lib/analytics/` — KPI/trend/top-product/category queries, date-range
  presets, velocity classification, stock-out risk, sentiment aggregation,
  and marketing recommendations
- `lib/forecasts/` — forecast generation orchestration and data access layer
- `lib/ml/` — fetch wrappers for the `services/ml-service` HTTP API
- `lib/db/` — Drizzle client, schema, and shared error helpers
- `services/ml-service/` — the Flask microservice (forecasting, embeddings,
  sentiment). Stateless, called server-to-server over HTTP with a
  shared-secret header.
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
- `hooks/` — shared client hooks (`use-speech-recognition.ts` for voice
  search, `use-file-drop.ts` for drag-and-drop CSV import)
- `scripts/` — seed data, one-off backfills, and dev fixtures (see below)

## Scripts

Run from the repository root unless noted otherwise.

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm biome:check` | Lint + format (writes fixes) |
| `pnpm ts:check` | TypeScript type check |
| `pnpm db:generate` / `db:migrate` / `db:push` | Drizzle schema management |
| `pnpm db:studio` | Drizzle Studio (browse the database) |
| `pnpm db:seed` | Seed a demo user/dataset with 12 months of sales/traffic |
| `pnpm db:backfill-embeddings` | Populate product embeddings for semantic search (only rows missing one) |
| `pnpm db:backfill-review-sentiment` | Score existing reviews' sentiment (pass `--all` to rescore everything) |
| `pnpm scrape:daraz-reviews <datasetId> [outputPath]` | Experimental: scrape Daraz reviews into a CSV for re-import |
| `pnpm exec tsx --env-file=.env scripts/enable-pgvector.ts` | One-time: enable the Postgres `vector` extension |
| `pnpm exec tsx --env-file=.env scripts/create-search-test-dataset.ts` | Dev-only: seed a dataset for manually verifying semantic search quality |
