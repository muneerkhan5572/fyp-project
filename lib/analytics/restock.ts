import "server-only";
import type { Forecast } from "@/lib/db/schema";

export type RestockSource = "ml" | "rule";

export type RestockRecommendation = {
  reorderQuantity: number;
  horizonDays: number;
  source: RestockSource;
};

export function computeRestockRecommendation(
  stock: number,
  forecast: Forecast | null,
  historicalVelocity: number,
  fallbackHorizonDays: number,
): RestockRecommendation {
  if (forecast && forecast.predictions.length > 0) {
    const predictedDemand = forecast.predictions.reduce(
      (sum, point) => sum + point.predictedQuantity,
      0,
    );
    return {
      reorderQuantity: Math.max(0, Math.ceil(predictedDemand - stock)),
      horizonDays: forecast.horizonDays,
      source: "ml",
    };
  }

  const estimatedDemand = historicalVelocity * fallbackHorizonDays;
  return {
    reorderQuantity: Math.max(0, Math.ceil(estimatedDemand - stock)),
    horizonDays: fallbackHorizonDays,
    source: "rule",
  };
}
