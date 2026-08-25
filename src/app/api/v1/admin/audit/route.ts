import { listAdminSection } from "@/data/admin-console";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
export async function GET(request: Request) { const id = requestId(request); try { await requirePermission("audit:read"); return apiData(await listAdminSection("auditoria", new URL(request.url).searchParams.get("q") ?? ""), { requestId: id }); } catch { return apiError("FORBIDDEN", "No tenés acceso a la auditoría.", 403, id); } }
