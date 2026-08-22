import { z } from "zod";
import { setFavorite } from "@/data/interactions";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";

async function mutate(request: Request, params: Promise<{ professionalId: string }>, enabled: boolean) {
  const id=requestId(request); let userId:string; try{userId=(await requireServerSession()).user.id;}catch{return apiError("UNAUTHORIZED","Ingresá para guardar favoritos.",401,id);}
  const profileId=(await params).professionalId;if(!z.uuid().safeParse(profileId).success)return apiError("INVALID_ID","Perfil inválido.",400,id);
  try{return apiData(await setFavorite(userId,profileId,enabled),{requestId:id});}catch{return apiError("NOT_FOUND","No encontramos ese perfil.",404,id);}
}
export function POST(request:Request,{params}:{params:Promise<{professionalId:string}>}){return mutate(request,params,true);}
export function DELETE(request:Request,{params}:{params:Promise<{professionalId:string}>}){return mutate(request,params,false);}
