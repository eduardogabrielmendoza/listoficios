import { z } from "zod";
import { listProfessionals } from "@/data/professionals";
import { apiData, apiError, logRequest, requestId } from "@/lib/server/api-response";

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  zone: z.string().trim().max(60).optional(),
  pricing: z.enum(["from", "hourly", "fixed", "quote"]).optional(),
  sort: z.enum(["relevance", "rating", "price"]).default("relevance"),
  cursor: z.string().max(300).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = requestId(request);
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("INVALID_QUERY", "Revisá los filtros enviados.", 400, id, z.flattenError(parsed.error).fieldErrors);
  try {
    const result = await listProfessionals({ query: parsed.data.q, ...parsed.data });
    logRequest("info", "professionals.list", { requestId: id, total: result.total, source: result.source });
    return apiData(result.data, { requestId: id, total: result.total, nextCursor: result.nextCursor });
  } catch (error) {
    logRequest("error", "professionals.list.failed", { requestId: id, message: error instanceof Error ? error.message : "unknown" });
    return apiError("DATABASE_ERROR", "No pudimos cargar los profesionales.", 503, id);
  }
}
