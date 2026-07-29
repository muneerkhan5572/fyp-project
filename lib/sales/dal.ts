import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { products, sales } from "@/lib/db/schema";
import { matchProductIdsForSearch } from "@/lib/products/search-match";

export type PagedSalesParams = {
  page?: number;
  productId?: string;
  from?: string;
  to?: string;
  search?: string;
  sort?: "saleDate" | "productName" | "quantity" | "revenue";
  dir?: "asc" | "desc";
};

const SALES_SORT_COLUMNS = {
  saleDate: sales.saleDate,
  productName: products.name,
  quantity: sales.quantity,
  revenue: sales.revenue,
};

export const pagedSales = cache(
  async (datasetId: string, params: PagedSalesParams = {}) => {
    const page = Math.max(1, params.page ?? 1);
    const query = params.search?.trim();

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

    let semanticError: string | undefined;

    if (query) {
      const match = await matchProductIdsForSearch(datasetId, query);
      semanticError = match.semanticError;
      if (match.productIds.length === 0) {
        return {
          rows: [],
          total: 0,
          page: 1,
          pageSize: TABLE_PAGE_SIZE,
          pageCount: 1,
          semanticError,
        };
      }
      conditions.push(inArray(sales.productId, match.productIds));
    }

    const where = and(...conditions);

    const sortColumn = SALES_SORT_COLUMNS[params.sort ?? "saleDate"];
    const direction = params.dir === "asc" ? asc : desc;

    const pagedRows = await db
      .select({
        id: sales.id,
        productId: sales.productId,
        productName: products.name,
        productSku: products.sku,
        saleDate: sales.saleDate,
        quantity: sales.quantity,
        revenue: sales.revenue,
        total: sql<number>`count(*) over ()::int`,
      })
      .from(sales)
      .innerJoin(products, eq(sales.productId, products.id))
      .where(where)
      .orderBy(direction(sortColumn), asc(products.name))
      .limit(TABLE_PAGE_SIZE)
      .offset((page - 1) * TABLE_PAGE_SIZE);

    let total = pagedRows[0]?.total ?? 0;
    if (pagedRows.length === 0 && page > 1) {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sales)
        .innerJoin(products, eq(sales.productId, products.id))
        .where(where);
      total = countRow?.count ?? 0;
    }

    const rows = pagedRows.map(({ total: _total, ...row }) => row);

    return {
      rows,
      total,
      page,
      pageSize: TABLE_PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE)),
      semanticError,
    };
  },
);

export const listAllSalesForDataset = cache((datasetId: string) => {
  return db
    .select({
      productId: sales.productId,
      saleDate: sales.saleDate,
      quantity: sales.quantity,
      revenue: sales.revenue,
    })
    .from(sales)
    .where(eq(sales.datasetId, datasetId))
    .orderBy(asc(sales.saleDate));
});

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
