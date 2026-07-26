import * as z from "zod";
import { importStatus, importType } from "@/lib/db/schema";
import { pageParam, searchParam } from "@/lib/validations/shared";

export const importsListParamsSchema = z.object({
  page: pageParam,
  search: searchParam,
  type: z.enum(importType.enumValues).optional().catch(undefined),
  status: z.enum(importStatus.enumValues).optional().catch(undefined),
  importId: z.uuid().optional().catch(undefined),
});
