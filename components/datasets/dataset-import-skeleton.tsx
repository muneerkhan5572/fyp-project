import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CHECKLIST_IDS = ["item-1", "item-2", "item-3", "item-4"];
const CHOICE_IDS = ["choice-1", "choice-2", "choice-3", "choice-4"];

const HISTORY_COLUMNS = [
  { id: "type", width: "w-16" },
  { id: "file", width: "w-32" },
  { id: "rows", width: "w-8", align: "right" as const },
  { id: "imported", width: "w-8", align: "right" as const },
  { id: "failed", width: "w-8", align: "right" as const },
  { id: "status", width: "w-20" },
  { id: "uploaded", width: "w-24" },
];

export function DatasetImportSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton descriptionWidth="w-64" titleWidth="w-40" />

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {CHECKLIST_IDS.map((id) => (
            <div
              className="flex flex-wrap items-center gap-3 rounded-md px-2 py-2"
              key={id}
            >
              <Skeleton className="size-4 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-1 h-3 w-64" />
              </div>
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CHOICE_IDS.map((id) => (
          <Card key={id}>
            <CardContent className="flex flex-col items-start gap-2">
              <Skeleton className="size-5" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-6 w-36" />
        <DataTableSkeleton
          columns={HISTORY_COLUMNS}
          toolbar={
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-7 w-32" />
            </div>
          }
        />
      </div>
    </div>
  );
}
