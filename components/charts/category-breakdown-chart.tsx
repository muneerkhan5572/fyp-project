"use client";

import { CHART_COLORS } from "@/components/charts/palette";
import { RankedBarChart } from "@/components/charts/ranked-bar-chart";
import type { CategoryBreakdownPoint } from "@/lib/analytics/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

type CategoryBreakdownChartProps = {
  data: CategoryBreakdownPoint[];
};

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const chartData = data
    .map((point) => ({ label: point.category, value: point.revenue }))
    .reverse();

  return (
    <RankedBarChart
      color={CHART_COLORS.neutral}
      data={chartData}
      seriesLabel="Revenue"
      valueFormatter={(value) => currency.format(value)}
    />
  );
}
