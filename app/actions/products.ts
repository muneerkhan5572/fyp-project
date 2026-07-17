"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { products } from "@/lib/db/schema";
import {
  type DeleteProductInput,
  deleteProductSchema,
  type ProductFormValues,
  productFormSchema,
  type UpdateProductValues,
  updateProductSchema,
} from "@/lib/validations/products";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

export async function createProduct(
  datasetId: string,
  input: ProductFormValues,
): Promise<ProductActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await db.insert(products).values({
      datasetId: dataset.id,
      name: parsed.data.name,
      sku: parsed.data.sku,
      category: parsed.data.category ?? null,
      price: parsed.data.price.toString(),
      cost: parsed.data.cost !== undefined ? parsed.data.cost.toString() : null,
      stock: parsed.data.stock ?? null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: { sku: ["SKU already exists in this dataset."] },
      };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${dataset.id}/products`);
  return { success: "Product created." };
}

export async function updateProduct(
  datasetId: string,
  input: UpdateProductValues,
): Promise<ProductActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const [updated] = await db
      .update(products)
      .set({
        name: parsed.data.name,
        sku: parsed.data.sku,
        category: parsed.data.category ?? null,
        price: parsed.data.price.toString(),
        cost:
          parsed.data.cost !== undefined ? parsed.data.cost.toString() : null,
        stock: parsed.data.stock ?? null,
      })
      .where(
        and(
          eq(products.id, parsed.data.id),
          eq(products.datasetId, dataset.id),
        ),
      )
      .returning({ id: products.id });

    if (!updated) {
      return { error: "Product not found." };
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: { sku: ["SKU already exists in this dataset."] },
      };
    }
    throw error;
  }

  revalidatePath(`/dashboard/${dataset.id}/products`);
  return { success: "Product updated." };
}

export async function deleteProduct(
  datasetId: string,
  input: DeleteProductInput,
): Promise<ProductActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const parsed = deleteProductSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await db
    .delete(products)
    .where(
      and(eq(products.id, parsed.data.id), eq(products.datasetId, dataset.id)),
    );

  revalidatePath(`/dashboard/${dataset.id}/products`);
  return { success: "Product deleted." };
}
