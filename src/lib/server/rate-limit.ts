import { and, eq, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db";
import { rateLimits } from "@/db/schema";
import { hashIdentifier } from "@/lib/server/crypto";

const memory = new Map<string, { count: number; expiresAt: number }>();

export function visitorKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const agent = request.headers.get("user-agent")?.slice(0, 160) ?? "unknown";
  const pepper = process.env.BETTER_AUTH_SECRET ?? "development";
  return hashIdentifier(`${pepper}|${forwarded}|${agent}`);
}

export async function checkRateLimit(action: string, identifier: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
  const expiresAt = new Date(bucket + windowSeconds * 1000);
  const keyHash = hashIdentifier(identifier);
  if (!hasDatabase()) {
    const key = `${keyHash}:${action}:${bucket}`;
    const current = memory.get(key) ?? { count: 0, expiresAt: expiresAt.getTime() };
    current.count += 1;
    memory.set(key, current);
    return { allowed: current.count <= limit, remaining: Math.max(limit - current.count, 0), retryAfter: Math.max(Math.ceil((current.expiresAt - now) / 1000), 1) };
  }
  const db = getDb();
  const windowStart = new Date(bucket);
  const [entry] = await db.insert(rateLimits).values({ keyHash, action, windowStart, expiresAt, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.keyHash, rateLimits.action, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    }).returning({ count: rateLimits.count, expiresAt: rateLimits.expiresAt });
  // Evita que una eventual fila dañada permita más solicitudes.
  const stored = await db.select({ count: rateLimits.count }).from(rateLimits).where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.action, action), eq(rateLimits.windowStart, windowStart))).limit(1);
  const count = stored[0]?.count ?? entry.count;
  return { allowed: count <= limit, remaining: Math.max(limit - count, 0), retryAfter: Math.max(Math.ceil((entry.expiresAt.getTime() - now) / 1000), 1) };
}
