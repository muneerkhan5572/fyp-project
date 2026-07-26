import { Skeleton } from "@/components/ui/skeleton";

const STAT_IDS = ["stat-1", "stat-2", "stat-3"];
const CHART_IDS = ["chart-1", "chart-2"];
const BADGE_IDS = ["badge-1", "badge-2", "badge-3", "badge-4", "badge-5"];

export default function ProductDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-48" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Skeleton className="h-8 w-56" />
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {BADGE_IDS.map((id) => (
              <Skeleton className="h-4 w-16" key={id} />
            ))}
          </div>
        </div>
        <Skeleton className="h-7 w-32" />
      </div>

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

      <div className="mt-6">
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
