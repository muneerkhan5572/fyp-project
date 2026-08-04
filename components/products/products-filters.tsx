"use client";

import { Mic, MicOff, SearchIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useQueryParams } from "@/hooks/use-query-params";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { UNCATEGORIZED_CATEGORY } from "@/lib/products/constants";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = "__all__";

type ProductsFiltersProps = {
  categories: string[];
};

export function ProductsFilters({ categories }: ProductsFiltersProps) {
  const { searchParams, isPending, updateParams } = useQueryParams();

  const category = searchParams.get("category") ?? ALL_CATEGORIES;
  const isSemantic = searchParams.get("searchMode") !== "lexical";
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value || undefined }, "replace");
  }, 350);

  const { isSupported, isListening, start, stop } = useSpeechRecognition();

  function handleMicClick() {
    if (isListening) {
      stop();
      return;
    }
    start(
      (transcript) => {
        setSearchValue(transcript);
        debouncedSearch(transcript);
      },
      (message) => toast.error(message),
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-row flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      <div className="relative min-w-40 flex-1">
        <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pr-16 pl-7"
          onChange={(event) => {
            setSearchValue(event.target.value);
            debouncedSearch(event.target.value);
          }}
          placeholder="Search by name or SKU..."
          value={searchValue}
        />
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
          <Button
            aria-label={
              isSemantic ? "Semantic search is on" : "Semantic search is off"
            }
            aria-pressed={isSemantic}
            className={cn(
              "size-6",
              isSemantic
                ? "text-primary hover:text-primary"
                : "text-muted-foreground",
            )}
            onClick={() =>
              updateParams(
                { searchMode: isSemantic ? "lexical" : undefined },
                "push",
              )
            }
            size="icon"
            variant="ghost"
          >
            <SparklesIcon className="size-3.5" />
          </Button>
          {isSupported ? (
            <Button
              aria-label={isListening ? "Stop voice search" : "Voice search"}
              aria-pressed={isListening}
              className={cn(
                "size-6",
                isListening
                  ? "text-destructive hover:text-destructive"
                  : "text-muted-foreground",
              )}
              onClick={handleMicClick}
              size="icon"
              variant="ghost"
            >
              {isListening ? (
                <MicOff className="size-3.5 animate-pulse" />
              ) : (
                <Mic className="size-3.5" />
              )}
            </Button>
          ) : null}
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
