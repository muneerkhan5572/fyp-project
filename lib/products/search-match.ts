import "server-only";
import { runSemanticSearch } from "@/lib/analytics/semantic-search";
import { listProducts } from "@/lib/products/dal";

function tokenPrefixMatches(
  product: { name: string; sku: string },
  query: string,
) {
  const haystack = `${product.name} ${product.sku}`
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
  const needles = query.toLowerCase().split(/\W+/).filter(Boolean);
  return (
    needles.length > 0 &&
    needles.every((needle) =>
      haystack.some((token) => token.startsWith(needle)),
    )
  );
}

function substringMatches(
  product: { name: string; sku: string },
  query: string,
) {
  const needle = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(needle) ||
    product.sku.toLowerCase().includes(needle)
  );
}

function hasNumericToken(query: string) {
  return query
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean)
    .some((token) => /^\d+$/.test(token));
}

export async function matchProductIdsForSearch(
  datasetId: string,
  query: string,
) {
  const allProducts = await listProducts(datasetId);
  const lexicalMatches = allProducts.filter(
    (product) =>
      substringMatches(product, query) || tokenPrefixMatches(product, query),
  );

  const result = await runSemanticSearch(allProducts, query);
  if (!result.success) {
    return {
      productIds: lexicalMatches.map((product) => product.id),
      semanticError: result.error as string | undefined,
    };
  }

  const bySku = new Map(allProducts.map((product) => [product.sku, product]));
  let ranked = result.skus
    .map((sku) => bySku.get(sku))
    .filter((product): product is (typeof allProducts)[number] =>
      Boolean(product),
    );

  if (hasNumericToken(query)) {
    ranked = ranked.filter(
      (product) =>
        substringMatches(product, query) || tokenPrefixMatches(product, query),
    );
  }

  const seen = new Set(ranked.map((product) => product.id));
  const matched = [
    ...ranked,
    ...lexicalMatches.filter((product) => !seen.has(product.id)),
  ];

  return {
    productIds: matched.map((product) => product.id),
    semanticError: undefined as string | undefined,
  };
}
