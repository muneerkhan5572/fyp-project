import "server-only";
import { and, desc, eq, ilike, type SQL, sql } from "drizzle-orm";
import { cache } from "react";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { type Import, imports } from "@/lib/db/schema";

export type PagedImportsParams = {
  page?: number;
  search?: string;
  type?: Import["type"];
  status?: Import["status"];
};

export const pagedImports = cache(
  async (datasetId: string, params: PagedImportsParams = {}) => {
    const page = Math.max(1, params.page ?? 1);

    const conditions: SQL[] = [eq(imports.datasetId, datasetId)];
    if (params.type) {
      conditions.push(eq(imports.type, params.type));
    }
    if (params.status) {
      conditions.push(eq(imports.status, params.status));
    }
    if (params.search) {
      conditions.push(ilike(imports.fileName, `%${params.search}%`));
    }
    const where = and(...conditions);

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(imports)
        .where(where)
        .orderBy(desc(imports.createdAt))
        .limit(TABLE_PAGE_SIZE)
        .offset((page - 1) * TABLE_PAGE_SIZE),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(imports)
        .where(where),
    ]);

    const total = countRows[0]?.count ?? 0;

    return {
      rows,
      total,
      page,
      pageSize: TABLE_PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE)),
    };
  },
);

export const getImport = cache(async (datasetId: string, importId: string) => {
  const [row] = await db
    .select()
    .from(imports)
    .where(and(eq(imports.id, importId), eq(imports.datasetId, datasetId)))
    .limit(1);

  return row ?? null;
});
