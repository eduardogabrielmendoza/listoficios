import { z } from "zod";
import { restoreSiteVersion } from "@/data/site-config";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { auditChange } from "@/data/admin-operations";
const schema = z.object({ versionId: z.uuid() });
export async function POST(request: Request) { const id = requestId(request); let session; try { session = await requirePermission("site:write"); } catch { return apiError("FORBIDDEN", "No tenés acceso a la configuración.", 403, id); } const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("VALIDATION_ERROR", "Versión inválida.", 422, id); try { const result = await restoreSiteVersion(session.user.id, parsed.data.versionId); await auditChange({ actorId: session.user.id, actorRole: session.user.role, targetType: "site_config", targetId: result.id, action: "restored", reason: `Restauración desde ${parsed.data.versionId}`, requestId: id, after: result }); return apiData(result, { requestId: id }); } catch { return apiError("NOT_FOUND", "No encontramos esa versión.", 404, id); } }
