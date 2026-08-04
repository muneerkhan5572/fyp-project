import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROW_IDS = ["a", "b", "c", "d", "e", "f"];

export default function ReviewsLoading() {
  return (
    <div>
      <PageHeaderSkeleton descriptionWidth="w-80" titleWidth="w-24" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-7 w-36" />
        </div>
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="mt-4 space-y-2">
        {SKELETON_ROW_IDS.map((id) => (
          <Skeleton className="h-11 w-full rounded-md" key={id} />
        ))}
      </div>
    </div>
  );
}
