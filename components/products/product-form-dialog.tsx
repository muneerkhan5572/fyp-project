"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/actions/products";
import { TextField } from "@/components/form/text-field";
import { CategoryField } from "@/components/products/category-field";
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
import type { Product } from "@/lib/db/schema";
import { productFormClientSchema } from "@/lib/validations/products";

type ProductFormDialogProps = {
  datasetId: string;
  categories: string[];
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toFormValue(value: string | null): string {
  return value ?? "";
}

export function ProductFormDialog({
  datasetId,
  categories,
  product,
  open,
  onOpenChange,
}: ProductFormDialogProps) {
  const isEdit = Boolean(product);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? "",
      price: toFormValue(product?.price ?? null),
      cost: toFormValue(product?.cost ?? null),
      stock:
        product?.stock !== null && product?.stock !== undefined
          ? String(product.stock)
          : "",
    },
    validators: {
      onChange: productFormClientSchema,
      onSubmit: productFormClientSchema,
    },
    onSubmit: async ({ value }) => {
      const result = product
        ? await updateProduct(datasetId, { id: product.id, ...value })
        : await createProduct(datasetId, value);

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
            <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this product's details."
                : "Add a product to this dataset's catalog."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <form.Field name="name">
              {(field) => (
                <TextField field={field} label="Name" placeholder="T-Shirt" />
              )}
            </form.Field>
            <form.Field name="sku">
              {(field) => (
                <TextField
                  field={field}
                  label="SKU"
                  placeholder="TSHIRT-BLK-M"
                />
              )}
            </form.Field>
            <form.Field name="category">
              {(field) => (
                <CategoryField categories={categories} field={field} />
              )}
            </form.Field>
            <div className="grid grid-cols-3 gap-2">
              <form.Field name="price">
                {(field) => (
                  <TextField
                    field={field}
                    inputMode="decimal"
                    label="Price"
                    min={0}
                    step="0.01"
                    type="number"
                  />
                )}
              </form.Field>
              <form.Field name="cost">
                {(field) => (
                  <TextField
                    field={field}
                    inputMode="decimal"
                    label="Cost"
                    min={0}
                    step="0.01"
                    type="number"
                  />
                )}
              </form.Field>
              <form.Field name="stock">
                {(field) => (
                  <TextField
                    field={field}
                    inputMode="numeric"
                    label="Stock"
                    min={0}
                    step="1"
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
