"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import { resetPassword } from "@/app/actions/auth";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { resetPasswordSchema } from "@/lib/validations/auth";

export function ResetPasswordForm({
  token,
  ...props
}: React.ComponentProps<typeof Card> & { token: string }) {
  const form = useForm({
    defaultValues: { token, password: "", confirmPassword: "" },
    validators: {
      onChange: resetPasswordSchema,
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await resetPassword(value);
      if (result?.error) {
        toast.error(result.error);
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter a new password for your account.
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
            <form.Field name="password">
              {(field) => (
                <TextField
                  autoComplete="new-password"
                  field={field}
                  label="New Password"
                  type="password"
                />
              )}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => (
                <TextField
                  autoComplete="new-password"
                  field={field}
                  label="Confirm Password"
                  type="password"
                />
              )}
            </form.Field>
            <Field>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Resetting..." : "Reset password"}
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
