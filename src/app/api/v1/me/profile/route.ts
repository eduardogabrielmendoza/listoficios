import { z } from "zod";
import { revalidateTag } from "next/cache";
import { getOwnProfileEditor, saveOwnProfile } from "@/data/me";
import { PUBLIC_PROFESSIONALS_TAG } from "@/data/professionals";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { profileInputSchema } from "@/lib/server/validation";

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
    const profile = await saveOwnProfile(access.session!.user.id, parsed.data);
    revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    return apiData(profile, { requestId: id });
  }
  catch (error) { return apiError(error instanceof Error && error.message === "INVALID_PHONE" ? "INVALID_PHONE" : "DATABASE_ERROR", error instanceof Error && error.message === "INVALID_PHONE" ? "Ingresá un WhatsApp válido." : "No pudimos guardar la publicación.", 422, id); }
}
