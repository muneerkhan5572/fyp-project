import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const KPI_IDS = ["kpi-1", "kpi-2", "kpi-3", "kpi-4", "kpi-5", "kpi-6"];
const CHART_IDS = ["chart-1", "chart-2"];

export default function DatasetOverviewLoading() {
  return (
    <div>
      <PageHeaderSkeleton
        actionsWidth="w-32"
        descriptionWidth="w-64"
        titleWidth="w-28"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {KPI_IDS.map((id) => (
          <Skeleton className="h-20 w-full" key={id} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CHART_IDS.map((id) => (
          <Skeleton className="h-72 w-full" key={id} />
        ))}
      </div>
    </div>
  );
}
