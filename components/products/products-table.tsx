"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { PackageIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { createProductColumns } from "@/components/products/columns";
import { ProductDeleteDialog } from "@/components/products/product-delete-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/db/schema";

const UNCATEGORIZED = "__uncategorized__";
const ALL_CATEGORIES = "__all__";

type ProductsTableProps = {
  datasetId: string;
  products: Product[];
  categories: string[];
};

export function ProductsTable({
  datasetId,
  products,
  categories,
}: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const columns = useMemo(
    () =>
      createProductColumns({
        onEdit: setEditingProduct,
        onDelete: setDeletingProduct,
      }),
    [],
  );

  const filteredProducts = useMemo(() => {
    if (categoryFilter === ALL_CATEGORIES) {
      return products;
    }
    if (categoryFilter === UNCATEGORIZED) {
      return products.filter((product) => !product.category);
    }
    return products.filter((product) => product.category === categoryFilter);
  }, [products, categoryFilter]);

  const table = useReactTable({
    columns,
    data: filteredProducts,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 20 } },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: { globalFilter, sorting },
  });

  const isEmpty = products.length === 0;

  return (
    <div>
      {isEmpty ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>No products yet</EmptyTitle>
            <EmptyDescription>
              Add your first product to start building this dataset's catalog.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Add product
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-7"
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  placeholder="Search name or SKU..."
                  value={globalFilter}
                />
              </div>
              <DataTableFilter
                onValueChange={setCategoryFilter}
                options={[
                  { value: ALL_CATEGORIES, label: "All categories" },
                  { value: UNCATEGORIZED, label: "Uncategorized" },
                  ...categories.map((category) => ({
                    value: category,
                    label: category,
                  })),
                ]}
                value={categoryFilter}
              />
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <PlusIcon />
              Add product
            </Button>
          </div>

          <div className="mt-4">
            <DataTable
              columnCount={columns.length}
              headerGroups={table.getHeaderGroups()}
              rows={table.getRowModel().rows}
              sorting={sorting}
            />
            <DataTablePagination
              canNextPage={table.getCanNextPage()}
              canPreviousPage={table.getCanPreviousPage()}
              onNextPage={() => table.nextPage()}
              onPreviousPage={() => table.previousPage()}
              pageCount={table.getPageCount()}
              pageIndex={table.getState().pagination.pageIndex}
              rowCount={table.getFilteredRowModel().rows.length}
            />
          </div>
        </>
      )}

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
