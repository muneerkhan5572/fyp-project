import "server-only";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { products, reviews } from "@/lib/db/schema";
import { chunk } from "@/lib/imports/chunk";
import { requestSentiment } from "@/lib/ml/sentiment-client";

const MIN_REVIEWS_FOR_ALERT = 3;
const RECENT_REVIEWS_LIMIT = 5;
const SENTIMENT_BATCH_SIZE = 50;

export async function scoreReviewTexts(
  texts: string[],
): Promise<
  ({ label: "positive" | "negative" | "neutral"; score: number } | null)[]
> {
  if (texts.length === 0) {
    return [];
  }

  try {
    return await requestSentiment(texts);
  } catch (error) {
    console.error("Failed to score review sentiment:", error);
    return texts.map(() => null);
  }
}

export async function scoreUnscoredReviewSentiment(
  datasetId: string,
): Promise<void> {
  const pending = await db
    .select({ id: reviews.id, reviewText: reviews.reviewText })
    .from(reviews)
    .where(
      and(eq(reviews.datasetId, datasetId), isNull(reviews.sentimentLabel)),
    );

  if (pending.length === 0) {
    return;
  }

  for (const batch of chunk(pending, SENTIMENT_BATCH_SIZE)) {
    const results = await scoreReviewTexts(batch.map((row) => row.reviewText));

    for (let i = 0; i < batch.length; i++) {
      const result = results[i];
      if (!result) {
        continue;
      }
      await db
        .update(reviews)
        .set({
          sentimentLabel: result.label,
          sentimentScore: result.score.toString(),
        })
        .where(eq(reviews.id, batch[i].id));
    }
  }
}

function signedScore(
  label: "positive" | "negative" | "neutral" | null,
  score: string | null,
): number | null {
  if (label === null || score === null) {
    return null;
  }
  if (label === "neutral") {
    return 0;
  }
  const magnitude = Number(score);
  return label === "positive" ? magnitude : -magnitude;
}

export type ProductSentimentSummary = {
  totalCount: number;
  scoredCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageScore: number | null;
  recentReviews: {
    id: string;
    reviewText: string;
    rating: number | null;
    sentimentLabel: "positive" | "negative" | "neutral" | null;
    reviewDate: string | null;
  }[];
};

export const getProductSentiment = cache(
  async (productId: string): Promise<ProductSentimentSummary> => {
    const rows = await db
      .select({
        id: reviews.id,
        reviewText: reviews.reviewText,
        rating: reviews.rating,
        sentimentLabel: reviews.sentimentLabel,
        sentimentScore: reviews.sentimentScore,
        reviewDate: reviews.reviewDate,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.reviewDate), desc(reviews.createdAt));

    const signedScores = rows
      .map((row) => signedScore(row.sentimentLabel, row.sentimentScore))
      .filter((value): value is number => value !== null);

    return {
      totalCount: rows.length,
      scoredCount: signedScores.length,
      positiveCount: rows.filter((row) => row.sentimentLabel === "positive")
        .length,
      negativeCount: rows.filter((row) => row.sentimentLabel === "negative")
        .length,
      neutralCount: rows.filter((row) => row.sentimentLabel === "neutral")
        .length,
      averageScore:
        signedScores.length > 0
          ? signedScores.reduce((sum, value) => sum + value, 0) /
            signedScores.length
          : null,
      recentReviews: rows.slice(0, RECENT_REVIEWS_LIMIT).map((row) => ({
        id: row.id,
        reviewText: row.reviewText,
        rating: row.rating,
        sentimentLabel: row.sentimentLabel,
        reviewDate: row.reviewDate,
      })),
    };
  },
);

export type SentimentAlertEntry = {
  productId: string;
  name: string;
  sku: string;
  averageScore: number;
  reviewCount: number;
};

export const getDatasetSentimentAlerts = cache(
  async (datasetId: string): Promise<SentimentAlertEntry[]> => {
    const rows = await db
      .select({
        productId: reviews.productId,
        name: products.name,
        sku: products.sku,
        sentimentLabel: reviews.sentimentLabel,
        sentimentScore: reviews.sentimentScore,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(
        and(
          eq(reviews.datasetId, datasetId),
          isNotNull(reviews.sentimentLabel),
        ),
      );

    const byProduct = new Map<
      string,
      { name: string; sku: string; scores: number[] }
    >();

    for (const row of rows) {
      const score = signedScore(row.sentimentLabel, row.sentimentScore);
      if (score === null) {
        continue;
      }
      const existing = byProduct.get(row.productId);
      if (existing) {
        existing.scores.push(score);
      } else {
        byProduct.set(row.productId, {
          name: row.name,
          sku: row.sku,
          scores: [score],
        });
      }
    }

    const alerts: SentimentAlertEntry[] = [];
    for (const [productId, entry] of byProduct) {
      if (entry.scores.length < MIN_REVIEWS_FOR_ALERT) {
        continue;
      }
      const averageScore =
        entry.scores.reduce((sum, value) => sum + value, 0) /
        entry.scores.length;
      if (averageScore >= 0) {
        continue;
      }
      alerts.push({
        productId,
        name: entry.name,
        sku: entry.sku,
        averageScore,
        reviewCount: entry.scores.length,
      });
    }

    return alerts.sort((a, b) => a.averageScore - b.averageScore);
  },
);
