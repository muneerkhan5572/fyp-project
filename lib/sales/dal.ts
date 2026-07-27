import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { runSemanticSearch } from "@/lib/analytics/semantic-search";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { products, sales } from "@/lib/db/schema";
import { listProducts } from "@/lib/products/dal";

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

async function matchProductIdsForSearch(datasetId: string, query: string) {
  const allProducts = await listProducts(datasetId);
  const needle = query.toLowerCase();
  const substringMatches = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(needle) ||
      product.sku.toLowerCase().includes(needle),
  );

  const result = await runSemanticSearch(allProducts, query);
  if (!result.success) {
    return {
      productIds: substringMatches.map((product) => product.id),
      semanticError: result.error as string | undefined,
    };
  }

  const bySku = new Map(allProducts.map((product) => [product.sku, product]));
  const ranked = result.skus
    .map((sku) => bySku.get(sku))
    .filter((product): product is (typeof allProducts)[number] =>
      Boolean(product),
    );
  const seen = new Set(ranked.map((product) => product.id));
  const matched = [
    ...ranked,
    ...substringMatches.filter((product) => !seen.has(product.id)),
  ];

  return {
    productIds: matched.map((product) => product.id),
    semanticError: undefined as string | undefined,
  };
}

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
        .orderBy(direction(sortColumn), asc(products.name))
        .limit(TABLE_PAGE_SIZE)
        .offset((page - 1) * TABLE_PAGE_SIZE),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(sales)
        .innerJoin(products, eq(sales.productId, products.id))
        .where(where),
    ]);

    const total = countRows[0]?.count ?? 0;

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
