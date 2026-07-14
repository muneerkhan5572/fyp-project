import "server-only";
import { env } from "@/env";
import { transport } from "@/lib/email/transport";

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your password",
    text: `Reset your password using the link below. It expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>Reset your password using the link below. It expires in 1 hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  });
}
