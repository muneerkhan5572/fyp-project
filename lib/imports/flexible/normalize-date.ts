import { isRealCalendarDateParts } from "@/lib/validations/shared";
import type { DateFormat } from "./mapping-schema";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function normalizeDate(
  rawValue: string,
  format: DateFormat,
): string | null {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  let year: number;
  let month: number;
  let day: number;

  if (format === "ISO_DATETIME") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) {
      return null;
    }
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  } else {
    const separator = format.includes("/") ? "/" : "-";
    const parts = value.split(separator);
    if (parts.length !== 3) {
      return null;
    }
    const numbers = parts.map((part) => Number(part.trim()));
    if (numbers.some((part) => !Number.isInteger(part))) {
      return null;
    }
    const [a, b, c] = numbers as [number, number, number];
    if (format === "YYYY-MM-DD") {
      [year, month, day] = [a, b, c];
    } else if (format === "MM/DD/YYYY") {
      [month, day, year] = [a, b, c];
    } else {
      [day, month, year] = [a, b, c];
    }
  }

  if (!isRealCalendarDateParts(year, month, day)) {
    return null;
  }

  return `${year.toString().padStart(4, "0")}-${pad(month)}-${pad(day)}`;
}
