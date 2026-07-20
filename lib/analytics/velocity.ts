import "server-only";
import { eq, sql } from "drizzle-orm";
import { cache } from "react";
import { getDatasetDateBounds } from "@/lib/analytics/queries";
import { addDaysToDateString } from "@/lib/analytics/range";
import { db } from "@/lib/db";
import type { Dataset } from "@/lib/db/schema";
import { products, sales } from "@/lib/db/schema";

export type ProductClassification =
  | "high-demand"
  | "slow-mover"
  | "normal"
  | "no-data";

export type ClassifiedProduct = {
  productId: string;
  name: string;
  sku: string;
  unitsInWindow: number;
  velocity: number;
  classification: ProductClassification;
};

export const classifyProducts = cache(
  async (dataset: Dataset): Promise<ClassifiedProduct[]> => {
    const { maxDate } = await getDatasetDateBounds(dataset.id);
    const windowDays = dataset.velocityWindowDays;
    const slowThreshold = Number(dataset.slowVelocityThreshold);
    const highThreshold = Number(dataset.highVelocityThreshold);

    if (!maxDate) {
      const allProducts = await db
        .select({ id: products.id, name: products.name, sku: products.sku })
        .from(products)
        .where(eq(products.datasetId, dataset.id));

      return allProducts.map((product) => ({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitsInWindow: 0,
        velocity: 0,
        classification: "no-data",
      }));
    }

    const windowStart = addDaysToDateString(maxDate, -(windowDays - 1));

    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        unitsInWindow: sql<number>`coalesce(sum(case when ${sales.saleDate} between ${windowStart} and ${maxDate} then ${sales.quantity} else 0 end), 0)::int`,
        totalSalesRows: sql<number>`count(${sales.id})::int`,
      })
      .from(products)
      .leftJoin(sales, eq(sales.productId, products.id))
      .where(eq(products.datasetId, dataset.id))
      .groupBy(products.id, products.name, products.sku);

    return rows.map((row) => {
      const velocity = row.unitsInWindow / windowDays;
      let classification: ProductClassification;
      if (row.totalSalesRows === 0) {
        classification = "no-data";
      } else if (velocity >= highThreshold) {
        classification = "high-demand";
      } else if (velocity < slowThreshold) {
        classification = "slow-mover";
      } else {
        classification = "normal";
      }
      return {
        productId: row.productId,
        name: row.name,
        sku: row.sku,
        unitsInWindow: row.unitsInWindow,
        velocity,
        classification,
      };
    });
  },
);
