import { DatasetNav } from "@/components/datasets/dataset-nav";
import { DatasetSwitcher } from "@/components/datasets/dataset-switcher";
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { getDatasetSetupState } from "@/lib/analytics/setup-state";
import { listDatasets } from "@/lib/datasets/dal";

export async function DatasetSidebarContent({
  datasetId,
}: {
  datasetId: string;
}) {
  const [datasets, setupState] = await Promise.all([
    listDatasets(),
    getDatasetSetupState(datasetId),
  ]);

  return (
    <>
      <SidebarHeader>
        <DatasetSwitcher currentDatasetId={datasetId} datasets={datasets} />
      </SidebarHeader>
      <SidebarContent>
        <DatasetNav
          counts={{
            products: setupState.productCount,
            sales: setupState.salesCount,
            traffic: setupState.trafficCount,
          }}
          datasetId={datasetId}
        />
      </SidebarContent>
    </>
  );
}
