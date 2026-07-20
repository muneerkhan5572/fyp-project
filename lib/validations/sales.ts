import * as z from "zod";
import { dateString, emptyToUndefined } from "@/lib/validations/shared";

const productId = z.uuid({ error: "Select a product." });

const quantity = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be a whole number." })
    .nonnegative({ error: "Quantity must be zero or greater." }),
);

const revenue = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Revenue must be a number." })
    .nonnegative({ error: "Revenue must be zero or greater." }),
);

export const saleFormSchema = z.object({
  productId,
  saleDate: dateString,
  quantity,
  revenue,
});

export const updateSaleSchema = saleFormSchema.extend({
  id: z.uuid({ error: "Invalid sale id." }),
});

export const deleteSaleSchema = z.object({
  id: z.uuid({ error: "Invalid sale id." }),
});

export type DeleteSaleInput = z.infer<typeof deleteSaleSchema>;

// Raw shape the form holds and submits (every field a string). Server
// actions re-validate/coerce with saleFormSchema — see productFormSchema
// in lib/validations/products.ts for why these can't share a type.
export type SaleFormValues = {
  productId: string;
  saleDate: string;
  quantity: string;
  revenue: string;
};

export type UpdateSaleValues = SaleFormValues & { id: string };

export const saleFormClientSchema = z.object({
  productId: z.string().min(1, { error: "Select a product." }),
  saleDate: dateString,
  quantity: z
    .string()
    .refine((value) => value.trim() !== "", {
      error: "Quantity is required.",
    })
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, {
      error: "Quantity must be a whole non-negative number.",
    }),
  revenue: z
    .string()
    .refine((value) => value.trim() !== "", { error: "Revenue is required." })
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      error: "Revenue must be zero or greater.",
    }),
});
