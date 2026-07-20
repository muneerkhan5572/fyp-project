import { Skeleton } from "@/components/ui/skeleton";

const CARD_IDS = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"];

export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_IDS.map((id) => (
          <Skeleton className="h-24 w-full" key={id} />
        ))}
      </div>
    </main>
  );
}
