"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldMapping } from "@/lib/imports/flexible/mapping-schema";

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
      <Select
        name={field.name}
        onValueChange={(next) => {
          if (next === null) {
            return;
          }
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
        <SelectTrigger
          aria-invalid={invalid}
          className="w-full"
          id={field.name}
          onBlur={field.handleBlur}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNMAPPED_VALUE}>Not mapped</SelectItem>
          <SelectItem value={CONSTANT_VALUE}>Constant value</SelectItem>
          {headers.map((header) => (
            <SelectItem key={header} value={header}>
              {header}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {mapping.kind === "constant" ? (
        <Input
          className="mt-1"
          onChange={(event) =>
            field.handleChange({
              kind: "constant",
              value: event.target.value,
            } satisfies FieldMapping)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
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
