import { z } from "zod";
import { getImageUrl } from "@/lib/server/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });
  const { data, error } = await createAdminClient()
    .from("portfolio_items")
    .select("storage_key, professional_profiles!inner(status)")
    .eq("id", id)
    .eq("professional_profiles.status", "published")
    .maybeSingle();
  if (error || !data) return new Response("Not found", { status: 404 });
  try {
    return new Response(null, { status: 307, headers: { location: getImageUrl(data.storage_key), "cache-control": "public, max-age=3600, stale-while-revalidate=86400", "x-content-type-options": "nosniff" } });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
