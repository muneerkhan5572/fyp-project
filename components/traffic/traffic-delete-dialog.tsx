"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTrafficRecord } from "@/app/actions/traffic";
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
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTrafficRecord(datasetId, { id: record.id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Traffic record deleted.");
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this traffic record?</AlertDialogTitle>
          <AlertDialogDescription>
            {record.productName} on {record.trafficDate}. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending ? "Deleting..." : "Delete record"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
