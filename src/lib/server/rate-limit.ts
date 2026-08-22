import { hashIdentifier } from "@/lib/server/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";

const memory = new Map<string, { count: number; expiresAt: number }>();

export function visitorKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const agent = request.headers.get("user-agent")?.slice(0, 160) ?? "unknown";
  const pepper = process.env.SUPABASE_SECRET_KEY ?? "development";
  return hashIdentifier(`${pepper}|${forwarded}|${agent}`);
}

export async function checkRateLimit(action: string, identifier: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
  const expiresAt = bucket + windowSeconds * 1000;
  const keyHash = hashIdentifier(identifier);
  if (!supabaseIsConfigured()) {
    const key = `${keyHash}:${action}:${bucket}`;
    const current = memory.get(key) ?? { count: 0, expiresAt };
    current.count += 1;
    memory.set(key, current);
    return { allowed: current.count <= limit, remaining: Math.max(limit - current.count, 0), retryAfter: Math.max(Math.ceil((current.expiresAt - now) / 1000), 1) };
  }
  const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
    p_key_hash: keyHash,
    p_action: action,
    p_window_start: new Date(bucket).toISOString(),
    p_expires_at: new Date(expiresAt).toISOString(),
  });
  if (error) throw error;
  const count = Number(data ?? 1);
  return { allowed: count <= limit, remaining: Math.max(limit - count, 0), retryAfter: Math.max(Math.ceil((expiresAt - now) / 1000), 1) };
}
