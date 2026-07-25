import { DatasetBreadcrumbs } from "@/components/dashboard/dataset-breadcrumbs";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { ImportHistoryTable } from "@/components/imports/import-history-table";
import { ImportWizard } from "@/components/imports/import-wizard";
import { getDatasetSetupState } from "@/lib/analytics/setup-state";
import { requireDataset } from "@/lib/datasets/dal";
import { listImports } from "@/lib/imports/dal";

export default async function DatasetOverviewPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);
  const [setupState, history] = await Promise.all([
    getDatasetSetupState(dataset.id),
    listImports(dataset.id),
  ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
          />
        }
        description="Import data and review upload history."
        title={dataset.name}
      />
      <SetupChecklist datasetId={dataset.id} state={setupState} />

      <div className="mt-6">
        <ImportWizard datasetId={dataset.id} />
      </div>

      <div className="mt-8">
        <h2 className="font-medium text-lg">Import history</h2>
        <ImportHistoryTable datasetId={dataset.id} imports={history} />
      </div>
    </div>
  );
}
