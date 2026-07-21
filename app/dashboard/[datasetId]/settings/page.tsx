import { BackLink } from "@/components/dashboard/back-link";
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
      <BackLink href={`/dashboard/${dataset.id}`} label="Overview" />
      <div className="mt-2">
        <h1 className="font-semibold text-2xl">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage this dataset's name, classification rules, and danger zone.
        </p>
      </div>

      <div className="mt-6 max-w-2xl">
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
