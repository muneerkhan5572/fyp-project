import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type ImportRowError,
  imports,
  products,
  sales,
  trafficRecords,
} from "@/lib/db/schema";
import { parseCsv } from "@/lib/imports/parse-csv";
import {
  PRODUCT_REQUIRED_HEADERS,
  productRowSchema,
  SALE_REQUIRED_HEADERS,
  saleRowSchema,
  TRAFFIC_REQUIRED_HEADERS,
  trafficRowSchema,
} from "@/lib/imports/row-schemas";

const BATCH_SIZE = 1000;
const MAX_ERRORS = 500;

export type ImportType = "products" | "sales" | "traffic";

export type RunImportResult = {
  importId: string;
  status: "completed" | "completed_with_errors" | "failed";
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: ImportRowError[];
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function writeImportRow(
  datasetId: string,
  type: ImportType,
  fileName: string,
  totalRows: number,
  importedRows: number,
  failedRows: number,
  errors: ImportRowError[],
): Promise<RunImportResult> {
  const status: RunImportResult["status"] =
    totalRows === 0 || (totalRows > 0 && importedRows === 0)
      ? "failed"
      : failedRows > 0
        ? "completed_with_errors"
        : "completed";

  const cappedErrors = errors.slice(0, MAX_ERRORS);

  const [row] = await db
    .insert(imports)
    .values({
      datasetId,
      type,
      fileName,
      totalRows,
      importedRows,
      failedRows,
      errors: cappedErrors,
      status,
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

async function runProductsImport(
  datasetId: string,
  fileName: string,
  content: string,
): Promise<RunImportResult> {
  const parsed = parseCsv(content, PRODUCT_REQUIRED_HEADERS);
  if (!parsed.success) {
    return writeImportRow(datasetId, "products", fileName, 0, 0, 0, [
      { row: 0, message: parsed.error },
    ]);
  }

  const { rows } = parsed.data;
  const errors: ImportRowError[] = [];
  const validRows: {
    row: number;
    data: ReturnType<typeof productRowSchema.parse>;
  }[] = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 1;
    const result = productRowSchema.safeParse(rawRow);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: rowNumber,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        });
      }
      return;
    }
    validRows.push({ row: rowNumber, data: result.data });
  });

  if (validRows.length > 0) {
    await db.transaction(async (tx) => {
      for (const batch of chunk(validRows, BATCH_SIZE)) {
        await tx
          .insert(products)
          .values(
            batch.map(({ data }) => ({
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
    });
  }

  return writeImportRow(
    datasetId,
    "products",
    fileName,
    rows.length,
    validRows.length,
    rows.length - validRows.length,
    errors,
  );
}

async function resolveSkuMap(datasetId: string, skus: string[]) {
  if (skus.length === 0) {
    return new Map<string, string>();
  }
  const rows = await db
    .select({ id: products.id, sku: products.sku })
    .from(products)
    .where(and(eq(products.datasetId, datasetId), inArray(products.sku, skus)));
  return new Map(rows.map((row) => [row.sku, row.id]));
}

async function runSalesImport(
  datasetId: string,
  fileName: string,
  content: string,
): Promise<RunImportResult> {
  const parsed = parseCsv(content, SALE_REQUIRED_HEADERS);
  if (!parsed.success) {
    return writeImportRow(datasetId, "sales", fileName, 0, 0, 0, [
      { row: 0, message: parsed.error },
    ]);
  }

  const { rows } = parsed.data;
  const errors: ImportRowError[] = [];
  const parsedRows: {
    row: number;
    data: ReturnType<typeof saleRowSchema.parse>;
  }[] = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 1;
    const result = saleRowSchema.safeParse(rawRow);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: rowNumber,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        });
      }
      return;
    }
    parsedRows.push({ row: rowNumber, data: result.data });
  });

  const skuMap = await resolveSkuMap(
    datasetId,
    Array.from(new Set(parsedRows.map(({ data }) => data.sku))),
  );

  const validRows: {
    row: number;
    productId: string;
    saleDate: string;
    quantity: number;
    revenue: number;
  }[] = [];

  for (const { row, data } of parsedRows) {
    const productId = skuMap.get(data.sku);
    if (!productId) {
      errors.push({
        row,
        field: "sku",
        message: "SKU not found in this dataset — import products first.",
      });
      continue;
    }
    validRows.push({
      row,
      productId,
      saleDate: data.date,
      quantity: data.quantity,
      revenue: data.revenue,
    });
  }

  if (validRows.length > 0) {
    await db.transaction(async (tx) => {
      for (const batch of chunk(validRows, BATCH_SIZE)) {
        await tx
          .insert(sales)
          .values(
            batch.map((entry) => ({
              datasetId,
              productId: entry.productId,
              saleDate: entry.saleDate,
              quantity: entry.quantity,
              revenue: entry.revenue.toString(),
            })),
          )
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

  return writeImportRow(
    datasetId,
    "sales",
    fileName,
    rows.length,
    validRows.length,
    rows.length - validRows.length,
    errors,
  );
}

async function runTrafficImport(
  datasetId: string,
  fileName: string,
  content: string,
): Promise<RunImportResult> {
  const parsed = parseCsv(content, TRAFFIC_REQUIRED_HEADERS);
  if (!parsed.success) {
    return writeImportRow(datasetId, "traffic", fileName, 0, 0, 0, [
      { row: 0, message: parsed.error },
    ]);
  }

  const { rows } = parsed.data;
  const errors: ImportRowError[] = [];
  const parsedRows: {
    row: number;
    data: ReturnType<typeof trafficRowSchema.parse>;
  }[] = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 1;
    const result = trafficRowSchema.safeParse(rawRow);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: rowNumber,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        });
      }
      return;
    }
    parsedRows.push({ row: rowNumber, data: result.data });
  });

  const skuMap = await resolveSkuMap(
    datasetId,
    Array.from(new Set(parsedRows.map(({ data }) => data.sku))),
  );

  const validRows: {
    row: number;
    productId: string;
    trafficDate: string;
    views: number;
  }[] = [];

  for (const { row, data } of parsedRows) {
    const productId = skuMap.get(data.sku);
    if (!productId) {
      errors.push({
        row,
        field: "sku",
        message: "SKU not found in this dataset — import products first.",
      });
      continue;
    }
    validRows.push({
      row,
      productId,
      trafficDate: data.date,
      views: data.views,
    });
  }

  if (validRows.length > 0) {
    await db.transaction(async (tx) => {
      for (const batch of chunk(validRows, BATCH_SIZE)) {
        await tx
          .insert(trafficRecords)
          .values(
            batch.map((entry) => ({
              datasetId,
              productId: entry.productId,
              trafficDate: entry.trafficDate,
              views: entry.views,
            })),
          )
          .onConflictDoUpdate({
            target: [trafficRecords.productId, trafficRecords.trafficDate],
            set: {
              views: sql`excluded.views`,
            },
          });
      }
    });
  }

  return writeImportRow(
    datasetId,
    "traffic",
    fileName,
    rows.length,
    validRows.length,
    rows.length - validRows.length,
    errors,
  );
}

export function runImport(
  datasetId: string,
  type: ImportType,
  fileName: string,
  content: string,
): Promise<RunImportResult> {
  if (type === "products") {
    return runProductsImport(datasetId, fileName, content);
  }
  if (type === "sales") {
    return runSalesImport(datasetId, fileName, content);
  }
  return runTrafficImport(datasetId, fileName, content);
}
