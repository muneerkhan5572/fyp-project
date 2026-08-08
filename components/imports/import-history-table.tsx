"use client";

import { HistoryIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTableLinkPagination } from "@/components/data-table/data-table-link-pagination";
import { ImportDeleteDialog } from "@/components/imports/import-delete-dialog";
import { ImportHistoryFilters } from "@/components/imports/import-history-filters";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { datasetSectionHref } from "@/lib/datasets/routes";
import type { Import } from "@/lib/db/schema";

const TYPE_LABELS: Record<Import["type"], string> = {
  products: "Products",
  sales: "Sales",
  traffic: "Traffic",
  reviews: "Reviews",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ImportHistoryTableProps = {
  datasetId: string;
  imports: Import[];
  page: number;
  pageCount: number;
  total: number;
  pathname: string;
  filters: Record<string, string | undefined>;
};

export function ImportHistoryTable({
  datasetId,
  imports,
  page,
  pageCount,
  total,
  pathname,
  filters,
}: ImportHistoryTableProps) {
  const [deletingImport, setDeletingImport] = useState<Pick<
    Import,
    "id" | "fileName"
  > | null>(null);

  const hasAnyImports = total > 0 || Object.values(filters).some(Boolean);

  if (!hasAnyImports) {
    return (
      <Empty className="mt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HistoryIcon />
          </EmptyMedia>
          <EmptyTitle>No imports yet</EmptyTitle>
          <EmptyDescription>
            Upload a CSV above to see its import history here, or add rows by
            hand instead.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={datasetSectionHref(datasetId, "products")}
          >
            Add products manually
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="mt-4">
      <ImportHistoryFilters />

      <div className="mt-4 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead className="text-right">Imported</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.length ? (
              imports.map((row) => (
                <TableRow className="hover:bg-muted/50" key={row.id}>
                  <TableCell>
                    <Link
                      className="block underline-offset-2 hover:underline"
                      href={`/dashboard/${datasetId}/import?importId=${row.id}`}
                    >
                      {TYPE_LABELS[row.type]}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.fileName}
                  </TableCell>
                  <TableCell className="text-right">{row.totalRows}</TableCell>
                  <TableCell className="text-right">
                    {row.importedRows}
                  </TableCell>
                  <TableCell className="text-right">{row.failedRows}</TableCell>
                  <TableCell>
                    <ImportStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {dateFormatter.format(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        setDeletingImport({
                          id: row.id,
                          fileName: row.fileName,
                        })
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2Icon />
                      <span className="sr-only">Delete import</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={8}
                >
                  No imports match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTableLinkPagination
        filters={filters}
        page={page}
        pageCount={pageCount}
        pathname={pathname}
        total={total}
      />

      {deletingImport ? (
        <ImportDeleteDialog
          datasetId={datasetId}
          importRow={deletingImport}
          onOpenChange={(open) => {
            if (!open) setDeletingImport(null);
          }}
          open
        />
      ) : null}
    </div>
  );
}
