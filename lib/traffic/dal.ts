import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { products, trafficRecords } from "@/lib/db/schema";

export const TRAFFIC_PAGE_SIZE = 25;

export type PagedTrafficParams = {
  page?: number;
  productId?: string;
  from?: string;
  to?: string;
};

export const pagedTraffic = cache(
  async (datasetId: string, params: PagedTrafficParams = {}) => {
    const page = Math.max(1, params.page ?? 1);

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
    const where = and(...conditions);

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
        .orderBy(desc(trafficRecords.trafficDate), asc(products.name))
        .limit(TRAFFIC_PAGE_SIZE)
        .offset((page - 1) * TRAFFIC_PAGE_SIZE),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(trafficRecords)
        .where(where),
    ]);

    const total = countRows[0]?.count ?? 0;

    return {
      rows,
      total,
      page,
      pageSize: TRAFFIC_PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(total / TRAFFIC_PAGE_SIZE)),
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
