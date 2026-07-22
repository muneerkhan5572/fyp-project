"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { semanticSearchProducts } from "@/app/actions/search";
import { Input } from "@/components/ui/input";

type SemanticSearchInputProps = {
  datasetId: string;
  onResults: (skus: string[] | null) => void;
};

export function SemanticSearchInput({
  datasetId,
  onResults,
}: SemanticSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isSearching, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      onResults(null);
      return;
    }
    startTransition(async () => {
      const result = await semanticSearchProducts(datasetId, query);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onResults(result.skus ?? null);
    });
  };

  const handleClear = () => {
    setQuery("");
    onResults(null);
  };

  return (
    <form className="relative w-full max-w-xs" onSubmit={handleSubmit}>
      <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pr-7 pl-7"
        disabled={isSearching}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={
          isSearching ? "Searching..." : "Describe what you're looking for..."
        }
        value={query}
      />
      {query ? (
        <button
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
          type="button"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </form>
  );
}
