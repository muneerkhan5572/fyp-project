import { notFound } from "next/navigation";
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
      <div>
        <h1 className="font-semibold text-2xl">Import report</h1>
        <p className="text-muted-foreground text-sm">
          Details for this CSV import.
        </p>
      </div>
      <div className="mt-6">
        <ImportReport datasetId={dataset.id} importRow={importRow} />
      </div>
    </div>
  );
}
