import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requestEmbeddings } from "@/lib/ml/embed-client";

const MAX_COSINE_DISTANCE = 0.65;
const SEMANTIC_MATCH_LIMIT = 50;

function tokenize(query: string) {
  return query.toLowerCase().split(/\W+/).filter(Boolean);
}

function hasNumericToken(tokens: string[]) {
  return tokens.some((token) => /^\d+$/.test(token));
}

function toPgVectorLiteral(vector: number[]) {
  return `[${vector.join(",")}]`;
}

async function lexicalMatchIds(datasetId: string, tokens: string[]) {
  const conditions = [eq(products.datasetId, datasetId)];
  for (const token of tokens) {
    const needle = `%${token}%`;
    conditions.push(
      sql`(${products.name} ilike ${needle} or ${products.sku} ilike ${needle})`,
    );
  }

  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.name));

  return rows.map((row) => row.id);
}

async function semanticMatchIds(datasetId: string, query: string) {
  const [vector] = await requestEmbeddings([query]);
  if (!vector) {
    return [];
  }

  const distance = sql<number>`${products.embedding} <=> ${toPgVectorLiteral(vector)}::vector`;

  const rows = await db
    .select({ id: products.id, distance })
    .from(products)
    .where(
      and(
        eq(products.datasetId, datasetId),
        sql`${products.embedding} is not null`,
      ),
    )
    .orderBy(distance)
    .limit(SEMANTIC_MATCH_LIMIT);

  return rows
    .filter((row) => row.distance <= MAX_COSINE_DISTANCE)
    .map((row) => row.id);
}

export async function matchProductIdsForSearch(
  datasetId: string,
  query: string,
  mode: "semantic" | "lexical" = "semantic",
) {
  const tokens = tokenize(query);

  if (mode === "lexical") {
    return {
      productIds: await lexicalMatchIds(datasetId, tokens),
      semanticError: undefined as string | undefined,
    };
  }

  const [lexicalIds, semanticResult] = await Promise.all([
    lexicalMatchIds(datasetId, tokens),
    semanticMatchIds(datasetId, query)
      .then((ids) => ({ ids, error: undefined as string | undefined }))
      .catch(() => ({
        ids: [] as string[],
        error:
          "Couldn't reach the search service. Make sure it's running and try again.",
      })),
  ]);

  let ranked = semanticResult.ids;
  if (hasNumericToken(tokens)) {
    const lexicalSet = new Set(lexicalIds);
    ranked = ranked.filter((id) => lexicalSet.has(id));
  }

  const seen = new Set(ranked);
  const matched = [...ranked, ...lexicalIds.filter((id) => !seen.has(id))];

  return {
    productIds: matched,
    semanticError: semanticResult.error,
  };
}
