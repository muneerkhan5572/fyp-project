import { createHash } from "node:crypto";

const MAX_SKU_LENGTH = 64;
const SUFFIX_LENGTH = 7;

export function slugifySku(name: string): string {
  const cleaned = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Za-z0-9._\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  const base = cleaned.length > 0 ? cleaned : "PRODUCT";
  return base.slice(0, MAX_SKU_LENGTH);
}

function shortHash(value: string): string {
  return createHash("sha1")
    .update(value)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
}

export function normalizeProductName(name: string): string {
  return name.trim().toLowerCase();
}

export function buildSkuAssignments(names: string[]): Map<string, string> {
  const normalizedNames = Array.from(
    new Set(
      names
        .map((name) => normalizeProductName(name))
        .filter((name) => name.length > 0),
    ),
  ).sort();

  const baseSlugOwner = new Map<string, string>();
  const assignments = new Map<string, string>();

  for (const normalized of normalizedNames) {
    const base = slugifySku(normalized);
    const owner = baseSlugOwner.get(base);
    if (owner === undefined) {
      baseSlugOwner.set(base, normalized);
      assignments.set(normalized, base);
    } else {
      const suffix = shortHash(normalized);
      assignments.set(
        normalized,
        `${base.slice(0, MAX_SKU_LENGTH - SUFFIX_LENGTH)}-${suffix}`,
      );
    }
  }

  return assignments;
}
