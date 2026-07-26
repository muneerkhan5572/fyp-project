import * as z from "zod";

export const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export function isRealCalendarDateParts(
  year: number,
  month: number,
  day: number,
): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  return isRealCalendarDateParts(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );
}

export const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    error: "Date must be in YYYY-MM-DD format.",
  })
  .refine(isRealCalendarDate, { error: "Enter a valid calendar date." });

// Query-param schemas deliberately use `.catch(default)` per field instead of
// throwing on parse failure — a stale or hand-edited URL must fall back to a
// sane default, not 500 the page.
export const pageParam = z.coerce.number().int().positive().catch(1);

export function sortParam<const T extends readonly [string, ...string[]]>(
  allowed: T,
  fallback: T[number],
) {
  return z.enum(allowed).catch(fallback);
}

export function dirParam(fallback: "asc" | "desc" = "desc") {
  return z.enum(["asc", "desc"]).catch(fallback);
}

export const searchParam = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(200).optional(),
);
