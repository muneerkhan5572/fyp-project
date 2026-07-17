import "server-only";
import postgres from "postgres";

function toPostgresError(error: unknown): postgres.PostgresError | null {
  if (error instanceof postgres.PostgresError) {
    return error;
  }
  if (error instanceof Error && error.cause instanceof postgres.PostgresError) {
    return error.cause;
  }
  return null;
}

export function isUniqueViolation(error: unknown): boolean {
  return toPostgresError(error)?.code === "23505";
}
