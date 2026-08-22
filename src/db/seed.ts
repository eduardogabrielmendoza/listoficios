import { eq } from "drizzle-orm";
import { getDb, closeDb } from "./index";
import {
  categories as categoryTable,
  professionalProfiles,
  profileZones,
  serviceCategories,
  services,
  zones as zoneTable,
} from "./schema";
import { categories, professionals } from "../lib/mock-data";
import { createSlug } from "../lib/slug";
import { encryptContact, maskPhone } from "../lib/server/crypto";

const zoneNames = ["Centro", "Los Pinos", "Villa Nueva", "El Mollar", "San Ramón", "Santa Rita", "La Esperanza", "Alrededores"];

async function seedCatalogs() {
  const db = getDb();
  await db.insert(categoryTable).values(categories.map((category, index) => ({
    id: category.id,
    slug: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    sortOrder: index,
  }))).onConflictDoNothing();

  await db.insert(zoneTable).values(zoneNames.map((name, index) => ({
    id: createSlug(name),
    slug: createSlug(name),
    name,
    description: `Profesionales que trabajan en ${name}, Bella Vista.`,
    sortOrder: index,
  }))).onConflictDoNothing();
}

async function seedProfessionals() {
  const db = getDb();
  for (const [index, professional] of professionals.entries()) {
    const existing = await db.select({ id: professionalProfiles.id }).from(professionalProfiles).where(eq(professionalProfiles.slug, professional.slug)).limit(1);
    if (existing.length) continue;

    const demoPhone = `54938100000${String(index + 1).padStart(2, "0")}`;
    const encrypted = encryptContact(demoPhone);
    const [profile] = await db.insert(professionalProfiles).values({
      slug: professional.slug,
      displayName: professional.name,
      headline: professional.trade,
      bio: professional.description,
      experienceYears: professional.experienceYears,
      phoneCiphertext: encrypted.ciphertext,
      phoneIv: encrypted.iv,
      phonePreview: maskPhone(demoPhone),
      accentColor: professional.avatarTone,
      serviceMode: professional.serviceMode,
      status: "published",
      isDemo: true,
    }).returning({ id: professionalProfiles.id });

    await db.insert(profileZones).values(professional.zones.map((name) => ({
      profileId: profile.id,
      zoneId: createSlug(name),
    }))).onConflictDoNothing();

    const [service] = await db.insert(services).values({
      profileId: profile.id,
      slug: createSlug(professional.customService || professional.trade),
      title: professional.customService || professional.trade,
      description: professional.description,
      customService: professional.customService || null,
      pricingMode: professional.pricingMode,
      priceAmount: professional.priceAmount,
    }).returning({ id: services.id });

    await db.insert(serviceCategories).values(professional.categories.map((categoryId) => ({
      serviceId: service.id,
      categoryId,
    }))).onConflictDoNothing();
  }
}

async function main() {
  await seedCatalogs();
  await seedProfessionals();
  console.info("Catálogos y perfiles demo cargados correctamente");
  await closeDb();
}

main().catch(async (error) => {
  console.error("No se pudo cargar el seed", error);
  await closeDb();
  process.exitCode = 1;
});
