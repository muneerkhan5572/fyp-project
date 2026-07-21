import Link from "next/link";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Import } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ImportReportProps = {
  datasetId: string;
  importRow: Import;
};

export function ImportReport({ datasetId, importRow }: ImportReportProps) {
  const errorsShown = importRow.errors.length;
  const errorsTruncated = importRow.failedRows > errorsShown;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-muted-foreground text-xs">
            {importRow.fileName}
          </p>
          <p className="text-muted-foreground text-xs">
            Uploaded {dateFormatter.format(importRow.createdAt)}
          </p>
        </div>
        <ImportStatusBadge status={importRow.status} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Total rows</p>
          <p className="font-semibold text-xl">{importRow.totalRows}</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Imported</p>
          <p className="font-semibold text-xl">{importRow.importedRows}</p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Failed</p>
          <p className="font-semibold text-xl">{importRow.failedRows}</p>
        </div>
      </div>

      {importRow.meta?.mode === "flexible" ? (
        <div className="mt-4 rounded-md border p-3 text-sm">
          <p>
            {importRow.meta.productsUpserted} product
            {importRow.meta.productsUpserted === 1 ? "" : "s"} created or
            updated.
          </p>
          {importRow.meta.namesCollapsed > 0 ? (
            <p className="mt-1 text-muted-foreground text-xs">
              No SKU column was mapped, so rows were matched to products by name
              — {importRow.meta.namesCollapsed} row
              {importRow.meta.namesCollapsed === 1 ? "" : "s"} shared a name
              with an earlier row in this file (expected if the same product
              sold more than once). If two different products share a name,
              re-import with a SKU column mapped so they don't get merged.
            </p>
          ) : null}
          {importRow.meta.salesRowsAggregated > 0 ? (
            <p className="mt-1 text-muted-foreground text-xs">
              {importRow.meta.salesRowsAggregated} row
              {importRow.meta.salesRowsAggregated === 1 ? "" : "s"} shared the
              same product and date as another row and were combined into one
              daily total (this app tracks sales per product per day, not per
              individual order).
            </p>
          ) : null}
        </div>
      ) : null}

      {importRow.errors.length > 0 ? (
        <div className="mt-6">
          <h2 className="font-medium text-sm">Row errors</h2>
          <div className="mt-2 overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead className="w-32">Field</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importRow.errors.map((error) => (
                  <TableRow
                    key={`${error.row}-${error.field ?? "row"}-${error.message}`}
                  >
                    <TableCell>{error.row}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {error.field ?? "—"}
                    </TableCell>
                    <TableCell>{error.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {errorsTruncated ? (
            <p className="mt-2 text-muted-foreground text-xs">
              Showing the first {errorsShown} of {importRow.failedRows} row
              errors.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6">
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          href={`/dashboard/${datasetId}/import`}
        >
          Upload a corrected file
        </Link>
      </div>
    </div>
  );
}
