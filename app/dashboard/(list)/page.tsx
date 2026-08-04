import { DatabaseIcon } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetCard } from "@/components/datasets/dataset-card";
import { DatasetCreateDialog } from "@/components/datasets/dataset-create-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { verifySession } from "@/lib/auth/dal";
import { listDatasets } from "@/lib/datasets/dal";

export default async function DashboardPage() {
  await verifySession();
  const datasets = await listDatasets();

  return (
    <>
      <DashboardTopbar />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-10">
        <PageHeader
          actions={datasets.length > 0 ? <DatasetCreateDialog /> : null}
          description="Create a dataset to start uploading and analyzing your sales data."
          title="Datasets"
        />

        {datasets.length === 0 ? (
          <Empty className="mt-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <DatabaseIcon />
              </EmptyMedia>
              <EmptyTitle>No datasets yet</EmptyTitle>
              <EmptyDescription>
                Create your first dataset to start uploading products and sales
                data.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <DatasetCreateDialog />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {datasets.map((dataset) => (
              <DatasetCard dataset={dataset} key={dataset.id} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
