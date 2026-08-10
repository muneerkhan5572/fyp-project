import { setDefaultResultOrder } from "node:dns";
import { setDefaultAutoSelectFamily } from "node:net";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "@/lib/db/schema";

setDefaultResultOrder("ipv4first");
setDefaultAutoSelectFamily(false);

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false,
    connect_timeout: 30,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
