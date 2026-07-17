import type { ReactNode } from "react";
import { DatasetNav } from "@/components/datasets/dataset-nav";
import { DatasetSwitcher } from "@/components/datasets/dataset-switcher";
import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
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
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="truncate font-medium text-sm">{dataset.name}</span>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <LogoutButton />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
