import { PageHeaderSkeleton } from "@/components/dashboard/page-header-skeleton";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS = [
  { id: "name", width: "w-32" },
  { id: "sku", width: "w-20" },
  { id: "category", width: "w-20" },
  { id: "price", width: "w-14", align: "right" as const },
  { id: "stock", width: "w-10", align: "right" as const },
  { id: "status", width: "w-20" },
  { id: "actions", width: "size-7" },
];

export default function ProductsLoading() {
  return (
    <div>
      <PageHeaderSkeleton
        actionsWidth="w-40"
        descriptionWidth="w-72"
        titleWidth="w-28"
      />
      <DataTableSkeleton
        columns={COLUMNS}
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-7 w-64" />
            </div>
            <Skeleton className="h-7 w-32" />
          </div>
        }
      />
    </div>
  );
}
