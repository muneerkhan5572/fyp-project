import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DatasetImportSkeleton } from "@/components/datasets/dataset-import-skeleton";
import { DatasetSidebarSkeleton } from "@/components/datasets/dataset-sidebar-skeleton";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLoading() {
  return (
    <SidebarProvider>
      <Sidebar>
        <DatasetSidebarSkeleton />
      </Sidebar>
      <SidebarInset>
        <DashboardTopbar leading={<SidebarTrigger />} />
        <div className="flex-1 p-4 md:p-6">
          <DatasetImportSkeleton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
