"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type ForecastChartPoint = {
  date: string;
  actual?: number;
  predicted?: number;
  lower?: number;
  bandHeight?: number;
};

type ForecastChartProps = {
  data: ForecastChartPoint[];
  label: string;
  color: { light: string; dark: string };
  valueFormatter?: (value: number) => string;
};

const defaultFormatter = (value: number) => value.toLocaleString();

function formatDateTick(date: string) {
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

export function ForecastChart({
  data,
  label,
  color,
  valueFormatter = defaultFormatter,
}: ForecastChartProps) {
  const config: ChartConfig = {
    actual: { label, theme: { light: color.light, dark: color.dark } },
    predicted: {
      label: `${label} (forecast)`,
      theme: { light: color.light, dark: color.dark },
    },
  };

  return (
    <ChartContainer className="aspect-auto h-64 w-full" config={config}>
      <ComposedChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="date"
          minTickGap={32}
          tickFormatter={formatDateTick}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          axisLine={false}
          tickFormatter={valueFormatter}
          tickLine={false}
          tickMargin={8}
          width={56}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {name === "predicted" ? `${label} (forecast)` : label}
                  </span>
                  <span className="font-medium font-mono text-foreground tabular-nums">
                    {valueFormatter(Number(value))}
                  </span>
                </div>
              )}
              labelFormatter={(value) => formatDateTick(String(value))}
            />
          }
          cursor={{ stroke: "var(--border)" }}
        />
        <Area
          dataKey="lower"
          fill="transparent"
          isAnimationActive={false}
          stackId="band"
          stroke="none"
          tooltipType="none"
        />
        <Area
          dataKey="bandHeight"
          fill="var(--color-predicted)"
          fillOpacity={0.12}
          isAnimationActive={false}
          stackId="band"
          stroke="none"
          tooltipType="none"
        />
        <Line
          connectNulls={false}
          dataKey="actual"
          dot={false}
          isAnimationActive={false}
          stroke="var(--color-actual)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          connectNulls
          dataKey="predicted"
          dot={false}
          isAnimationActive={false}
          stroke="var(--color-predicted)"
          strokeDasharray="4 4"
          strokeWidth={2}
          type="monotone"
        />
      </ComposedChart>
    </ChartContainer>
  );
}
