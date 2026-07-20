import * as z from "zod";
import { dateString, emptyToUndefined } from "@/lib/validations/shared";

const skuField = z
  .string()
  .trim()
  .min(1, { error: "SKU is required." })
  .max(64, { error: "SKU must be at most 64 characters long." })
  .regex(/^[A-Za-z0-9._-]+$/, {
    error:
      "SKU can only contain letters, numbers, dots, underscores, and hyphens.",
  })
  .transform((value) => value.toUpperCase());

export const PRODUCT_REQUIRED_HEADERS = ["name", "sku", "price"];
export const SALE_REQUIRED_HEADERS = ["sku", "date", "quantity", "revenue"];
export const TRAFFIC_REQUIRED_HEADERS = ["sku", "date", "views"];

export const productRowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required." })
    .max(120, { error: "Name must be at most 120 characters long." }),
  sku: skuField,
  category: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(60, { error: "Category must be at most 60 characters long." })
      .optional(),
  ),
  price: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Price must be a number." })
      .nonnegative({ error: "Price must be zero or greater." }),
  ),
  cost: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Cost must be a number." })
      .nonnegative({ error: "Cost must be zero or greater." })
      .optional(),
  ),
  stock: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Stock must be a number." })
      .int({ error: "Stock must be a whole number." })
      .nonnegative({ error: "Stock must be zero or greater." })
      .optional(),
  ),
});

export type ProductRow = z.infer<typeof productRowSchema>;

export const saleRowSchema = z.object({
  sku: skuField,
  date: dateString,
  quantity: z.coerce
    .number({ error: "Quantity must be a number." })
    .int({ error: "Quantity must be a whole number." })
    .nonnegative({ error: "Quantity must be zero or greater." }),
  revenue: z.coerce
    .number({ error: "Revenue must be a number." })
    .nonnegative({ error: "Revenue must be zero or greater." }),
});

export type SaleRow = z.infer<typeof saleRowSchema>;

export const trafficRowSchema = z.object({
  sku: skuField,
  date: dateString,
  views: z.coerce
    .number({ error: "Views must be a number." })
    .int({ error: "Views must be a whole number." })
    .nonnegative({ error: "Views must be zero or greater." }),
});

export type TrafficRow = z.infer<typeof trafficRowSchema>;
