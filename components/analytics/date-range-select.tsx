"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { parseRangePreset, RANGE_PRESETS } from "@/lib/analytics/range";

export function DateRangeSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const range = parseRangePreset(searchParams.get("range") ?? undefined);

  return (
    <DataTableFilter
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      options={RANGE_PRESETS}
      value={range}
    />
  );
}
