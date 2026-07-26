import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableSortHeaderProps = {
  label: string;
  field: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  pathname: string;
  params: Record<string, string | undefined>;
  className?: string;
};

// Link-based sortable header for server-driven tables — a pure server
// re-render on click, no client sort state to go stale (sidesteps the React
// Compiler memoization gotcha that DataTable/DataTablePagination work around
// via derived-primitive props and header keying).
export function DataTableSortHeader({
  label,
  field,
  currentSort,
  currentDir,
  pathname,
  params,
  className,
}: DataTableSortHeaderProps) {
  const isActive = currentSort === field;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }
  query.set("sort", field);
  query.set("dir", nextDir);

  return (
    <Link
      className={cn(
        buttonVariants({ size: "sm", variant: "ghost" }),
        "-ml-2 h-7 gap-1",
        className,
      )}
      href={`${pathname}?${query.toString()}`}
    >
      {label}
      {isActive ? (
        currentDir === "asc" ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ArrowDownIcon className="size-3.5" />
        )
      ) : (
        <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
      )}
    </Link>
  );
}
