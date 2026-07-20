import { Skeleton } from "@/components/ui/skeleton";

const ROW_IDS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];

export default function TrafficLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 space-y-2">
        <Skeleton className="h-9 w-full max-w-md" />
        {ROW_IDS.map((id) => (
          <Skeleton className="h-10 w-full" key={id} />
        ))}
      </div>
    </div>
  );
}
