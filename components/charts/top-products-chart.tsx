"use client";

import { useState } from "react";
import { CHART_COLORS } from "@/components/charts/palette";
import { RankedBarChart } from "@/components/charts/ranked-bar-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TopProduct } from "@/lib/analytics/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

type Metric = "revenue" | "units";

type TopProductsChartProps = {
  byRevenue: TopProduct[];
  byUnits: TopProduct[];
};

export function TopProductsChart({
  byRevenue,
  byUnits,
}: TopProductsChartProps) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const source = metric === "revenue" ? byRevenue : byUnits;
  const chartData = source
    .map((product) => ({
      label: product.name,
      value: metric === "revenue" ? product.revenue : product.units,
    }))
    .reverse();

  return (
    <div>
      <Tabs
        onValueChange={(value) => setMetric(value as Metric)}
        value={metric}
      >
        <TabsList>
          <TabsTrigger value="revenue">By revenue</TabsTrigger>
          <TabsTrigger value="units">By units</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4">
        <RankedBarChart
          color={CHART_COLORS.neutral}
          data={chartData}
          seriesLabel={metric === "revenue" ? "Revenue" : "Units sold"}
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
