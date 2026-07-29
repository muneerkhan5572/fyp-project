import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KPI_IDS = ["kpi-1", "kpi-2", "kpi-3", "kpi-4", "kpi-5", "kpi-6"];
const ATTENTION_PILL_IDS = ["pill-1", "pill-2", "pill-3", "pill-4"];

export default function DatasetOverviewLoading() {
  return (
    <div>
      <PageHeaderSkeleton
        actionsWidth="w-32"
        descriptionWidth="w-64"
        titleWidth="w-28"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {KPI_IDS.map((id) => (
          <Skeleton className="h-20 w-full" key={id} />
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            {ATTENTION_PILL_IDS.map((id) => (
              <Skeleton className="h-8 w-36 rounded-full" key={id} />
            ))}
            <Skeleton className="h-4 w-72 basis-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
