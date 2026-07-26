"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const router = useRouter();
  const [jumpValue, setJumpValue] = useState(String(page));
  const canPrevious = page > 1;
  const canNext = page < pageCount;

  useEffect(() => {
    setJumpValue(String(page));
  }, [page]);

  function commitJump() {
    const parsed = Number.parseInt(jumpValue, 10);
    const targetPage = Number.isNaN(parsed)
      ? page
      : Math.min(Math.max(parsed, 1), pageCount);
    setJumpValue(String(targetPage));
    if (targetPage !== page) {
      router.push(buildHref(pathname, filters, targetPage));
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <p className="text-muted-foreground text-sm">
        {total} {total === 1 ? "record" : "records"}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          Page {page} of {pageCount}
        </span>
        {pageCount > 1 ? (
          <Input
            aria-label="Jump to page"
            className="h-8 w-16 text-center"
            max={pageCount}
            min={1}
            onBlur={commitJump}
            onChange={(event) => setJumpValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitJump();
              }
            }}
            type="number"
            value={jumpValue}
          />
        ) : null}
        {canPrevious ? (
          <Link
            className={buttonVariants({ size: "icon-sm", variant: "outline" })}
            href={buildHref(pathname, filters, page - 1)}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Previous page</span>
          </Link>
        ) : (
          <Button disabled size="icon-sm" variant="outline">
            <ChevronLeftIcon />
            <span className="sr-only">Previous page</span>
          </Button>
        )}
        {canNext ? (
          <Link
            className={buttonVariants({ size: "icon-sm", variant: "outline" })}
            href={buildHref(pathname, filters, page + 1)}
          >
            <ChevronRightIcon />
            <span className="sr-only">Next page</span>
          </Link>
        ) : (
          <Button disabled size="icon-sm" variant="outline">
            <ChevronRightIcon />
            <span className="sr-only">Next page</span>
          </Button>
        )}
      </div>
    </div>
  );
}
