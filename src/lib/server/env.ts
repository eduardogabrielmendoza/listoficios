import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  APP_URL: z.string().url(),
  CONTACT_ENCRYPTION_KEY: z.string().min(40),
  ADMIN_EMAILS: z.string().default(""),
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? process.env.APP_URL,
    APP_URL: process.env.APP_URL ?? process.env.BETTER_AUTH_URL,
    CONTACT_ENCRYPTION_KEY: process.env.CONTACT_ENCRYPTION_KEY,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",
  });
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}
