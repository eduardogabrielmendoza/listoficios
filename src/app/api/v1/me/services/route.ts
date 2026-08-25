import { revalidateTag } from "next/cache";
import { z } from "zod";
import { deleteService, getOwnProfile, saveService } from "@/data/me";
import { PUBLIC_PROFESSIONALS_TAG } from "@/data/professionals";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { serviceInputSchema } from "@/lib/server/validation";
import { createModerationCase, moderateFields } from "@/lib/server/moderation";

export const dynamic = "force-dynamic";

async function getUserId() {
  try {
    return (await requireServerSession()).user.id;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const userId = await getUserId();
  return userId
    ? apiData((await getOwnProfile(userId))?.services ?? [], { requestId: requestId(request) })
    : apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, requestId(request));
}

async function write(request: Request) {
  const id = requestId(request);
  const userId = await getUserId();
  if (!userId) return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id);
  const parsed = serviceInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá el servicio.", 422, id, z.flattenError(parsed.error).fieldErrors);
  try {
    const moderation = await moderateFields("service", { title: parsed.data.title, description: parsed.data.description, customService: parsed.data.customService ?? "" });
    if (moderation.action === "block") return apiError("CONTENT_POLICY_BLOCKED", "Hay contenido que no podemos publicar.", 422, id, moderation.fieldErrors);
    if (moderation.action === "review") {
      const caseId = await createModerationCase({ scope: "service", userId, targetId: parsed.data.id ?? null, payload: parsed.data, matches: moderation.matches });
      if (caseId) return apiData({ moderationStatus: "pending", caseId }, { requestId: id }, { status: 202 });
    }
    const service = await saveService(userId, parsed.data);
    revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    return apiData(service, { requestId: id });
  } catch (error) {
    const code = error instanceof Error ? error.message : "DATABASE_ERROR";
    const message = code === "PROFILE_REQUIRED"
      ? "Primero creá tu perfil."
      : code === "SERVICE_LIMIT"
        ? "Podés publicar hasta ocho servicios."
        : "No pudimos guardar el servicio.";
    return apiError(code, message, code === "NOT_FOUND" ? 404 : 422, id);
  }
}

export const POST = write;
export const PATCH = write;

export async function DELETE(request: Request) {
  const id = requestId(request);
  const userId = await getUserId();
  if (!userId) return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id);
  const serviceId = new URL(request.url).searchParams.get("id");
  if (!serviceId || !z.uuid().safeParse(serviceId).success) return apiError("INVALID_ID", "Servicio inválido.", 400, id);
  if (!(await deleteService(userId, serviceId))) return apiError("NOT_FOUND", "No encontramos ese servicio.", 404, id);
  revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
  return apiData({ deleted: true }, { requestId: id });
}
