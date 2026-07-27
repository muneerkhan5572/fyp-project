import { LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DateRangeSelect } from "@/components/analytics/date-range-select";
import { KpiCardsSection } from "@/components/analytics/kpi-cards";
import { MoversCard } from "@/components/analytics/movers-card";
import { StockRiskCard } from "@/components/analytics/stock-risk-card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getDatasetDateBounds } from "@/lib/analytics/queries";
import { parseRangePreset, resolveDateRange } from "@/lib/analytics/range";
import { requireDataset } from "@/lib/datasets/dal";
import { datasetSectionHref } from "@/lib/datasets/routes";

function KpiRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {["kpi-1", "kpi-2", "kpi-3", "kpi-4", "kpi-5", "kpi-6"].map((id) => (
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

  const breadcrumbs = (
    <DatasetBreadcrumbs
      datasetId={dataset.id}
      datasetName={dataset.name}
      trail={[{ label: "Overview" }]}
    />
  );

  if (!maxDate) {
    return (
      <div>
        <PageHeader
          breadcrumbs={breadcrumbs}
          description="Top-line numbers will appear here once this dataset has data."
          title="Overview"
        />
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutDashboardIcon />
            </EmptyMedia>
            <EmptyTitle>Not enough data yet</EmptyTitle>
            <EmptyDescription>
              Finish setting up this dataset — add products and record some
              sales — to see KPIs here.
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
        description="Top-line numbers for this dataset."
        title="Overview"
      />

      <div>
        <Suspense fallback={<KpiRowSkeleton />}>
          <KpiCardsSection datasetId={dataset.id} range={range} />
        </Suspense>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartCardSkeleton />}>
          <MoversCard dataset={dataset} kind="high-demand" />
        </Suspense>
        <Suspense fallback={<ChartCardSkeleton />}>
          <StockRiskCard datasetId={dataset.id} />
        </Suspense>
      </div>
    </div>
  );
}
