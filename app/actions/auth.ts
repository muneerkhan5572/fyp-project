"use server";

import { and, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import * as z from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  generateResetToken,
  hashToken,
  RESET_TOKEN_DURATION_MS,
} from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { sendResetEmail } from "@/lib/email/send-reset-email";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
  type LoginInput,
  loginSchema,
  type ResetPasswordInput,
  resetPasswordSchema,
  type SignupInput,
  signupSchema,
} from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

const FORGOT_PASSWORD_MESSAGE =
  "If an account exists for that email, we've sent a password reset link.";

export async function login(input: LoginInput): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (
    !user ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signup(input: SignupInput): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [user] = await db
    .insert(users)
    .values({ name: parsed.data.name, email, passwordHash })
    .returning({ id: users.id });

  if (!user) {
    return { error: "Something went wrong creating your account." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));
    await db
      .insert(passwordResetTokens)
      .values({ userId: user.id, tokenHash, expiresAt });

    try {
      await sendResetEmail(email, token);
    } catch {
      return {
        error: "We couldn't send the reset email. Please try again later.",
      };
    }
  }

  return { success: FORGOT_PASSWORD_MESSAGE };
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const tokenHash = hashToken(parsed.data.token);
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!resetToken) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId));
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, resetToken.userId));

  redirect("/login");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
