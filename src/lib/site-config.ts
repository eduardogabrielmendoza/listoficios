import { z } from "zod";

const internalHref = z.string().trim().max(200).refine((value) => !value || value.startsWith("/"), "Usá una ruta interna que comience con /");
const externalHref = z.string().trim().max(300).refine((value) => !value || /^https:\/\//.test(value), "Usá una URL https://");
const nullableId = z.uuid().nullable();

export const siteConfigSchema = z.object({
  schemaVersion: z.literal(1),
  brand: z.object({
    name: z.string().trim().min(2).max(40),
    shortName: z.string().trim().min(2).max(20),
    description: z.string().trim().min(20).max(180),
    logoAssetId: nullableId,
    compactLogoAssetId: nullableId,
    faviconAssetId: nullableId,
    pwaAssetId: nullableId,
    openGraphAssetId: nullableId,
  }),
  theme: z.object({
    preset: z.enum(["forest", "ocean", "graphite"]),
    brand: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    ink: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  home: z.object({
    eyebrow: z.string().trim().min(3).max(60),
    title: z.string().trim().min(10).max(90),
    highlight: z.string().trim().min(2).max(45),
    description: z.string().trim().min(30).max(240),
    primaryCtaLabel: z.string().trim().min(2).max(40),
    primaryCtaHref: internalHref,
    professionalCtaLabel: z.string().trim().min(2).max(40),
    professionalCtaHref: internalHref,
    featuredProfileSlug: z.string().trim().max(120),
    heroAssetId: nullableId,
    trustTitle: z.string().trim().min(5).max(90),
    trustDescription: z.string().trim().min(20).max(220),
    finalCtaTitle: z.string().trim().min(5).max(90),
    finalCtaDescription: z.string().trim().min(20).max(200),
  }),
  footer: z.object({
    tagline: z.string().trim().min(2).max(100),
    contactEmail: z.union([z.literal(""), z.email()]),
    instagramUrl: externalHref,
    facebookUrl: externalHref,
  }),
  announcement: z.object({
    enabled: z.boolean(),
    text: z.string().trim().max(140),
    href: internalHref,
  }),
  seo: z.object({
    title: z.string().trim().min(10).max(70),
    description: z.string().trim().min(30).max(170),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const defaultSiteConfig: SiteConfig = {
  schemaVersion: 1,
  brand: {
    name: "Listoficios",
    shortName: "Listoficios",
    description: "Servicios y profesionales de Bella Vista, Tucumán.",
    logoAssetId: null,
    compactLogoAssetId: null,
    faviconAssetId: null,
    pwaAssetId: null,
    openGraphAssetId: null,
  },
  theme: { preset: "forest", brand: "#18715f", ink: "#102f29", accent: "#bff16f" },
  home: {
    eyebrow: "Hecho para Bella Vista",
    title: "Encontrá a alguien de confianza",
    highlight: "cerca tuyo.",
    description: "Buscá un servicio, compará perfiles y hablá directamente por WhatsApp. Fácil, local y sin registrarte.",
    primaryCtaLabel: "Buscar profesionales",
    primaryCtaHref: "/profesionales",
    professionalCtaLabel: "Publicar mi servicio",
    professionalCtaHref: "/profesionales/crear-perfil",
    featuredProfileSlug: "",
    heroAssetId: null,
    trustTitle: "Más claridad antes de llamar.",
    trustDescription: "Listoficios organiza la información para ayudarte a elegir.",
    finalCtaTitle: "Tu próximo cliente puede estar a pocas cuadras.",
    finalCtaDescription: "Publicá lo que hacés y dejá que Bella Vista te encuentre.",
  },
  footer: { tagline: "Hecho en Tucumán.", contactEmail: "", instagramUrl: "", facebookUrl: "" },
  announcement: { enabled: false, text: "", href: "" },
  seo: {
    title: "Listoficios | Profesionales en Bella Vista",
    description: "Encontrá profesionales y servicios en Bella Vista, Tucumán.",
  },
};
