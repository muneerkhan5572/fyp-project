"use client";

import { MoreVerticalIcon, PlusIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTableLinkPagination } from "@/components/data-table/data-table-link-pagination";
import { TrafficDeleteDialog } from "@/components/traffic/traffic-delete-dialog";
import { TrafficFilters } from "@/components/traffic/traffic-filters";
import { TrafficFormDialog } from "@/components/traffic/traffic-form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type ProductOption = { id: string; name: string; sku: string };

type TrafficRow = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  trafficDate: string;
  views: number;
};

type TrafficTableProps = {
  datasetId: string;
  rows: TrafficRow[];
  products: ProductOption[];
  page: number;
  pageCount: number;
  total: number;
  pathname: string;
  filters: Record<string, string | undefined>;
  hasAnyRecords: boolean;
};

export function TrafficTable({
  datasetId,
  rows,
  products,
  page,
  pageCount,
  total,
  pathname,
  filters,
  hasAnyRecords,
}: TrafficTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrafficRow | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<TrafficRow | null>(null);

  if (!hasAnyRecords) {
    return (
      <>
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrendingUpIcon />
            </EmptyMedia>
            <EmptyTitle>No traffic recorded yet</EmptyTitle>
            <EmptyDescription>
              {products.length === 0
                ? "Add a product first, then record traffic for it."
                : "Add your first traffic record, or import a CSV for bulk data."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex items-center gap-2">
              <Button
                disabled={products.length === 0}
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon />
                Add traffic record
              </Button>
              {products.length === 0 ? null : (
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  href={`/dashboard/${datasetId}/import`}
                >
                  Import CSV
                </Link>
              )}
            </div>
          </EmptyContent>
        </Empty>
        <TrafficFormDialog
          datasetId={datasetId}
          onOpenChange={setCreateOpen}
          open={createOpen}
          products={products}
        />
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TrafficFilters products={products} />
        <Button
          disabled={products.length === 0}
          onClick={() => setCreateOpen(true)}
          size="sm"
        >
          <PlusIcon />
          Add traffic record
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.trafficDate}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.productSku}
                  </TableCell>
                  <TableCell className="text-right">{row.views}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button size="icon-sm" variant="ghost" />}
                      >
                        <MoreVerticalIcon />
                        <span className="sr-only">Traffic record actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingRecord(row)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingRecord(row)}
                          variant="destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={5}
                >
                  No traffic records match these filters.
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

      <TrafficFormDialog
        datasetId={datasetId}
        onOpenChange={setCreateOpen}
        open={createOpen}
        products={products}
      />
      {editingRecord ? (
        <TrafficFormDialog
          datasetId={datasetId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingRecord(null);
            }
          }}
          open={true}
          products={products}
          record={editingRecord}
        />
      ) : null}
      {deletingRecord ? (
        <TrafficDeleteDialog
          datasetId={datasetId}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingRecord(null);
            }
          }}
          open={true}
          record={deletingRecord}
        />
      ) : null}
    </div>
  );
}
