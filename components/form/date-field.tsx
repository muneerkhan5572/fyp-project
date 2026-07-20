"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  field: AnyFieldApi;
  label: string;
};

function parseDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DateField({ field, label }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const invalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;
  const value = field.state.value as string;
  const selected = parseDate(value);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Popover
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            field.handleBlur();
          }
        }}
        open={open}
      >
        <PopoverTrigger
          render={
            <Button
              aria-invalid={invalid}
              className={cn(
                "w-full justify-start gap-2 font-normal",
                !selected && "text-muted-foreground",
              )}
              id={field.name}
              variant="outline"
            />
          }
        >
          <CalendarIcon className="size-3.5" />
          {selected ? value : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={(date) => {
              if (date) {
                field.handleChange(formatDate(date));
                setOpen(false);
                field.handleBlur();
              }
            }}
            selected={selected}
          />
        </PopoverContent>
      </Popover>
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
