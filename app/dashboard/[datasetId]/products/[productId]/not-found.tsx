import { PackageXIcon } from "lucide-react";
import { DatasetSectionLink } from "@/components/dashboard/dataset-section-link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ProductNotFound() {
  return (
    <Empty className="mt-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageXIcon />
        </EmptyMedia>
        <EmptyTitle>Product not found</EmptyTitle>
        <EmptyDescription>
          This product doesn't exist or you don't have access to it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <DatasetSectionLink label="Back to products" section="products" />
      </EmptyContent>
    </Empty>
  );
}
