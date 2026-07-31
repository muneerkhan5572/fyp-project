"use client";

import { Mic, MicOff, SearchIcon, SparklesIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ALL_PRODUCTS,
  type ProductOption,
  ProductPicker,
} from "@/components/data-table/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useQueryParams } from "@/hooks/use-query-params";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

type RecordFiltersProps = {
  products?: ProductOption[];
  search?: boolean;
  searchPlaceholder?: string;
  dateRange?: boolean;
  semanticSearch?: boolean;
};

export function RecordFilters({
  products,
  search = false,
  searchPlaceholder = "Search...",
  dateRange = false,
  semanticSearch = false,
}: RecordFiltersProps) {
  const { searchParams, isPending, updateParams, clearParams } =
    useQueryParams();

  const productId = searchParams.get("productId") ?? ALL_PRODUCTS;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const isSemantic = searchParams.get("searchMode") !== "lexical";
  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );

  const hasFilters =
    productId !== ALL_PRODUCTS ||
    Boolean(from) ||
    Boolean(to) ||
    Boolean(searchValue);

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

  function handleClear() {
    setSearchValue("");
    clearParams();
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-row flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      {search ? (
        <div className="relative min-w-40 flex-1">
          <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className={cn("pl-7", semanticSearch && "pr-16")}
            onChange={(event) => {
              setSearchValue(event.target.value);
              debouncedSearch(event.target.value);
            }}
            placeholder={searchPlaceholder}
            value={searchValue}
          />
          {semanticSearch ? (
            <div className="absolute top-0.5 right-1.5 flex items-center gap-0.5">
              <Button
                aria-label={
                  isSemantic
                    ? "Semantic search is on"
                    : "Semantic search is off"
                }
                aria-pressed={isSemantic}
                className={cn(
                  "size-5",
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
                  aria-label={
                    isListening ? "Stop voice search" : "Voice search"
                  }
                  aria-pressed={isListening}
                  className={cn(
                    "size-7",
                    isListening
                      ? "text-destructive hover:text-destructive"
                      : "text-muted-foreground",
                  )}
                  onClick={handleMicClick}
                  size="icon"
                  variant="ghost"
                >
                  {isListening ? (
                    <MicOff className="size-5 animate-pulse" />
                  ) : (
                    <Mic className="size-5" />
                  )}
                </Button>
              ) : null}
            </div>
          ) : null}
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
