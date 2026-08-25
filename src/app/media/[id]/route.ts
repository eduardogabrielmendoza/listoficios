import { z } from "zod";
import { getServerSession } from "@/lib/auth-server";
import { getImageUrl, type ImageVariant } from "@/lib/server/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const variantSchema = z.enum(["avatar", "cover", "card", "gallery", "full"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });
  const variant = variantSchema.catch("full").parse(new URL(request.url).searchParams.get("variant") ?? "full") as ImageVariant;
  const { data, error } = await createAdminClient()
    .from("portfolio_items")
    .select("storage_key, professional_profiles!inner(status, user_id)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return new Response("Not found", { status: 404 });
  const profile = data.professional_profiles as unknown as { status: string; user_id: string | null };
  if (profile.status !== "published") {
    const session = await getServerSession();
    if (!session || profile.user_id !== session.user.id) return new Response("Not found", { status: 404 });
  }
  try {
    return new Response(null, { status: 307, headers: { location: getImageUrl(data.storage_key, variant), "cache-control": "public, max-age=3600, stale-while-revalidate=86400", "x-content-type-options": "nosniff" } });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
