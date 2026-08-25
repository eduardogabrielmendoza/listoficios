import { adminOperationalOverview } from "@/data/admin-console";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

export const dynamic = "force-dynamic";
export async function GET(request: Request) { const id = requestId(request); try { await requirePermission("moderation:read"); return apiData(await adminOperationalOverview(), { requestId: id }); } catch { return apiError("FORBIDDEN", "No tenés acceso al panel.", 403, id); } }
