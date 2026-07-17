import { DatabaseIcon } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
import {
  getOwnedDataset,
  LAST_DATASET_COOKIE_NAME,
  listDatasets,
} from "@/lib/datasets/dal";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const { userId } = await verifySession();
  const { all } = await searchParams;
  const cookieStore = await cookies();
  const lastDatasetId = cookieStore.get(LAST_DATASET_COOKIE_NAME)?.value;

  if (!all && lastDatasetId) {
    const lastDataset = await getOwnedDataset(lastDatasetId, userId);
    if (lastDataset) {
      redirect(`/dashboard/${lastDataset.id}`);
    }
  }

  const datasets = await listDatasets();

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Datasets</h1>
          <p className="text-muted-foreground text-sm">
            Create a dataset to start uploading and analyzing your sales data.
          </p>
        </div>
        {datasets.length > 0 ? <DatasetCreateDialog /> : null}
      </div>

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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <DatasetCard dataset={dataset} key={dataset.id} />
          ))}
        </div>
      )}
    </main>
  );
}
