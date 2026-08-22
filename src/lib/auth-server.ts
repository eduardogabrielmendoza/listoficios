import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { schema } from "@/db/schema";
import { adminEmails } from "@/lib/server/env";

const buildSecret = "listoficios-build-only-secret-change-in-railway";
const baseURL = process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  appName: "Listoficios",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? buildSecret,
  database: drizzleAdapter(getDb(), { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 6 },
      "/sign-up/email": { window: 300, max: 4 },
    },
  },
  trustedOrigins: [baseURL],
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => ({
          data: {
            ...newUser,
            role: adminEmails().includes(newUser.email.toLowerCase()) ? "admin" : "user",
          },
        }),
      },
    },
  },
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), nextCookies()],
});

export function authIsConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET && (process.env.BETTER_AUTH_URL || process.env.APP_URL));
}

export async function getServerSession() {
  if (!authIsConfigured()) return null;
  return auth.api.getSession({ headers: await headers() });
}

export async function requireServerSession() {
  const current = await getServerSession();
  if (!current) throw new Error("UNAUTHORIZED");
  return current;
}

export async function requireAdminSession() {
  const current = await requireServerSession();
  if (current.user.role !== "admin") throw new Error("FORBIDDEN");
  return current;
}
