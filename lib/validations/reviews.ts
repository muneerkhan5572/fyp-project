import * as z from "zod";
import {
  dateString,
  dirParam,
  emptyToUndefined,
  pageParam,
  searchParam,
  sortParam,
} from "@/lib/validations/shared";

const REVIEWS_SORT_FIELDS = [
  "latestReviewDate",
  "productName",
  "reviewCount",
] as const;

export const reviewsListParamsSchema = z.object({
  page: pageParam,
  productId: z
    .preprocess(emptyToUndefined, z.uuid().optional())
    .catch(undefined),
  from: z.preprocess(emptyToUndefined, dateString.optional()).catch(undefined),
  to: z.preprocess(emptyToUndefined, dateString.optional()).catch(undefined),
  search: searchParam,
  searchMode: z.enum(["semantic", "lexical"]).catch("semantic"),
  sentiment: z
    .preprocess(
      emptyToUndefined,
      z.enum(["positive", "negative", "neutral"]).optional(),
    )
    .catch(undefined),
  sort: sortParam(REVIEWS_SORT_FIELDS, "latestReviewDate"),
  dir: dirParam("desc"),
});
