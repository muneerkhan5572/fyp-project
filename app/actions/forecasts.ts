"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import { runForecastGeneration } from "@/lib/forecasts/generate-forecast";

export type ForecastActionState = {
  error?: string;
  success?: string;
};

export async function generateForecast(
  datasetId: string,
  horizonDays?: number,
): Promise<ForecastActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const result = await runForecastGeneration(dataset.id, horizonDays);
  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath(`/dashboard/${dataset.id}`, "layout");

  return {
    success:
      result.skippedCount > 0
        ? `Forecast generated for ${result.generatedCount} product${result.generatedCount === 1 ? "" : "s"} (${result.skippedCount} skipped — not enough history).`
        : `Forecast generated for ${result.generatedCount} product${result.generatedCount === 1 ? "" : "s"}.`,
  };
}
