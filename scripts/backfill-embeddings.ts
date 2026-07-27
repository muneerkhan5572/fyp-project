import { eq, isNull } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

const BATCH_SIZE = 50;

function buildProductEmbeddingText(product: {
  name: string;
  category: string | null;
  description: string | null;
}) {
  return `${product.name} ${product.category ?? ""} ${product.description ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
}

async function embedProductTexts(
  texts: string[],
): Promise<(number[] | null)[]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await fetch(`${env.ML_SERVICE_URL}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding service error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.vectors;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      description: products.description,
    })
    .from(products)
    .where(isNull(products.embedding));

  console.info(`Backfilling embeddings for ${rows.length} products...`);

  let done = 0;
  for (const batch of chunk(rows, BATCH_SIZE)) {
    const embeddings = await embedProductTexts(
      batch.map((row) => buildProductEmbeddingText(row)),
    );

    for (let i = 0; i < batch.length; i++) {
      const embedding = embeddings[i];
      if (!embedding) {
        continue;
      }
      await db
        .update(products)
        .set({ embedding })
        .where(eq(products.id, batch[i].id));
    }

    done += batch.length;
    console.info(`  ${done}/${rows.length}`);
  }

  console.info("Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
