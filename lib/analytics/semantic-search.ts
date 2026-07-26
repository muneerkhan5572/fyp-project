import "server-only";
import { requestSemanticSearch } from "@/lib/ml/search-client";

export type SemanticSearchResult =
  | { success: true; skus: string[] }
  | { success: false; error: string };

type SearchableProduct = {
  sku: string;
  name: string;
  category: string | null;
};

// Takes the product corpus as a parameter rather than fetching it itself —
// callers (lib/products/dal.ts) already have it loaded, and fetching here
// would create a dal.ts <-> semantic-search.ts import cycle.
export async function runSemanticSearch(
  products: SearchableProduct[],
  query: string,
): Promise<SemanticSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { success: false, error: "Type something to search for." };
  }

  if (products.length === 0) {
    return { success: false, error: "No products to search yet." };
  }

  try {
    const results = await requestSemanticSearch(
      products.map((product) => ({
        sku: product.sku,
        name: product.name,
        category: product.category,
      })),
      trimmed,
    );
    return { success: true, skus: results.map((result) => result.sku) };
  } catch {
    return {
      success: false,
      error:
        "Couldn't reach the search service. Make sure it's running and try again.",
    };
  }
}
