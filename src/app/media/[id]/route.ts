import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { portfolioItems, professionalProfiles } from "@/db/schema";
import { getImageUrl } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });

  const db = getDb();
  const rows = await db
    .select({ key: portfolioItems.storageKey })
    .from(portfolioItems)
    .innerJoin(professionalProfiles, eq(professionalProfiles.id, portfolioItems.profileId))
    .where(and(eq(portfolioItems.id, id), eq(professionalProfiles.status, "published")))
    .limit(1);
  if (!rows.length) return new Response("Not found", { status: 404 });

  try {
    return new Response(null, {
      status: 307,
      headers: {
        location: getImageUrl(rows[0].key),
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
