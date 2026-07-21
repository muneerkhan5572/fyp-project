import {
  CANONICAL_FIELD_KEYS,
  type FieldMapping,
  type ImportMapping,
} from "./mapping-schema";
import { normalizeDate } from "./normalize-date";

function resolveField(
  rawRow: Record<string, string>,
  fieldMapping: FieldMapping,
): string {
  if (fieldMapping.kind === "column") {
    return rawRow[fieldMapping.sourceHeader] ?? "";
  }
  if (fieldMapping.kind === "constant") {
    return fieldMapping.value;
  }
  return "";
}

export function applyMapping(
  rawRow: Record<string, string>,
  mapping: ImportMapping,
): Record<string, string> {
  const output: Record<string, string> = {};

  for (const key of CANONICAL_FIELD_KEYS) {
    output[key] = resolveField(rawRow, mapping.fields[key]);
  }

  if (!output.name && output.sku) {
    output.name = output.sku;
  }

  output.date = normalizeDate(output.date, mapping.dateFormat) ?? "";

  if (mapping.deriveRevenue) {
    const price = Number(output.price);
    const quantity = Number(output.quantity);
    output.revenue =
      Number.isFinite(price) && Number.isFinite(quantity)
        ? (price * quantity).toString()
        : "";
  }

  return output;
}
