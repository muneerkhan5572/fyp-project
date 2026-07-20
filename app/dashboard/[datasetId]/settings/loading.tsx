import { Skeleton } from "@/components/ui/skeleton";

const CARD_IDS = ["card-1", "card-2", "card-3"];

export default function SettingsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 max-w-2xl space-y-4">
        {CARD_IDS.map((id) => (
          <Skeleton className="h-32 w-full" key={id} />
        ))}
      </div>
    </div>
  );
}
