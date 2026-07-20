import * as z from "zod";
import { dateString, emptyToUndefined } from "@/lib/validations/shared";

const productId = z.uuid({ error: "Select a product." });

const views = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Views must be a number." })
    .int({ error: "Views must be a whole number." })
    .nonnegative({ error: "Views must be zero or greater." }),
);

export const trafficFormSchema = z.object({
  productId,
  trafficDate: dateString,
  views,
});

export const updateTrafficSchema = trafficFormSchema.extend({
  id: z.uuid({ error: "Invalid traffic record id." }),
});

export const deleteTrafficSchema = z.object({
  id: z.uuid({ error: "Invalid traffic record id." }),
});

export type DeleteTrafficInput = z.infer<typeof deleteTrafficSchema>;

// Raw shape the form holds and submits (every field a string). Server
// actions re-validate/coerce with trafficFormSchema — see
// productFormSchema in lib/validations/products.ts for why these can't
// share a type.
export type TrafficFormValues = {
  productId: string;
  trafficDate: string;
  views: string;
};

export type UpdateTrafficValues = TrafficFormValues & { id: string };

export const trafficFormClientSchema = z.object({
  productId: z.string().min(1, { error: "Select a product." }),
  trafficDate: dateString,
  views: z
    .string()
    .refine((value) => value.trim() !== "", { error: "Views is required." })
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, {
      error: "Views must be a whole non-negative number.",
    }),
});
