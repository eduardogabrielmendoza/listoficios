import { z } from "zod";

const serverEnvSchema = z.object({
  APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SECRET_KEY: z.string().min(20),
  CONTACT_ENCRYPTION_KEY: z.string().min(40),
  ADMIN_EMAILS: z.string().default(""),
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    CONTACT_ENCRYPTION_KEY: process.env.CONTACT_ENCRYPTION_KEY,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? "",
  });
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}
