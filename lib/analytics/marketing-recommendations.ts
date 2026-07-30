import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDatasetSentimentAlerts } from "@/lib/analytics/sentiment";
import { classifyProducts } from "@/lib/analytics/velocity";
import { db } from "@/lib/db";
import type { Dataset } from "@/lib/db/schema";
import { products } from "@/lib/db/schema";

const MIN_MARGIN_RATIO = 0.3;
const DISCOUNT_FLOOR_MULTIPLIER = 1.1;
const CLEARANCE_DAYS_OF_STOCK = 60;
const MAX_RECOMMENDATIONS = 10;

export type MarketingRecommendationType =
  | "discount"
  | "bundle"
  | "clearance"
  | "fix-quality";

export type MarketingRecommendation = {
  type: MarketingRecommendationType;
  message: string;
};

export function computeMarketingRecommendation(input: {
  price: number;
  cost: number | null;
  stock: number | null;
  velocity: number;
  hasNegativeSentiment: boolean;
  bundlePartnerName: string | null;
}): MarketingRecommendation | null {
  const {
    price,
    cost,
    stock,
    velocity,
    hasNegativeSentiment,
    bundlePartnerName,
  } = input;

  if (hasNegativeSentiment) {
    return {
      type: "fix-quality",
      message:
        "Address recent negative reviews before promoting — a discount won't fix a trust problem.",
    };
  }

  if (bundlePartnerName) {
    return {
      type: "bundle",
      message: `Bundle with "${bundlePartnerName}", a strong seller in the same category.`,
    };
  }

  if (stock !== null) {
    const daysOfStock = stock / Math.max(velocity, 0.01);
    if (daysOfStock >= CLEARANCE_DAYS_OF_STOCK) {
      return {
        type: "clearance",
        message:
          "Stock is far outpacing sales — run a time-limited clearance (e.g. 3-for-2) to move inventory faster than a simple discount would.",
      };
    }
  }

  if (cost !== null && price > 0) {
    const marginRatio = (price - cost) / price;
    if (marginRatio >= MIN_MARGIN_RATIO) {
      const discountedPrice = Math.max(
        cost * DISCOUNT_FLOOR_MULTIPLIER,
        price * 0.8,
      );
      const discountPercent = Math.round((1 - discountedPrice / price) * 100);
      if (discountPercent > 0) {
        return {
          type: "discount",
          message: `Healthy margin — a ${discountPercent}% discount stays above cost and could revive demand.`,
        };
      }
    }
  }

  return null;
}

export type MarketingRecommendationEntry = {
  productId: string;
  name: string;
  sku: string;
  recommendation: MarketingRecommendation;
};

export const getMarketingRecommendations = cache(
  async (dataset: Dataset): Promise<MarketingRecommendationEntry[]> => {
    const classified = await classifyProducts(dataset);
    const slowMovers = classified.filter(
      (product) => product.classification === "slow-mover",
    );
    if (slowMovers.length === 0) {
      return [];
    }

    const highDemand = classified.filter(
      (product) => product.classification === "high-demand",
    );

    const [productRows, sentimentAlerts] = await Promise.all([
      db
        .select({
          id: products.id,
          category: products.category,
          price: products.price,
          cost: products.cost,
          stock: products.stock,
        })
        .from(products)
        .where(eq(products.datasetId, dataset.id)),
      getDatasetSentimentAlerts(dataset.id),
    ]);

    const productById = new Map(productRows.map((row) => [row.id, row]));
    const negativeSentimentIds = new Set(
      sentimentAlerts.map((entry) => entry.productId),
    );

    const bestHighDemandByCategory = new Map<string, string>();
    for (const product of highDemand) {
      const row = productById.get(product.productId);
      const category = row?.category;
      if (!category || bestHighDemandByCategory.has(category)) {
        continue;
      }
      bestHighDemandByCategory.set(category, product.name);
    }

    const entries: (MarketingRecommendationEntry & { velocity: number })[] = [];
    for (const product of slowMovers) {
      const row = productById.get(product.productId);
      if (!row) {
        continue;
      }

      const recommendation = computeMarketingRecommendation({
        price: Number(row.price),
        cost: row.cost !== null ? Number(row.cost) : null,
        stock: row.stock,
        velocity: product.velocity,
        hasNegativeSentiment: negativeSentimentIds.has(product.productId),
        bundlePartnerName: row.category
          ? (bestHighDemandByCategory.get(row.category) ?? null)
          : null,
      });

      if (recommendation) {
        entries.push({
          productId: product.productId,
          name: product.name,
          sku: product.sku,
          recommendation,
          velocity: product.velocity,
        });
      }
    }

    return entries
      .sort((a, b) => a.velocity - b.velocity)
      .slice(0, MAX_RECOMMENDATIONS)
      .map(({ velocity: _velocity, ...entry }) => entry);
  },
);
