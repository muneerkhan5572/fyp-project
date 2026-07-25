import { FolderXIcon } from "lucide-react";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { buttonVariants } from "@/components/ui/button";
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
            <Link className={buttonVariants()} href={DATASETS_HREF}>
              Go to your datasets
            </Link>
          </EmptyContent>
        </Empty>
      </main>
    </>
  );
}
