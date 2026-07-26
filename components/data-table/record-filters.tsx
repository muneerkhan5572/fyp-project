"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ALL_PRODUCTS,
  type ProductOption,
  ProductPicker,
} from "@/components/data-table/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";

type RecordFiltersProps = {
  products?: ProductOption[];
  search?: boolean;
  searchPlaceholder?: string;
  dateRange?: boolean;
};

// Shared replacement for the (formerly byte-identical) sales-filters.tsx /
// traffic-filters.tsx. Debounced search commits via router.replace (no
// history entry per keystroke); discrete changes (product/date) commit via
// router.push. Both run inside useTransition so the filter bar can dim
// itself while a navigation is pending.
export function RecordFilters({
  products,
  search = false,
  searchPlaceholder = "Search...",
  dateRange = false,
}: RecordFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const productId = searchParams.get("productId") ?? ALL_PRODUCTS;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );

  const hasFilters =
    productId !== ALL_PRODUCTS ||
    Boolean(from) ||
    Boolean(to) ||
    Boolean(searchValue);

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
        router.push(href, { scroll: false });
      } else {
        router.replace(href, { scroll: false });
      }
    });
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value || undefined }, "replace");
  }, 350);

  function handleClear() {
    setSearchValue("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      {search ? (
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-7"
            onChange={(event) => {
              setSearchValue(event.target.value);
              debouncedSearch(event.target.value);
            }}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
        </div>
      ) : null}
      {products ? (
        <ProductPicker
          onValueChange={(value) =>
            updateParams(
              { productId: value === ALL_PRODUCTS ? undefined : value },
              "push",
            )
          }
          products={products}
          value={productId}
        />
      ) : null}
      {dateRange ? (
        <>
          <Input
            aria-label="From date"
            className="w-36"
            onChange={(event) =>
              updateParams({ from: event.target.value || undefined }, "push")
            }
            type="date"
            value={from}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            aria-label="To date"
            className="w-36"
            onChange={(event) =>
              updateParams({ to: event.target.value || undefined }, "push")
            }
            type="date"
            value={to}
          />
        </>
      ) : null}
      {hasFilters ? (
        <Button onClick={handleClear} variant="ghost">
          <XIcon />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
