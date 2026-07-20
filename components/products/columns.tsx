"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { ClassificationBadge } from "@/components/analytics/classification-badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductClassification } from "@/lib/analytics/velocity";
import type { Product } from "@/lib/db/schema";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export type ProductWithClassification = Product & {
  classification: ProductClassification;
};

type CreateProductColumnsOptions = {
  datasetId: string;
  onEdit: (product: ProductWithClassification) => void;
  onDelete: (product: ProductWithClassification) => void;
};

export function createProductColumns({
  datasetId,
  onEdit,
  onDelete,
}: CreateProductColumnsOptions): ColumnDef<ProductWithClassification>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Link
          className="underline-offset-2 hover:underline"
          href={`/dashboard/${datasetId}/products/${row.original.id}`}
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant="outline">{row.original.category}</Badge>
        ) : (
          <span className="text-muted-foreground">Uncategorized</span>
        ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {currency.format(Number(row.original.price))}
        </div>
      ),
      sortingFn: (rowA, rowB) =>
        Number(rowA.original.price) - Number(rowB.original.price),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => (
        <div className="text-right">{row.original.stock ?? "—"}</div>
      ),
    },
    {
      accessorKey: "classification",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <ClassificationBadge classification={row.original.classification} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="icon-sm" variant="ghost" />}
          >
            <MoreVerticalIcon />
            <span className="sr-only">Product actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              variant="destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
