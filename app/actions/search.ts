"use server";

import { runSemanticSearch } from "@/lib/analytics/semantic-search";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";

export type SemanticSearchActionState =
  | { error: string; skus?: undefined }
  | { error?: undefined; skus: string[] };

export async function semanticSearchProducts(
  datasetId: string,
  query: string,
): Promise<SemanticSearchActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const result = await runSemanticSearch(dataset.id, query);
  if (!result.success) {
    return { error: result.error };
  }
  return { skus: result.skus };
}
