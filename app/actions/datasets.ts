"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";
import { env } from "@/env";
import { verifySession } from "@/lib/auth/dal";
import { getOwnedDataset, LAST_DATASET_COOKIE_NAME } from "@/lib/datasets/dal";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import { datasets } from "@/lib/db/schema";
import {
  type CreateDatasetInput,
  createDatasetSchema,
  type DeleteDatasetInput,
  deleteDatasetSchema,
  type RenameDatasetInput,
  renameDatasetSchema,
  type UpdateDatasetThresholdsValues,
  updateDatasetThresholdsSchema,
} from "@/lib/validations/datasets";

export type DatasetActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

export async function createDataset(
  input: CreateDatasetInput,
): Promise<DatasetActionState> {
  const { userId } = await verifySession();
  const parsed = createDatasetSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let datasetId: string;
  try {
    const [dataset] = await db
      .insert(datasets)
      .values({ userId, name: parsed.data.name })
      .returning({ id: datasets.id });

    if (!dataset) {
      return { error: "Something went wrong creating your dataset." };
    }
    datasetId = dataset.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: {
          name: ["You already have a dataset with this name."],
        },
      };
    }
    throw error;
  }

  const cookieStore = await cookies();
  cookieStore.set(LAST_DATASET_COOKIE_NAME, datasetId, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${datasetId}`);
}

export async function renameDataset(
  input: RenameDatasetInput,
): Promise<DatasetActionState> {
  const { userId } = await verifySession();
  const parsed = renameDatasetSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const dataset = await getOwnedDataset(parsed.data.id, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  try {
    await db
      .update(datasets)
      .set({ name: parsed.data.name })
      .where(and(eq(datasets.id, dataset.id), eq(datasets.userId, userId)));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: {
          name: ["You already have a dataset with this name."],
        },
      };
    }
    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${dataset.id}`, "layout");
  return { success: "Dataset renamed." };
}

export async function deleteDataset(
  input: DeleteDatasetInput,
): Promise<DatasetActionState> {
  const { userId } = await verifySession();
  const parsed = deleteDatasetSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const dataset = await getOwnedDataset(parsed.data.id, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  if (parsed.data.confirmName !== dataset.name) {
    return {
      fieldErrors: {
        confirmName: ["Type the exact dataset name to confirm."],
      },
    };
  }

  await db
    .delete(datasets)
    .where(and(eq(datasets.id, dataset.id), eq(datasets.userId, userId)));

  const cookieStore = await cookies();
  if (cookieStore.get(LAST_DATASET_COOKIE_NAME)?.value === dataset.id) {
    cookieStore.delete(LAST_DATASET_COOKIE_NAME);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?all=1");
}

export async function updateDatasetThresholds(
  input: UpdateDatasetThresholdsValues,
): Promise<DatasetActionState> {
  const { userId } = await verifySession();
  const parsed = updateDatasetThresholdsSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const dataset = await getOwnedDataset(parsed.data.id, userId);
  if (!dataset) {
    return { error: "Dataset not found." };
  }

  await db
    .update(datasets)
    .set({
      slowVelocityThreshold: parsed.data.slowVelocityThreshold.toString(),
      highVelocityThreshold: parsed.data.highVelocityThreshold.toString(),
      velocityWindowDays: parsed.data.velocityWindowDays,
    })
    .where(and(eq(datasets.id, dataset.id), eq(datasets.userId, userId)));

  revalidatePath(`/dashboard/${dataset.id}`, "layout");
  return { success: "Classification thresholds updated." };
}
