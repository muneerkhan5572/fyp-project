import { notFound } from "next/navigation";
import { DatasetBreadcrumbs } from "@/components/dashboard/dataset-breadcrumbs";
import { PageHeader } from "@/components/dashboard/page-header";
import { ImportReport } from "@/components/imports/import-report";
import { requireDataset } from "@/lib/datasets/dal";
import { getImport } from "@/lib/imports/dal";

export default async function ImportReportPage({
  params,
}: {
  params: Promise<{ datasetId: string; importId: string }>;
}) {
  const { datasetId, importId } = await params;
  const dataset = await requireDataset(datasetId);
  const importRow = await getImport(dataset.id, importId);

  if (!importRow) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[{ label: importRow.fileName }]}
          />
        }
        description="Details for this CSV import."
        title="Import report"
      />
      <div>
        <ImportReport datasetId={dataset.id} importRow={importRow} />
      </div>
    </div>
  );
}
