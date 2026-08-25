import { z } from "zod";
import { requirePermission } from "@/lib/auth-server";
import { siteConfigSchema } from "@/lib/site-config";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
const schema = z.object({ config: siteConfigSchema });
export async function POST(request: Request) { const id = requestId(request); try { await requirePermission("site:write"); } catch { return apiError("FORBIDDEN", "No tenés acceso a la vista previa.", 403, id); } const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá la configuración.", 422, id, z.flattenError(parsed.error).fieldErrors); return apiData({ token: crypto.randomUUID(), config: parsed.data.config, expiresIn: 900 }, { requestId: id }); }
