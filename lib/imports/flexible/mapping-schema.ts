import * as z from "zod";

export const CANONICAL_FIELD_KEYS = [
  "name",
  "sku",
  "category",
  "price",
  "cost",
  "stock",
  "date",
  "quantity",
  "revenue",
] as const;

export type FieldKey = (typeof CANONICAL_FIELD_KEYS)[number];

export const DATE_FORMATS = [
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "ISO_DATETIME",
] as const;

export type DateFormat = (typeof DATE_FORMATS)[number];

const fieldMappingSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("column"),
    sourceHeader: z.string().trim().min(1, { error: "Choose a column." }),
  }),
  z.object({ kind: z.literal("constant"), value: z.string() }),
  z.object({ kind: z.literal("unmapped") }),
]);

export type FieldMapping = z.infer<typeof fieldMappingSchema>;

export const UNMAPPED_FIELD: FieldMapping = { kind: "unmapped" };

export const importMappingSchema = z
  .object({
    fields: z.object({
      name: fieldMappingSchema,
      sku: fieldMappingSchema,
      category: fieldMappingSchema,
      price: fieldMappingSchema,
      cost: fieldMappingSchema,
      stock: fieldMappingSchema,
      date: fieldMappingSchema,
      quantity: fieldMappingSchema,
      revenue: fieldMappingSchema,
    }),
    dateFormat: z.enum(DATE_FORMATS, { error: "Choose a date format." }),
    deriveRevenue: z.boolean(),
  })
  .refine(
    (data) =>
      data.fields.name.kind !== "unmapped" ||
      data.fields.sku.kind !== "unmapped",
    {
      error: "Map a product name or SKU column to identify products.",
      path: ["fields", "name"],
    },
  )
  .refine((data) => data.fields.date.kind !== "unmapped", {
    error: "Map a date column.",
    path: ["fields", "date"],
  })
  .refine((data) => data.fields.quantity.kind !== "unmapped", {
    error: "Map a quantity column.",
    path: ["fields", "quantity"],
  })
  .refine((data) => data.fields.price.kind !== "unmapped", {
    error: "Map a price column, or a constant price.",
    path: ["fields", "price"],
  })
  .refine(
    (data) =>
      !data.deriveRevenue ||
      (data.fields.price.kind !== "unmapped" &&
        data.fields.quantity.kind !== "unmapped"),
    {
      error: "Deriving revenue needs both price and quantity mapped.",
      path: ["deriveRevenue"],
    },
  )
  .refine(
    (data) => data.deriveRevenue || data.fields.revenue.kind !== "unmapped",
    {
      error:
        "Map a revenue column, or enable deriving revenue from price × quantity.",
      path: ["fields", "revenue"],
    },
  );

export type ImportMapping = z.infer<typeof importMappingSchema>;
