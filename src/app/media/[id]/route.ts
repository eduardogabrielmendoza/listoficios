import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { portfolioItems, professionalProfiles } from "@/db/schema";
import { getPrivateObject } from "@/lib/server/storage";

export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const id=(await params).id;if(!z.uuid().safeParse(id).success)return new Response("Not found",{status:404});const db=getDb();const rows=await db.select({key:portfolioItems.storageKey}).from(portfolioItems).innerJoin(professionalProfiles,eq(professionalProfiles.id,portfolioItems.profileId)).where(and(eq(portfolioItems.id,id),eq(professionalProfiles.status,"published"))).limit(1);if(!rows.length)return new Response("Not found",{status:404});try{const object=await getPrivateObject(rows[0].key);if(!object.Body)return new Response("Not found",{status:404});return new Response(object.Body.transformToWebStream() as ReadableStream,{headers:{"content-type":object.ContentType??"image/webp","cache-control":"public, max-age=86400, stale-while-revalidate=604800","x-content-type-options":"nosniff"}});}catch{return new Response("Media unavailable",{status:503});}}
