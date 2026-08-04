import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);
const [_row] =
  await sql`select count(*) from reviews where sentiment_label is null`;
await sql.end();
