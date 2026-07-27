import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { products, trafficRecords } from "@/lib/db/schema";
import { matchProductIdsForSearch } from "@/lib/products/search-match";

export type PagedTrafficParams = {
  page?: number;
  productId?: string;
  from?: string;
  to?: string;
  search?: string;
  sort?: "trafficDate" | "productName" | "views";
  dir?: "asc" | "desc";
};

const TRAFFIC_SORT_COLUMNS = {
  trafficDate: trafficRecords.trafficDate,
  productName: products.name,
  views: trafficRecords.views,
};

export const pagedTraffic = cache(
  async (datasetId: string, params: PagedTrafficParams = {}) => {
    const page = Math.max(1, params.page ?? 1);
    const query = params.search?.trim();

    const conditions = [eq(trafficRecords.datasetId, datasetId)];
    if (params.productId) {
      conditions.push(eq(trafficRecords.productId, params.productId));
    }
    if (params.from) {
      conditions.push(gte(trafficRecords.trafficDate, params.from));
    }
    if (params.to) {
      conditions.push(lte(trafficRecords.trafficDate, params.to));
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
      conditions.push(inArray(trafficRecords.productId, match.productIds));
    }

    const where = and(...conditions);

    const sortColumn = TRAFFIC_SORT_COLUMNS[params.sort ?? "trafficDate"];
    const direction = params.dir === "asc" ? asc : desc;

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: trafficRecords.id,
          productId: trafficRecords.productId,
          productName: products.name,
          productSku: products.sku,
          trafficDate: trafficRecords.trafficDate,
          views: trafficRecords.views,
        })
        .from(trafficRecords)
        .innerJoin(products, eq(trafficRecords.productId, products.id))
        .where(where)
        .orderBy(direction(sortColumn), asc(products.name))
        .limit(TABLE_PAGE_SIZE)
        .offset((page - 1) * TABLE_PAGE_SIZE),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(trafficRecords)
        .innerJoin(products, eq(trafficRecords.productId, products.id))
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

export const hasAnyTraffic = cache(async (datasetId: string) => {
  const [row] = await db
    .select({ id: trafficRecords.id })
    .from(trafficRecords)
    .where(eq(trafficRecords.datasetId, datasetId))
    .limit(1);

  return Boolean(row);
});

export const getTrafficRecord = cache(
  async (datasetId: string, trafficRecordId: string) => {
    const [record] = await db
      .select()
      .from(trafficRecords)
      .where(
        and(
          eq(trafficRecords.id, trafficRecordId),
          eq(trafficRecords.datasetId, datasetId),
        ),
      )
      .limit(1);

    return record ?? null;
  },
);
