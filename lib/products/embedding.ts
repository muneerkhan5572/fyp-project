import "server-only";
import { requestEmbeddings } from "@/lib/ml/embed-client";

export type EmbeddableProduct = {
  name: string;
  category: string | null;
  description: string | null;
};

export function buildProductEmbeddingText(product: EmbeddableProduct): string {
  return `${product.name} ${product.category ?? ""} ${product.description ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}

export async function embedProductTexts(
  texts: string[],
): Promise<(number[] | null)[]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    return await requestEmbeddings(texts);
  } catch (error) {
    console.error("Failed to generate product embeddings:", error);
    return texts.map(() => null);
  }
}

export async function embedProductText(text: string): Promise<number[] | null> {
  const [vector] = await embedProductTexts([text]);
  return vector ?? null;
}
