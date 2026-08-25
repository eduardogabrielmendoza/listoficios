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
  return <GalleryManager initial={(result.data ?? []).map((item) => {
    const kind = (item.kind ?? "work") as "avatar" | "cover" | "work";
    return {
      id: item.id,
      url: `/media/${item.id}?variant=${kind === "work" ? "gallery" : kind}`,
      alt: item.alt,
      caption: item.caption ?? "",
      kind,
      sortOrder: item.sort_order,
      focalX: Number(item.focal_x ?? 0.5),
      focalY: Number(item.focal_y ?? 0.5),
      width: item.width,
      height: item.height,
    };
  })} />;
}
