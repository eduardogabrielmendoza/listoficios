import { z } from "zod";
import { decideModerationCase } from "@/data/admin-operations";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

const schema = z.object({ decision: z.enum(["approved", "rejected", "changes_requested", "dismissed"]), reason: z.string().trim().min(3).max(500), internalNote: z.string().trim().max(1000).optional() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const id = requestId(request); let session; try { session = await requirePermission("moderation:write"); } catch { return apiError("FORBIDDEN", "No tenés acceso a moderación.", 403, id); } const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá la decisión.", 422, id, z.flattenError(parsed.error).fieldErrors); try { return apiData(await decideModerationCase({ caseId: (await params).id, ...parsed.data, actorId: session.user.id, actorRole: session.user.role, requestId: id }), { requestId: id }); } catch { return apiError("NOT_FOUND", "No encontramos el caso.", 404, id); } }
