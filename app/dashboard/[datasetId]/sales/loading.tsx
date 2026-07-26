import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS = [
  { id: "date", width: "w-20" },
  { id: "product", width: "w-32" },
  { id: "sku", width: "w-20" },
  { id: "quantity", width: "w-10", align: "right" as const },
  { id: "revenue", width: "w-16", align: "right" as const },
  { id: "actions", width: "size-7" },
];

export default function SalesLoading() {
  return (
    <div>
      <PageHeaderSkeleton descriptionWidth="w-80" titleWidth="w-20" />
      <DataTableSkeleton
        columns={COLUMNS}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-7 w-36" />
            </div>
            <Skeleton className="h-7 w-24" />
          </div>
        }
      />
    </div>
  );
}
