import { FileWarningIcon } from "lucide-react";
import { DatasetSectionLink } from "@/components/dashboard/dataset-section-link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ImportNotFound() {
  return (
    <Empty className="mt-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileWarningIcon />
        </EmptyMedia>
        <EmptyTitle>Import not found</EmptyTitle>
        <EmptyDescription>
          This import doesn't exist or you don't have access to it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <DatasetSectionLink label="Back to dataset" section="" />
      </EmptyContent>
    </Empty>
  );
}
