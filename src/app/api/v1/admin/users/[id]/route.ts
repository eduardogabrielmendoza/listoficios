import { z } from "zod";
import { patchUser } from "@/data/admin-operations";
import { requirePermission } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

const schema = z.object({ role: z.enum(["user", "moderator", "admin"]).optional(), banned: z.boolean().optional(), reason: z.string().trim().min(3).max(500) }).refine((value) => value.role !== undefined || value.banned !== undefined);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const id = requestId(request); let session; try { session = await requirePermission("users:roles"); } catch { return apiError("FORBIDDEN", "Solo un administrador puede cambiar cuentas.", 403, id); } const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá los cambios.", 422, id, z.flattenError(parsed.error).fieldErrors); try { return apiData(await patchUser({ id: (await params).id, ...parsed.data, actorId: session.user.id, actorRole: session.user.role, requestId: id }), { requestId: id }); } catch { return apiError("NOT_FOUND", "No encontramos esa cuenta.", 404, id); } }
