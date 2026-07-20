import { Skeleton } from "@/components/ui/skeleton";

const STAT_IDS = ["stat-1", "stat-2", "stat-3"];
const ROW_IDS = ["row-1", "row-2", "row-3", "row-4"];

export default function ImportReportLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        {STAT_IDS.map((id) => (
          <Skeleton className="h-16 w-full" key={id} />
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {ROW_IDS.map((id) => (
          <Skeleton className="h-10 w-full" key={id} />
        ))}
      </div>
    </div>
  );
}
