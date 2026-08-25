import { z } from "zod";
import { revalidateTag } from "next/cache";
import { getOwnProfileEditor, saveOwnProfile } from "@/data/me";
import { PUBLIC_PROFESSIONALS_TAG } from "@/data/professionals";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { profileInputSchema } from "@/lib/server/validation";
import { createModerationCase, moderateFields, rejectedContentHash } from "@/lib/server/moderation";

export const dynamic = "force-dynamic";

async function sessionOrError(request: Request) {
  try { return { session: await requireServerSession() }; }
  catch { return { response: apiError("UNAUTHORIZED", "Necesitás ingresar a tu cuenta.", 401, requestId(request)) }; }
}

export async function GET(request: Request) {
  const access = await sessionOrError(request); if (access.response) return access.response;
  return apiData(await getOwnProfileEditor(access.session!.user.id,access.session!.user.email), { requestId: requestId(request) });
}

export async function PATCH(request: Request) {
  const id = requestId(request); const access = await sessionOrError(request); if (access.response) return access.response;
  const parsed = profileInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá los datos de tu publicación.", 422, id, z.flattenError(parsed.error).fieldErrors);
  try {
    const fields = { firstName: parsed.data.firstName, lastName: parsed.data.lastName, customService: parsed.data.customService ?? "", bio: parsed.data.bio };
    const moderation = await moderateFields("profile", fields);
    if (moderation.action === "block") {
      rejectedContentHash(fields);
      return apiError("CONTENT_POLICY_BLOCKED", "Hay contenido que no podemos publicar.", 422, id, moderation.fieldErrors);
    }
    if (moderation.action === "review") {
      const caseId = await createModerationCase({ scope: "profile", userId: access.session!.user.id, payload: parsed.data, matches: moderation.matches });
      if (caseId) return apiData({ moderationStatus: "pending", caseId }, { requestId: id }, { status: 202 });
    }
    const profile = await saveOwnProfile(access.session!.user.id, parsed.data);
    revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    return apiData(profile, { requestId: id });
  }
  catch (error) { return apiError(error instanceof Error && error.message === "INVALID_PHONE" ? "INVALID_PHONE" : "DATABASE_ERROR", error instanceof Error && error.message === "INVALID_PHONE" ? "Ingresá un WhatsApp válido." : "No pudimos guardar la publicación.", 422, id); }
}
