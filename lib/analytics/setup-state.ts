import "server-only";
import { count, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { products, reviews, sales, trafficRecords } from "@/lib/db/schema";
import { hasAnyForecast } from "@/lib/forecasts/dal";

export type SetupStep =
  | "products"
  | "sales"
  | "traffic"
  | "forecast"
  | "complete";

export type DatasetSetupState = {
  productCount: number;
  salesCount: number;
  trafficCount: number;
  reviewCount: number;
  hasForecast: boolean;
  nextStep: SetupStep;
  isComplete: boolean;
};

async function countRows(
  table:
    | typeof products
    | typeof sales
    | typeof trafficRecords
    | typeof reviews,
  datasetId: string,
) {
  const [row] = await db
    .select({ value: count() })
    .from(table)
    .where(eq(table.datasetId, datasetId));

  return row?.value ?? 0;
}

export const getDatasetSetupState = cache(
  async (datasetId: string): Promise<DatasetSetupState> => {
    const [productCount, salesCount, trafficCount, reviewCount, hasForecast] =
      await Promise.all([
        countRows(products, datasetId),
        countRows(sales, datasetId),
        countRows(trafficRecords, datasetId),
        countRows(reviews, datasetId),
        hasAnyForecast(datasetId),
      ]);

    const nextStep: SetupStep =
      productCount === 0
        ? "products"
        : salesCount === 0
          ? "sales"
          : hasForecast
            ? "complete"
            : "forecast";

    return {
      productCount,
      salesCount,
      trafficCount,
      reviewCount,
      hasForecast,
      nextStep,
      isComplete: nextStep === "complete",
    };
  },
);
