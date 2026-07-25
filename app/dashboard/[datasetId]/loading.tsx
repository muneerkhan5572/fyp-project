import { Skeleton } from "@/components/ui/skeleton";

const TILE_IDS = ["tile-1", "tile-2", "tile-3", "tile-4"];
const ROW_IDS = ["row-1", "row-2", "row-3"];

export default function DatasetOverviewLoading() {
  return (
    <div>
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Skeleton className="mt-6 h-40 w-full" />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TILE_IDS.map((id) => (
          <Skeleton className="h-24 w-full" key={id} />
        ))}
      </div>

      <div className="mt-8 space-y-2">
        <Skeleton className="h-6 w-40" />
        {ROW_IDS.map((id) => (
          <Skeleton className="h-10 w-full" key={id} />
        ))}
      </div>
    </div>
  );
}
