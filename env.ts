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
    SMTP_HOST: z.string().min(1, { error: "SMTP_HOST is required." }),
    SMTP_PORT: z.coerce
      .number({ error: "SMTP_PORT must be a number." })
      .int({ error: "SMTP_PORT must be an integer." })
      .positive({ error: "SMTP_PORT must be a positive number." }),
    SMTP_USER: z.string().min(1, { error: "SMTP_USER is required." }),
    SMTP_PASSWORD: z.string().min(1, { error: "SMTP_PASSWORD is required." }),
    SMTP_FROM: z.string().min(1, { error: "SMTP_FROM is required." }),
  },
  client: {},
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    APP_URL: process.env.APP_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
  },
});
