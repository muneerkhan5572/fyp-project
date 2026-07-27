import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

async function main() {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
  console.info("pgvector extension enabled.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
