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
