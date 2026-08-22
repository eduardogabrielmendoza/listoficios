import { and, desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db";
import { contactEvents, favorites, professionalProfiles, services } from "@/db/schema";
import { getProfessionalBySlug } from "@/data/professionals";
import { findProfessional } from "@/lib/mock-data";
import { decryptContact } from "@/lib/server/crypto";

export async function setFavorite(userId: string, profileId: string, enabled: boolean) {
  const db = getDb();
  const profile = await db.select({ id: professionalProfiles.id }).from(professionalProfiles).where(eq(professionalProfiles.id, profileId)).limit(1);
  if (!profile.length) throw new Error("NOT_FOUND");
  if (enabled) await db.insert(favorites).values({ userId, profileId }).onConflictDoNothing();
  else await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.profileId, profileId)));
  return { favorite: enabled };
}

export async function listFavorites(userId: string) {
  const db = getDb();
  const rows = await db.select({ profileId: favorites.profileId, slug: professionalProfiles.slug, createdAt: favorites.createdAt })
    .from(favorites).innerJoin(professionalProfiles, eq(professionalProfiles.id, favorites.profileId))
    .where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  const profiles = await Promise.all(rows.map(async (row) => ({ createdAt: row.createdAt, profile: await getProfessionalBySlug(row.slug) })));
  return profiles.filter((entry) => entry.profile !== null);
}

export async function createContact(input: { profileId: string; serviceId?: string; channel: "whatsapp" | "phone"; userId?: string; visitorHash: string }) {
  if (!hasDatabase()) {
    const demo = findProfessional(input.profileId);
    if (!demo) throw new Error("NOT_FOUND");
    return { channel: input.channel, phonePreview: demo.phonePreview, url: null, message: `Hola, vi tu perfil en Listoficios y quería consultarte por ${demo.trade.toLowerCase()}.`, demo: true };
  }
  const db = getDb();
  const rows = await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, input.profileId)).limit(1);
  const profile = rows[0];
  if (!profile || profile.status !== "published" || !profile.phoneCiphertext || !profile.phoneIv) throw new Error("NOT_FOUND");
  let serviceTitle = profile.headline;
  if (input.serviceId) {
    const serviceRows = await db.select().from(services).where(and(eq(services.id, input.serviceId), eq(services.profileId, profile.id))).limit(1);
    if (!serviceRows.length) throw new Error("NOT_FOUND");
    serviceTitle = serviceRows[0].title;
  }
  await db.insert(contactEvents).values({ userId: input.userId, profileId: profile.id, serviceId: input.serviceId, channel: input.channel, visitorHash: input.visitorHash });
  const message = `Hola, vi tu perfil en Listoficios y quería consultarte por ${serviceTitle}.`;
  if(profile.isDemo)return{channel:input.channel,phonePreview:profile.phonePreview,url:null,message,demo:true};
  const phone = decryptContact(profile.phoneCiphertext, profile.phoneIv);
  const url = input.channel === "whatsapp" ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `tel:+${phone}`;
  return { channel: input.channel, phonePreview: profile.phonePreview, url, message, demo: false };
}
