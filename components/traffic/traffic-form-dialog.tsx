"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createTrafficRecord,
  updateTrafficRecord,
} from "@/app/actions/traffic";
import { DateField } from "@/components/form/date-field";
import { ProductPickerField } from "@/components/form/product-picker-field";
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
import { trafficFormClientSchema } from "@/lib/validations/traffic";

type ProductOption = { id: string; name: string; sku: string };

type TrafficRecordEntry = {
  id: string;
  productId: string;
  trafficDate: string;
  views: number;
};

type TrafficFormDialogProps = {
  datasetId: string;
  products: ProductOption[];
  record?: TrafficRecordEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TrafficFormDialog({
  datasetId,
  products,
  record,
  open,
  onOpenChange,
}: TrafficFormDialogProps) {
  const isEdit = Boolean(record);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      productId: record?.productId ?? "",
      trafficDate: record?.trafficDate ?? "",
      views: record ? String(record.views) : "",
    },
    validators: {
      onChange: trafficFormClientSchema,
      onSubmit: trafficFormClientSchema,
    },
    onSubmit: async ({ value }) => {
      const result = record
        ? await updateTrafficRecord(datasetId, { id: record.id, ...value })
        : await createTrafficRecord(datasetId, value);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const fieldErrors = result?.fieldErrors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors).flat()[0];
        if (firstError) {
          toast.error(firstError);
        }
        return;
      }

      toast.success(result?.success ?? "Saved.");
      form.reset();
      onOpenChange(false);
      router.refresh();
    },
  });

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          form.reset();
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit traffic record" : "Add traffic record"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this traffic record."
                : "Record page views for a product on a given date."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <form.Field name="productId">
              {(field) => (
                <ProductPickerField field={field} products={products} />
              )}
            </form.Field>
            <form.Field name="trafficDate">
              {(field) => <DateField field={field} label="Date" />}
            </form.Field>
            <form.Field name="views">
              {(field) => (
                <TextField
                  field={field}
                  inputMode="numeric"
                  label="Views"
                  min={0}
                  step="1"
                  type="number"
                />
              )}
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
