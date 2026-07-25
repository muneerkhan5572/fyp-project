import { DatasetBreadcrumbs } from "@/components/dashboard/dataset-breadcrumbs";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { getDatasetSetupState } from "@/lib/analytics/setup-state";
import { requireDataset } from "@/lib/datasets/dal";

export default async function DatasetOverviewPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);
  const setupState = await getDatasetSetupState(dataset.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
          />
        }
        description="Complete these steps to get this dataset ready."
        title={`${dataset.name} overview`}
      />
      <SetupChecklist datasetId={dataset.id} state={setupState} />
    </div>
  );
}
