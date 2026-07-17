"use client";

import {
  flexRender,
  type HeaderGroup,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableProps<TData> = {
  headerGroups: HeaderGroup<TData>[];
  rows: Row<TData>[];
  columnCount: number;
  sorting?: SortingState;
  emptyMessage?: string;
};

// Takes derived row/header data (fresh array references produced by
// table.getRowModel()/getHeaderGroups()) rather than the table instance
// itself. TanStack keeps that instance's object identity stable across
// renders (it mutates internally), which reads as "unchanged props" to
// automatic memoization and silently stops this component from
// re-rendering when the underlying data changes.
//
// Sorting needs an extra layer of this fix: table/column/header objects
// stay referentially stable when only the sort direction changes (unlike
// rows, which get a fresh array), so a sortable header cell's own props
// never change and the compiler skips re-rendering it after mount,
// freezing its sort icon and toggle handler on the first click. Keying
// each header cell off the current sorting state forces React to remount
// it whenever sorting changes, sidestepping that stale-props chain.
export function DataTable<TData>({
  headerGroups,
  rows,
  columnCount,
  sorting = [],
  emptyMessage = "No results.",
}: DataTableProps<TData>) {
  const sortingKey = sorting.map((sort) => `${sort.id}:${sort.desc}`).join(",");

  return (
    <Table>
      <TableHeader>
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={`${header.id}-${sortingKey}`}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              className="h-24 text-center text-muted-foreground"
              colSpan={columnCount}
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
