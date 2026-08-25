import { getPublicSiteConfig } from "@/data/site-config";
import { apiData, requestId } from "@/lib/server/api-response";

export async function GET(request: Request) { return apiData(await getPublicSiteConfig(), { requestId: requestId(request) }); }
