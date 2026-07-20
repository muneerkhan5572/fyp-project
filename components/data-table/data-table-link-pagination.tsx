import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableLinkPaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pathname: string;
  filters?: Record<string, string | undefined>;
};

function buildHref(
  pathname: string,
  filters: Record<string, string | undefined>,
  targetPage: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  if (targetPage > 1) {
    params.set("page", String(targetPage));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function DataTableLinkPagination({
  page,
  pageCount,
  total,
  pathname,
  filters = {},
}: DataTableLinkPaginationProps) {
  const canPrevious = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <p className="text-muted-foreground text-sm">
        {total} {total === 1 ? "record" : "records"}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          Page {page} of {pageCount}
        </span>
        <Link
          aria-disabled={!canPrevious}
          className={cn(
            buttonVariants({ size: "icon-sm", variant: "outline" }),
            !canPrevious && "pointer-events-none opacity-50",
          )}
          href={buildHref(pathname, filters, page - 1)}
        >
          <ChevronLeftIcon />
        </Link>
        <Link
          aria-disabled={!canNext}
          className={cn(
            buttonVariants({ size: "icon-sm", variant: "outline" }),
            !canNext && "pointer-events-none opacity-50",
          )}
          href={buildHref(pathname, filters, page + 1)}
        >
          <ChevronRightIcon />
        </Link>
      </div>
    </div>
  );
}
