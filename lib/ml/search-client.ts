import "server-only";
import { env } from "@/env";

export type SearchProductInput = {
  sku: string;
  name: string;
  category: string | null;
};

export type SearchResult = {
  sku: string;
  score: number;
};

export async function requestSemanticSearch(
  products: SearchProductInput[],
  query: string,
): Promise<SearchResult[]> {
  const response = await fetch(`${env.ML_SERVICE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ products, query }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Search service error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.results;
}
