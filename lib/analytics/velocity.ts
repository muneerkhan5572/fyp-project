import "server-only";
import { eq, sql } from "drizzle-orm";
import { cache } from "react";
import { getDatasetDateBounds } from "@/lib/analytics/queries";
import { addDaysToDateString } from "@/lib/analytics/range";
import { db } from "@/lib/db";
import type { Dataset } from "@/lib/db/schema";
import { products, sales } from "@/lib/db/schema";
import { listLatestForecastsForDataset } from "@/lib/forecasts/dal";

export type ProductClassification =
  | "high-demand"
  | "slow-mover"
  | "normal"
  | "no-data";

export type VelocitySource = "forecast" | "historical";

export type ClassifiedProduct = {
  productId: string;
  name: string;
  sku: string;
  unitsInWindow: number;
  velocity: number;
  historicalVelocity: number;
  predictedVelocity: number | null;
  velocitySource: VelocitySource;
  classification: ProductClassification;
};

function classify(
  velocity: number,
  totalSalesRows: number,
  slowThreshold: number,
  highThreshold: number,
): ProductClassification {
  if (totalSalesRows === 0) {
    return "no-data";
  }
  if (velocity >= highThreshold) {
    return "high-demand";
  }
  if (velocity < slowThreshold) {
    return "slow-mover";
  }
  return "normal";
}

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
        historicalVelocity: 0,
        predictedVelocity: null,
        velocitySource: "historical" as const,
        classification: "no-data" as const,
      }));
    }

    const windowStart = addDaysToDateString(maxDate, -(windowDays - 1));

    const [rows, latestForecasts] = await Promise.all([
      db
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
        .groupBy(products.id, products.name, products.sku),
      listLatestForecastsForDataset(dataset.id),
    ]);

    return rows.map((row) => {
      const historicalVelocity = row.unitsInWindow / windowDays;
      const forecast = latestForecasts.get(row.productId);
      const predictedVelocity =
        forecast && forecast.predictions.length > 0
          ? forecast.predictions.reduce(
              (sum, point) => sum + point.predictedQuantity,
              0,
            ) / forecast.horizonDays
          : null;

      const velocitySource: VelocitySource =
        predictedVelocity !== null ? "forecast" : "historical";
      const velocity = predictedVelocity ?? historicalVelocity;

      return {
        productId: row.productId,
        name: row.name,
        sku: row.sku,
        unitsInWindow: row.unitsInWindow,
        velocity,
        historicalVelocity,
        predictedVelocity,
        velocitySource,
        classification: classify(
          velocity,
          row.totalSalesRows,
          slowThreshold,
          highThreshold,
        ),
      };
    });
  },
);
