import "server-only";
import { requestSemanticSearch } from "@/lib/ml/search-client";
import { listProducts } from "@/lib/products/dal";

export type SemanticSearchResult =
  | { success: true; skus: string[] }
  | { success: false; error: string };

export async function runSemanticSearch(
  datasetId: string,
  query: string,
): Promise<SemanticSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { success: false, error: "Type something to search for." };
  }

  const products = await listProducts(datasetId);
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
