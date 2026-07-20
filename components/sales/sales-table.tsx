"use client";

import { MoreVerticalIcon, PlusIcon, ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTableLinkPagination } from "@/components/data-table/data-table-link-pagination";
import { SaleDeleteDialog } from "@/components/sales/sale-delete-dialog";
import { SaleFormDialog } from "@/components/sales/sale-form-dialog";
import { SalesFilters } from "@/components/sales/sales-filters";
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

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type ProductOption = { id: string; name: string; sku: string };

type SaleRow = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  saleDate: string;
  quantity: number;
  revenue: string;
};

type SalesTableProps = {
  datasetId: string;
  rows: SaleRow[];
  products: ProductOption[];
  page: number;
  pageCount: number;
  total: number;
  pathname: string;
  filters: Record<string, string | undefined>;
  hasAnyRecords: boolean;
};

export function SalesTable({
  datasetId,
  rows,
  products,
  page,
  pageCount,
  total,
  pathname,
  filters,
  hasAnyRecords,
}: SalesTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRow | null>(null);
  const [deletingSale, setDeletingSale] = useState<SaleRow | null>(null);

  if (!hasAnyRecords) {
    return (
      <>
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptIcon />
            </EmptyMedia>
            <EmptyTitle>No sales recorded yet</EmptyTitle>
            <EmptyDescription>
              {products.length === 0
                ? "Add a product first, then record sales for it."
                : "Add your first sale, or import a CSV for bulk data."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex items-center gap-2">
              <Button
                disabled={products.length === 0}
                onClick={() => setCreateOpen(true)}
              >
                <PlusIcon />
                Add sale
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
        <SaleFormDialog
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
        <SalesFilters products={products} />
        <Button
          disabled={products.length === 0}
          onClick={() => setCreateOpen(true)}
          size="sm"
        >
          <PlusIcon />
          Add sale
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.saleDate}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.productSku}
                  </TableCell>
                  <TableCell className="text-right">{row.quantity}</TableCell>
                  <TableCell className="text-right">
                    {currency.format(Number(row.revenue))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button size="icon-sm" variant="ghost" />}
                      >
                        <MoreVerticalIcon />
                        <span className="sr-only">Sale actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSale(row)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingSale(row)}
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
                  colSpan={6}
                >
                  No sales match these filters.
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

      <SaleFormDialog
        datasetId={datasetId}
        onOpenChange={setCreateOpen}
        open={createOpen}
        products={products}
      />
      {editingSale ? (
        <SaleFormDialog
          datasetId={datasetId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSale(null);
            }
          }}
          open={true}
          products={products}
          sale={editingSale}
        />
      ) : null}
      {deletingSale ? (
        <SaleDeleteDialog
          datasetId={datasetId}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingSale(null);
            }
          }}
          open={true}
          sale={deletingSale}
        />
      ) : null}
    </div>
  );
}
