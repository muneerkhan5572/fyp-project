"use client";

import { deleteImport } from "@/app/actions/imports";
import { RecordDeleteDialog } from "@/components/shared/record-delete-dialog";
import type { Import } from "@/lib/db/schema";

type ImportDeleteDialogProps = {
  datasetId: string;
  importRow: Pick<Import, "id" | "fileName">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportDeleteDialog({
  datasetId,
  importRow,
  open,
  onOpenChange,
}: ImportDeleteDialogProps) {
  return (
    <RecordDeleteDialog
      confirmLabel="Delete import"
      defaultSuccessMessage="Import and its data removed."
      description="This permanently deletes the data this import added (rows later changed by a newer import aren't affected). If this was a products import, any sales, traffic, or reviews linked to those products are removed too. This cannot be undone."
      onDelete={() => deleteImport(datasetId, { id: importRow.id })}
      onOpenChange={onOpenChange}
      open={open}
      title={`Delete “${importRow.fileName}” from history?`}
    />
  );
}
