"use client";

import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createDataset } from "@/app/actions/datasets";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { createDatasetSchema } from "@/lib/validations/datasets";

export function DatasetCreateDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: { name: "" },
    validators: {
      onChange: createDatasetSchema,
      onSubmit: createDatasetSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createDataset(value);
      if (result?.error) {
        toast.error(result.error);
      }
      const nameError = result?.fieldErrors?.name?.[0];
      if (nameError) {
        toast.error(nameError);
      }
    },
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        New dataset
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create dataset</DialogTitle>
            <DialogDescription>
              Datasets keep your products, sales, and traffic data separate —
              e.g. one per store or one per year.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <form.Field name="name">
              {(field) => (
                <TextField
                  field={field}
                  label="Name"
                  placeholder="Shop A 2024"
                />
              )}
            </form.Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating..." : "Create dataset"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
