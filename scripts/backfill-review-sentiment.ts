import { eq, isNull } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

const BATCH_SIZE = 50;

type SentimentResult = {
  label: "positive" | "negative" | "neutral";
  score: number;
};

async function requestSentiment(
  texts: string[],
): Promise<(SentimentResult | null)[]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await fetch(`${env.ML_SERVICE_URL}/sentiment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Api-Key": env.ML_SERVICE_API_KEY,
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sentiment service error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.results;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const rescoreAll = process.argv.includes("--all");

  const query = db
    .select({ id: reviews.id, reviewText: reviews.reviewText })
    .from(reviews);
  const rows = rescoreAll
    ? await query
    : await query.where(isNull(reviews.sentimentLabel));

  console.info(`Backfilling sentiment for ${rows.length} reviews...`);

  let updated = 0;
  let failed = 0;

  for (const batch of chunk(rows, BATCH_SIZE)) {
    let results: (SentimentResult | null)[];
    try {
      results = await requestSentiment(batch.map((row) => row.reviewText));
    } catch (error) {
      console.error("  Batch failed, leaving rows null:", error);
      failed += batch.length;
      continue;
    }

    for (let i = 0; i < batch.length; i++) {
      const result = results[i];
      if (!result) {
        failed++;
        continue;
      }
      await db
        .update(reviews)
        .set({
          sentimentLabel: result.label,
          sentimentScore: result.score.toString(),
        })
        .where(eq(reviews.id, batch[i].id));
      updated++;
    }

    console.info(`  ${updated + failed}/${rows.length}`);
  }

  console.info(`Done. Updated ${updated}, still failing ${failed}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
