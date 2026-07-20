"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type RankedBarChartProps = {
  data: { label: string; value: number }[];
  seriesLabel: string;
  color: { light: string; dark: string };
  valueFormatter?: (value: number) => string;
};

const defaultFormatter = (value: number) => value.toLocaleString();

export function RankedBarChart({
  data,
  seriesLabel,
  color,
  valueFormatter = defaultFormatter,
}: RankedBarChartProps) {
  const config: ChartConfig = {
    value: {
      label: seriesLabel,
      theme: { light: color.light, dark: color.dark },
    },
  };
  const rowHeight = 32;
  const height = Math.max(160, data.length * rowHeight + 32);

  return (
    <ChartContainer
      className="aspect-auto w-full"
      config={config}
      style={{ height }}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 24, top: 8 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis
          axisLine={false}
          tickFormatter={valueFormatter}
          tickLine={false}
          tickMargin={8}
          type="number"
        />
        <YAxis
          axisLine={false}
          dataKey="label"
          tickLine={false}
          tickMargin={8}
          type="category"
          width={120}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-medium font-mono text-foreground tabular-nums">
                  {valueFormatter(Number(value))}
                </span>
              )}
              hideLabel
            />
          }
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar
          barSize={20}
          dataKey="value"
          fill="var(--color-value)"
          isAnimationActive={false}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
