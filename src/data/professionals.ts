import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db";
import {
  categories,
  portfolioItems,
  professionalProfiles,
  profileZones,
  reviews,
  serviceCategories,
  services,
  zones,
} from "@/db/schema";
import type { PricingMode, ServiceProfile } from "@/lib/app-types";
import type { PublicProfessionalProfile, ServiceListing } from "@/lib/api-contracts";
import { findProfessional, professionals as mockProfessionals, searchProfessionals } from "@/lib/mock-data";

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

function encodeCursor(updated: Date, id: string) {
  return Buffer.from(`${updated.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor?: string) {
  if (!cursor) return null;
  try {
    const [date, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
    const updated = new Date(date);
    return id && !Number.isNaN(updated.getTime()) ? { updated, id } : null;
  } catch {
    return null;
  }
}

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

export async function listProfessionals(filters: DirectoryFilters = {}) {
  if (!hasDatabase()) return mockResult(filters);
  const db = getDb();
  const limit = Math.min(Math.max(filters.limit ?? 12, 1), 30);
  const cursor = decodeCursor(filters.cursor);
  const query = filters.query?.trim().toLowerCase();
  const conditions = [eq(professionalProfiles.status, "published")];
  if (query) conditions.push(sql<boolean>`(
    lower(${professionalProfiles.displayName}) like ${`%${query}%`}
    or lower(${professionalProfiles.headline}) like ${`%${query}%`}
    or lower(${professionalProfiles.bio}) like ${`%${query}%`}
    or exists (select 1 from ${services} s where s.profile_id = ${professionalProfiles.id} and (lower(s.title) like ${`%${query}%`} or lower(s.description) like ${`%${query}%`} or lower(coalesce(s.custom_service, '')) like ${`%${query}%`}))
  )`);
  if (filters.category) conditions.push(sql<boolean>`exists (
    select 1 from ${services} s join ${serviceCategories} sc on sc.service_id = s.id
    where s.profile_id = ${professionalProfiles.id} and sc.category_id = ${filters.category}
  )`);
  if (filters.zone) conditions.push(sql<boolean>`exists (
    select 1 from ${profileZones} pz join ${zones} z on z.id = pz.zone_id
    where pz.profile_id = ${professionalProfiles.id} and (z.id = ${filters.zone} or z.name = ${filters.zone})
  )`);
  if (filters.pricing) conditions.push(sql<boolean>`exists (
    select 1 from ${services} s where s.profile_id = ${professionalProfiles.id} and s.pricing_mode = ${filters.pricing}
  )`);
  if (cursor) conditions.push(sql<boolean>`(${professionalProfiles.updatedAt}, ${professionalProfiles.id}) < (${cursor.updated}, ${cursor.id}::uuid)`);

  const priceOrder = sql<number>`coalesce((select min(s.price_amount) from ${services} s where s.profile_id = ${professionalProfiles.id} and s.price_amount is not null), 2147483647)`;
  const ratingOrder = sql<number>`coalesce((select avg(r.rating) from ${reviews} r where r.profile_id = ${professionalProfiles.id} and r.status = 'published'), 0)`;
  const ordering = filters.sort === "price"
    ? [asc(priceOrder), desc(professionalProfiles.updatedAt), desc(professionalProfiles.id)]
    : filters.sort === "rating"
      ? [desc(ratingOrder), desc(professionalProfiles.updatedAt), desc(professionalProfiles.id)]
      : [desc(professionalProfiles.updatedAt), desc(professionalProfiles.id)];

  const rows = await db.select().from(professionalProfiles)
    .where(and(...conditions))
    .orderBy(...ordering)
    .limit(limit + 1);
  const page = rows.slice(0, limit);
  const hydrated = await hydrateProfiles(page);
  const totalRows = await db.select({ count: sql<number>`count(*)::int` }).from(professionalProfiles).where(and(...conditions.filter((_, index) => index !== conditions.length - 1 || !cursor)));
  const last = page.at(-1);
  return {
    data: hydrated,
    nextCursor: rows.length > limit && last ? encodeCursor(last.updatedAt, last.id) : null,
    total: totalRows[0]?.count ?? hydrated.length,
    source: "database" as const,
  };
}

async function hydrateProfiles(profileRows: (typeof professionalProfiles.$inferSelect)[]): Promise<ServiceProfile[]> {
  if (!profileRows.length) return [];
  const db = getDb();
  const ids = profileRows.map((profile) => profile.id);
  const [serviceRows, zoneRows, reviewRows] = await Promise.all([
    db.select({ service: services, categoryId: serviceCategories.categoryId, categoryName: categories.name })
      .from(services)
      .leftJoin(serviceCategories, eq(serviceCategories.serviceId, services.id))
      .leftJoin(categories, eq(categories.id, serviceCategories.categoryId))
      .where(and(inArray(services.profileId, ids), eq(services.published, true))),
    db.select({ profileId: profileZones.profileId, zoneName: zones.name })
      .from(profileZones).innerJoin(zones, eq(zones.id, profileZones.zoneId)).where(inArray(profileZones.profileId, ids)),
    db.select({ profileId: reviews.profileId, rating: sql<number>`coalesce(avg(${reviews.rating}), 0)::float`, count: sql<number>`count(*)::int` })
      .from(reviews).where(and(inArray(reviews.profileId, ids), eq(reviews.status, "published"))).groupBy(reviews.profileId),
  ]);

  return profileRows.map((profile) => {
    const profileServices = serviceRows.filter((row) => row.service.profileId === profile.id);
    const first = profileServices[0]?.service;
    const categoryIds = [...new Set(profileServices.flatMap((row) => row.categoryId ? [row.categoryId] : []))];
    const skills = [...new Set(profileServices.flatMap((row) => [row.service.title, ...(row.categoryName ? [row.categoryName] : [])]))];
    const score = reviewRows.find((row) => row.profileId === profile.id);
    const initials = profile.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const tone = tones.has(profile.accentColor) ? profile.accentColor as ServiceProfile["avatarTone"] : "forest";
    return {
      id: profile.id,
      slug: profile.slug,
      name: profile.displayName,
      initials,
      trade: profile.headline,
      categoryId: categoryIds[0] ?? "otro",
      categories: categoryIds,
      customService: first?.customService ?? "",
      description: profile.bio,
      experienceYears: profile.experienceYears,
      zones: zoneRows.filter((row) => row.profileId === profile.id).map((row) => row.zoneName),
      serviceMode: profile.serviceMode,
      pricingMode: first?.pricingMode ?? "quote",
      priceAmount: first?.priceAmount ?? null,
      generalAvailability: ["coordinate"],
      whatsapp: "",
      phonePreview: profile.phonePreview ?? "Número protegido",
      rating: score?.rating ?? 0,
      reviews: score?.count ?? 0,
      responseTime: "Contacto directo por WhatsApp",
      skills,
      avatarTone: tone,
      featured: profile.viewsCount > 10,
      isDemo: profile.isDemo,
    };
  });
}

export async function getProfessionalBySlug(slug: string) {
  if (!hasDatabase()) return findProfessional(slug) ?? null;
  const db = getDb();
  const rows = await db.select().from(professionalProfiles).where(and(eq(professionalProfiles.slug, slug), eq(professionalProfiles.status, "published"))).limit(1);
  return (await hydrateProfiles(rows))[0] ?? null;
}

export async function getPublicProfile(slug: string): Promise<PublicProfessionalProfile | null> {
  const card = await getProfessionalBySlug(slug);
  if (!card) return null;
  if (!hasDatabase()) {
    return {
      id: card.id, slug: card.slug, displayName: card.name, headline: card.trade, bio: card.description,
      experienceYears: card.experienceYears, zones: card.zones, serviceMode: card.serviceMode,
      phonePreview: card.phonePreview, accentColor: card.avatarTone, rating: card.rating, reviewCount: card.reviews,
      isDemo: card.isDemo, portfolio: [], services: [{ id: `${card.id}-service`, slug: card.customService ? card.customService.toLowerCase().replace(/\s+/g, "-") : card.categoryId, title: card.customService || card.trade, description: card.description, categories: card.categories, customService: card.customService || null, pricingMode: card.pricingMode, priceAmount: card.priceAmount }],
    };
  }
  const db = getDb();
  const [serviceRows,portfolioRows] = await Promise.all([db.select().from(services).where(and(eq(services.profileId, card.id), eq(services.published, true))),db.select().from(portfolioItems).where(eq(portfolioItems.profileId,card.id)).orderBy(portfolioItems.sortOrder)]);
  const listings: ServiceListing[] = await Promise.all(serviceRows.map(async (service) => {
    const cats = await db.select({ id: serviceCategories.categoryId }).from(serviceCategories).where(eq(serviceCategories.serviceId, service.id));
    return { id: service.id, slug: service.slug, title: service.title, description: service.description, categories: cats.map((entry) => entry.id), customService: service.customService, pricingMode: service.pricingMode, priceAmount: service.priceAmount };
  }));
  return {
    id: card.id, slug: card.slug, displayName: card.name, headline: card.trade, bio: card.description,
    experienceYears: card.experienceYears, zones: card.zones, serviceMode: card.serviceMode,
    phonePreview: card.phonePreview, accentColor: card.avatarTone, rating: card.rating || null, reviewCount: card.reviews,
    isDemo: card.isDemo, portfolio: portfolioRows.map((item)=>({id:item.id,url:`/media/${item.id}`,alt:item.alt,width:item.width,height:item.height})), services: listings,
  };
}

export async function getServiceBySlug(profileSlug: string, serviceSlug: string) {
  const profile = await getPublicProfile(profileSlug);
  if (!profile) return null;
  const service = profile.services.find((entry) => entry.slug === serviceSlug);
  return service ? { profile, service } : null;
}

export async function getServiceByListingSlug(serviceSlug:string){if(!hasDatabase()){for(const professional of mockProfessionals){const profile=await getPublicProfile(professional.slug);const service=profile?.services.find((entry)=>entry.slug===serviceSlug);if(profile&&service)return{profile,service};}return null;}const db=getDb();const rows=await db.select({serviceSlug:services.slug,profileSlug:professionalProfiles.slug}).from(services).innerJoin(professionalProfiles,eq(professionalProfiles.id,services.profileId)).where(and(eq(services.slug,serviceSlug),eq(services.published,true),eq(professionalProfiles.status,"published"))).limit(1);return rows[0]?getServiceBySlug(rows[0].profileSlug,rows[0].serviceSlug):null;}

export function allMockProfessionals() {
  return mockProfessionals;
}
