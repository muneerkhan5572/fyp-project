import "server-only";
import Papa from "papaparse";

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

export type ParseRawResult =
  | { success: true; data: ParsedCsv }
  | { success: false; error: string };

export type ParseCsvResult = ParseRawResult;

function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

export function parseRaw(content: string): ParseRawResult {
  const result = Papa.parse<Record<string, string>>(stripBom(content), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    return {
      success: false,
      error: `Could not parse CSV: ${first.message}${
        typeof first.row === "number" ? ` (row ${first.row + 1})` : ""
      }.`,
    };
  }

  const headers = result.meta.fields ?? [];

  return { success: true, data: { headers, rows: result.data } };
}

export function parseCsv(
  content: string,
  requiredHeaders: string[],
): ParseCsvResult {
  const parsed = parseRaw(content);
  if (!parsed.success) {
    return parsed;
  }

  const missing = requiredHeaders.filter(
    (header) => !parsed.data.headers.includes(header),
  );
  if (missing.length > 0) {
    return {
      success: false,
      error: `Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`,
    };
  }

  if (parsed.data.rows.length === 0) {
    return { success: false, error: "The CSV file has no data rows." };
  }

  return parsed;
}
