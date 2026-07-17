"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type DataTablePaginationProps = {
  pageIndex: number;
  pageCount: number;
  rowCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

// Takes derived primitives instead of the table instance for the same
// reason as DataTable — see the comment there.
export function DataTablePagination({
  pageIndex,
  pageCount,
  rowCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="text-muted-foreground text-xs">{rowCount} row(s)</div>
      <div className="flex items-center gap-2">
        <span className="text-xs">
          Page {pageIndex + 1} of {pageCount || 1}
        </span>
        <Button
          disabled={!canPreviousPage}
          onClick={onPreviousPage}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeftIcon />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          disabled={!canNextPage}
          onClick={onNextPage}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRightIcon />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
