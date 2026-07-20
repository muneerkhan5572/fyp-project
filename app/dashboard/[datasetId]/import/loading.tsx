import { Skeleton } from "@/components/ui/skeleton";

const CARD_IDS = ["products", "sales", "traffic"];
const ROW_IDS = ["row-1", "row-2", "row-3"];

export default function ImportLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CARD_IDS.map((id) => (
          <Skeleton className="h-40 w-full" key={id} />
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
