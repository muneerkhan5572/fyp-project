"use client";

import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALL_PRODUCTS = "__all__";

type ProductOption = { id: string; name: string; sku: string };

type TrafficFiltersProps = {
  products: ProductOption[];
};

export function TrafficFilters({ products }: TrafficFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") ?? ALL_PRODUCTS;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilters = productId !== ALL_PRODUCTS || Boolean(from) || Boolean(to);

  function updateParams(next: Record<string, string | undefined>) {
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
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DataTableFilter
        onValueChange={(value) =>
          updateParams({
            productId: value === ALL_PRODUCTS ? undefined : value,
          })
        }
        options={[
          { value: ALL_PRODUCTS, label: "All products" },
          ...products.map((product) => ({
            value: product.id,
            label: `${product.name} (${product.sku})`,
          })),
        ]}
        value={productId}
      />
      <Input
        aria-label="From date"
        className="w-36"
        onChange={(event) =>
          updateParams({ from: event.target.value || undefined })
        }
        type="date"
        value={from}
      />
      <span className="text-muted-foreground text-sm">to</span>
      <Input
        aria-label="To date"
        className="w-36"
        onChange={(event) =>
          updateParams({ to: event.target.value || undefined })
        }
        type="date"
        value={to}
      />
      {hasFilters ? (
        <Button onClick={() => router.push(pathname)} size="sm" variant="ghost">
          <XIcon />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
