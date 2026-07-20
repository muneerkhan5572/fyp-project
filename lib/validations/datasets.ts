import * as z from "zod";

const name = z
  .string()
  .trim()
  .min(2, { error: "Name must be at least 2 characters long." })
  .max(64, { error: "Name must be at most 64 characters long." });

const id = z.uuid({ error: "Invalid dataset id." });

export const createDatasetSchema = z.object({ name });

export const renameDatasetSchema = z.object({ id, name });

export const deleteDatasetSchema = z.object({
  id,
  confirmName: z
    .string()
    .trim()
    .min(1, { error: "Type the dataset name to confirm deletion." }),
});

export const updateDatasetThresholdsSchema = z
  .object({
    id,
    slowVelocityThreshold: z.coerce
      .number({ error: "Must be a number." })
      .nonnegative({ error: "Must be zero or greater." }),
    highVelocityThreshold: z.coerce
      .number({ error: "Must be a number." })
      .nonnegative({ error: "Must be zero or greater." }),
    velocityWindowDays: z.coerce
      .number({ error: "Must be a number." })
      .int({ error: "Must be a whole number." })
      .min(7, { error: "Must be at least 7 days." })
      .max(365, { error: "Must be at most 365 days." }),
  })
  .refine((data) => data.highVelocityThreshold > data.slowVelocityThreshold, {
    error:
      "The high-demand threshold must be greater than the slow-mover threshold.",
    path: ["highVelocityThreshold"],
  });

export type CreateDatasetInput = z.infer<typeof createDatasetSchema>;
export type RenameDatasetInput = z.infer<typeof renameDatasetSchema>;
export type DeleteDatasetInput = z.infer<typeof deleteDatasetSchema>;

export type UpdateDatasetThresholdsValues = {
  id: string;
  slowVelocityThreshold: string;
  highVelocityThreshold: string;
  velocityWindowDays: string;
};

export const updateDatasetThresholdsClientSchema = z
  .object({
    slowVelocityThreshold: z
      .string()
      .refine((value) => value.trim() !== "", { error: "Required." })
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
        error: "Must be zero or greater.",
      }),
    highVelocityThreshold: z
      .string()
      .refine((value) => value.trim() !== "", { error: "Required." })
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
        error: "Must be zero or greater.",
      }),
    velocityWindowDays: z
      .string()
      .refine((value) => value.trim() !== "", { error: "Required." })
      .refine(
        (value) =>
          Number.isInteger(Number(value)) &&
          Number(value) >= 7 &&
          Number(value) <= 365,
        { error: "Must be a whole number between 7 and 365." },
      ),
  })
  .refine(
    (data) =>
      Number(data.highVelocityThreshold) > Number(data.slowVelocityThreshold),
    {
      error:
        "The high-demand threshold must be greater than the slow-mover threshold.",
      path: ["highVelocityThreshold"],
    },
  );
