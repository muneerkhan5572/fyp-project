"use client";

import { GenerateForecastButton } from "@/components/analytics/generate-forecast-button";
import { NoDataMessage } from "@/components/analytics/no-data-message";
import {
  ForecastChart,
  type ForecastChartPoint,
} from "@/components/charts/forecast-chart";
import { CHART_COLORS } from "@/components/charts/palette";
import type { Forecast } from "@/lib/db/schema";

const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});
const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ProductForecastCardProps = {
  datasetId: string;
  actualSeries: { date: string; units: number }[];
  forecast: Forecast | null;
};

function buildChartData(
  actualSeries: { date: string; units: number }[],
  forecast: Forecast | null,
): ForecastChartPoint[] {
  const points: ForecastChartPoint[] = actualSeries.map((point) => ({
    date: point.date,
    actual: point.units,
  }));

  if (!forecast || forecast.predictions.length === 0) {
    return points;
  }

  const lastActual = points.at(-1);
  if (lastActual) {
    lastActual.predicted = lastActual.actual;
    lastActual.lower = lastActual.actual;
    lastActual.bandHeight = 0;
  }

  for (const prediction of forecast.predictions) {
    points.push({
      date: prediction.date,
      predicted: prediction.predictedQuantity,
      lower: prediction.lowerBound,
      bandHeight: prediction.upperBound - prediction.lowerBound,
    });
  }

  return points;
}

export function ProductForecastCard({
  datasetId,
  actualSeries,
  forecast,
}: ProductForecastCardProps) {
  const chartData = buildChartData(actualSeries, forecast);
  const hasChartData = chartData.length > 0;

  const predictedTotals = forecast?.predictions.reduce(
    (acc, point) => ({
      units: acc.units + point.predictedQuantity,
      revenue: acc.revenue + point.predictedRevenue,
    }),
    { units: 0, revenue: 0 },
  );

  return (
    <div>
      {hasChartData ? (
        <ForecastChart
          color={CHART_COLORS.units}
          data={chartData}
          label="Units sold"
          valueFormatter={(value) => compactNumber.format(value)}
        />
      ) : (
        <NoDataMessage message="No sales recorded for this product yet." />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs">
          {forecast ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <span>
                Predicted next {forecast.horizonDays} days:{" "}
                <span className="font-medium text-foreground">
                  {compactNumber.format(predictedTotals?.units ?? 0)} units
                </span>{" "}
                /{" "}
                <span className="font-medium text-foreground">
                  {currency.format(predictedTotals?.revenue ?? 0)}
                </span>
              </span>
              {forecast.rmse !== null && forecast.mae !== null ? (
                <span>
                  Accuracy: typically off by ±{Number(forecast.mae).toFixed(1)}{" "}
                  units (MAE), RMSE {Number(forecast.rmse).toFixed(1)}
                </span>
              ) : null}
              <span>
                Generated {timestampFormatter.format(forecast.generatedAt)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              No forecast yet — this product needs at least a few weeks of sales
              history.
            </span>
          )}
        </div>
        <GenerateForecastButton
          datasetId={datasetId}
          hasExistingForecast={Boolean(forecast)}
        />
      </div>
      <p className="mt-1 text-muted-foreground text-xs">
        Trains one model across every product in this dataset — this refreshes
        forecasts for all of them, not just this product.
      </p>
    </div>
  );
}
