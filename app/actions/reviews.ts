"use server";

import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import {
  getReviewSentimentCounts,
  type ReviewSentimentCounts,
} from "@/lib/reviews/dal";

export async function getReviewSentimentProgress(
  datasetId: string,
): Promise<ReviewSentimentCounts | { error: string }> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  return getReviewSentimentCounts(dataset.id);
}
