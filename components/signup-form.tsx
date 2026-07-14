"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { toast } from "sonner";
import { signup } from "@/app/actions/auth";
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
import { signupSchema } from "@/lib/validations/auth";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const form = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators: { onChange: signupSchema, onSubmit: signupSchema },
    onSubmit: async ({ value }) => {
      const result = await signup(value);
      if (result?.error) {
        toast.error(result.error);
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
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
            <form.Field name="name">
              {(field) => (
                <TextField
                  autoComplete="name"
                  field={field}
                  label="Full Name"
                  placeholder="John Doe"
                />
              )}
            </form.Field>
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
                  autoComplete="new-password"
                  field={field}
                  label="Password"
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
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                )}
              </form.Subscribe>
              <FieldDescription className="px-6 text-center">
                Already have an account? <Link href="/login">Sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
