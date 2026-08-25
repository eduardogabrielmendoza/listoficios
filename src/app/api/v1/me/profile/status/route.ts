import { revalidateTag } from "next/cache";
import { z } from "zod";
import { setProfileStatus } from "@/data/me";
import { PUBLIC_PROFESSIONALS_TAG } from "@/data/professionals";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

export async function PATCH(request: Request) {
  const id = requestId(request);
  let userId: string;
  try {
    userId = (await requireServerSession()).user.id;
  } catch {
    return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id);
  }
  const parsed = z.object({ status: z.enum(["published", "paused"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Estado inválido.", 422, id);
  try {
    const profile = await setProfileStatus(userId, parsed.data.status);
    revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    return apiData(profile, { requestId: id });
  } catch {
    return apiError("NOT_FOUND", "No encontramos tu publicación.", 404, id);
  }
}
