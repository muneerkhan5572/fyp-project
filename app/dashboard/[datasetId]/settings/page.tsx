import { DatasetBreadcrumbs } from "@/components/dashboard/dataset-breadcrumbs";
import { PageHeader } from "@/components/dashboard/page-header";
import { DatasetSettingsGeneral } from "@/components/datasets/dataset-settings-general";
import { DatasetThresholdsForm } from "@/components/datasets/dataset-thresholds-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDataset } from "@/lib/datasets/dal";

export default async function DatasetSettingsPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <DatasetBreadcrumbs
            datasetId={dataset.id}
            datasetName={dataset.name}
            trail={[{ label: "Settings" }]}
          />
        }
        description="Manage this dataset's name, classification rules, and danger zone."
        title="Settings"
      />

      <div className="max-w-2xl">
        <DatasetSettingsGeneral dataset={dataset} />

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Classification thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <DatasetThresholdsForm dataset={dataset} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
