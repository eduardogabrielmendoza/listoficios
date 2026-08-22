import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, professionalProfiles, profileZones, serviceCategories, services, zones } from "@/db/schema";
import type { z } from "zod";
import { createSlug } from "@/lib/slug";
import { decryptContact, encryptContact, maskPhone } from "@/lib/server/crypto";
import { normalizeWhatsapp, profileInputSchema, serviceInputSchema } from "@/lib/server/validation";

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;

export async function getOwnProfile(userId: string) {
  const db = getDb();
  const profiles = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1);
  const profile = profiles[0];
  if (!profile) return null;
  const [serviceRows, zoneRows] = await Promise.all([
    db.select().from(services).where(eq(services.profileId, profile.id)),
    db.select({ id: zones.id, name: zones.name }).from(profileZones).innerJoin(zones, eq(zones.id, profileZones.zoneId)).where(eq(profileZones.profileId, profile.id)),
  ]);
  return { profile, services: serviceRows, zones: zoneRows };
}

export async function getOwnProfileEditor(userId:string,email:string){const data=await getOwnProfile(userId);if(!data)return null;const db=getDb();const service=data.services[0];const categoryRows=service?await db.select({id:serviceCategories.categoryId}).from(serviceCategories).where(eq(serviceCategories.serviceId,service.id)):[];const nameParts=data.profile.displayName.trim().split(/\s+/);const firstName=nameParts.shift()??data.profile.displayName;const lastName=nameParts.join(" ")||"Profesional";let whatsapp="";if(data.profile.phoneCiphertext&&data.profile.phoneIv){try{whatsapp=decryptContact(data.profile.phoneCiphertext,data.profile.phoneIv);}catch{whatsapp="";}}return{firstName,lastName,email,whatsapp,categories:categoryRows.map((entry)=>entry.id),customService:service?.customService??"",experienceYears:data.profile.experienceYears,bio:data.profile.bio,zones:data.zones.map((zone)=>zone.name),serviceMode:data.profile.serviceMode,pricingMode:service?.pricingMode??"quote",priceAmount:service?.priceAmount??null,generalAvailability:["coordinate"],preferredContact:"whatsapp",publicationStatus:data.profile.status,acceptedTerms:true,completed:true};}

export async function saveOwnProfile(userId: string, input: ProfileInput) {
  const db = getDb();
  const phone = normalizeWhatsapp(input.whatsapp);
  const encrypted = encryptContact(phone);
  return db.transaction(async (tx) => {
    const existingRows = await tx.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1);
    const existing = existingRows[0];
    const baseSlug = createSlug(`${input.firstName}-${input.lastName}-${input.customService || input.categories[0] || "profesional"}`);
    const values = {
      displayName: `${input.firstName} ${input.lastName}`.trim(),
      headline: input.customService || "Profesional de Bella Vista",
      bio: input.bio,
      experienceYears: input.experienceYears,
      phoneCiphertext: encrypted.ciphertext,
      phoneIv: encrypted.iv,
      phonePreview: maskPhone(phone),
      serviceMode: input.serviceMode,
      status: "published" as const,
      updatedAt: new Date(),
    };
    const profile = existing
      ? (await tx.update(professionalProfiles).set(values).where(eq(professionalProfiles.id, existing.id)).returning())[0]
      : (await tx.insert(professionalProfiles).values({ ...values, userId, slug: `${baseSlug}-${userId.slice(0, 6).toLowerCase()}` }).returning())[0];

    const validZones = await tx.select({ id: zones.id, name: zones.name }).from(zones).where(inArray(zones.name, input.zones));
    await tx.delete(profileZones).where(eq(profileZones.profileId, profile.id));
    if (validZones.length) await tx.insert(profileZones).values(validZones.map((zone) => ({ profileId: profile.id, zoneId: zone.id })));

    const currentServices = await tx.select().from(services).where(eq(services.profileId, profile.id)).limit(1);
    const categoryRows = input.categories.length ? await tx.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, input.categories)) : [];
    const title = input.customService || categoryRows[0]?.name || "Servicio profesional";
    const serviceValues = { title, description: input.bio, customService: input.customService || null, pricingMode: input.pricingMode, priceAmount: input.pricingMode === "quote" ? null : input.priceAmount, published: true, updatedAt: new Date() };
    const service = currentServices[0]
      ? (await tx.update(services).set(serviceValues).where(eq(services.id, currentServices[0].id)).returning())[0]
      : (await tx.insert(services).values({ ...serviceValues, profileId: profile.id, slug: createSlug(title) }).returning())[0];
    await tx.delete(serviceCategories).where(eq(serviceCategories.serviceId, service.id));
    if (categoryRows.length) await tx.insert(serviceCategories).values(categoryRows.map((category) => ({ serviceId: service.id, categoryId: category.id })));
    return { profileId: profile.id, slug: profile.slug, serviceId: service.id, status: profile.status };
  });
}

export async function saveService(userId: string, input: ServiceInput) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const profiles = await tx.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1);
    const profile = profiles[0];
    if (!profile) throw new Error("PROFILE_REQUIRED");
    const existingServices = await tx.select().from(services).where(eq(services.profileId, profile.id));
    const owned = input.id ? existingServices.find((service) => service.id === input.id) : null;
    if (input.id && !owned) throw new Error("NOT_FOUND");
    if (!input.id && existingServices.length >= 8) throw new Error("SERVICE_LIMIT");
    const slugBase = createSlug(input.title);
    const values = { title: input.title, description: input.description, customService: input.customService || null, pricingMode: input.pricingMode, priceAmount: input.pricingMode === "quote" ? null : input.priceAmount, published: input.published, updatedAt: new Date() };
    const service = owned
      ? (await tx.update(services).set(values).where(and(eq(services.id, owned.id), eq(services.profileId, profile.id))).returning())[0]
      : (await tx.insert(services).values({ ...values, profileId: profile.id, slug: existingServices.some((item) => item.slug === slugBase) ? `${slugBase}-${existingServices.length + 1}` : slugBase }).returning())[0];
    const validCategories = input.categories.length ? await tx.select({ id: categories.id }).from(categories).where(inArray(categories.id, input.categories)) : [];
    await tx.delete(serviceCategories).where(eq(serviceCategories.serviceId, service.id));
    if (validCategories.length) await tx.insert(serviceCategories).values(validCategories.map((category) => ({ serviceId: service.id, categoryId: category.id })));
    return service;
  });
}

export async function deleteService(userId: string, serviceId: string) {
  const db = getDb();
  const owned = await db.select({ id: services.id }).from(services).innerJoin(professionalProfiles, eq(professionalProfiles.id, services.profileId)).where(and(eq(services.id, serviceId), eq(professionalProfiles.userId, userId))).limit(1);
  if (!owned.length) return false;
  await db.delete(services).where(eq(services.id, serviceId));
  return true;
}

export async function setProfileStatus(userId:string,status:"published"|"paused"){const [profile]=await getDb().update(professionalProfiles).set({status,updatedAt:new Date()}).where(and(eq(professionalProfiles.userId,userId),eq(professionalProfiles.isDemo,false))).returning({id:professionalProfiles.id,status:professionalProfiles.status});if(!profile)throw new Error("NOT_FOUND");return profile;}
