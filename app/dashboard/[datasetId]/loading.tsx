import { Skeleton } from "@/components/ui/skeleton";

const KPI_IDS = ["kpi-1", "kpi-2", "kpi-3", "kpi-4"];
const CHART_IDS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

export default function DatasetOverviewLoading() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
