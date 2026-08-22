import { getProfessionalBySlug } from "@/data/professionals";
import { findProfessional } from "@/lib/mock-data";
import { decryptContact } from "@/lib/server/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";
import type { ProfileRow, ServiceRow } from "@/lib/supabase/rows";

export async function setFavorite(userId: string, profileId: string, enabled: boolean) {
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from("professional_profiles").select("id").eq("id", profileId).maybeSingle();
  if (!profile) throw new Error("NOT_FOUND");
  const operation = enabled
    ? supabase.from("favorites").upsert({ user_id: userId, profile_id: profileId }, { onConflict: "user_id,profile_id", ignoreDuplicates: true })
    : supabase.from("favorites").delete().eq("user_id", userId).eq("profile_id", profileId);
  const { error } = await operation;
  if (error) throw error;
  return { favorite: enabled };
}

export async function listFavorites(userId: string) {
  const { data, error } = await createAdminClient()
    .from("favorites")
    .select("profile_id, created_at, professional_profiles!inner(slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const profiles = await Promise.all((data ?? []).map(async (row) => {
    const joined = row.professional_profiles as unknown as { slug: string };
    return { createdAt: new Date(row.created_at), profile: await getProfessionalBySlug(joined.slug) };
  }));
  return profiles.filter((entry) => entry.profile !== null);
}

export async function createContact(input: { profileId: string; serviceId?: string; channel: "whatsapp" | "phone"; userId?: string; visitorHash: string }) {
  if (!supabaseIsConfigured()) {
    const demo = findProfessional(input.profileId);
    if (!demo) throw new Error("NOT_FOUND");
    return { channel: input.channel, phonePreview: demo.phonePreview, url: null, message: `Hola, vi tu perfil en Listoficios y quería consultarte por ${demo.trade.toLowerCase()}.`, demo: true };
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("professional_profiles").select("*").eq("id", input.profileId).maybeSingle();
  if (error) throw error;
  const profile = data as unknown as ProfileRow | null;
  if (!profile || profile.status !== "published") throw new Error("NOT_FOUND");
  let serviceTitle = profile.headline;
  if (input.serviceId) {
    const serviceResult = await supabase.from("services").select("*").eq("id", input.serviceId).eq("profile_id", profile.id).maybeSingle();
    const service = serviceResult.data as unknown as ServiceRow | null;
    if (serviceResult.error || !service) throw new Error("NOT_FOUND");
    serviceTitle = service.title;
  }
  const inserted = await supabase.from("contact_events").insert({
    user_id: input.userId ?? null,
    profile_id: profile.id,
    service_id: input.serviceId ?? null,
    channel: input.channel,
    visitor_hash: input.visitorHash,
  });
  if (inserted.error) throw inserted.error;
  const message = `Hola, vi tu perfil en Listoficios y quería consultarte por ${serviceTitle}.`;
  if (profile.is_demo) return { channel: input.channel, phonePreview: profile.phone_preview, url: null, message, demo: true };
  if (!profile.phone_ciphertext || !profile.phone_iv) throw new Error("CONTACT_NOT_AVAILABLE");
  const phone = decryptContact(profile.phone_ciphertext, profile.phone_iv);
  const url = input.channel === "whatsapp" ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `tel:+${phone}`;
  return { channel: input.channel, phonePreview: profile.phone_preview, url, message, demo: false };
}
