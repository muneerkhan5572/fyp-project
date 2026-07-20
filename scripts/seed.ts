import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  datasets,
  products,
  sales,
  trafficRecords,
  users,
} from "@/lib/db/schema";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "DemoPass123!";
const DEMO_NAME = "Demo User";
const DATASET_NAME = "Demo Store";

const CATEGORIES = ["Apparel", "Kitchen", "Electronics", "Outdoors", "Toys"];
const PRODUCT_COUNT = 45;
const DAYS = 365;
const BATCH_SIZE = 1000;

// Rough holiday-season boost: Nov/Dec higher, Jan/Feb lower. Index 0 = January.
const MONTH_SEASONALITY = [
  0.8, 0.75, 0.85, 0.9, 0.95, 1.0, 1.0, 0.95, 1.0, 1.1, 1.4, 1.6,
];

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function upsertDemoUser() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const passwordHash = await hash(DEMO_PASSWORD, 12);
  const [created] = await db
    .insert(users)
    .values({ name: DEMO_NAME, email: DEMO_EMAIL, passwordHash })
    .returning({ id: users.id });

  return created.id;
}

async function upsertDataset(userId: string) {
  const [existing] = await db
    .select({ id: datasets.id })
    .from(datasets)
    .where(eq(datasets.userId, userId))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [created] = await db
    .insert(datasets)
    .values({ userId, name: DATASET_NAME })
    .returning({ id: datasets.id });

  return created.id;
}

async function seedProducts(datasetId: string) {
  const rows = Array.from({ length: PRODUCT_COUNT }, (_, i) => {
    const index = i + 1;
    const category = CATEGORIES[i % CATEGORIES.length];
    const price = randomInt(500, 20000) / 100;
    const cost = Number((price * (randomInt(30, 70) / 100)).toFixed(2));
    return {
      datasetId,
      name: `${category} Item ${index}`,
      sku: `DEMO-${String(index).padStart(3, "0")}`,
      category,
      price: price.toString(),
      cost: cost.toString(),
      stock: randomInt(0, 400),
      dailyUnits: randomInt(1, 8),
    };
  });

  const inserted = await db
    .insert(products)
    .values(rows.map(({ dailyUnits, ...row }) => row))
    .onConflictDoUpdate({
      target: [products.datasetId, products.sku],
      set: {
        name: sql`excluded.name`,
        category: sql`excluded.category`,
        price: sql`excluded.price`,
        cost: sql`excluded.cost`,
        stock: sql`excluded.stock`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, sku: products.sku });

  const idBySku = new Map(inserted.map((row) => [row.sku, row.id]));
  return rows.map((row) => ({
    id: idBySku.get(row.sku),
    price: Number(row.price),
    dailyUnits: row.dailyUnits,
  }));
}

async function seedSalesAndTraffic(
  datasetId: string,
  seededProducts: {
    id: string | undefined;
    price: number;
    dailyUnits: number;
  }[],
) {
  const today = new Date();
  const salesRows: (typeof sales.$inferInsert)[] = [];
  const trafficRows: (typeof trafficRecords.$inferInsert)[] = [];

  for (const product of seededProducts) {
    if (!product.id) {
      continue;
    }
    for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const seasonality = MONTH_SEASONALITY[date.getMonth()];
      const dateStr = dateString(date);

      if (Math.random() < 0.55) {
        const quantity = Math.max(
          0,
          Math.round(product.dailyUnits * seasonality * (0.5 + Math.random())),
        );
        if (quantity > 0) {
          salesRows.push({
            datasetId,
            productId: product.id,
            saleDate: dateStr,
            quantity,
            revenue: (quantity * product.price).toFixed(2),
          });
        }
      }

      if (Math.random() < 0.7) {
        const views = Math.max(
          0,
          Math.round(
            product.dailyUnits *
              seasonality *
              randomInt(15, 45) *
              (0.5 + Math.random()),
          ),
        );
        if (views > 0) {
          trafficRows.push({
            datasetId,
            productId: product.id,
            trafficDate: dateStr,
            views,
          });
        }
      }
    }
  }

  for (const batch of chunk(salesRows, BATCH_SIZE)) {
    await db
      .insert(sales)
      .values(batch)
      .onConflictDoUpdate({
        target: [sales.productId, sales.saleDate],
        set: {
          quantity: sql`excluded.quantity`,
          revenue: sql`excluded.revenue`,
        },
      });
  }

  for (const batch of chunk(trafficRows, BATCH_SIZE)) {
    await db
      .insert(trafficRecords)
      .values(batch)
      .onConflictDoUpdate({
        target: [trafficRecords.productId, trafficRecords.trafficDate],
        set: { views: sql`excluded.views` },
      });
  }

  return { salesCount: salesRows.length, trafficCount: trafficRows.length };
}

async function main() {
  console.info("Seeding demo data...");

  const userId = await upsertDemoUser();
  const datasetId = await upsertDataset(userId);
  const seededProducts = await seedProducts(datasetId);
  const { salesCount, trafficCount } = await seedSalesAndTraffic(
    datasetId,
    seededProducts,
  );

  console.info("\nDone.");
  console.info(`  Products: ${seededProducts.length}`);
  console.info(`  Sales rows: ${salesCount}`);
  console.info(`  Traffic rows: ${trafficCount}`);
  console.info(`  Dataset: ${DATASET_NAME} (${datasetId})`);
  console.info("\nLog in with:");
  console.info(`  Email:    ${DEMO_EMAIL}`);
  console.info(`  Password: ${DEMO_PASSWORD}`);

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
