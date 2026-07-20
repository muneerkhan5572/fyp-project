"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { DataTableFilter } from "@/components/data-table/data-table-filter";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type ProductOption = { id: string; name: string; sku: string };

type ProductPickerFieldProps = {
  field: AnyFieldApi;
  products: ProductOption[];
  label?: string;
};

export function ProductPickerField({
  field,
  products,
  label = "Product",
}: ProductPickerFieldProps) {
  const invalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <DataTableFilter
        aria-invalid={invalid}
        id={field.name}
        onValueChange={(value) => {
          field.handleChange(value);
          field.handleBlur();
        }}
        options={products.map((product) => ({
          value: product.id,
          label: `${product.name} (${product.sku})`,
        }))}
        placeholder="Select a product..."
        value={field.state.value}
      />
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
