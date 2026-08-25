import { z } from "zod";
import { patchProfile } from "@/data/admin-operations";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

const schema = z.object({ values: z.record(z.string(), z.unknown()), reason: z.string().trim().min(3).max(500) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const id = requestId(request); let session; try { session = await requirePermission("profiles:correct"); } catch { return apiError("FORBIDDEN", "Solo un administrador puede corregir contenido ajeno.", 403, id); } const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá la corrección.", 422, id, z.flattenError(parsed.error).fieldErrors); try { return apiData(await patchProfile({ id: (await params).id, ...parsed.data, actorId: session.user.id, actorRole: session.user.role, requestId: id }), { requestId: id }); } catch { return apiError("NOT_FOUND", "No encontramos ese perfil.", 404, id); } }
