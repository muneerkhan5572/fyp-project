"use client";

import { CHART_COLORS } from "@/components/charts/palette";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import type { ConversionTrendPoint } from "@/lib/analytics/queries";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

type ConversionRateChartProps = {
  data: ConversionTrendPoint[];
};

export function ConversionRateChart({ data }: ConversionRateChartProps) {
  const chartData = data.map((point) => ({
    date: point.date,
    value: point.rate ?? 0,
  }));

  return (
    <TrendLineChart
      color={CHART_COLORS.traffic}
      data={chartData}
      label="Conversion rate"
      valueFormatter={(value) => percent.format(value)}
    />
  );
}
