import { listFavorites } from "@/data/interactions";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

export const dynamic="force-dynamic";
export async function GET(request:Request){const id=requestId(request);try{return apiData(await listFavorites((await requireServerSession()).user.id),{requestId:id});}catch{return apiError("UNAUTHORIZED","Ingresá para ver tus favoritos.",401,id);}}
