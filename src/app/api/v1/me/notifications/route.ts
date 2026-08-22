import { listNotifications,markNotifications } from "@/data/community";import { requireServerSession } from "@/lib/auth-server";import { apiData,apiError,requestId } from "@/lib/server/api-response";
async function userId(){try{return(await requireServerSession()).user.id}catch{return null}}
export async function GET(request:Request){const id=requestId(request);const user=await userId();return user?apiData(await listNotifications(user),{requestId:id}):apiError("UNAUTHORIZED","Necesitás ingresar.",401,id)}
export async function PATCH(request:Request){const id=requestId(request);const user=await userId();return user?apiData(await markNotifications(user,true),{requestId:id}):apiError("UNAUTHORIZED","Necesitás ingresar.",401,id)}
