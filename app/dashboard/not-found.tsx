import { FolderXIcon } from "lucide-react";
import { BackButton } from "@/components/dashboard/back-button";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DATASETS_HREF } from "@/lib/datasets/routes";

export default function DatasetNotFound() {
  return (
    <>
      <DashboardTopbar />
      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 items-center justify-center px-4 py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderXIcon />
            </EmptyMedia>
            <EmptyTitle>Dataset not found</EmptyTitle>
            <EmptyDescription>
              This dataset doesn't exist or you don't have access to it.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <BackButton href={DATASETS_HREF} label="Back to datasets" />
          </EmptyContent>
        </Empty>
      </main>
    </>
  );
}
