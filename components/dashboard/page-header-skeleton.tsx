import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageHeaderSkeletonProps = {
  titleWidth: string;
  descriptionWidth: string;
  actionsWidth?: string;
  breadcrumbs?: boolean;
};

export function PageHeaderSkeleton({
  titleWidth,
  descriptionWidth,
  actionsWidth,
  breadcrumbs = true,
}: PageHeaderSkeletonProps) {
  return (
    <div className="mb-6">
      {breadcrumbs ? <Skeleton className="h-4 w-48" /> : null}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Skeleton className={cn("h-8", titleWidth)} />
          <Skeleton className={cn("mt-2 h-4", descriptionWidth)} />
        </div>
        {actionsWidth ? <Skeleton className={cn("h-7", actionsWidth)} /> : null}
      </div>
    </div>
  );
}
