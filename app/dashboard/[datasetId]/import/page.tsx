import { DatasetBreadcrumbs } from "@/components/dashboard/dataset-breadcrumbs";
import { PageHeader } from "@/components/dashboard/page-header";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { ImportHistoryTable } from "@/components/imports/import-history-table";
import { ImportWizard } from "@/components/imports/import-wizard";
import { getDatasetSetupState } from "@/lib/analytics/setup-state";
import { requireDataset } from "@/lib/datasets/dal";
import { pagedImports } from "@/lib/imports/dal";
import { importsListParamsSchema } from "@/lib/validations/imports";

type DatasetImportPageProps = {
  params: Promise<{ datasetId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DatasetImportPage({
  params,
  searchParams,
}: DatasetImportPageProps) {
  const { datasetId } = await params;
  const { page, search, type, status } = importsListParamsSchema.parse(
    await searchParams,
  );
  const dataset = await requireDataset(datasetId);
  const [setupState, { rows, total, page: currentPage, pageCount }] =
    await Promise.all([
      getDatasetSetupState(dataset.id),
      pagedImports(dataset.id, { page, search, type, status }),
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
        <h2 className="font-semibold text-lg">Import history</h2>
        <ImportHistoryTable
          datasetId={dataset.id}
          filters={{ search, type, status }}
          imports={rows}
          page={currentPage}
          pageCount={pageCount}
          pathname={`/dashboard/${dataset.id}/import`}
          total={total}
        />
      </div>
    </div>
  );
}
