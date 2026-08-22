import { GalleryManager } from "@/components/gallery-manager";
import { getOwnProfile } from "@/data/me";
import { requireServerSession } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function GalleryPage() {
  const session = await requireServerSession();
  const data = await getOwnProfile(session.user.id);
  const result = data
    ? await createAdminClient().from("portfolio_items").select("*").eq("profile_id", data.profile.id).order("sort_order")
    : { data: [], error: null };
  if (result.error) throw result.error;
  return <GalleryManager initial={(result.data ?? []).map((item) => ({ id: item.id, url: `/media/${item.id}`, alt: item.alt, width: item.width, height: item.height }))} />;
}
