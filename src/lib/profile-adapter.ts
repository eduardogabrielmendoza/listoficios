import type { ProfessionalProfileDraft, ServiceProfile } from "@/lib/app-types";

export function draftToServiceProfile(draft: ProfessionalProfileDraft): ServiceProfile {
  const name = `${draft.firstName} ${draft.lastName}`.trim() || "Profesional local";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return {
    id: "local-profile", slug: "mi-servicio", name, initials,
    trade: draft.customService || "Servicio profesional", categoryId: draft.categories[0] || "otro",
    categories: draft.categories, customService: draft.customService, description: draft.bio,
    experienceYears: draft.experienceYears, zones: draft.zones, serviceMode: draft.serviceMode,
    pricingMode: draft.pricingMode, priceAmount: draft.priceAmount,
    generalAvailability: draft.generalAvailability, whatsapp: draft.whatsapp,
    phonePreview: draft.whatsapp ? `${draft.whatsapp.slice(0, 4)} ••• ••${draft.whatsapp.slice(-2)}` : "No informado",
    rating: 0, reviews: 0, responseTime: "Contacto directo", skills: draft.customService ? [draft.customService] : ["Servicio local"],
    avatarTone: "forest", featured: false, isDemo: true,
  };
}
