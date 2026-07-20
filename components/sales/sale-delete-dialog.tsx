"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteSale } from "@/app/actions/sales";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSale(datasetId, { id: sale.id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Sale deleted.");
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
          <AlertDialogDescription>
            {sale.productName} on {sale.saleDate}. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending ? "Deleting..." : "Delete sale"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
