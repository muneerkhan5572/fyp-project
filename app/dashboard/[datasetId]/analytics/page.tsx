import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  ChartCardSkeleton,
  ListCardSkeleton,
  TabbedChartCardSkeleton,
} from "@/components/analytics/card-skeletons";
import { CategoryBreakdownCard } from "@/components/analytics/category-breakdown-card";
import { ConversionRateCard } from "@/components/analytics/conversion-rate-card";
import { DateRangeSelect } from "@/components/analytics/date-range-select";
import { MarketingRecommendationsCard } from "@/components/analytics/marketing-recommendations-card";
import { MoversCard } from "@/components/analytics/movers-card";
import { ProfitByProductCard } from "@/components/analytics/profit-by-product-card";
import { RevenueUnitsCard } from "@/components/analytics/revenue-units-card";
import { SentimentAlertsCard } from "@/components/analytics/sentiment-alerts-card";
import { StockRiskCard } from "@/components/analytics/stock-risk-card";
import { TopProductsCard } from "@/components/analytics/top-products-card";
import { TrafficCard } from "@/components/analytics/traffic-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetBreadcrumbs } from "@/components/datasets/dataset-breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getDatasetDateBounds } from "@/lib/analytics/queries";
import { parseRangePreset, resolveDateRange } from "@/lib/analytics/range";
import { requireDataset } from "@/lib/datasets/dal";
import { datasetSectionHref } from "@/lib/datasets/routes";

export default async function DatasetAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { datasetId } = await params;
  const { range: rangeParam } = await searchParams;
  const dataset = await requireDataset(datasetId);

  const { maxDate } = await getDatasetDateBounds(dataset.id);

  const breadcrumbs = (
    <DatasetBreadcrumbs
      datasetId={dataset.id}
      datasetName={dataset.name}
      trail={[{ label: "Analytics" }]}
    />
  );

  if (!maxDate) {
    return (
      <div>
        <PageHeader
          breadcrumbs={breadcrumbs}
          description="Trends and breakdowns will appear here once this dataset has data."
          title="Analytics"
        />
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutDashboardIcon />
            </EmptyMedia>
            <EmptyTitle>Not enough data yet</EmptyTitle>
            <EmptyDescription>
              Finish setting up this dataset — add products and record some
              sales — to see trends and charts here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              className={buttonVariants()}
              href={datasetSectionHref(dataset.id, "import")}
            >
              Import data
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const range = resolveDateRange(parseRangePreset(rangeParam), maxDate);
  if (!range) {
    return null;
  }

  return (
    <div>
      <PageHeader
        actions={<DateRangeSelect />}
        breadcrumbs={breadcrumbs}
        description="Trends and breakdowns for this dataset."
        title="Analytics"
      />

      <div className="mt-6">
        <h2 className="font-semibold text-lg">Sales & traffic</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Suspense fallback={<TabbedChartCardSkeleton />}>
            <RevenueUnitsCard datasetId={dataset.id} range={range} />
          </Suspense>
          <Suspense fallback={<ChartCardSkeleton />}>
            <TrafficCard datasetId={dataset.id} range={range} />
          </Suspense>
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartCardSkeleton />}>
              <ConversionRateCard datasetId={dataset.id} range={range} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-lg">Product performance</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Suspense fallback={<TabbedChartCardSkeleton />}>
            <TopProductsCard datasetId={dataset.id} range={range} />
          </Suspense>
          <Suspense fallback={<ChartCardSkeleton />}>
            <CategoryBreakdownCard datasetId={dataset.id} range={range} />
          </Suspense>
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartCardSkeleton />}>
              <ProfitByProductCard datasetId={dataset.id} range={range} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mt-8" id="demand-classification">
        <h2 className="font-semibold text-lg">Demand classification</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Suspense fallback={<ListCardSkeleton />}>
            <MoversCard dataset={dataset} kind="high-demand" />
          </Suspense>
          <Suspense fallback={<ListCardSkeleton />}>
            <MoversCard dataset={dataset} kind="slow-mover" />
          </Suspense>
        </div>
      </div>

      <div className="mt-8" id="marketing-recommendations">
        <h2 className="font-semibold text-lg">Marketing recommendations</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Suspense fallback={<ListCardSkeleton />}>
            <MarketingRecommendationsCard dataset={dataset} />
          </Suspense>
        </div>
      </div>

      <div className="mt-8" id="stock-risk">
        <h2 className="font-semibold text-lg">Stock risk</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Suspense fallback={<ListCardSkeleton />}>
            <StockRiskCard datasetId={dataset.id} />
          </Suspense>
        </div>
      </div>

      <div className="mt-8" id="sentiment">
        <h2 className="font-semibold text-lg">Customer sentiment</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Suspense fallback={<ListCardSkeleton />}>
            <SentimentAlertsCard datasetId={dataset.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
