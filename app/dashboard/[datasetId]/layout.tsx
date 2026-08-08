import type { ReactNode } from "react";
import { Suspense } from "react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { HashScrollRestoration } from "@/components/dashboard/hash-scroll-restoration";
import { DatasetSidebarContent } from "@/components/datasets/dataset-sidebar-content";
import { DatasetSidebarSkeleton } from "@/components/datasets/dataset-sidebar-skeleton";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireDataset } from "@/lib/datasets/dal";

export default async function DatasetLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);

  return (
    <SidebarProvider>
      <Sidebar>
        <Suspense fallback={<DatasetSidebarSkeleton />}>
          <DatasetSidebarContent datasetId={dataset.id} />
        </Suspense>
      </Sidebar>
      <SidebarInset>
        <DashboardTopbar leading={<SidebarTrigger />} />
        <HashScrollRestoration />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
