"use client";

import { MoreVerticalIcon, PackageIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ClassificationBadge } from "@/components/analytics/classification-badge";
import { DataTableLinkPagination } from "@/components/data-table/data-table-link-pagination";
import { DataTableSortHeader } from "@/components/data-table/data-table-sort-header";
import { ProductDeleteDialog } from "@/components/products/product-delete-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductsFilters } from "@/components/products/products-filters";
import { Badge } from "@/components/ui/badge";
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
import type { ProductClassification } from "@/lib/analytics/velocity";
import { datasetHref } from "@/lib/datasets/routes";
import type { Product } from "@/lib/db/schema";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export type ProductWithClassification = Product & {
  classification: ProductClassification;
};

type ProductsTableProps = {
  datasetId: string;
  categories: string[];
  rows: ProductWithClassification[];
  page: number;
  pageCount: number;
  total: number;
  pathname: string;
  filters: Record<string, string | undefined>;
  hasAnyProducts: boolean;
  currentSort: string;
  currentDir: "asc" | "desc";
  mode: "exact" | "semantic";
  semanticError?: string;
};

export function ProductsTable({
  datasetId,
  categories,
  rows,
  page,
  pageCount,
  total,
  pathname,
  filters,
  hasAnyProducts,
  currentSort,
  currentDir,
  mode,
  semanticError,
}: ProductsTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithClassification | null>(null);
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithClassification | null>(null);

  if (!hasAnyProducts) {
    return (
      <>
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>No products yet</EmptyTitle>
            <EmptyDescription>
              Add your first product, or import a CSV for bulk data.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon />
                Add product
              </Button>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={datasetHref(datasetId)}
              >
                Import CSV
              </Link>
            </div>
          </EmptyContent>
        </Empty>
        <ProductFormDialog
          categories={categories}
          datasetId={datasetId}
          onOpenChange={setCreateOpen}
          open={createOpen}
        />
      </>
    );
  }

  function sortHeader(field: string, label: string, className?: string) {
    if (mode === "semantic") {
      return <span className={className}>{label}</span>;
    }
    return (
      <DataTableSortHeader
        className={className}
        currentDir={currentDir}
        currentSort={currentSort}
        field={field}
        label={label}
        params={filters}
        pathname={pathname}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ProductsFilters categories={categories} />
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Add product
        </Button>
      </div>

      {semanticError ? (
        <p className="mt-4 text-destructive text-sm">{semanticError}</p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{sortHeader("name", "Name")}</TableHead>
              <TableHead>{sortHeader("sku", "SKU")}</TableHead>
              <TableHead>{sortHeader("category", "Category")}</TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  {sortHeader("price", "Price")}
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex justify-end">
                  {sortHeader("stock", "Stock")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      className="underline-offset-2 hover:underline"
                      href={`/dashboard/${datasetId}/products/${product.id}`}
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        Uncategorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {currency.format(Number(product.price))}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ClassificationBadge
                      classification={product.classification}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button size="icon" variant="ghost" />}
                      >
                        <MoreVerticalIcon />
                        <span className="sr-only">Product actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingProduct(product)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingProduct(product)}
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
                  colSpan={7}
                >
                  No products match these filters.
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

      <ProductFormDialog
        categories={categories}
        datasetId={datasetId}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
      {editingProduct ? (
        <ProductFormDialog
          categories={categories}
          datasetId={datasetId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProduct(null);
            }
          }}
          open={true}
          product={editingProduct}
        />
      ) : null}
      {deletingProduct ? (
        <ProductDeleteDialog
          datasetId={datasetId}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingProduct(null);
            }
          }}
          open={true}
          product={deletingProduct}
        />
      ) : null}
    </div>
  );
}
