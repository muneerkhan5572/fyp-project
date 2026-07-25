import type { ReactNode } from "react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DatasetNav } from "@/components/datasets/dataset-nav";
import { DatasetSwitcher } from "@/components/datasets/dataset-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
  const datasets = await listDatasets();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <DatasetSwitcher currentDatasetId={dataset.id} datasets={datasets} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <DatasetNav datasetId={dataset.id} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <DashboardTopbar leading={<SidebarTrigger />} title={dataset.name} />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
