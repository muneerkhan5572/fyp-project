"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export function ForgotPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onChange: forgotPasswordSchema,
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);
      const result = await forgotPassword(value);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.success);
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <TextField
                  autoComplete="email"
                  field={field}
                  label="Email"
                  placeholder="m@example.com"
                  type="email"
                />
              )}
            </form.Field>
            {serverError ? <FieldError>{serverError}</FieldError> : null}
            {successMessage ? (
              <FieldDescription className="text-center">
                {successMessage}
              </FieldDescription>
            ) : null}
            <Field>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                )}
              </form.Subscribe>
              <FieldDescription className="text-center">
                Remember your password? <Link href="/login">Sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
