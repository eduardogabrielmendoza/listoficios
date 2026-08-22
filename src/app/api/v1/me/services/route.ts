import { z } from "zod";
import { deleteService, getOwnProfile, saveService } from "@/data/me";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { serviceInputSchema } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

async function getUserId() { try { return (await requireServerSession()).user.id; } catch { return null; } }
export async function GET(request: Request) { const userId=await getUserId(); return userId?apiData((await getOwnProfile(userId))?.services??[],{requestId:requestId(request)}):apiError("UNAUTHORIZED","Necesitás ingresar.",401,requestId(request)); }
async function write(request: Request) { const id=requestId(request); const userId=await getUserId(); if(!userId)return apiError("UNAUTHORIZED","Necesitás ingresar.",401,id); const parsed=serviceInputSchema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return apiError("VALIDATION_ERROR","Revisá el servicio.",422,id,z.flattenError(parsed.error).fieldErrors); try{return apiData(await saveService(userId,parsed.data),{requestId:id});}catch(error){const code=error instanceof Error?error.message:"DATABASE_ERROR";return apiError(code,code==="PROFILE_REQUIRED"?"Primero creá tu perfil.":code==="SERVICE_LIMIT"?"Podés publicar hasta ocho servicios.":"No pudimos guardar el servicio.",code==="NOT_FOUND"?404:422,id);} }
export const POST=write;
export const PATCH=write;
export async function DELETE(request:Request){const id=requestId(request);const userId=await getUserId();if(!userId)return apiError("UNAUTHORIZED","Necesitás ingresar.",401,id);const serviceId=new URL(request.url).searchParams.get("id");if(!serviceId||!z.uuid().safeParse(serviceId).success)return apiError("INVALID_ID","Servicio inválido.",400,id);return await deleteService(userId,serviceId)?apiData({deleted:true},{requestId:id}):apiError("NOT_FOUND","No encontramos ese servicio.",404,id);}
