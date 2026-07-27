"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type DescriptionFieldProps = {
  field: AnyFieldApi;
};

export function DescriptionField({ field }: DescriptionFieldProps) {
  const invalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
      <Textarea
        aria-invalid={invalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder="What this product is, who it's for, materials, use case..."
        rows={3}
        value={field.state.value ?? ""}
      />
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
