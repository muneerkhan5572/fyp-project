"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import { db } from "@/lib/db";
import { imports } from "@/lib/db/schema";
import { type ImportType, runImport } from "@/lib/imports/run-import";

const importTypeSchema = z.enum(["products", "sales", "traffic", "reviews"], {
  error: "Invalid import type.",
});

export type ImportActionState = {
  error?: string;
  success?: string;
};

export async function uploadCsv(
  datasetId: string,
  formData: FormData,
): Promise<ImportActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  const typeResult = importTypeSchema.safeParse(formData.get("type"));
  if (!typeResult.success) {
    return { error: "Invalid import type." };
  }
  const type: ImportType = typeResult.data;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to upload." };
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { error: "Only .csv files are supported." };
  }

  const content = await file.text();
  const result = await runImport(dataset.id, type, file.name, content);

  revalidatePath(`/dashboard/${dataset.id}`, "layout");

  redirect(`/dashboard/${dataset.id}/import?importId=${result.importId}`);
}

export async function deleteImport(
  datasetId: string,
  input: { id: string },
): Promise<ImportActionState> {
  const { userId } = await verifySession();
  const dataset = await getOwnedDataset(datasetId, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  await db
    .delete(imports)
    .where(and(eq(imports.id, input.id), eq(imports.datasetId, dataset.id)));

  revalidatePath(`/dashboard/${dataset.id}/import`);

  return { success: "Import removed from history." };
}
