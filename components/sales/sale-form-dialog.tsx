"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSale, updateSale } from "@/app/actions/sales";
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
import { saleFormClientSchema } from "@/lib/validations/sales";

type ProductOption = { id: string; name: string; sku: string };

type SaleRecord = {
  id: string;
  productId: string;
  saleDate: string;
  quantity: number;
  revenue: string;
};

type SaleFormDialogProps = {
  datasetId: string;
  products: ProductOption[];
  sale?: SaleRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SaleFormDialog({
  datasetId,
  products,
  sale,
  open,
  onOpenChange,
}: SaleFormDialogProps) {
  const isEdit = Boolean(sale);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      productId: sale?.productId ?? "",
      saleDate: sale?.saleDate ?? "",
      quantity: sale ? String(sale.quantity) : "",
      revenue: sale?.revenue ?? "",
    },
    validators: {
      onChange: saleFormClientSchema,
      onSubmit: saleFormClientSchema,
    },
    onSubmit: async ({ value }) => {
      const result = sale
        ? await updateSale(datasetId, { id: sale.id, ...value })
        : await createSale(datasetId, value);

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
            <DialogTitle>{isEdit ? "Edit sale" : "Add sale"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this sale record."
                : "Record a sale for a product on a given date."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <form.Field name="productId">
              {(field) => (
                <ProductPickerField field={field} products={products} />
              )}
            </form.Field>
            <form.Field name="saleDate">
              {(field) => <DateField field={field} label="Date" />}
            </form.Field>
            <div className="grid grid-cols-2 gap-2">
              <form.Field name="quantity">
                {(field) => (
                  <TextField
                    field={field}
                    inputMode="numeric"
                    label="Quantity"
                    min={0}
                    step="1"
                    type="number"
                  />
                )}
              </form.Field>
              <form.Field name="revenue">
                {(field) => (
                  <TextField
                    field={field}
                    inputMode="decimal"
                    label="Revenue"
                    min={0}
                    step="0.01"
                    type="number"
                  />
                )}
              </form.Field>
            </div>
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
