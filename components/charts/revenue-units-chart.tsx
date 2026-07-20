"use client";

import { useState } from "react";
import { CHART_COLORS } from "@/components/charts/palette";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DailyTrendPoint } from "@/lib/analytics/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

type Metric = "revenue" | "units";

type RevenueUnitsChartProps = {
  data: DailyTrendPoint[];
};

export function RevenueUnitsChart({ data }: RevenueUnitsChartProps) {
  const [metric, setMetric] = useState<Metric>("revenue");

  const chartData = data.map((point) => ({
    date: point.date,
    value: metric === "revenue" ? point.revenue : point.units,
  }));

  return (
    <div>
      <Tabs
        onValueChange={(value) => setMetric(value as Metric)}
        value={metric}
      >
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="units">Units sold</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4">
        <TrendLineChart
          color={CHART_COLORS[metric]}
          data={chartData}
          label={metric === "revenue" ? "Revenue" : "Units sold"}
          valueFormatter={
            metric === "revenue"
              ? (value) => currency.format(value)
              : (value) => compactNumber.format(value)
          }
        />
      </div>
    </div>
  );
}
