"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { sales } from "@/lib/db/schema";
import {
  type DeleteSaleInput,
  deleteSaleSchema,
  type SaleFormValues,
  saleFormSchema,
  type UpdateSaleValues,
  updateSaleSchema,
} from "@/lib/validations/sales";

export type SaleActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

const DUPLICATE_MESSAGE =
  "A record for this product and date already exists — edit it instead.";

export async function createSale(
  datasetId: string,
  input: SaleFormValues,
): Promise<SaleActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = saleFormSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await db.insert(sales).values({
      datasetId: dataset.id,
      productId: parsed.data.productId,
      saleDate: parsed.data.saleDate,
      quantity: parsed.data.quantity,
      revenue: parsed.data.revenue.toString(),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { saleDate: [DUPLICATE_MESSAGE] } };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${dataset.id}/sales`);
  return { success: "Sale recorded." };
}

export async function updateSale(
  datasetId: string,
  input: UpdateSaleValues,
): Promise<SaleActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = updateSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const [updated] = await db
      .update(sales)
      .set({
        productId: parsed.data.productId,
        saleDate: parsed.data.saleDate,
        quantity: parsed.data.quantity,
        revenue: parsed.data.revenue.toString(),
      })
      .where(and(eq(sales.id, parsed.data.id), eq(sales.datasetId, dataset.id)))
      .returning({ id: sales.id });

    if (!updated) {
      return { error: "Sale not found." };
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { saleDate: [DUPLICATE_MESSAGE] } };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${dataset.id}/sales`);
  return { success: "Sale updated." };
}

export async function deleteSale(
  datasetId: string,
  input: DeleteSaleInput,
): Promise<SaleActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = deleteSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await db
    .delete(sales)
    .where(and(eq(sales.id, parsed.data.id), eq(sales.datasetId, dataset.id)));

  revalidatePath(`/dashboard/${dataset.id}/sales`);
  return { success: "Sale deleted." };
}
