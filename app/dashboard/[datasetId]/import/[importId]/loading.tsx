import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const STAT_IDS = ["stat-1", "stat-2", "stat-3"];
const ROW_IDS = ["row-1", "row-2", "row-3", "row-4"];

export default function ImportReportLoading() {
  return (
    <div>
      <PageHeaderSkeleton descriptionWidth="w-56" titleWidth="w-40" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {STAT_IDS.map((id) => (
          <Skeleton className="h-16 w-full" key={id} />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {ROW_IDS.map((id) => (
          <Skeleton className="h-9 w-full" key={id} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-36" />
      </div>
    </div>
  );
}
