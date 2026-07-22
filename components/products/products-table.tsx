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
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  createProductColumns,
  type ProductWithClassification,
} from "@/components/products/columns";
import { ProductDeleteDialog } from "@/components/products/product-delete-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { SemanticSearchInput } from "@/components/products/semantic-search-input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UNCATEGORIZED = "__uncategorized__";
const ALL_CATEGORIES = "__all__";

type ProductsTableProps = {
  datasetId: string;
  products: ProductWithClassification[];
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
  const [searchMode, setSearchMode] = useState<"exact" | "semantic">("exact");
  const [semanticOrder, setSemanticOrder] = useState<string[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithClassification | null>(null);
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithClassification | null>(null);

  const columns = useMemo(
    () =>
      createProductColumns({
        datasetId,
        onEdit: setEditingProduct,
        onDelete: setDeletingProduct,
      }),
    [datasetId],
  );

  const filteredProducts = useMemo(() => {
    let result = products;
    if (categoryFilter === UNCATEGORIZED) {
      result = result.filter((product) => !product.category);
    } else if (categoryFilter !== ALL_CATEGORIES) {
      result = result.filter((product) => product.category === categoryFilter);
    }

    if (semanticOrder) {
      const rank = new Map(semanticOrder.map((sku, index) => [sku, index]));
      result = [...result].sort(
        (a, b) =>
          (rank.get(a.sku) ?? Number.POSITIVE_INFINITY) -
          (rank.get(b.sku) ?? Number.POSITIVE_INFINITY),
      );
    }

    return result;
  }, [products, categoryFilter, semanticOrder]);

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
                href={`/dashboard/${datasetId}/import`}
              >
                Import CSV
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="flex flex-col gap-1.5">
                <Tabs
                  onValueChange={(value) => {
                    const mode = value as "exact" | "semantic";
                    setSearchMode(mode);
                    if (mode === "exact") {
                      setSemanticOrder(null);
                    } else {
                      setGlobalFilter("");
                    }
                  }}
                  value={searchMode}
                >
                  <TabsList>
                    <TabsTrigger value="exact">Exact match</TabsTrigger>
                    <TabsTrigger value="semantic">By description</TabsTrigger>
                  </TabsList>
                </Tabs>
                {searchMode === "exact" ? (
                  <div className="relative w-full max-w-xs">
                    <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-7"
                      onChange={(event) => setGlobalFilter(event.target.value)}
                      placeholder="Search name or SKU..."
                      value={globalFilter}
                    />
                  </div>
                ) : (
                  <SemanticSearchInput
                    datasetId={datasetId}
                    onResults={(skus) => {
                      setSemanticOrder(skus);
                      setSorting([]);
                    }}
                  />
                )}
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
