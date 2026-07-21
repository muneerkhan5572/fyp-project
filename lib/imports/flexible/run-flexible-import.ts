import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type ImportMeta,
  type ImportRowError,
  imports,
  products,
  sales,
} from "@/lib/db/schema";
import { parseRaw } from "@/lib/imports/parse-csv";
import { productRowSchema, saleRowSchema } from "@/lib/imports/row-schemas";
import type { RunImportResult } from "@/lib/imports/run-import";
import { chunk, resolveSkuMap } from "@/lib/imports/run-import";
import { applyMapping } from "./apply-mapping";
import { buildSkuAssignments, normalizeProductName } from "./generate-sku";
import type { ImportMapping } from "./mapping-schema";

const BATCH_SIZE = 1000;
const MAX_ERRORS = 500;

type ValidRow = {
  row: number;
  product: ReturnType<typeof productRowSchema.parse>;
  sale: ReturnType<typeof saleRowSchema.parse>;
};

type AggregatedSale = {
  sku: string;
  date: string;
  quantity: number;
  revenue: number;
};

function aggregateSalesByProductAndDate(rows: ValidRow[]): AggregatedSale[] {
  const grouped = new Map<string, AggregatedSale>();
  for (const { product, sale } of rows) {
    const key = `${product.sku}|${sale.date}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += sale.quantity;
      existing.revenue += sale.revenue;
    } else {
      grouped.set(key, {
        sku: product.sku,
        date: sale.date,
        quantity: sale.quantity,
        revenue: sale.revenue,
      });
    }
  }
  return Array.from(grouped.values());
}

export async function runFlexibleImport(
  datasetId: string,
  mapping: ImportMapping,
  fileName: string,
  content: string,
): Promise<RunImportResult> {
  const parsed = parseRaw(content);
  if (!parsed.success) {
    return writeFlexibleImportRow(datasetId, fileName, mapping, {
      totalRows: 0,
      importedRows: 0,
      failedRows: 0,
      errors: [{ row: 0, message: parsed.error }],
      productsUpserted: 0,
      namesCollapsed: 0,
      salesRowsAggregated: 0,
    });
  }

  const { rows } = parsed.data;
  if (rows.length === 0) {
    return writeFlexibleImportRow(datasetId, fileName, mapping, {
      totalRows: 0,
      importedRows: 0,
      failedRows: 0,
      errors: [{ row: 0, message: "The CSV file has no data rows." }],
      productsUpserted: 0,
      namesCollapsed: 0,
      salesRowsAggregated: 0,
    });
  }

  const mappedRows = rows.map((rawRow) => applyMapping(rawRow, mapping));

  const needsGeneratedSku = mapping.fields.sku.kind === "unmapped";
  const skuAssignments = needsGeneratedSku
    ? buildSkuAssignments(mappedRows.map((row) => row.name))
    : null;

  const errors: ImportRowError[] = [];
  const validRows: ValidRow[] = [];

  mappedRows.forEach((mappedRow, index) => {
    const rowNumber = index + 1;
    const sku = needsGeneratedSku
      ? (skuAssignments?.get(normalizeProductName(mappedRow.name)) ?? "")
      : mappedRow.sku;

    const productResult = productRowSchema.safeParse({ ...mappedRow, sku });
    if (!productResult.success) {
      for (const issue of productResult.error.issues) {
        errors.push({
          row: rowNumber,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        });
      }
      return;
    }

    const saleResult = saleRowSchema.safeParse({ ...mappedRow, sku });
    if (!saleResult.success) {
      for (const issue of saleResult.error.issues) {
        errors.push({
          row: rowNumber,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        });
      }
      return;
    }

    validRows.push({
      row: rowNumber,
      product: productResult.data,
      sale: saleResult.data,
    });
  });

  let productsUpserted = 0;
  const aggregatedSales = aggregateSalesByProductAndDate(validRows);
  const salesRowsAggregated = Math.max(
    validRows.length - aggregatedSales.length,
    0,
  );

  if (validRows.length > 0) {
    await db.transaction(async (tx) => {
      const uniqueProducts = new Map<string, ValidRow["product"]>();
      for (const { product } of validRows) {
        uniqueProducts.set(product.sku, product);
      }
      const productBatchValues = Array.from(uniqueProducts.values());
      productsUpserted = productBatchValues.length;

      for (const batch of chunk(productBatchValues, BATCH_SIZE)) {
        await tx
          .insert(products)
          .values(
            batch.map((data) => ({
              datasetId,
              name: data.name,
              sku: data.sku,
              category: data.category ?? null,
              price: data.price.toString(),
              cost: data.cost !== undefined ? data.cost.toString() : null,
              stock: data.stock ?? null,
            })),
          )
          .onConflictDoUpdate({
            target: [products.datasetId, products.sku],
            set: {
              name: sql`excluded.name`,
              category: sql`excluded.category`,
              price: sql`excluded.price`,
              cost: sql`excluded.cost`,
              stock: sql`excluded.stock`,
              updatedAt: sql`now()`,
            },
          });
      }

      const skuMap = await resolveSkuMap(
        tx,
        datasetId,
        Array.from(uniqueProducts.keys()),
      );

      const saleValues = aggregatedSales
        .map((entry) => {
          const productId = skuMap.get(entry.sku);
          if (!productId) {
            return null;
          }
          return {
            datasetId,
            productId,
            saleDate: entry.date,
            quantity: entry.quantity,
            revenue: entry.revenue.toString(),
          };
        })
        .filter((value): value is NonNullable<typeof value> => value !== null);

      for (const batch of chunk(saleValues, BATCH_SIZE)) {
        await tx
          .insert(sales)
          .values(batch)
          .onConflictDoUpdate({
            target: [sales.productId, sales.saleDate],
            set: {
              quantity: sql`excluded.quantity`,
              revenue: sql`excluded.revenue`,
            },
          });
      }
    });
  }

  const namesCollapsed =
    needsGeneratedSku && skuAssignments
      ? mappedRows.filter((row) => row.name.trim() !== "").length -
        skuAssignments.size
      : 0;

  return writeFlexibleImportRow(datasetId, fileName, mapping, {
    totalRows: rows.length,
    importedRows: validRows.length,
    failedRows: rows.length - validRows.length,
    errors,
    productsUpserted,
    namesCollapsed: Math.max(namesCollapsed, 0),
    salesRowsAggregated,
  });
}

async function writeFlexibleImportRow(
  datasetId: string,
  fileName: string,
  mapping: ImportMapping,
  outcome: {
    totalRows: number;
    importedRows: number;
    failedRows: number;
    errors: ImportRowError[];
    productsUpserted: number;
    namesCollapsed: number;
    salesRowsAggregated: number;
  },
): Promise<RunImportResult> {
  const {
    totalRows,
    importedRows,
    failedRows,
    errors,
    productsUpserted,
    namesCollapsed,
    salesRowsAggregated,
  } = outcome;

  const status: RunImportResult["status"] =
    totalRows === 0 || (totalRows > 0 && importedRows === 0)
      ? "failed"
      : failedRows > 0
        ? "completed_with_errors"
        : "completed";

  const cappedErrors = errors.slice(0, MAX_ERRORS);

  const meta: ImportMeta = {
    mode: "flexible",
    dateFormat: mapping.dateFormat,
    productsUpserted,
    namesCollapsed,
    salesRowsAggregated,
  };

  const [row] = await db
    .insert(imports)
    .values({
      datasetId,
      type: "sales",
      fileName,
      totalRows,
      importedRows,
      failedRows,
      errors: cappedErrors,
      status,
      meta,
    })
    .returning({ id: imports.id });

  return {
    importId: row.id,
    status,
    totalRows,
    importedRows,
    failedRows,
    errors: cappedErrors,
  };
}
