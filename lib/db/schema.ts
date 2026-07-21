import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const datasets = pgTable(
  "datasets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slowVelocityThreshold: numeric("slow_velocity_threshold", {
      precision: 8,
      scale: 3,
    })
      .notNull()
      .default("0.33"),
    highVelocityThreshold: numeric("high_velocity_threshold", {
      precision: 8,
      scale: 3,
    })
      .notNull()
      .default("3"),
    velocityWindowDays: integer("velocity_window_days").notNull().default(30),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    unique("datasets_user_id_name_unique").on(table.userId, table.name),
    index("datasets_user_id_idx").on(table.userId),
  ],
);

export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => datasets.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    category: text("category"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }),
    stock: integer("stock"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    unique("products_dataset_id_sku_unique").on(table.datasetId, table.sku),
    index("products_dataset_id_idx").on(table.datasetId),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const sales = pgTable(
  "sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => datasets.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    saleDate: date("sale_date", { mode: "string" }).notNull(),
    quantity: integer("quantity").notNull(),
    revenue: numeric("revenue", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("sales_product_id_sale_date_unique").on(
      table.productId,
      table.saleDate,
    ),
    index("sales_dataset_id_sale_date_idx").on(table.datasetId, table.saleDate),
  ],
);

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export const trafficRecords = pgTable(
  "traffic_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => datasets.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    trafficDate: date("traffic_date", { mode: "string" }).notNull(),
    views: integer("views").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("traffic_records_product_id_traffic_date_unique").on(
      table.productId,
      table.trafficDate,
    ),
    index("traffic_records_dataset_id_traffic_date_idx").on(
      table.datasetId,
      table.trafficDate,
    ),
  ],
);

export type TrafficRecord = typeof trafficRecords.$inferSelect;
export type NewTrafficRecord = typeof trafficRecords.$inferInsert;

export const importType = pgEnum("import_type", [
  "products",
  "sales",
  "traffic",
]);

export const importStatus = pgEnum("import_status", [
  "completed",
  "completed_with_errors",
  "failed",
]);

export type ImportRowError = {
  row: number;
  field?: string;
  message: string;
};

export type ImportMeta = {
  mode: "flexible";
  dateFormat: string;
  productsUpserted: number;
  namesCollapsed: number;
  salesRowsAggregated: number;
};

export const imports = pgTable(
  "imports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => datasets.id, { onDelete: "cascade" }),
    type: importType("type").notNull(),
    fileName: text("file_name").notNull(),
    totalRows: integer("total_rows").notNull(),
    importedRows: integer("imported_rows").notNull(),
    failedRows: integer("failed_rows").notNull(),
    errors: jsonb("errors").$type<ImportRowError[]>().notNull().default([]),
    status: importStatus("status").notNull(),
    meta: jsonb("meta").$type<ImportMeta | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("imports_dataset_id_idx").on(table.datasetId)],
);

export type Import = typeof imports.$inferSelect;
export type NewImport = typeof imports.$inferInsert;
