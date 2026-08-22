export type PricingMode = "from" | "hourly" | "fixed" | "quote";
export type GeneralAvailability = "weekdays" | "weekends" | "emergencies" | "coordinate";
export type ServiceMode = "domicilio" | "taller" | "ambos";
export type PublicationStatus = "draft" | "published" | "paused";
export type ProfessionalProfileDraft = { firstName: string; lastName: string; email: string; whatsapp: string; categories: string[]; customService: string; experienceYears: number; bio: string; zones: string[]; serviceMode: ServiceMode; pricingMode: PricingMode; priceAmount: number | null; generalAvailability: GeneralAvailability[]; preferredContact: "whatsapp" | "phone" | "both"; publicationStatus: PublicationStatus; acceptedTerms: boolean; completed: boolean };
export type AuthCredentials = { email: string; password: string };
export type ServiceProfile = { id: string; slug: string; name: string; initials: string; trade: string; categoryId: string; categories: string[]; customService: string; description: string; experienceYears: number; zones: string[]; serviceMode: ServiceMode; pricingMode: PricingMode; priceAmount: number | null; generalAvailability: GeneralAvailability[]; whatsapp: string; phonePreview: string; rating: number; reviews: number; responseTime: string; skills: string[]; avatarTone: "forest" | "ocean" | "sunset" | "plum"; featured: boolean; isDemo: boolean };
