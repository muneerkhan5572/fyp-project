"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
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

type RecordDeleteDialogProps = {
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  defaultSuccessMessage: string;
  onDelete: () => Promise<{ error?: string; success?: string } | undefined>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RecordDeleteDialog({
  title,
  description,
  confirmLabel,
  defaultSuccessMessage,
  onDelete,
  open,
  onOpenChange,
}: RecordDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await onDelete();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? defaultSuccessMessage);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending ? "Deleting..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
