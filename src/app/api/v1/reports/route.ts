import { z } from "zod";
import { createReport } from "@/data/community";
import { getServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { createModerationCase, moderateFields } from "@/lib/server/moderation";
import { checkRateLimit, visitorKey } from "@/lib/server/rate-limit";

const schema = z.object({ targetType: z.enum(["profile", "service", "review"]), targetId: z.string().min(1).max(100), reason: z.enum(["informacion_falsa", "contenido_inapropiado", "estafa", "spam", "otro"]), description: z.string().trim().max(800).default("") });

export async function POST(request: Request) {
  const id = requestId(request); const visitor = visitorKey(request);
  const limit = await checkRateLimit("report", visitor, 5, 3600);
  if (!limit.allowed) return apiError("RATE_LIMITED", "Alcanzaste el límite temporal de reportes.", 429, id);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá el reporte.", 422, id, z.flattenError(parsed.error).fieldErrors);
  const moderation = await moderateFields("report", { description: parsed.data.description });
  if (moderation.action === "block") return apiError("CONTENT_POLICY_BLOCKED", "El detalle contiene texto que no podemos procesar.", 422, id, moderation.fieldErrors);
  const session = await getServerSession();
  const report = await createReport({ ...parsed.data, reporterUserId: session?.user.id, visitorHash: visitor });
  if (moderation.action === "review") await createModerationCase({ scope: "report", userId: session?.user.id, targetId: report.number, payload: { reason: parsed.data.reason }, matches: moderation.matches });
  return apiData(report, { requestId: id }, { status: 201 });
}
