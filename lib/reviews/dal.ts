import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { products, reviews } from "@/lib/db/schema";
import { matchProductIdsForSearch } from "@/lib/products/search-match";

export type ReviewFilterParams = {
  productId?: string;
  from?: string;
  to?: string;
  search?: string;
  searchMode?: "semantic" | "lexical";
  sentiment?: "positive" | "negative" | "neutral";
};

export type PagedReviewedProductsParams = ReviewFilterParams & {
  page?: number;
  sort?: "latestReviewDate" | "productName" | "reviewCount";
  dir?: "asc" | "desc";
};

const REVIEWED_PRODUCTS_SORT_COLUMNS = {
  latestReviewDate: sql`max(${reviews.reviewDate})`,
  productName: products.name,
  reviewCount: sql`count(*)`,
};

async function buildReviewConditions(
  datasetId: string,
  params: ReviewFilterParams,
) {
  const conditions = [eq(reviews.datasetId, datasetId)];
  if (params.productId) {
    conditions.push(eq(reviews.productId, params.productId));
  }
  if (params.from) {
    conditions.push(gte(reviews.reviewDate, params.from));
  }
  if (params.to) {
    conditions.push(lte(reviews.reviewDate, params.to));
  }
  if (params.sentiment) {
    conditions.push(eq(reviews.sentimentLabel, params.sentiment));
  }

  const query = params.search?.trim();
  let semanticError: string | undefined;

  if (query) {
    const match = await matchProductIdsForSearch(
      datasetId,
      query,
      params.searchMode,
    );
    semanticError = match.semanticError;
    if (match.productIds.length === 0) {
      return { conditions: null, semanticError };
    }
    conditions.push(inArray(reviews.productId, match.productIds));
  }

  return { conditions, semanticError };
}

export const pagedReviewedProducts = cache(
  async (datasetId: string, params: PagedReviewedProductsParams = {}) => {
    const page = Math.max(1, params.page ?? 1);
    const { conditions, semanticError } = await buildReviewConditions(
      datasetId,
      params,
    );

    if (!conditions) {
      return {
        rows: [],
        total: 0,
        page: 1,
        pageSize: TABLE_PAGE_SIZE,
        pageCount: 1,
        semanticError,
      };
    }

    const where = and(...conditions);
    const sortColumn =
      REVIEWED_PRODUCTS_SORT_COLUMNS[params.sort ?? "latestReviewDate"];
    const direction = params.dir === "asc" ? asc : desc;

    const pagedRows = await db
      .select({
        productId: reviews.productId,
        productName: products.name,
        productSku: products.sku,
        reviewCount: sql<number>`count(*)::int`,
        latestReviewDate: sql<string | null>`max(${reviews.reviewDate})`,
        total: sql<number>`count(*) over ()::int`,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(where)
      .groupBy(reviews.productId, products.name, products.sku)
      .orderBy(direction(sortColumn), asc(products.name))
      .limit(TABLE_PAGE_SIZE)
      .offset((page - 1) * TABLE_PAGE_SIZE);

    let total = pagedRows[0]?.total ?? 0;
    if (pagedRows.length === 0 && page > 1) {
      const [countRow] = await db
        .select({
          count: sql<number>`count(distinct ${reviews.productId})::int`,
        })
        .from(reviews)
        .innerJoin(products, eq(reviews.productId, products.id))
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

export type ListReviewsFilterParams = Omit<
  ReviewFilterParams,
  "search" | "searchMode" | "productId"
>;

export type ReviewRow = {
  id: string;
  productId: string;
  reviewDate: string | null;
  reviewText: string;
  rating: number | null;
  sentimentLabel: "positive" | "negative" | "neutral" | null;
  sentimentScore: string | null;
};

export const listReviewsForProducts = cache(
  async (
    datasetId: string,
    productIds: string[],
    params: ListReviewsFilterParams = {},
  ): Promise<ReviewRow[]> => {
    if (productIds.length === 0) {
      return [];
    }

    const conditions = [
      eq(reviews.datasetId, datasetId),
      inArray(reviews.productId, productIds),
    ];
    if (params.from) {
      conditions.push(gte(reviews.reviewDate, params.from));
    }
    if (params.to) {
      conditions.push(lte(reviews.reviewDate, params.to));
    }
    if (params.sentiment) {
      conditions.push(eq(reviews.sentimentLabel, params.sentiment));
    }

    return await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        reviewDate: reviews.reviewDate,
        reviewText: reviews.reviewText,
        rating: reviews.rating,
        sentimentLabel: reviews.sentimentLabel,
        sentimentScore: reviews.sentimentScore,
      })
      .from(reviews)
      .where(and(...conditions))
      .orderBy(desc(reviews.reviewDate));
  },
);

export const hasAnyReviews = cache(async (datasetId: string) => {
  const [row] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.datasetId, datasetId))
    .limit(1);

  return Boolean(row);
});

export type ReviewSentimentCounts = {
  total: number;
  done: number;
};

export const getReviewSentimentCounts = cache(
  async (datasetId: string): Promise<ReviewSentimentCounts> => {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${reviews.sentimentLabel} is not null)::int`,
      })
      .from(reviews)
      .where(eq(reviews.datasetId, datasetId));

    return row ?? { total: 0, done: 0 };
  },
);
