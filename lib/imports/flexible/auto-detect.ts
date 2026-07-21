import {
  CANONICAL_FIELD_KEYS,
  DATE_FORMATS,
  type DateFormat,
  type FieldKey,
  type FieldMapping,
  type ImportMapping,
  UNMAPPED_FIELD,
} from "./mapping-schema";
import { normalizeDate } from "./normalize-date";

const SYNONYMS: Record<FieldKey, string[]> = {
  name: [
    "name",
    "product name",
    "product",
    "item",
    "item name",
    "title",
    "description",
  ],
  sku: [
    "sku",
    "product id",
    "item code",
    "item id",
    "code",
    "product code",
    "id",
  ],
  category: [
    "category",
    "cat",
    "type",
    "department",
    "dept",
    "segment",
    "product category",
    "group",
  ],
  price: [
    "price",
    "unit price",
    "selling price",
    "list price",
    "rate",
    "sale price",
  ],
  cost: ["cost", "unit cost", "cogs", "cost price", "wholesale price"],
  stock: [
    "stock",
    "quantity in stock",
    "inventory",
    "stock level",
    "qty on hand",
    "on hand",
  ],
  date: [
    "date",
    "order date",
    "sale date",
    "transaction date",
    "purchase date",
    "ship date",
    "invoice date",
  ],
  quantity: [
    "quantity",
    "qty",
    "units",
    "units sold",
    "quantity sold",
    "order quantity",
  ],
  revenue: [
    "revenue",
    "total",
    "sales",
    "amount",
    "amt",
    "total sales",
    "sub total",
    "order total",
    "line total",
    "grand total",
  ],
};

const NAME_MATCH_THRESHOLD = 0.5;
const COMBINED_MATCH_THRESHOLD = 0.35;
const DATE_FORMAT_PRIORITY: DateFormat[] = [
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "ISO_DATETIME",
];

function normalizeForMatch(header: string): string {
  return header
    .toLowerCase()
    .replace(/[_\-.]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0),
  );
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

const FUZZY_SIMILARITY_THRESHOLD = 0.8;
const FUZZY_MIN_TOKEN_LENGTH = 4;

function tokensFuzzyMatch(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }
  if (a.length < FUZZY_MIN_TOKEN_LENGTH || b.length < FUZZY_MIN_TOKEN_LENGTH) {
    return false;
  }
  const similarity = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  return similarity >= FUZZY_SIMILARITY_THRESHOLD;
}

function scoreSynonym(header: string, synonym: string): number {
  if (header === synonym) {
    return 1;
  }
  const headerTokens = header.split(" ");
  const synonymTokens = synonym.split(" ");
  if (
    synonymTokens.every((token) =>
      headerTokens.some((headerToken) => tokensFuzzyMatch(headerToken, token)),
    )
  ) {
    return 0.85;
  }
  if (header.includes(synonym) || synonym.includes(header)) {
    return 0.75;
  }
  const overlap = synonymTokens.filter((token) =>
    headerTokens.some((headerToken) => tokensFuzzyMatch(headerToken, token)),
  ).length;
  return overlap > 0 ? 0.4 + 0.1 * overlap : 0;
}

function nameScoreFor(header: string, field: FieldKey): number {
  const normalized = normalizeForMatch(header);
  let best = 0;
  for (const synonym of SYNONYMS[field]) {
    best = Math.max(best, scoreSynonym(normalized, synonym));
  }
  return best;
}

type ColumnStats = {
  dateLikeRatio: number;
  numericRatio: number;
  hasDecimalRatio: number;
  uniqueRatio: number;
  avgLength: number;
  sampleCount: number;
};

function analyzeColumn(values: string[]): ColumnStats {
  const nonEmpty = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const sampleCount = nonEmpty.length;
  if (sampleCount === 0) {
    return {
      dateLikeRatio: 0,
      numericRatio: 0,
      hasDecimalRatio: 0,
      uniqueRatio: 0,
      avgLength: 0,
      sampleCount: 0,
    };
  }

  let dateLike = 0;
  let numeric = 0;
  let hasDecimal = 0;
  let totalLength = 0;

  for (const value of nonEmpty) {
    totalLength += value.length;
    if (DATE_FORMATS.some((format) => normalizeDate(value, format) !== null)) {
      dateLike++;
    }
    const stripped = value.replace(/[$,]/g, "");
    if (/^-?\d+(\.\d+)?$/.test(stripped)) {
      numeric++;
      if (stripped.includes(".")) {
        hasDecimal++;
      }
    }
  }

  return {
    dateLikeRatio: dateLike / sampleCount,
    numericRatio: numeric / sampleCount,
    hasDecimalRatio: numeric > 0 ? hasDecimal / numeric : 0,
    uniqueRatio: new Set(nonEmpty).size / sampleCount,
    avgLength: totalLength / sampleCount,
    sampleCount,
  };
}

function contentAffinity(
  stats: ColumnStats,
): Partial<Record<FieldKey, number>> {
  const affinity: Partial<Record<FieldKey, number>> = {};
  if (stats.sampleCount === 0) {
    return affinity;
  }

  if (stats.dateLikeRatio > 0.8) {
    affinity.date = 0.7 * stats.dateLikeRatio;
  }

  if (stats.numericRatio > 0.8) {
    if (stats.hasDecimalRatio > 0.3) {
      affinity.price = 0.5;
      affinity.revenue = 0.45;
      affinity.cost = 0.3;
    } else {
      affinity.quantity = 0.5;
      affinity.stock = 0.35;
    }
  }

  if (stats.numericRatio < 0.2 && stats.avgLength > 0) {
    if (stats.uniqueRatio > 0.9 && stats.avgLength <= 20) {
      affinity.sku = 0.45;
    }
    if (stats.uniqueRatio < 0.5 && stats.avgLength <= 30) {
      affinity.category = 0.3;
    }
    if (stats.avgLength > 3) {
      affinity.name = 0.25;
    }
  }

  return affinity;
}

type Candidate = { header: string; field: FieldKey; score: number };

function assignHeadersToFields(
  headers: string[],
  columnValues: Map<string, string[]>,
): Map<FieldKey, string> {
  const candidates: Candidate[] = [];

  for (const header of headers) {
    const stats = analyzeColumn(columnValues.get(header) ?? []);
    const affinity = contentAffinity(stats);

    for (const field of CANONICAL_FIELD_KEYS) {
      const nameScore = nameScoreFor(header, field);
      const combined = Math.max(
        nameScore >= NAME_MATCH_THRESHOLD ? nameScore : 0,
        nameScore * 0.6 + (affinity[field] ?? 0) * 0.6,
      );
      if (combined >= COMBINED_MATCH_THRESHOLD) {
        candidates.push({ header, field, score: combined });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const assignments = new Map<FieldKey, string>();
  const usedHeaders = new Set<string>();

  for (const candidate of candidates) {
    if (usedHeaders.has(candidate.header) || assignments.has(candidate.field)) {
      continue;
    }
    assignments.set(candidate.field, candidate.header);
    usedHeaders.add(candidate.header);
  }

  return assignments;
}

function resolveDateFormat(
  header: string | undefined,
  sampleRows: Record<string, string>[],
): { dateFormat: DateFormat; confident: boolean } {
  if (!header) {
    return { dateFormat: "YYYY-MM-DD", confident: false };
  }

  const values = sampleRows
    .map((row) => row[header]?.trim())
    .filter((value): value is string => !!value);
  if (values.length === 0) {
    return { dateFormat: "YYYY-MM-DD", confident: false };
  }

  const fittingFormats = DATE_FORMAT_PRIORITY.filter((format) =>
    values.every((value) => normalizeDate(value, format) !== null),
  );

  if (fittingFormats.length === 0) {
    return { dateFormat: "YYYY-MM-DD", confident: false };
  }

  const [bestFormat, ...restFormats] = fittingFormats;
  const allFormatsAgree = restFormats.every((format) =>
    values.every(
      (value) =>
        normalizeDate(value, format) === normalizeDate(value, bestFormat),
    ),
  );

  return { dateFormat: bestFormat, confident: allFormatsAgree };
}

export type DetectedMapping = {
  mapping: ImportMapping;
  lowConfidenceFields: FieldKey[];
};

export function detectMapping(
  headers: string[],
  sampleRows: Record<string, string>[],
): DetectedMapping {
  const columnValues = new Map<string, string[]>(
    headers.map((header) => [
      header,
      sampleRows.map((row) => row[header] ?? ""),
    ]),
  );

  const assignments = assignHeadersToFields(headers, columnValues);

  const fields = Object.fromEntries(
    CANONICAL_FIELD_KEYS.map((field) => {
      const header = assignments.get(field);
      const value: FieldMapping = header
        ? { kind: "column", sourceHeader: header }
        : UNMAPPED_FIELD;
      return [field, value];
    }),
  ) as ImportMapping["fields"];

  const { dateFormat, confident: dateConfident } = resolveDateFormat(
    assignments.get("date"),
    sampleRows,
  );

  const deriveRevenue =
    fields.revenue.kind === "unmapped" &&
    fields.price.kind !== "unmapped" &&
    fields.quantity.kind !== "unmapped";

  const lowConfidenceFields: FieldKey[] = [];
  if (!dateConfident) {
    lowConfidenceFields.push("date");
  }
  if (fields.name.kind === "unmapped" && fields.sku.kind === "unmapped") {
    lowConfidenceFields.push("name");
  }
  if (fields.quantity.kind === "unmapped") {
    lowConfidenceFields.push("quantity");
  }
  if (fields.price.kind === "unmapped") {
    lowConfidenceFields.push("price");
  }
  if (fields.revenue.kind === "unmapped" && !deriveRevenue) {
    lowConfidenceFields.push("revenue");
  }

  return {
    mapping: {
      fields,
      dateFormat,
      deriveRevenue,
    },
    lowConfidenceFields,
  };
}
