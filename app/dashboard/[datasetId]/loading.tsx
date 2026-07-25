import { Skeleton } from "@/components/ui/skeleton";

export default function DatasetOverviewLoading() {
  return (
    <div>
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}
