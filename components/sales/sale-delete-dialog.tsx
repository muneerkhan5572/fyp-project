"use client";

import { deleteSale } from "@/app/actions/sales";
import { RecordDeleteDialog } from "@/components/shared/record-delete-dialog";

type SaleDeleteDialogProps = {
  datasetId: string;
  sale: { id: string; productName: string; saleDate: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SaleDeleteDialog({
  datasetId,
  sale,
  open,
  onOpenChange,
}: SaleDeleteDialogProps) {
  return (
    <RecordDeleteDialog
      confirmLabel="Delete sale"
      defaultSuccessMessage="Sale deleted."
      description={`${sale.productName} on ${sale.saleDate}. This cannot be undone.`}
      onDelete={() => deleteSale(datasetId, { id: sale.id })}
      onOpenChange={onOpenChange}
      open={open}
      title="Delete this sale?"
    />
  );
}
