import { apiData, requestId } from "@/lib/server/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = requestId(request);
  const started = Date.now();
  if (!supabaseIsConfigured()) {
    return Response.json({ data: { status: "degraded", database: "not_configured", uptime: process.uptime() }, meta: { requestId: id } }, { status: 503 });
  }
  try {
    const { error } = await createAdminClient().from("categories").select("id").limit(1);
    if (error) throw error;
    return apiData({ status: "ok", database: "supabase_data_api", uptime: process.uptime(), latencyMs: Date.now() - started }, { requestId: id });
  } catch {
    return Response.json({ data: { status: "unhealthy", database: "unavailable", uptime: process.uptime() }, meta: { requestId: id } }, { status: 503 });
  }
}
