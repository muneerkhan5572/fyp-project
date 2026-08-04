import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);
const CONCURRENCY = 8;
const BATCH_SIZE = 50;

const rows =
  await sql`select id, review_text from reviews where sentiment_label is null`;

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
}

const batches = chunk(rows, BATCH_SIZE);
let _done = 0;
let _failed = 0;

async function scoreBatch(batch) {
  try {
    const res = await fetch(`${process.env.ML_SERVICE_URL}/sentiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Api-Key": process.env.ML_SERVICE_API_KEY,
      },
      body: JSON.stringify({ texts: batch.map((r) => r.review_text) }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    for (let i = 0; i < batch.length; i++) {
      const result = data.results[i];
      if (!result) {
        _failed++;
        continue;
      }
      await sql`update reviews set sentiment_label = ${result.label}, sentiment_score = ${result.score} where id = ${batch[i].id}`;
      _done++;
    }
  } catch (error) {
    _failed += batch.length;
    console.error("batch failed:", error.message);
  }
}

let cursor = 0;
async function worker() {
  while (cursor < batches.length) {
    const batch = batches[cursor++];
    await scoreBatch(batch);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
await sql.end();
