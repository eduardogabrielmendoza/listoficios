import { apiData, requestId } from "@/lib/server/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = requestId(request);
  const checkDependencies = new URL(request.url).searchParams.get("dependencies") === "1";
  const started = Date.now();

  if (!checkDependencies) {
    return apiData({
      status: "ok",
      application: "ready",
      database: supabaseIsConfigured() ? "configured_not_checked" : "not_configured",
      uptime: process.uptime(),
    }, { requestId: id });
  }

  if (!supabaseIsConfigured()) {
    return apiData({
      status: "degraded",
      application: "ready",
      database: "not_configured",
      uptime: process.uptime(),
    }, { requestId: id });
  }

  try {
    const { error } = await createAdminClient()
      .from("categories")
      .select("id")
      .limit(1)
      .abortSignal(AbortSignal.timeout(5_000));
    if (error) throw error;
    return apiData({ status: "ok", application: "ready", database: "supabase_data_api", uptime: process.uptime(), latencyMs: Date.now() - started }, { requestId: id });
  } catch (cause) {
    const diagnostic = cause instanceof Error ? cause.message.slice(0, 180) : "Supabase no respondió.";
    return apiData({
      status: "degraded",
      application: "ready",
      database: "unavailable",
      diagnostic,
      uptime: process.uptime(),
      latencyMs: Date.now() - started,
    }, { requestId: id });
  }
}
