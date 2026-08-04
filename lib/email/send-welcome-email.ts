import "server-only";
import { env } from "@/env";
import { transport } from "@/lib/email/transport";

export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  await transport.sendMail({
    from: env.GMAIL_SMTP_USER,
    to,
    subject: "Welcome to Sales Analytics",
    text: `Hi ${name},\n\nWelcome to Sales Analytics! Your account is ready — sign in to start organizing your datasets and exploring your dashboards.\n\n${env.APP_URL}/login`,
    html: `<p>Hi ${name},</p><p>Welcome to Sales Analytics! Your account is ready — sign in to start organizing your datasets and exploring your dashboards.</p><p><a href="${env.APP_URL}/login">Go to login</a></p>`,
  });
}
