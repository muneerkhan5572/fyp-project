import "server-only";
import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { cache } from "react";
import { runSemanticSearch } from "@/lib/analytics/semantic-search";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { UNCATEGORIZED_CATEGORY } from "@/lib/products/constants";

export const listProducts = cache((datasetId: string) => {
  return db
    .select()
    .from(products)
    .where(eq(products.datasetId, datasetId))
    .orderBy(asc(products.name));
});

export const getProduct = cache(
  async (datasetId: string, productId: string) => {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.datasetId, datasetId)))
      .limit(1);

    return product ?? null;
  },
);

export const listCategories = cache(async (datasetId: string) => {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.datasetId, datasetId));

  return rows
    .map((row) => row.category)
    .filter((category): category is string => Boolean(category))
    .sort((a, b) => a.localeCompare(b));
});

export const hasAnyProducts = cache(async (datasetId: string) => {
  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.datasetId, datasetId))
    .limit(1);

  return Boolean(row);
});

export type PagedProductsParams = {
  page?: number;
  category?: string;
  mode?: "exact" | "semantic";
  search?: string;
  sort?: "name" | "sku" | "category" | "price" | "stock";
  dir?: "asc" | "desc";
};

const PRODUCTS_SORT_COLUMNS = {
  name: products.name,
  sku: products.sku,
  category: products.category,
  price: products.price,
  stock: products.stock,
};

function matchesCategory<T extends { category: string | null }>(
  product: T,
  category: string,
) {
  return category === UNCATEGORIZED_CATEGORY
    ? !product.category
    : product.category === category;
}

// Semantic mode is fully server-driven: the ranked SKU list is recomputed on
// every request (page/category change included) rather than cached
// client-side, then sliced for the current page — same paged shape as exact
// mode. Bounded by catalog size (one ML call over the whole dataset), so this
// is acceptable cost for a per-request re-rank.
async function pagedProductsSemantic(
  datasetId: string,
  params: PagedProductsParams,
) {
  const page = Math.max(1, params.page ?? 1);
  const query = params.search?.trim();

  if (!query) {
    return {
      rows: [],
      total: 0,
      page: 1,
      pageSize: TABLE_PAGE_SIZE,
      pageCount: 1,
      semanticError: undefined as string | undefined,
    };
  }

  const allProducts = await listProducts(datasetId);
  const result = await runSemanticSearch(allProducts, query);
  if (!result.success) {
    return {
      rows: [],
      total: 0,
      page: 1,
      pageSize: TABLE_PAGE_SIZE,
      pageCount: 1,
      semanticError: result.error,
    };
  }

  const bySku = new Map(allProducts.map((product) => [product.sku, product]));

  let ranked = result.skus
    .map((sku) => bySku.get(sku))
    .filter((product): product is (typeof allProducts)[number] =>
      Boolean(product),
    );

  if (params.category) {
    ranked = ranked.filter((product) =>
      matchesCategory(product, params.category as string),
    );
  }

  const total = ranked.length;
  const start = (page - 1) * TABLE_PAGE_SIZE;

  return {
    rows: ranked.slice(start, start + TABLE_PAGE_SIZE),
    total,
    page,
    pageSize: TABLE_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE)),
    semanticError: undefined as string | undefined,
  };
}

async function pagedProductsExact(
  datasetId: string,
  params: PagedProductsParams,
) {
  const page = Math.max(1, params.page ?? 1);

  const conditions = [eq(products.datasetId, datasetId)];
  if (params.category === UNCATEGORIZED_CATEGORY) {
    conditions.push(isNull(products.category));
  } else if (params.category) {
    conditions.push(eq(products.category, params.category));
  }
  if (params.search) {
    const pattern = `%${params.search}%`;
    const searchCondition = or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }
  const where = and(...conditions);

  const sortColumn = PRODUCTS_SORT_COLUMNS[params.sort ?? "name"];
  const direction = params.dir === "desc" ? desc : asc;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(direction(sortColumn), asc(products.name))
      .limit(TABLE_PAGE_SIZE)
      .offset((page - 1) * TABLE_PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(where),
  ]);

  const total = countRows[0]?.count ?? 0;

  return {
    rows,
    total,
    page,
    pageSize: TABLE_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE)),
    semanticError: undefined as string | undefined,
  };
}

export const pagedProducts = cache(
  (datasetId: string, params: PagedProductsParams = {}) => {
    return params.mode === "semantic"
      ? pagedProductsSemantic(datasetId, params)
      : pagedProductsExact(datasetId, params);
  },
);
