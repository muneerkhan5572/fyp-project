import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { listDatesBetween } from "@/lib/analytics/range";
import { db } from "@/lib/db";
import { products, sales, trafficRecords } from "@/lib/db/schema";

type RangeBounds = { from: string | null; to: string };

function dateConditions(
  dateColumn: typeof sales.saleDate | typeof trafficRecords.trafficDate,
  range: RangeBounds,
) {
  const conditions = [lte(dateColumn, range.to)];
  if (range.from) {
    conditions.push(gte(dateColumn, range.from));
  }
  return conditions;
}

export const getDatasetDateBounds = cache(async (datasetId: string) => {
  const [row] = await db
    .select({
      minDate: sql<string | null>`min(${sales.saleDate})`,
      maxDate: sql<string | null>`max(${sales.saleDate})`,
    })
    .from(sales)
    .where(eq(sales.datasetId, datasetId));

  return {
    minDate: row?.minDate ?? null,
    maxDate: row?.maxDate ?? null,
  };
});

export const getProductDateBounds = cache(async (productId: string) => {
  const [row] = await db
    .select({
      minDate: sql<string | null>`min(${sales.saleDate})`,
      maxDate: sql<string | null>`max(${sales.saleDate})`,
    })
    .from(sales)
    .where(eq(sales.productId, productId));

  return {
    minDate: row?.minDate ?? null,
    maxDate: row?.maxDate ?? null,
  };
});

export type Kpis = {
  totalRevenue: number;
  totalUnits: number;
  avgDailyUnits: number;
  productCount: number;
};

export const getKpis = cache(
  async (datasetId: string, range: RangeBounds): Promise<Kpis> => {
    const [salesRow] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(${sales.revenue}), 0)::float`,
        totalUnits: sql<number>`coalesce(sum(${sales.quantity}), 0)::int`,
        minDate: sql<string | null>`min(${sales.saleDate})`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.datasetId, datasetId),
          ...dateConditions(sales.saleDate, range),
        ),
      );

    const [productRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.datasetId, datasetId));

    const effectiveFrom = range.from ?? salesRow?.minDate ?? range.to;
    const dayCount = listDatesBetween(effectiveFrom, range.to).length || 1;
    const totalUnits = salesRow?.totalUnits ?? 0;

    return {
      totalRevenue: salesRow?.totalRevenue ?? 0,
      totalUnits,
      avgDailyUnits: dayCount > 0 ? totalUnits / dayCount : 0,
      productCount: productRow?.count ?? 0,
    };
  },
);

export type DailyTrendPoint = { date: string; revenue: number; units: number };

export const getDailyTrend = cache(
  async (datasetId: string, range: RangeBounds): Promise<DailyTrendPoint[]> => {
    const rows = await db
      .select({
        date: sales.saleDate,
        revenue: sql<number>`coalesce(sum(${sales.revenue}), 0)::float`,
        units: sql<number>`coalesce(sum(${sales.quantity}), 0)::int`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.datasetId, datasetId),
          ...dateConditions(sales.saleDate, range),
        ),
      )
      .groupBy(sales.saleDate)
      .orderBy(sales.saleDate);

    if (!range.from) {
      return rows.map((row) => ({
        date: row.date,
        revenue: row.revenue,
        units: row.units,
      }));
    }

    const byDate = new Map(rows.map((row) => [row.date, row]));
    return listDatesBetween(range.from, range.to).map((date) => {
      const row = byDate.get(date);
      return { date, revenue: row?.revenue ?? 0, units: row?.units ?? 0 };
    });
  },
);

export type TrafficTrendPoint = { date: string; views: number };

export const getTrafficTrend = cache(
  async (
    datasetId: string,
    range: RangeBounds,
  ): Promise<TrafficTrendPoint[]> => {
    const rows = await db
      .select({
        date: trafficRecords.trafficDate,
        views: sql<number>`coalesce(sum(${trafficRecords.views}), 0)::int`,
      })
      .from(trafficRecords)
      .where(
        and(
          eq(trafficRecords.datasetId, datasetId),
          ...dateConditions(trafficRecords.trafficDate, range),
        ),
      )
      .groupBy(trafficRecords.trafficDate)
      .orderBy(trafficRecords.trafficDate);

    if (!range.from) {
      return rows.map((row) => ({ date: row.date, views: row.views }));
    }

    const byDate = new Map(rows.map((row) => [row.date, row]));
    return listDatesBetween(range.from, range.to).map((date) => ({
      date,
      views: byDate.get(date)?.views ?? 0,
    }));
  },
);

export type TopProduct = {
  productId: string;
  name: string;
  sku: string;
  units: number;
  revenue: number;
};

export const getTopProducts = cache(
  async (
    datasetId: string,
    range: RangeBounds,
    by: "units" | "revenue" = "revenue",
    limit = 10,
  ): Promise<TopProduct[]> => {
    const rows = await db
      .select({
        productId: sales.productId,
        name: products.name,
        sku: products.sku,
        units: sql<number>`coalesce(sum(${sales.quantity}), 0)::int`,
        revenue: sql<number>`coalesce(sum(${sales.revenue}), 0)::float`,
      })
      .from(sales)
      .innerJoin(products, eq(sales.productId, products.id))
      .where(
        and(
          eq(sales.datasetId, datasetId),
          ...dateConditions(sales.saleDate, range),
        ),
      )
      .groupBy(sales.productId, products.name, products.sku)
      .orderBy(
        by === "units"
          ? desc(sql`sum(${sales.quantity})`)
          : desc(sql`sum(${sales.revenue})`),
      )
      .limit(limit);

    return rows;
  },
);

export type CategoryBreakdownPoint = {
  category: string;
  revenue: number;
  units: number;
};

export const getCategoryBreakdown = cache(
  async (
    datasetId: string,
    range: RangeBounds,
  ): Promise<CategoryBreakdownPoint[]> => {
    const rows = await db
      .select({
        category: sql<string>`coalesce(${products.category}, 'Uncategorized')`,
        revenue: sql<number>`coalesce(sum(${sales.revenue}), 0)::float`,
        units: sql<number>`coalesce(sum(${sales.quantity}), 0)::int`,
      })
      .from(sales)
      .innerJoin(products, eq(sales.productId, products.id))
      .where(
        and(
          eq(sales.datasetId, datasetId),
          ...dateConditions(sales.saleDate, range),
        ),
      )
      .groupBy(sql`coalesce(${products.category}, 'Uncategorized')`)
      .orderBy(desc(sql`sum(${sales.revenue})`));

    return rows;
  },
);

export type ProductSeriesPoint = {
  date: string;
  units: number;
  revenue: number;
  views: number;
};

export const getProductSeries = cache(
  async (
    productId: string,
    range: RangeBounds,
  ): Promise<ProductSeriesPoint[]> => {
    const [salesRows, trafficRows] = await Promise.all([
      db
        .select({
          date: sales.saleDate,
          units: sql<number>`coalesce(sum(${sales.quantity}), 0)::int`,
          revenue: sql<number>`coalesce(sum(${sales.revenue}), 0)::float`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.productId, productId),
            ...dateConditions(sales.saleDate, range),
          ),
        )
        .groupBy(sales.saleDate),
      db
        .select({
          date: trafficRecords.trafficDate,
          views: sql<number>`coalesce(sum(${trafficRecords.views}), 0)::int`,
        })
        .from(trafficRecords)
        .where(
          and(
            eq(trafficRecords.productId, productId),
            ...dateConditions(trafficRecords.trafficDate, range),
          ),
        )
        .groupBy(trafficRecords.trafficDate),
    ]);

    const salesByDate = new Map(salesRows.map((row) => [row.date, row]));
    const trafficByDate = new Map(trafficRows.map((row) => [row.date, row]));

    if (!range.from) {
      const dates = Array.from(
        new Set([...salesByDate.keys(), ...trafficByDate.keys()]),
      ).sort();
      return dates.map((date) => ({
        date,
        units: salesByDate.get(date)?.units ?? 0,
        revenue: salesByDate.get(date)?.revenue ?? 0,
        views: trafficByDate.get(date)?.views ?? 0,
      }));
    }

    return listDatesBetween(range.from, range.to).map((date) => ({
      date,
      units: salesByDate.get(date)?.units ?? 0,
      revenue: salesByDate.get(date)?.revenue ?? 0,
      views: trafficByDate.get(date)?.views ?? 0,
    }));
  },
);
