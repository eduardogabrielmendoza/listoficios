import { z } from "zod";
import { saveReview } from "@/data/community";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { createModerationCase, moderateFields } from "@/lib/server/moderation";
import { checkRateLimit } from "@/lib/server/rate-limit";

const schema = z.object({ id: z.uuid().optional(), profileId: z.uuid(), rating: z.number().int().min(1).max(5), title: z.string().trim().min(3).max(80), body: z.string().trim().min(20).max(800) });

async function write(request: Request) {
  const id = requestId(request);
  let userId: string;
  try { userId = (await requireServerSession()).user.id; }
  catch { return apiError("UNAUTHORIZED", "Ingresá para opinar.", 401, id); }
  const limit = await checkRateLimit("review", userId, 6, 3600);
  if (!limit.allowed) return apiError("RATE_LIMITED", "Esperá antes de volver a opinar.", 429, id);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá tu opinión.", 422, id, z.flattenError(parsed.error).fieldErrors);
  const moderation = await moderateFields("review", { title: parsed.data.title, body: parsed.data.body });
  if (moderation.action === "block") return apiError("CONTENT_POLICY_BLOCKED", "Hay contenido que no podemos publicar.", 422, id, moderation.fieldErrors);
  try {
    const review = await saveReview(userId, parsed.data);
    if (moderation.action === "review") {
      const caseId = await createModerationCase({ scope: "review", userId, targetId: review.id, payload: parsed.data, matches: moderation.matches });
      return apiData({ ...review, moderationStatus: "pending", caseId }, { requestId: id }, { status: 202 });
    }
    return apiData(review, { requestId: id }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "DATABASE_ERROR";
    return apiError(code, code === "CONTACT_REQUIRED" ? "Podés opinar después de iniciar un contacto." : code === "NOT_ALLOWED" ? "No podés opinar sobre tu propio perfil." : "No pudimos guardar la opinión.", 422, id);
  }
}

export const POST = write;
export const PATCH = write;
