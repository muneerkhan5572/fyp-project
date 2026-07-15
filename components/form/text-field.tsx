"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
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
      <div className="relative">
        <Input
          aria-invalid={invalid}
          autoComplete={autoComplete}
          className={isPassword ? "pr-7" : undefined}
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          type={isPassword && showPassword ? "text" : type}
          value={field.state.value}
        />
        {isPassword ? (
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-1 my-auto flex size-5 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? (
              <EyeOffIcon className="size-3.5" />
            ) : (
              <EyeIcon className="size-3.5" />
            )}
          </button>
        ) : null}
      </div>
      {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
