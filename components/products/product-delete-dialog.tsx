"use client";

import { deleteProduct } from "@/app/actions/products";
import { RecordDeleteDialog } from "@/components/shared/record-delete-dialog";
import type { Product } from "@/lib/db/schema";

type ProductDeleteDialogProps = {
  datasetId: string;
  product: Pick<Product, "id" | "name">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDeleteDialog({
  datasetId,
  product,
  open,
  onOpenChange,
}: ProductDeleteDialogProps) {
  return (
    <RecordDeleteDialog
      confirmLabel="Delete product"
      defaultSuccessMessage="Product deleted."
      description="This also removes any sales and traffic records linked to this product. This cannot be undone."
      onDelete={() => deleteProduct(datasetId, { id: product.id })}
      onOpenChange={onOpenChange}
      open={open}
      title={`Delete “${product.name}”?`}
    />
  );
}
