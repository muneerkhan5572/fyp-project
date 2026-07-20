import { Skeleton } from "@/components/ui/skeleton";

const STAT_IDS = ["stat-1", "stat-2", "stat-3"];
const CHART_IDS = ["chart-1", "chart-2"];

export default function ProductDetailLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 grid grid-cols-3 gap-4">
        {STAT_IDS.map((id) => (
          <Skeleton className="h-16 w-full" key={id} />
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
