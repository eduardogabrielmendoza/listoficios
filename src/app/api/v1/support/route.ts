import { z } from "zod";
import { createSupport } from "@/data/community";
import { getServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { createModerationCase, moderateFields } from "@/lib/server/moderation";
import { checkRateLimit, visitorKey } from "@/lib/server/rate-limit";

const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.email(), role: z.enum(["cliente", "profesional", "otro"]), topic: z.string().trim().min(2).max(100), message: z.string().trim().min(20).max(1200) });

export async function POST(request: Request) {
  const id = requestId(request); const visitor = visitorKey(request);
  const limit = await checkRateLimit("support", visitor, 4, 3600);
  if (!limit.allowed) return apiError("RATE_LIMITED", "Esperá antes de crear otra consulta.", 429, id);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Revisá la consulta.", 422, id, z.flattenError(parsed.error).fieldErrors);
  const moderation = await moderateFields("support", { topic: parsed.data.topic, message: parsed.data.message });
  if (moderation.action === "block") return apiError("CONTENT_POLICY_BLOCKED", "La consulta contiene texto que no podemos procesar.", 422, id, moderation.fieldErrors);
  const session = await getServerSession(); const { role, ...values } = parsed.data;
  const ticket = await createSupport({ ...values, userType: role, userId: session?.user.id });
  if (moderation.action === "review") await createModerationCase({ scope: "support", userId: session?.user.id, targetId: ticket.number, payload: { topic: parsed.data.topic }, matches: moderation.matches });
  return apiData(ticket, { requestId: id }, { status: 201 });
}
