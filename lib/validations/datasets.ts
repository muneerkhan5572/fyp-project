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

export type CreateDatasetInput = z.infer<typeof createDatasetSchema>;
export type RenameDatasetInput = z.infer<typeof renameDatasetSchema>;
export type DeleteDatasetInput = z.infer<typeof deleteDatasetSchema>;
