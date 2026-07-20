"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { trafficRecords } from "@/lib/db/schema";
import {
  type DeleteTrafficInput,
  deleteTrafficSchema,
  type TrafficFormValues,
  trafficFormSchema,
  type UpdateTrafficValues,
  updateTrafficSchema,
} from "@/lib/validations/traffic";

export type TrafficActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

const DUPLICATE_MESSAGE =
  "A record for this product and date already exists — edit it instead.";

export async function createTrafficRecord(
  datasetId: string,
  input: TrafficFormValues,
): Promise<TrafficActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = trafficFormSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await db.insert(trafficRecords).values({
      datasetId: dataset.id,
      productId: parsed.data.productId,
      trafficDate: parsed.data.trafficDate,
      views: parsed.data.views,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { trafficDate: [DUPLICATE_MESSAGE] } };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${dataset.id}/traffic`);
  return { success: "Traffic recorded." };
}

export async function updateTrafficRecord(
  datasetId: string,
  input: UpdateTrafficValues,
): Promise<TrafficActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = updateTrafficSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const [updated] = await db
      .update(trafficRecords)
      .set({
        productId: parsed.data.productId,
        trafficDate: parsed.data.trafficDate,
        views: parsed.data.views,
      })
      .where(
        and(
          eq(trafficRecords.id, parsed.data.id),
          eq(trafficRecords.datasetId, dataset.id),
        ),
      )
      .returning({ id: trafficRecords.id });

    if (!updated) {
      return { error: "Traffic record not found." };
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { trafficDate: [DUPLICATE_MESSAGE] } };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${dataset.id}/traffic`);
  return { success: "Traffic record updated." };
}

export async function deleteTrafficRecord(
  datasetId: string,
  input: DeleteTrafficInput,
): Promise<TrafficActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = deleteTrafficSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await db
    .delete(trafficRecords)
    .where(
      and(
        eq(trafficRecords.id, parsed.data.id),
        eq(trafficRecords.datasetId, dataset.id),
      ),
    );

  revalidatePath(`/dashboard/${dataset.id}/traffic`);
  return { success: "Traffic record deleted." };
}
