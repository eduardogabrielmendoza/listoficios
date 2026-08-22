import type { PricingMode, ServiceProfile } from "@/lib/app-types";

export type Category = { id: string; name: string; description: string; icon: "droplet" | "bolt" | "flame" | "paint" | "hammer" | "brick" | "leaf" | "snowflake"; tone: "aqua" | "yellow" | "orange" | "violet" | "rose" | "clay" | "green" | "blue"; available: number };
export const categories: Category[] = [
  { id: "plomeria", name: "Plomería", description: "Pérdidas, instalaciones y urgencias", icon: "droplet", tone: "aqua", available: 18 },
  { id: "electricidad", name: "Electricidad", description: "Instalaciones y reparaciones", icon: "bolt", tone: "yellow", available: 14 },
  { id: "gas", name: "Gasistas", description: "Conexión y mantenimiento", icon: "flame", tone: "orange", available: 8 },
  { id: "pintura", name: "Pintura", description: "Interiores y exteriores", icon: "paint", tone: "violet", available: 21 },
  { id: "carpinteria", name: "Carpintería", description: "Muebles y aberturas", icon: "hammer", tone: "rose", available: 11 },
  { id: "albanileria", name: "Albañilería", description: "Obras y reformas", icon: "brick", tone: "clay", available: 23 },
  { id: "jardineria", name: "Jardinería", description: "Poda y cuidado", icon: "leaf", tone: "green", available: 16 },
  { id: "refrigeracion", name: "Refrigeración", description: "Aires y heladeras", icon: "snowflake", tone: "blue", available: 10 },
];

export const professionals: ServiceProfile[] = [
  { id: "diego-sosa", slug: "diego-sosa-electricista", name: "Diego Sosa", initials: "DS", trade: "Electricista", categoryId: "electricidad", categories: ["electricidad"], customService: "Tableros e instalaciones domiciliarias", description: "Electricista con experiencia en instalaciones, tableros y reparaciones del hogar. Trabajo prolijo y presupuesto claro antes de comenzar.", experienceYears: 9, zones: ["Centro", "Los Pinos", "Villa Nueva"], serviceMode: "domicilio", pricingMode: "from", priceAmount: 12500, generalAvailability: ["weekdays", "emergencies"], whatsapp: "3815550101", phonePreview: "381 5•• ••01", rating: 4.9, reviews: 47, responseTime: "Suele responder en 15 min", skills: ["Instalaciones", "Tableros", "Urgencias"], avatarTone: "forest", featured: true, isDemo: true },
  { id: "mariana-ruiz", slug: "mariana-ruiz-pintora", name: "Mariana Ruiz", initials: "MR", trade: "Pintora y decoradora", categoryId: "pintura", categories: ["pintura"], customService: "", description: "Pintura de interiores y exteriores, tratamiento de humedad y terminaciones decorativas para hogares y comercios.", experienceYears: 7, zones: ["Los Pinos", "Centro", "Santa Rita"], serviceMode: "domicilio", pricingMode: "fixed", priceAmount: 18000, generalAvailability: ["weekdays", "weekends"], whatsapp: "3815550102", phonePreview: "381 5•• ••02", rating: 5, reviews: 32, responseTime: "Suele responder en 30 min", skills: ["Interiores", "Texturados", "Humedad"], avatarTone: "sunset", featured: true, isDemo: true },
  { id: "carlos-farias", slug: "carlos-farias-plomero", name: "Carlos Farías", initials: "CF", trade: "Plomero integral", categoryId: "plomeria", categories: ["plomeria"], customService: "", description: "Soluciones de plomería para pérdidas, baños, cocinas y termotanques. Atención en distintos barrios de Bella Vista.", experienceYears: 12, zones: ["Villa Nueva", "Centro", "San Ramón"], serviceMode: "domicilio", pricingMode: "hourly", priceAmount: 10500, generalAvailability: ["weekdays", "emergencies"], whatsapp: "3815550103", phonePreview: "381 5•• ••03", rating: 4.8, reviews: 61, responseTime: "Suele responder en 20 min", skills: ["Pérdidas", "Termotanques", "Baños"], avatarTone: "ocean", featured: false, isDemo: true },
  { id: "lucas-molina", slug: "lucas-molina-carpintero", name: "Lucas Molina", initials: "LM", trade: "Carpintero", categoryId: "carpinteria", categories: ["carpinteria"], customService: "Restauración de muebles antiguos", description: "Diseño, fabricación y restauración de muebles. Trabajos a medida con visita previa para conversar la idea y los materiales.", experienceYears: 11, zones: ["El Mollar", "Alrededores", "Centro"], serviceMode: "ambos", pricingMode: "quote", priceAmount: null, generalAvailability: ["coordinate"], whatsapp: "3815550104", phonePreview: "381 5•• ••04", rating: 4.9, reviews: 28, responseTime: "Suele responder en 1 hora", skills: ["Muebles", "Aberturas", "Restauración"], avatarTone: "plum", featured: false, isDemo: true },
  { id: "sofia-medina", slug: "sofia-medina-jardineria", name: "Sofía Medina", initials: "SM", trade: "Jardinería y poda", categoryId: "jardineria", categories: ["jardineria"], customService: "Huertas familiares", description: "Mantenimiento de jardines, poda responsable y armado de huertas para patios pequeños.", experienceYears: 5, zones: ["La Esperanza", "Santa Rita", "Centro"], serviceMode: "domicilio", pricingMode: "from", priceAmount: 8000, generalAvailability: ["weekdays", "weekends"], whatsapp: "3815550105", phonePreview: "381 5•• ••05", rating: 4.7, reviews: 19, responseTime: "Suele responder en el día", skills: ["Poda", "Mantenimiento", "Huertas"], avatarTone: "forest", featured: true, isDemo: true },
  { id: "martin-rojas", slug: "martin-rojas-refrigeracion", name: "Martín Rojas", initials: "MR", trade: "Técnico en refrigeración", categoryId: "refrigeracion", categories: ["refrigeracion", "electricidad"], customService: "", description: "Instalación y mantenimiento de aires acondicionados y diagnóstico de heladeras familiares.", experienceYears: 8, zones: ["Centro", "Villa Nueva", "Alrededores"], serviceMode: "domicilio", pricingMode: "from", priceAmount: 15000, generalAvailability: ["weekdays", "emergencies"], whatsapp: "3815550106", phonePreview: "381 5•• ••06", rating: 4.8, reviews: 36, responseTime: "Suele responder en 40 min", skills: ["Aires", "Heladeras", "Instalación"], avatarTone: "ocean", featured: false, isDemo: true },
];

export type ProfessionalFilters = { query?: string; category?: string; zone?: string; pricing?: PricingMode | ""; sort?: "relevance" | "rating" | "price" };
export function searchProfessionals(filters: ProfessionalFilters | string = {}, categoryId?: string) {
  const f: ProfessionalFilters = typeof filters === "string" ? { query: filters, category: categoryId } : filters;
  const query = (f.query ?? "").trim().toLocaleLowerCase("es-AR");
  const list = professionals.filter((p) => {
    const text = [p.name, p.trade, p.customService, p.description, ...p.skills, ...p.zones].join(" ").toLocaleLowerCase("es-AR");
    return (!query || text.includes(query)) && (!f.category || p.categories.includes(f.category)) && (!f.zone || p.zones.includes(f.zone)) && (!f.pricing || p.pricingMode === f.pricing);
  });
  if (f.sort === "rating") return list.sort((a, b) => b.rating - a.rating);
  if (f.sort === "price") return list.sort((a, b) => (a.priceAmount ?? Number.MAX_SAFE_INTEGER) - (b.priceAmount ?? Number.MAX_SAFE_INTEGER));
  return list.sort((a, b) => Number(b.featured) - Number(a.featured));
}
export function findProfessional(slugOrId: string) { return professionals.find((p) => p.slug === slugOrId || p.id === slugOrId); }
export const pricingLabels: Record<PricingMode, string> = { from: "Desde", hourly: "Por hora", fixed: "Precio fijo", quote: "A convenir" };
export function formatPrice(mode: PricingMode, amount: number | null) { if (mode === "quote" || amount === null) return "A convenir"; return `${pricingLabels[mode]} $${amount.toLocaleString("es-AR")}`; }
