"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset } from "@/lib/datasets/dal";
import { type ImportType, runImport } from "@/lib/imports/run-import";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const importTypeSchema = z.enum(["products", "sales", "traffic"], {
  error: "Invalid import type.",
});

export type ImportActionState = {
  error?: string;
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
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "File is too large — the limit is 8 MB." };
  }

  const content = await file.text();
  const result = await runImport(dataset.id, type, file.name, content);

  revalidatePath(`/dashboard/${dataset.id}/import`);
  revalidatePath(`/dashboard/${dataset.id}/${type}`);
  if (type !== "products") {
    revalidatePath(`/dashboard/${dataset.id}`);
  }

  redirect(`/dashboard/${dataset.id}/import/${result.importId}`);
}
