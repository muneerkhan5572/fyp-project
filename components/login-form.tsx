"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { login } from "@/app/actions/auth";
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
import { cn } from "@/lib/utils";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema, onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await login(value);
      if (result?.error) {
        setServerError(result.error);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              <form.Field name="password">
                {(field) => (
                  <TextField
                    autoComplete="current-password"
                    field={field}
                    label="Password"
                    labelSuffix={
                      <Link
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        href="/forgot-password"
                      >
                        Forgot your password?
                      </Link>
                    }
                    type="password"
                  />
                )}
              </form.Field>
              {serverError ? <FieldError>{serverError}</FieldError> : null}
              <Field>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  )}
                </form.Subscribe>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
