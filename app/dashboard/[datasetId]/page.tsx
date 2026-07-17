import { LayoutDashboardIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { requireDataset } from "@/lib/datasets/dal";

export default async function DatasetOverviewPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  const dataset = await requireDataset(datasetId);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LayoutDashboardIcon />
        </EmptyMedia>
        <EmptyTitle>{dataset.name} overview</EmptyTitle>
        <EmptyDescription>
          KPIs, trends, and top-seller charts for this dataset will appear here
          once you add products and sales data.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
