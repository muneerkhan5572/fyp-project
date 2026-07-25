import type { ReactNode } from "react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DatasetNav } from "@/components/datasets/dataset-nav";
import { DatasetSwitcher } from "@/components/datasets/dataset-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getDatasetSetupState } from "@/lib/analytics/setup-state";
import { listDatasets, requireDataset } from "@/lib/datasets/dal";

export default async function DatasetLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);
  const [datasets, setupState] = await Promise.all([
    listDatasets(),
    getDatasetSetupState(datasetId),
  ]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <DatasetSwitcher currentDatasetId={dataset.id} datasets={datasets} />
        </SidebarHeader>
        <SidebarContent>
          <DatasetNav
            counts={{
              products: setupState.productCount,
              sales: setupState.salesCount,
              traffic: setupState.trafficCount,
            }}
            datasetId={dataset.id}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <DashboardTopbar leading={<SidebarTrigger />} title={dataset.name} />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
