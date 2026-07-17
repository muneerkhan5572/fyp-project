"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { renameDataset } from "@/app/actions/datasets";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import type { Dataset } from "@/lib/db/schema";
import { renameDatasetSchema } from "@/lib/validations/datasets";

type DatasetRenameDialogProps = {
  dataset: Pick<Dataset, "id" | "name">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DatasetRenameDialog({
  dataset,
  open,
  onOpenChange,
}: DatasetRenameDialogProps) {
  const router = useRouter();
  const form = useForm({
    defaultValues: { id: dataset.id, name: dataset.name },
    validators: {
      onChange: renameDatasetSchema,
      onSubmit: renameDatasetSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await renameDataset(value);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const nameError = result?.fieldErrors?.name?.[0];
      if (nameError) {
        toast.error(nameError);
        return;
      }
      toast.success(result?.success ?? "Dataset renamed.");
      onOpenChange(false);
      router.refresh();
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename dataset</DialogTitle>
            <DialogDescription>
              Choose a new name for “{dataset.name}”.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <form.Field name="name">
              {(field) => <TextField field={field} label="Name" />}
            </form.Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
