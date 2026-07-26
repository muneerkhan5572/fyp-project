"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { Import } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const ALL_TYPES = "__all__";
const ALL_STATUSES = "__all__";

const TYPE_LABELS: Record<Import["type"], string> = {
  products: "Products",
  sales: "Sales",
  traffic: "Traffic",
};

const STATUS_LABELS: Record<Import["status"], string> = {
  completed: "Completed",
  completed_with_errors: "Completed with errors",
  failed: "Failed",
};

export function ImportHistoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const type = searchParams.get("type") ?? ALL_TYPES;
  const status = searchParams.get("status") ?? ALL_STATUSES;
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );

  const hasFilters =
    type !== ALL_TYPES || status !== ALL_STATUSES || Boolean(searchValue);

  function updateParams(
    next: Record<string, string | undefined>,
    mode: "push" | "replace",
  ) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      if (mode === "push") {
        router.push(href);
      } else {
        router.replace(href);
      }
    });
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value || undefined }, "replace");
  }, 350);

  function handleClear() {
    setSearchValue("");
    startTransition(() => router.push(pathname));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      <div className="relative w-full max-w-xs">
        <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-7"
          onChange={(event) => {
            setSearchValue(event.target.value);
            debouncedSearch(event.target.value);
          }}
          placeholder="Search file name..."
          value={searchValue}
        />
      </div>
      <DataTableFilter
        onValueChange={(value) =>
          updateParams(
            { type: value === ALL_TYPES ? undefined : value },
            "push",
          )
        }
        options={[
          { value: ALL_TYPES, label: "All types" },
          ...(Object.entries(TYPE_LABELS) as [Import["type"], string][]).map(
            ([value, label]) => ({ value, label }),
          ),
        ]}
        value={type}
      />
      <DataTableFilter
        onValueChange={(value) =>
          updateParams(
            { status: value === ALL_STATUSES ? undefined : value },
            "push",
          )
        }
        options={[
          { value: ALL_STATUSES, label: "All statuses" },
          ...(
            Object.entries(STATUS_LABELS) as [Import["status"], string][]
          ).map(([value, label]) => ({ value, label })),
        ]}
        value={status}
      />
      {hasFilters ? (
        <Button onClick={handleClear} variant="ghost">
          <XIcon />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
