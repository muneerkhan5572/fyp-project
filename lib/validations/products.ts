import * as z from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const name = z
  .string()
  .trim()
  .min(1, { error: "Name is required." })
  .max(120, { error: "Name must be at most 120 characters long." });

const sku = z
  .string()
  .trim()
  .min(1, { error: "SKU is required." })
  .max(64, { error: "SKU must be at most 64 characters long." })
  .regex(/^[A-Za-z0-9._-]+$/, {
    error:
      "SKU can only contain letters, numbers, dots, underscores, and hyphens.",
  })
  .transform((value) => value.toUpperCase());

const category = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(60, { error: "Category must be at most 60 characters long." })
    .optional(),
);

const price = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Price must be a number." })
    .nonnegative({ error: "Price must be zero or greater." }),
);

const cost = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Cost must be a number." })
    .nonnegative({ error: "Cost must be zero or greater." })
    .optional(),
);

const stock = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Stock must be a number." })
    .int({ error: "Stock must be a whole number." })
    .nonnegative({ error: "Stock must be zero or greater." })
    .optional(),
);

export const productFormSchema = z.object({
  name,
  sku,
  category,
  price,
  cost,
  stock,
});

export const updateProductSchema = productFormSchema.extend({
  id: z.uuid({ error: "Invalid product id." }),
});

export const deleteProductSchema = z.object({
  id: z.uuid({ error: "Invalid product id." }),
});

export type DeleteProductInput = z.infer<typeof deleteProductSchema>;

// The raw shape the form actually holds and submits (every field is a
// string, since inputs are uncontrolled-by-type). Server actions accept
// this and re-validate/coerce with productFormSchema — that schema's own
// z.infer is the *parsed* output (price: number, etc.), not what callers
// send, so it can't be reused as the action parameter type.
export type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  price: string;
  cost: string;
  stock: string;
};

export type UpdateProductValues = ProductFormValues & { id: string };

// Client-side validator matching the raw string shape above, used for
// inline TanStack Form field errors as the user types. The server action
// re-validates with productFormSchema regardless — this is UX only.
export const productFormClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required." })
    .max(120, { error: "Name must be at most 120 characters long." }),
  sku: z
    .string()
    .trim()
    .min(1, { error: "SKU is required." })
    .max(64, { error: "SKU must be at most 64 characters long." })
    .regex(/^[A-Za-z0-9._-]+$/, {
      error:
        "SKU can only contain letters, numbers, dots, underscores, and hyphens.",
    }),
  category: z
    .string()
    .max(60, { error: "Category must be at most 60 characters long." }),
  price: z
    .string()
    .refine((value) => value.trim() !== "", { error: "Price is required." })
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      error: "Price must be zero or greater.",
    }),
  cost: z
    .string()
    .refine(
      (value) =>
        value.trim() === "" ||
        (!Number.isNaN(Number(value)) && Number(value) >= 0),
      { error: "Cost must be zero or greater." },
    ),
  stock: z
    .string()
    .refine(
      (value) =>
        value.trim() === "" ||
        (Number.isInteger(Number(value)) && Number(value) >= 0),
      { error: "Stock must be a whole non-negative number." },
    ),
});
