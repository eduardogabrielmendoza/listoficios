import { getServiceByListingSlug } from "@/data/professionals";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const id = requestId(request);
  const result = await getServiceByListingSlug((await params).slug);
  return result ? apiData(result, { requestId: id }) : apiError("NOT_FOUND", "No encontramos ese servicio.", 404, id);
}
