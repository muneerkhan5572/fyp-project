"use client";

import { CHART_COLORS } from "@/components/charts/palette";
import { RankedBarChart } from "@/components/charts/ranked-bar-chart";
import type { TopProductByProfit } from "@/lib/analytics/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

export function ProfitByProductChart({ data }: { data: TopProductByProfit[] }) {
  const chartData = data
    .map((product) => ({ label: product.name, value: product.profit }))
    .reverse();

  return (
    <RankedBarChart
      color={CHART_COLORS.profit}
      data={chartData}
      seriesLabel="Profit"
      valueFormatter={(value) => currency.format(value)}
    />
  );
}
