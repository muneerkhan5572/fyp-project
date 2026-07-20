export type RangePreset = "30d" | "90d" | "1y" | "all";

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

export type DateRange = {
  from: string | null;
  to: string;
  preset: RangePreset;
};

export function parseRangePreset(value: string | undefined): RangePreset {
  if (value === "30d" || value === "90d" || value === "1y" || value === "all") {
    return value;
  }
  return "30d";
}

export function addDaysToDateString(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function listDatesBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    cursor = addDaysToDateString(cursor, 1);
  }
  return dates;
}

export function resolveDateRange(
  preset: RangePreset,
  anchorDate: string | null,
): DateRange | null {
  if (!anchorDate) {
    return null;
  }
  if (preset === "all") {
    return { from: null, to: anchorDate, preset };
  }
  const days = preset === "30d" ? 30 : preset === "90d" ? 90 : 365;
  const from = addDaysToDateString(anchorDate, -(days - 1));
  return { from, to: anchorDate, preset };
}
