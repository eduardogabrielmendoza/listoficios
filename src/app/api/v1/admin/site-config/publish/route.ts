import { revalidateTag } from "next/cache";
import { publishSiteDraft, SITE_CONFIG_TAG } from "@/data/site-config";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { auditChange } from "@/data/admin-operations";
export async function POST(request: Request) { const id = requestId(request); try { const session = await requirePermission("site:write"); const result = await publishSiteDraft(session.user.id); await auditChange({ actorId: session.user.id, actorRole: session.user.role, targetType: "site_config", targetId: result.id, action: "published", reason: result.change_note || "Publicación de configuración", requestId: id, after: result }); revalidateTag(SITE_CONFIG_TAG, "max"); return apiData(result, { requestId: id }); } catch { return apiError("PUBLISH_FAILED", "No pudimos publicar el borrador.", 422, id); } }
