import type { z } from "zod";
import { createSlug } from "@/lib/slug";
import { decryptContact, encryptContact, maskPhone } from "@/lib/server/crypto";
import { normalizeWhatsapp, profileInputSchema, serviceInputSchema } from "@/lib/server/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProfileRow, ServiceRow, ServiceView, ZoneRow } from "@/lib/supabase/rows";

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;

function serviceView(service: ServiceRow): ServiceView {
  return {
    id: service.id,
    profileId: service.profile_id,
    slug: service.slug,
    title: service.title,
    description: service.description,
    customService: service.custom_service,
    pricingMode: service.pricing_mode,
    priceAmount: service.price_amount,
    published: service.published,
    createdAt: service.created_at,
    updatedAt: service.updated_at,
  };
}

function profileView(profile: ProfileRow) {
  return {
    id: profile.id,
    userId: profile.user_id,
    slug: profile.slug,
    displayName: profile.display_name,
    headline: profile.headline,
    bio: profile.bio,
    experienceYears: profile.experience_years,
    phoneCiphertext: profile.phone_ciphertext,
    phoneIv: profile.phone_iv,
    phonePreview: profile.phone_preview,
    avatarKey: null,
    coverKey: null,
    accentColor: profile.accent_color,
    serviceMode: profile.service_mode,
    status: profile.status,
    isDemo: profile.is_demo,
    viewsCount: profile.views_count,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function getOwnProfile(userId: string) {
  const { data, error } = await createAdminClient()
    .from("professional_profiles")
    .select("*, services(*), profile_zones(zone_id, zones(*))")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const profile = data as unknown as ProfileRow & {
    services: ServiceRow[];
    profile_zones: { zone_id: string; zones: ZoneRow | null }[];
  };
  return {
    profile: profileView(profile),
    services: profile.services.map(serviceView),
    zones: profile.profile_zones.flatMap((entry) => entry.zones ? [{ id: entry.zones.id, name: entry.zones.name }] : []),
  };
}

export async function getOwnProfileEditor(userId: string, email: string) {
  const data = await getOwnProfile(userId);
  if (!data) return null;
  const service = data.services[0];
  const categoryRows = service
    ? await createAdminClient().from("service_categories").select("category_id").eq("service_id", service.id)
    : { data: [], error: null };
  if (categoryRows.error) throw categoryRows.error;
  const nameParts = data.profile.displayName.trim().split(/\s+/);
  const firstName = nameParts.shift() ?? data.profile.displayName;
  const lastName = nameParts.join(" ") || "Profesional";
  let whatsapp = "";
  if (data.profile.phoneCiphertext && data.profile.phoneIv) {
    try { whatsapp = decryptContact(data.profile.phoneCiphertext, data.profile.phoneIv); } catch { whatsapp = ""; }
  }
  return {
    firstName,
    lastName,
    email,
    whatsapp,
    categories: (categoryRows.data ?? []).map((entry) => entry.category_id),
    customService: service?.customService ?? "",
    experienceYears: data.profile.experienceYears,
    bio: data.profile.bio,
    zones: data.zones.map((zone) => zone.name),
    serviceMode: data.profile.serviceMode,
    pricingMode: service?.pricingMode ?? "quote",
    priceAmount: service?.priceAmount ?? null,
    generalAvailability: ["coordinate"],
    preferredContact: "whatsapp",
    publicationStatus: data.profile.status,
    acceptedTerms: true,
    completed: true,
  };
}

export async function saveOwnProfile(userId: string, input: ProfileInput) {
  const phone = normalizeWhatsapp(input.whatsapp);
  const encrypted = encryptContact(phone);
  const baseSlug = createSlug(`${input.firstName}-${input.lastName}-${input.customService || input.categories[0] || "profesional"}`);
  const { data, error } = await createAdminClient().rpc("save_professional_profile", {
    p_user_id: userId,
    p_payload: {
      slug: `${baseSlug}-${userId.slice(0, 6).toLowerCase()}`,
      service_slug: createSlug(input.customService || input.categories[0] || "servicio"),
      display_name: `${input.firstName} ${input.lastName}`.trim(),
      headline: input.customService || "Profesional de Bella Vista",
      bio: input.bio,
      experience_years: input.experienceYears,
      phone_ciphertext: encrypted.ciphertext,
      phone_iv: encrypted.iv,
      phone_preview: maskPhone(phone),
      service_mode: input.serviceMode,
      zones: input.zones,
      categories: input.categories,
      custom_service: input.customService || null,
      pricing_mode: input.pricingMode,
      price_amount: input.pricingMode === "quote" ? null : input.priceAmount,
    },
  });
  if (error) throw error;
  return data as { profileId: string; slug: string; serviceId: string; status: string };
}

export async function saveService(userId: string, input: ServiceInput) {
  const { data, error } = await createAdminClient().rpc("save_professional_service", {
    p_user_id: userId,
    p_payload: {
      ...input,
      slug: createSlug(input.title),
      custom_service: input.customService || null,
      pricing_mode: input.pricingMode,
      price_amount: input.pricingMode === "quote" ? null : input.priceAmount,
    },
  });
  if (error) {
    if (error.message.includes("PROFILE_REQUIRED")) throw new Error("PROFILE_REQUIRED");
    if (error.message.includes("SERVICE_LIMIT")) throw new Error("SERVICE_LIMIT");
    if (error.message.includes("NOT_FOUND")) throw new Error("NOT_FOUND");
    throw error;
  }
  return serviceView(data as unknown as ServiceRow);
}

export async function deleteService(userId: string, serviceId: string) {
  const { data, error } = await createAdminClient().rpc("delete_professional_service", { p_user_id: userId, p_service_id: serviceId });
  if (error) throw error;
  return Boolean(data);
}

export async function setProfileStatus(userId: string, status: "published" | "paused") {
  const { data, error } = await createAdminClient()
    .from("professional_profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_demo", false)
    .select("id, status")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("NOT_FOUND");
  return data;
}
