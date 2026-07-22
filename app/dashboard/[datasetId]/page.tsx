import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryBreakdownCard } from "@/components/analytics/category-breakdown-card";
import { DateRangeSelect } from "@/components/analytics/date-range-select";
import { KpiCardsSection } from "@/components/analytics/kpi-cards";
import { MoversCard } from "@/components/analytics/movers-card";
import { RevenueUnitsCard } from "@/components/analytics/revenue-units-card";
import { StockRiskCard } from "@/components/analytics/stock-risk-card";
import { TopProductsCard } from "@/components/analytics/top-products-card";
import { TrafficCard } from "@/components/analytics/traffic-card";
import { BackLink } from "@/components/dashboard/back-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getDatasetDateBounds } from "@/lib/analytics/queries";
import { parseRangePreset, resolveDateRange } from "@/lib/analytics/range";
import { requireDataset } from "@/lib/datasets/dal";

function KpiRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {["kpi-1", "kpi-2", "kpi-3", "kpi-4"].map((id) => (
        <Skeleton className="h-20 w-full" key={id} />
      ))}
    </div>
  );
}

function ChartCardSkeleton() {
  return <Skeleton className="h-72 w-full" />;
}

export default async function DatasetOverviewPage({
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

  if (!maxDate) {
    return (
      <div>
        <BackLink href="/dashboard" label="All datasets" />
        <h1 className="mt-2 font-semibold text-2xl">{dataset.name} overview</h1>
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutDashboardIcon />
            </EmptyMedia>
            <EmptyTitle>Not enough data yet</EmptyTitle>
            <EmptyDescription>
              Add products and record some sales — or import a CSV — to see KPIs
              and charts here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              className={buttonVariants()}
              href={`/dashboard/${dataset.id}/import`}
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
      <BackLink href="/dashboard" label="All datasets" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-semibold text-2xl">{dataset.name} overview</h1>
          <p className="text-muted-foreground text-sm">
            KPIs and trends for this dataset.
          </p>
        </div>
        <DateRangeSelect />
      </div>

      <div className="mt-6">
        <Suspense fallback={<KpiRowSkeleton />}>
          <KpiCardsSection datasetId={dataset.id} range={range} />
        </Suspense>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartCardSkeleton />}>
          <RevenueUnitsCard datasetId={dataset.id} range={range} />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <TrafficCard datasetId={dataset.id} range={range} />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <TopProductsCard datasetId={dataset.id} range={range} />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <CategoryBreakdownCard datasetId={dataset.id} range={range} />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <MoversCard dataset={dataset} kind="high-demand" />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <MoversCard dataset={dataset} kind="slow-mover" />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <StockRiskCard datasetId={dataset.id} />
        </Suspense>
      </div>
    </div>
  );
}
