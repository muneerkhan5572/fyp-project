import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { imports } from "@/lib/db/schema";

export const listImports = cache((datasetId: string) => {
  return db
    .select()
    .from(imports)
    .where(eq(imports.datasetId, datasetId))
    .orderBy(desc(imports.createdAt));
});

export const getImport = cache(async (datasetId: string, importId: string) => {
  const [row] = await db
    .select()
    .from(imports)
    .where(and(eq(imports.id, importId), eq(imports.datasetId, datasetId)))
    .limit(1);

  return row ?? null;
});
