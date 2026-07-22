"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type CategoryFieldProps = {
  field: AnyFieldApi;
  categories: string[];
};

export function CategoryField({ field, categories }: CategoryFieldProps) {
  const invalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
      <Input
        aria-invalid={invalid}
        id={field.name}
        list={`${field.name}-suggestions`}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
        placeholder="Uncategorized"
        value={field.state.value ?? ""}
      />
      <datalist id={`${field.name}-suggestions`}>
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
