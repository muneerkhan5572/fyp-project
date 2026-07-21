import "server-only";
import { db } from "@/lib/db";
import { forecasts } from "@/lib/db/schema";
import {
  type ForecastHistoryPoint,
  type ForecastProductInput,
  requestForecast,
} from "@/lib/ml/forecast-client";
import { listProducts } from "@/lib/products/dal";
import { listAllSalesForDataset } from "@/lib/sales/dal";

const DEFAULT_HORIZON_DAYS = 7;

export type GenerateForecastResult =
  | { success: true; generatedCount: number; skippedCount: number }
  | { success: false; error: string };

export async function runForecastGeneration(
  datasetId: string,
  horizonDays: number = DEFAULT_HORIZON_DAYS,
): Promise<GenerateForecastResult> {
  const [products, salesRows] = await Promise.all([
    listProducts(datasetId),
    listAllSalesForDataset(datasetId),
  ]);

  if (products.length === 0) {
    return {
      success: false,
      error: "Add products before generating a forecast.",
    };
  }

  const historyByProductId = new Map<string, ForecastHistoryPoint[]>();
  for (const row of salesRows) {
    const history = historyByProductId.get(row.productId) ?? [];
    history.push({
      date: row.saleDate,
      quantity: row.quantity,
      revenue: Number(row.revenue),
    });
    historyByProductId.set(row.productId, history);
  }

  const productInputs: ForecastProductInput[] = products.map((product) => ({
    sku: product.sku,
    category: product.category,
    price: Number(product.price),
    history: historyByProductId.get(product.id) ?? [],
  }));

  let result: Awaited<ReturnType<typeof requestForecast>>;
  try {
    result = await requestForecast(productInputs, horizonDays);
  } catch {
    return {
      success: false,
      error:
        "Couldn't reach the forecasting service. Make sure it's running and try again.",
    };
  }

  const skuToProductId = new Map(
    products.map((product) => [product.sku, product.id]),
  );
  const rowsToInsert = Object.entries(result.predictions)
    .map(([sku, predictions]) => {
      const productId = skuToProductId.get(sku);
      if (!productId) {
        return null;
      }
      return {
        datasetId,
        productId,
        horizonDays: result.horizonDays,
        predictions,
        modelType: result.modelType,
        rmse:
          result.metrics.randomForest.rmse !== null
            ? result.metrics.randomForest.rmse.toString()
            : null,
        mae:
          result.metrics.randomForest.mae !== null
            ? result.metrics.randomForest.mae.toString()
            : null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rowsToInsert.length === 0) {
    return {
      success: false,
      error:
        "None of this dataset's products have enough sales history yet to forecast.",
    };
  }

  await db.insert(forecasts).values(rowsToInsert);

  return {
    success: true,
    generatedCount: rowsToInsert.length,
    skippedCount: result.skipped.length,
  };
}
