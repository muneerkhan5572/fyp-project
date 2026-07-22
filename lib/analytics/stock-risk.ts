import "server-only";
import { cache } from "react";
import type { ForecastPoint } from "@/lib/db/schema";
import { listLatestForecastsForDataset } from "@/lib/forecasts/dal";
import { listProducts } from "@/lib/products/dal";

export type StockRiskStatus = "out-of-stock" | "at-risk" | "sufficient";

export type StockRiskEntry = {
  productId: string;
  name: string;
  sku: string;
  stock: number;
  status: StockRiskStatus;
  stockOutDate: string | null;
  daysRemaining: number | null;
};

function computeStockOut(
  stock: number,
  predictions: ForecastPoint[],
): { stockOutDate: string | null; daysRemaining: number | null } {
  let cumulative = 0;
  for (let index = 0; index < predictions.length; index++) {
    cumulative += predictions[index].predictedQuantity;
    if (cumulative >= stock) {
      return {
        stockOutDate: predictions[index].date,
        daysRemaining: index + 1,
      };
    }
  }
  return { stockOutDate: null, daysRemaining: null };
}

export const getStockRisk = cache(
  async (datasetId: string): Promise<StockRiskEntry[]> => {
    const [products, latestForecasts] = await Promise.all([
      listProducts(datasetId),
      listLatestForecastsForDataset(datasetId),
    ]);

    const entries: StockRiskEntry[] = [];

    for (const product of products) {
      if (product.stock === null) {
        continue;
      }

      if (product.stock === 0) {
        entries.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          stock: 0,
          status: "out-of-stock",
          stockOutDate: null,
          daysRemaining: null,
        });
        continue;
      }

      const forecast = latestForecasts.get(product.id);
      if (!forecast || forecast.predictions.length === 0) {
        continue;
      }

      const { stockOutDate, daysRemaining } = computeStockOut(
        product.stock,
        forecast.predictions,
      );

      entries.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        status: stockOutDate ? "at-risk" : "sufficient",
        stockOutDate,
        daysRemaining,
      });
    }

    return entries;
  },
);
