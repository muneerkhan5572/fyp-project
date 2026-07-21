import { notFound } from "next/navigation";
import { ClassificationBadge } from "@/components/analytics/classification-badge";
import { DateRangeSelect } from "@/components/analytics/date-range-select";
import { NoDataMessage } from "@/components/analytics/no-data-message";
import { ProductForecastCard } from "@/components/analytics/product-forecast-card";
import { RevenueUnitsChart } from "@/components/charts/revenue-units-chart";
import { TrafficTrendChart } from "@/components/charts/traffic-trend-chart";
import { BackLink } from "@/components/dashboard/back-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProductDateBounds,
  getProductSeries,
} from "@/lib/analytics/queries";
import { parseRangePreset, resolveDateRange } from "@/lib/analytics/range";
import {
  classifyProducts,
  type ProductClassification,
} from "@/lib/analytics/velocity";
import { requireDataset } from "@/lib/datasets/dal";
import { getLatestForecast } from "@/lib/forecasts/dal";
import { getProduct } from "@/lib/products/dal";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ datasetId: string; productId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { datasetId, productId } = await params;
  const { range: rangeParam } = await searchParams;
  const dataset = await requireDataset(datasetId);

  const product = await getProduct(dataset.id, productId);
  if (!product) {
    notFound();
  }

  const classified = await classifyProducts(dataset);
  const classification = classified.find(
    (entry) => entry.productId === product.id,
  ) ?? {
    classification: "no-data" as const,
    velocity: 0,
    historicalVelocity: 0,
    predictedVelocity: null,
    velocitySource: "historical" as const,
  };

  const { maxDate } = await getProductDateBounds(product.id);

  if (!maxDate) {
    return (
      <div>
        <BackLink href={`/dashboard/${dataset.id}/products`} label="Products" />
        <div className="mt-2">
          <ProductHeader
            classification={classification}
            product={product}
            windowDays={dataset.velocityWindowDays}
          />
        </div>
        <div className="mt-10">
          <NoDataMessage message="No sales recorded for this product yet." />
        </div>
      </div>
    );
  }

  const range = resolveDateRange(parseRangePreset(rangeParam), maxDate);
  if (!range) {
    return null;
  }

  const series = await getProductSeries(product.id, range);
  const totals = series.reduce(
    (acc, point) => ({
      units: acc.units + point.units,
      revenue: acc.revenue + point.revenue,
      views: acc.views + point.views,
    }),
    { units: 0, revenue: 0, views: 0 },
  );

  const dailyTrend = series.map((point) => ({
    date: point.date,
    revenue: point.revenue,
    units: point.units,
  }));
  const trafficTrend = series.map((point) => ({
    date: point.date,
    views: point.views,
  }));
  const hasSales = totals.units > 0 || totals.revenue > 0;
  const hasViews = totals.views > 0;
  const forecast = await getLatestForecast(dataset.id, product.id);

  return (
    <div>
      <BackLink href={`/dashboard/${dataset.id}/products`} label="Products" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <ProductHeader
          classification={classification}
          product={product}
          windowDays={dataset.velocityWindowDays}
        />
        <DateRangeSelect />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Units sold</p>
          <p className="font-semibold text-xl">
            {compactNumber.format(totals.units)}
          </p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Revenue</p>
          <p className="font-semibold text-xl">
            {currency.format(totals.revenue)}
          </p>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Views</p>
          <p className="font-semibold text-xl">
            {compactNumber.format(totals.views)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales trend</CardTitle>
          </CardHeader>
          <CardContent>
            {hasSales ? (
              <RevenueUnitsChart data={dailyTrend} />
            ) : (
              <NoDataMessage message="No sales recorded for this period." />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Views trend</CardTitle>
          </CardHeader>
          <CardContent>
            {hasViews ? (
              <TrafficTrendChart data={trafficTrend} />
            ) : (
              <NoDataMessage message="No traffic recorded for this period." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Demand forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForecastCard
              actualSeries={dailyTrend}
              datasetId={dataset.id}
              forecast={forecast}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductHeader({
  product,
  classification,
  windowDays,
}: {
  product: {
    name: string;
    sku: string;
    category: string | null;
    price: string;
  };
  classification: {
    classification: ProductClassification;
    velocity: number;
    historicalVelocity: number;
    predictedVelocity: number | null;
    velocitySource: "forecast" | "historical";
  };
  windowDays: number;
}) {
  return (
    <div>
      <h1 className="font-semibold text-2xl">{product.name}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
        <span className="font-mono text-xs">{product.sku}</span>
        {product.category ? (
          <Badge variant="outline">{product.category}</Badge>
        ) : null}
        <span>{currency.format(Number(product.price))}</span>
        <ClassificationBadge classification={classification.classification} />
        {classification.velocitySource === "forecast" &&
        classification.predictedVelocity !== null ? (
          <span className="text-xs">
            predicted velocity: {classification.predictedVelocity.toFixed(2)}{" "}
            units/day · historical:{" "}
            {classification.historicalVelocity.toFixed(2)} units/day over last{" "}
            {windowDays} days
          </span>
        ) : (
          <span className="text-xs">
            velocity: {classification.velocity.toFixed(2)} units/day over last{" "}
            {windowDays} days
          </span>
        )}
      </div>
    </div>
  );
}
