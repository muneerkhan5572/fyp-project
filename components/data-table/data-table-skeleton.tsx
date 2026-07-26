import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableSkeletonColumn = {
  id: string;
  width: string;
  align?: "right";
};

type DataTableSkeletonProps = {
  columns: DataTableSkeletonColumn[];
  rows?: number;
  toolbar?: ReactNode;
  pagination?: boolean;
};

export function DataTableSkeleton({
  columns,
  rows = 6,
  toolbar,
  pagination = true,
}: DataTableSkeletonProps) {
  const rowIds = Array.from({ length: rows }, (_, index) => `row-${index}`);

  return (
    <div>
      {toolbar}
      <div className="mt-4 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  className={column.align === "right" ? "text-right" : ""}
                  key={column.id}
                >
                  <Skeleton
                    className={cn(
                      "h-4",
                      column.width,
                      column.align === "right" && "ml-auto",
                    )}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowIds.map((id) => (
              <TableRow key={id}>
                {columns.map((column) => (
                  <TableCell
                    className={column.align === "right" ? "text-right" : ""}
                    key={column.id}
                  >
                    <Skeleton
                      className={cn(
                        "h-4",
                        column.width,
                        column.align === "right" && "ml-auto",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between gap-2 py-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
