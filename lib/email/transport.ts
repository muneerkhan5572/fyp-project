import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/env";

export const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_SMTP_USER,
    pass: env.GMAIL_SMTP_PASS,
  },
});
