import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export const listProducts = cache((datasetId: string) => {
  return db
    .select()
    .from(products)
    .where(eq(products.datasetId, datasetId))
    .orderBy(asc(products.name));
});

export const getProduct = cache(
  async (datasetId: string, productId: string) => {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.datasetId, datasetId)))
      .limit(1);

    return product ?? null;
  },
);

export const listCategories = cache(async (datasetId: string) => {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.datasetId, datasetId));

  return rows
    .map((row) => row.category)
    .filter((category): category is string => Boolean(category))
    .sort((a, b) => a.localeCompare(b));
});
