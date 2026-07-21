import "server-only";
import { env } from "@/env";

export type ForecastHistoryPoint = {
  date: string;
  quantity: number;
  revenue: number;
};

export type ForecastProductInput = {
  sku: string;
  category: string | null;
  price: number;
  history: ForecastHistoryPoint[];
};

export type ForecastPredictionPoint = {
  date: string;
  predictedQuantity: number;
  predictedRevenue: number;
  lowerBound: number;
  upperBound: number;
};

export type ForecastModelMetrics = {
  rmse: number | null;
  mae: number | null;
};

export type ForecastMetrics = {
  randomForest: ForecastModelMetrics;
  linearRegression: ForecastModelMetrics;
};

export type ForecastSkippedProduct = {
  sku: string;
  reason: string;
};

export type ForecastResponse = {
  modelType: string;
  generatedAt: string;
  horizonDays: number;
  predictions: Record<string, ForecastPredictionPoint[]>;
  metrics: ForecastMetrics;
  skipped: ForecastSkippedProduct[];
};

export async function requestForecast(
  products: ForecastProductInput[],
  horizonDays: number,
): Promise<ForecastResponse> {
  const response = await fetch(`${env.ML_SERVICE_URL}/forecast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ products, horizonDays }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Forecast service error (${response.status}): ${body}`);
  }

  return response.json();
}
