"use client";

import { CHART_COLORS } from "@/components/charts/palette";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import type { TrafficTrendPoint } from "@/lib/analytics/queries";

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

type TrafficTrendChartProps = {
  data: TrafficTrendPoint[];
};

export function TrafficTrendChart({ data }: TrafficTrendChartProps) {
  const chartData = data.map((point) => ({
    date: point.date,
    value: point.views,
  }));

  return (
    <TrendLineChart
      color={CHART_COLORS.traffic}
      data={chartData}
      label="Views"
      valueFormatter={(value) => compactNumber.format(value)}
    />
  );
}
