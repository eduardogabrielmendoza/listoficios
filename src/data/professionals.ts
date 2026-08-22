import type { PricingMode, ServiceProfile } from "@/lib/app-types";
import type { PublicProfessionalProfile, ServiceListing } from "@/lib/api-contracts";
import { findProfessional, professionals as mockProfessionals, searchProfessionals } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";
import type { ProfileGraph } from "@/lib/supabase/rows";

export type DirectoryFilters = {
  query?: string;
  category?: string;
  zone?: string;
  pricing?: PricingMode | "";
  sort?: "relevance" | "rating" | "price";
  cursor?: string;
  limit?: number;
};

const tones = new Set(["forest", "ocean", "sunset", "plum"]);
const graphSelect = `
  *,
  services(*, service_categories(category_id, categories(name))),
  profile_zones(zone_id, zones(name)),
  reviews(rating, status),
  portfolio_items(*)
`;

function mockResult(filters: DirectoryFilters) {
  const data = searchProfessionals({
    query: filters.query,
    category: filters.category,
    zone: filters.zone,
    pricing: filters.pricing,
    sort: filters.sort,
  });
  return { data, nextCursor: null, total: data.length, source: "seed-preview" as const };
}

function serviceProfile(profile: ProfileGraph): ServiceProfile {
  const activeServices = profile.services.filter((service) => service.published);
  const first = activeServices[0];
  const categories = [...new Set(activeServices.flatMap((service) => service.service_categories.map((entry) => entry.category_id)))];
  const categoryNames = activeServices.flatMap((service) => service.service_categories.flatMap((entry) => entry.categories?.name ? [entry.categories.name] : []));
  const reviews = profile.reviews.filter((review) => review.status === "published");
  const rating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  const initials = profile.display_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.display_name,
    initials,
    trade: profile.headline,
    categoryId: categories[0] ?? "otro",
    categories,
    customService: first?.custom_service ?? "",
    description: profile.bio,
    experienceYears: profile.experience_years,
    zones: profile.profile_zones.flatMap((entry) => entry.zones?.name ? [entry.zones.name] : []),
    serviceMode: profile.service_mode,
    pricingMode: first?.pricing_mode ?? "quote",
    priceAmount: first?.price_amount ?? null,
    generalAvailability: ["coordinate"],
    whatsapp: "",
    phonePreview: profile.phone_preview ?? "Número protegido",
    rating,
    reviews: reviews.length,
    responseTime: "Contacto directo por WhatsApp",
    skills: [...new Set([...activeServices.map((service) => service.title), ...categoryNames])],
    avatarTone: tones.has(profile.accent_color) ? profile.accent_color as ServiceProfile["avatarTone"] : "forest",
    featured: profile.views_count > 10,
    isDemo: profile.is_demo,
  };
}

async function publishedGraphs() {
  const { data, error } = await createAdminClient()
    .from("professional_profiles")
    .select(graphSelect)
    .eq("status", "published")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProfileGraph[];
}

function applyFilters(entries: ServiceProfile[], filters: DirectoryFilters) {
  const query = filters.query?.trim().toLocaleLowerCase("es-AR") ?? "";
  const filtered = entries.filter((profile) => {
    const text = [profile.name, profile.trade, profile.customService, profile.description, ...profile.skills, ...profile.zones].join(" ").toLocaleLowerCase("es-AR");
    return (!query || text.includes(query))
      && (!filters.category || profile.categories.includes(filters.category))
      && (!filters.zone || profile.zones.includes(filters.zone))
      && (!filters.pricing || profile.pricingMode === filters.pricing);
  });
  if (filters.sort === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === "price") filtered.sort((a, b) => (a.priceAmount ?? Number.MAX_SAFE_INTEGER) - (b.priceAmount ?? Number.MAX_SAFE_INTEGER));
  else filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  return filtered;
}

export async function listProfessionals(filters: DirectoryFilters = {}) {
  if (!supabaseIsConfigured()) return mockResult(filters);
  try {
    const all = applyFilters((await publishedGraphs()).map(serviceProfile), filters);
    const offset = filters.cursor ? Number(Buffer.from(filters.cursor, "base64url").toString("utf8")) || 0 : 0;
    const limit = Math.min(Math.max(filters.limit ?? 12, 1), 30);
    const data = all.slice(offset, offset + limit);
    const nextOffset = offset + data.length;
    return {
      data,
      nextCursor: nextOffset < all.length ? Buffer.from(String(nextOffset)).toString("base64url") : null,
      total: all.length,
      source: "database" as const,
    };
  } catch {
    return mockResult(filters);
  }
}

export async function getProfessionalBySlug(slug: string) {
  if (!supabaseIsConfigured()) return findProfessional(slug) ?? null;
  const { data, error } = await createAdminClient()
    .from("professional_profiles")
    .select(graphSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data ? serviceProfile(data as unknown as ProfileGraph) : null;
}

export async function getPublicProfile(slug: string): Promise<PublicProfessionalProfile | null> {
  if (!supabaseIsConfigured()) {
    const card = findProfessional(slug);
    if (!card) return null;
    return {
      id: card.id, slug: card.slug, displayName: card.name, headline: card.trade, bio: card.description,
      experienceYears: card.experienceYears, zones: card.zones, serviceMode: card.serviceMode,
      phonePreview: card.phonePreview, accentColor: card.avatarTone, rating: card.rating, reviewCount: card.reviews,
      isDemo: card.isDemo, portfolio: [], services: [{ id: `${card.id}-service`, slug: card.customService ? card.customService.toLowerCase().replace(/\s+/g, "-") : card.categoryId, title: card.customService || card.trade, description: card.description, categories: card.categories, customService: card.customService || null, pricingMode: card.pricingMode, priceAmount: card.priceAmount }],
    };
  }
  const { data, error } = await createAdminClient()
    .from("professional_profiles")
    .select(graphSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const graph = data as unknown as ProfileGraph;
  const card = serviceProfile(graph);
  const listings: ServiceListing[] = graph.services.filter((service) => service.published).map((service) => ({
    id: service.id,
    slug: service.slug,
    title: service.title,
    description: service.description,
    categories: service.service_categories.map((entry) => entry.category_id),
    customService: service.custom_service,
    pricingMode: service.pricing_mode,
    priceAmount: service.price_amount,
  }));
  return {
    id: card.id, slug: card.slug, displayName: card.name, headline: card.trade, bio: card.description,
    experienceYears: card.experienceYears, zones: card.zones, serviceMode: card.serviceMode,
    phonePreview: card.phonePreview, accentColor: card.avatarTone, rating: card.rating || null, reviewCount: card.reviews,
    isDemo: card.isDemo,
    portfolio: graph.portfolio_items.sort((a, b) => a.sort_order - b.sort_order).map((item) => ({ id: item.id, url: `/media/${item.id}`, alt: item.alt, width: item.width, height: item.height })),
    services: listings,
  };
}

export async function getServiceBySlug(profileSlug: string, serviceSlug: string) {
  const profile = await getPublicProfile(profileSlug);
  if (!profile) return null;
  const service = profile.services.find((entry) => entry.slug === serviceSlug);
  return service ? { profile, service } : null;
}

export async function getServiceByListingSlug(serviceSlug: string) {
  if (!supabaseIsConfigured()) {
    for (const professional of mockProfessionals) {
      const profile = await getPublicProfile(professional.slug);
      const service = profile?.services.find((entry) => entry.slug === serviceSlug);
      if (profile && service) return { profile, service };
    }
    return null;
  }
  const { data, error } = await createAdminClient().from("services").select("slug, professional_profiles!inner(slug, status)").eq("slug", serviceSlug).eq("published", true).eq("professional_profiles.status", "published").limit(1).maybeSingle();
  if (error || !data) return null;
  const joined = data.professional_profiles as unknown as { slug: string };
  return getServiceBySlug(joined.slug, data.slug);
}

export function allMockProfessionals() {
  return mockProfessionals;
}
