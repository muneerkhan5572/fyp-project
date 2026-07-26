"use client";

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export const ALL_PRODUCTS = "__all__";

export type ProductOption = { id: string; name: string; sku: string };

type ProductPickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  products: ProductOption[];
  id?: string;
};

// A typeahead-enabled product filter: a search Input composed inside the
// existing DropdownMenu popup rather than a shadcn Select/Combobox, which
// crashes on item click with this project's Base UI version. All keydown
// events except Escape are stopped from bubbling to the menu — Base UI's
// Menu has its own built-in character-key typeahead that jumps focus to a
// matching item, which would otherwise steal every keystroke from this
// input before it ever reaches the value.
export function ProductPicker({
  value,
  onValueChange,
  products,
  id,
}: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const current = products.find((product) => product.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <DropdownMenu
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
      open={open}
    >
      <DropdownMenuTrigger
        render={
          <Button className="justify-between gap-2" id={id} variant="outline" />
        }
      >
        <span className="truncate">
          {current ? `${current.name} (${current.sku})` : "All products"}
        </span>
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="relative p-1 pb-0">
          <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            className="pl-7"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Escape") {
                event.stopPropagation();
              }
            }}
            placeholder="Search products..."
            value={query}
          />
        </div>
        <DropdownMenuGroup className="mt-1 max-h-64 overflow-y-auto">
          <DropdownMenuItem onClick={() => onValueChange(ALL_PRODUCTS)}>
            All products
          </DropdownMenuItem>
          {filtered.map((product) => (
            <DropdownMenuItem
              key={product.id}
              onClick={() => onValueChange(product.id)}
            >
              {product.name} ({product.sku})
            </DropdownMenuItem>
          ))}
          {filtered.length === 0 ? (
            <div className="px-2 py-1.5 text-muted-foreground text-xs">
              No products match &quot;{query}&quot;.
            </div>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
