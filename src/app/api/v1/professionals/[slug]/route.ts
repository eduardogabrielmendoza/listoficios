import { getPublicProfile } from "@/data/professionals";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const id = requestId(request);
  const profile = await getPublicProfile((await params).slug);
  return profile ? apiData(profile, { requestId: id }) : apiError("NOT_FOUND", "No encontramos ese perfil.", 404, id);
}
