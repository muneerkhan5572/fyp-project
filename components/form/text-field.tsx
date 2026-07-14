"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type TextFieldProps = {
  field: AnyFieldApi;
  label: string;
  type?: React.ComponentProps<typeof Input>["type"];
  placeholder?: string;
  autoComplete?: string;
  labelSuffix?: React.ReactNode;
};

export function TextField({
  field,
  label,
  type = "text",
  placeholder,
  autoComplete,
  labelSuffix,
}: TextFieldProps) {
  const invalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={invalid}>
      {labelSuffix ? (
        <div className="flex items-center">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {labelSuffix}
        </div>
      ) : (
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      )}
      <Input
        aria-invalid={invalid}
        autoComplete={autoComplete}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={field.state.value}
      />
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
