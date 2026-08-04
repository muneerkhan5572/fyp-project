import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production"], {
        error: 'NODE_ENV must be either "development" or "production".',
      })
      .default("development"),
    DATABASE_URL: z.url({ error: "DATABASE_URL must be a valid URL." }),
    SESSION_SECRET: z.string().min(32, {
      error: "SESSION_SECRET must be at least 32 characters long.",
    }),
    APP_URL: z
      .url({ error: "APP_URL must be a valid URL." })
      .transform((url) => url.replace(/\/+$/, "")),
    GMAIL_SMTP_USER: z
      .string()
      .min(1, { error: "GMAIL_SMTP_USER is required." }),
    GMAIL_SMTP_PASS: z
      .string()
      .min(1, { error: "GMAIL_SMTP_PASS is required." }),
    ML_SERVICE_URL: z.url({ error: "ML_SERVICE_URL must be a valid URL." }),
    ML_SERVICE_API_KEY: z.string().min(1, {
      error: "ML_SERVICE_API_KEY is required.",
    }),
  },
  client: {},
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    APP_URL: process.env.APP_URL,
    GMAIL_SMTP_USER: process.env.GMAIL_SMTP_USER,
    GMAIL_SMTP_PASS: process.env.GMAIL_SMTP_PASS,
    ML_SERVICE_URL: process.env.ML_SERVICE_URL,
    ML_SERVICE_API_KEY: process.env.ML_SERVICE_API_KEY,
  },
});
