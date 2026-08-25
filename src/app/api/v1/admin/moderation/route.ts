import { revalidateTag } from "next/cache";
import { z } from "zod";
import { moderate } from "@/data/admin";
import { PUBLIC_PROFESSIONALS_TAG } from "@/data/professionals";
import { requireAdminSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

const schema = z.object({
  targetType: z.enum(["review", "report", "profile", "support", "user"]),
  targetId: z.string().min(1).max(100),
  action: z.string().min(2).max(30),
  reason: z.string().trim().min(3).max(500),
});

export async function PATCH(request: Request) {
  const id = requestId(request);
  let session: Awaited<ReturnType<typeof requireAdminSession>>;
  try {
    session = await requireAdminSession();
  } catch {
    return apiError("FORBIDDEN", "No tenés acceso al panel administrador.", 403, id);
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá la acción de moderación.", 422, id, z.flattenError(parsed.error).fieldErrors);
  try {
    const result = await moderate(session.user.id, parsed.data);
    if (parsed.data.targetType === "profile" || parsed.data.targetType === "review") {
      revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    }
    return apiData(result, { requestId: id });
  } catch {
    return apiError("INVALID_ACTION", "La acción solicitada no es válida.", 422, id);
  }
}
