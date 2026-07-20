"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type TrendLineChartProps = {
  data: { date: string; value: number }[];
  label: string;
  color: { light: string; dark: string };
  valueFormatter?: (value: number) => string;
};

const defaultFormatter = (value: number) => value.toLocaleString();

function formatDateTick(date: string) {
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

export function TrendLineChart({
  data,
  label,
  color,
  valueFormatter = defaultFormatter,
}: TrendLineChartProps) {
  const config: ChartConfig = {
    value: { label, theme: { light: color.light, dark: color.dark } },
  };

  return (
    <ChartContainer className="aspect-auto h-64 w-full" config={config}>
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
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
                  <span className="text-muted-foreground">{name}</span>
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
        <Line
          dataKey="value"
          dot={false}
          isAnimationActive={false}
          stroke="var(--color-value)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
}
