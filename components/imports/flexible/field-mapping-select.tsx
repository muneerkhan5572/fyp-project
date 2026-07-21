"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FieldMapping } from "@/lib/imports/flexible/mapping-schema";
import { cn } from "@/lib/utils";

const UNMAPPED_VALUE = "__unmapped__";
const CONSTANT_VALUE = "__constant__";

type FieldMappingSelectProps = {
  field: AnyFieldApi;
  headers: string[];
  label: string;
  sample?: string;
  lowConfidence?: boolean;
};

export function FieldMappingSelect({
  field,
  headers,
  label,
  sample,
  lowConfidence,
}: FieldMappingSelectProps) {
  const mapping = field.state.value as FieldMapping;
  const selectedValue =
    mapping.kind === "column"
      ? mapping.sourceHeader
      : mapping.kind === "constant"
        ? CONSTANT_VALUE
        : UNMAPPED_VALUE;
  const invalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {lowConfidence ? (
          <span className="font-normal text-amber-600 dark:text-amber-500">
            ⚠ check this
          </span>
        ) : null}
      </FieldLabel>
      <select
        aria-invalid={invalid}
        className={cn(
          "h-8 w-full rounded-md border border-input bg-input/20 px-2 text-xs/relaxed outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50",
        )}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(event) => {
          const next = event.target.value;
          if (next === UNMAPPED_VALUE) {
            field.handleChange({ kind: "unmapped" } satisfies FieldMapping);
          } else if (next === CONSTANT_VALUE) {
            field.handleChange({
              kind: "constant",
              value: "",
            } satisfies FieldMapping);
          } else {
            field.handleChange({
              kind: "column",
              sourceHeader: next,
            } satisfies FieldMapping);
          }
        }}
        value={selectedValue}
      >
        <option value={UNMAPPED_VALUE}>Not mapped</option>
        <option value={CONSTANT_VALUE}>Constant value</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
      {mapping.kind === "constant" ? (
        <Input
          className="mt-1"
          onChange={(event) =>
            field.handleChange({
              kind: "constant",
              value: event.target.value,
            } satisfies FieldMapping)
          }
          placeholder="Value for every row"
          value={mapping.value}
        />
      ) : null}
      {mapping.kind === "column" && sample !== undefined ? (
        <FieldDescription>Sample: {sample || "(empty)"}</FieldDescription>
      ) : null}
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
