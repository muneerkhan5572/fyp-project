import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { Card, CardAction, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_IDS = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"];

export default function DashboardLoading() {
  return (
    <>
      <DashboardTopbar />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-10">
        <PageHeaderSkeleton
          actionsWidth="w-32"
          breadcrumbs={false}
          descriptionWidth="w-96"
          titleWidth="w-24"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_IDS.map((id) => (
            <Card key={id}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-3 w-24" />
                <CardAction>
                  <Skeleton className="size-7" />
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
