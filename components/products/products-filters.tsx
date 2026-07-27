"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useQueryParams } from "@/hooks/use-query-params";
import { UNCATEGORIZED_CATEGORY } from "@/lib/products/constants";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = "__all__";

type ProductsFiltersProps = {
  categories: string[];
};

export function ProductsFilters({ categories }: ProductsFiltersProps) {
  const { searchParams, isPending, updateParams } = useQueryParams();

  const mode = searchParams.get("mode") === "semantic" ? "semantic" : "exact";
  const category = searchParams.get("category") ?? ALL_CATEGORIES;
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value || undefined }, "replace");
  }, 350);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      <div className="flex flex-col gap-1.5">
        <Tabs
          onValueChange={(value) => {
            const nextMode = value as "exact" | "semantic";
            setSearchValue("");
            updateParams(
              {
                mode: nextMode === "semantic" ? "semantic" : undefined,
                search: undefined,
              },
              "push",
            );
          }}
          value={mode}
        >
          <TabsList>
            <TabsTrigger value="exact">Exact match</TabsTrigger>
            <TabsTrigger value="semantic">By description</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-7"
            onChange={(event) => {
              setSearchValue(event.target.value);
              debouncedSearch(event.target.value);
            }}
            placeholder={
              mode === "semantic"
                ? "Describe what you're looking for..."
                : "Search name or SKU..."
            }
            value={searchValue}
          />
        </div>
      </div>
      <DataTableFilter
        onValueChange={(value) =>
          updateParams(
            { category: value === ALL_CATEGORIES ? undefined : value },
            "push",
          )
        }
        options={[
          { value: ALL_CATEGORIES, label: "All categories" },
          { value: UNCATEGORIZED_CATEGORY, label: "Uncategorized" },
          ...categories.map((cat) => ({ value: cat, label: cat })),
        ]}
        value={category}
      />
    </div>
  );
}
