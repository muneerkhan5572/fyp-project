import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { datasets } from "@/lib/db/schema";

export const LAST_DATASET_COOKIE_NAME = "last_dataset_id";

export const requireDataset = cache(async (datasetId: string) => {
  const { userId } = await verifySession();

  const [dataset] = await db
    .select()
    .from(datasets)
    .where(and(eq(datasets.id, datasetId), eq(datasets.userId, userId)))
    .limit(1);

  if (!dataset) {
    notFound();
  }

  return dataset;
});

export async function getOwnedDataset(datasetId: string, userId: string) {
  const [dataset] = await db
    .select()
    .from(datasets)
    .where(and(eq(datasets.id, datasetId), eq(datasets.userId, userId)))
    .limit(1);

  return dataset ?? null;
}

export const listDatasets = cache(async () => {
  const { userId } = await verifySession();

  return db
    .select()
    .from(datasets)
    .where(eq(datasets.userId, userId))
    .orderBy(desc(datasets.updatedAt));
});
