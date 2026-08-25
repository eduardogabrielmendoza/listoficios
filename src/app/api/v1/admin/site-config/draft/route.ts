import { z } from "zod";
import { getOrCreateDraft, saveSiteDraft } from "@/data/site-config";
import { requirePermission } from "@/lib/auth-server";
import { siteConfigSchema } from "@/lib/site-config";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
export async function GET(request: Request) { const id = requestId(request); try { const session = await requirePermission("site:write"); return apiData(await getOrCreateDraft(session.user.id), { requestId: id }); } catch { return apiError("FORBIDDEN", "No tenés acceso a la configuración.", 403, id); } }
const schema = z.object({ config: siteConfigSchema, note: z.string().trim().max(200).default("") });
export async function PATCH(request: Request) { const id = requestId(request); let session; try { session = await requirePermission("site:write"); } catch { return apiError("FORBIDDEN", "No tenés acceso a la configuración.", 403, id); } const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá la configuración.", 422, id, z.flattenError(parsed.error).fieldErrors); return apiData(await saveSiteDraft(session.user.id, parsed.data.config, parsed.data.note), { requestId: id }); }
