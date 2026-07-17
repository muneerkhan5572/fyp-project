"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteDataset } from "@/app/actions/datasets";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Dataset } from "@/lib/db/schema";

type DatasetDeleteDialogProps = {
  dataset: Pick<Dataset, "id" | "name">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DatasetDeleteDialog({
  dataset,
  open,
  onOpenChange,
}: DatasetDeleteDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [isPending, startTransition] = useTransition();
  const isMatch = confirmName === dataset.name;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDataset({ id: dataset.id, confirmName });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const confirmError = result?.fieldErrors?.confirmName?.[0];
      if (confirmError) {
        toast.error(confirmError);
      }
    });
  };

  return (
    <AlertDialog
      onOpenChange={(next) => {
        if (!next) {
          setConfirmName("");
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{dataset.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes this dataset and all of its products,
            sales, and traffic records. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="confirm-dataset-name">
            Type <span className="font-medium">{dataset.name}</span> to confirm
          </FieldLabel>
          <Input
            id="confirm-dataset-name"
            onChange={(event) => setConfirmName(event.target.value)}
            value={confirmName}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!isMatch || isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending ? "Deleting..." : "Delete dataset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
