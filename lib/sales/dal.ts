import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { products, sales } from "@/lib/db/schema";

export const SALES_PAGE_SIZE = 25;

export type PagedSalesParams = {
  page?: number;
  productId?: string;
  from?: string;
  to?: string;
};

export const pagedSales = cache(
  async (datasetId: string, params: PagedSalesParams = {}) => {
    const page = Math.max(1, params.page ?? 1);

    const conditions = [eq(sales.datasetId, datasetId)];
    if (params.productId) {
      conditions.push(eq(sales.productId, params.productId));
    }
    if (params.from) {
      conditions.push(gte(sales.saleDate, params.from));
    }
    if (params.to) {
      conditions.push(lte(sales.saleDate, params.to));
    }
    const where = and(...conditions);

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: sales.id,
          productId: sales.productId,
          productName: products.name,
          productSku: products.sku,
          saleDate: sales.saleDate,
          quantity: sales.quantity,
          revenue: sales.revenue,
        })
        .from(sales)
        .innerJoin(products, eq(sales.productId, products.id))
        .where(where)
        .orderBy(desc(sales.saleDate), asc(products.name))
        .limit(SALES_PAGE_SIZE)
        .offset((page - 1) * SALES_PAGE_SIZE),
      db.select({ count: sql<number>`count(*)::int` }).from(sales).where(where),
    ]);

    const total = countRows[0]?.count ?? 0;

    return {
      rows,
      total,
      page,
      pageSize: SALES_PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(total / SALES_PAGE_SIZE)),
    };
  },
);

export const hasAnySales = cache(async (datasetId: string) => {
  const [row] = await db
    .select({ id: sales.id })
    .from(sales)
    .where(eq(sales.datasetId, datasetId))
    .limit(1);

  return Boolean(row);
});

export const getSale = cache(async (datasetId: string, saleId: string) => {
  const [sale] = await db
    .select()
    .from(sales)
    .where(and(eq(sales.id, saleId), eq(sales.datasetId, datasetId)))
    .limit(1);

  return sale ?? null;
});
