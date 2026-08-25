import { listAdminSection } from "@/data/admin-console";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

export async function GET(request: Request) { const id = requestId(request); try { await requirePermission("moderation:read"); const query = new URL(request.url).searchParams.get("q") ?? ""; return apiData(await listAdminSection("moderacion", query), { requestId: id }); } catch { return apiError("FORBIDDEN", "No tenés acceso a moderación.", 403, id); } }
