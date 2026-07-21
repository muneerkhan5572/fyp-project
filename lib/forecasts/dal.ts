import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { forecasts } from "@/lib/db/schema";

export const getLatestForecast = cache(
  async (datasetId: string, productId: string) => {
    const [forecast] = await db
      .select()
      .from(forecasts)
      .where(
        and(
          eq(forecasts.datasetId, datasetId),
          eq(forecasts.productId, productId),
        ),
      )
      .orderBy(desc(forecasts.generatedAt))
      .limit(1);

    return forecast ?? null;
  },
);

export const hasAnyForecast = cache(async (datasetId: string) => {
  const [row] = await db
    .select({ id: forecasts.id })
    .from(forecasts)
    .where(eq(forecasts.datasetId, datasetId))
    .limit(1);

  return Boolean(row);
});

export const listLatestForecastsForDataset = cache(
  async (datasetId: string) => {
    const rows = await db
      .select()
      .from(forecasts)
      .where(eq(forecasts.datasetId, datasetId))
      .orderBy(desc(forecasts.generatedAt));

    const latestByProduct = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!latestByProduct.has(row.productId)) {
        latestByProduct.set(row.productId, row);
      }
    }
    return latestByProduct;
  },
);
