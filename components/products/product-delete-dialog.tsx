"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/actions/products";
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
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(datasetId, { id: product.id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result?.success ?? "Product deleted.");
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{product.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This also removes any sales and traffic records linked to this
            product. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending ? "Deleting..." : "Delete product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
