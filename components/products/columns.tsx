"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreVerticalIcon } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/lib/db/schema";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type CreateProductColumnsOptions = {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function createProductColumns({
  onEdit,
  onDelete,
}: CreateProductColumnsOptions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
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
