"use client";

import { deleteTrafficRecord } from "@/app/actions/traffic";
import { RecordDeleteDialog } from "@/components/shared/record-delete-dialog";

type TrafficDeleteDialogProps = {
  datasetId: string;
  record: { id: string; productName: string; trafficDate: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TrafficDeleteDialog({
  datasetId,
  record,
  open,
  onOpenChange,
}: TrafficDeleteDialogProps) {
  return (
    <RecordDeleteDialog
      confirmLabel="Delete record"
      defaultSuccessMessage="Traffic record deleted."
      description={`${record.productName} on ${record.trafficDate}. This cannot be undone.`}
      onDelete={() => deleteTrafficRecord(datasetId, { id: record.id })}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete this traffic record?"
    />
  );
}
