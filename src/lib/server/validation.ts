import { z } from "zod";

export const profileInputSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.email(),
  whatsapp: z.string().trim().min(8).max(30),
  categories: z.array(z.string().trim().min(1).max(60)).max(8),
  customService: z.string().trim().max(80).default(""),
  experienceYears: z.coerce.number().int().min(0).max(70),
  bio: z.string().trim().min(40).max(1200),
  zones: z.array(z.string().trim().min(2).max(60)).min(1).max(8),
  serviceMode: z.enum(["domicilio", "taller", "ambos"]),
  pricingMode: z.enum(["from", "hourly", "fixed", "quote"]),
  priceAmount: z.number().int().positive().max(100_000_000).nullable(),
  generalAvailability: z.array(z.enum(["weekdays", "weekends", "emergencies", "coordinate"])).min(1),
  acceptedTerms: z.literal(true),
}).superRefine((value, context) => {
  if (!value.categories.length && value.customService.length < 3) context.addIssue({ code: "custom", path: ["customService"], message: "Elegí una categoría o contanos qué hacés." });
  if (value.pricingMode !== "quote" && value.priceAmount === null) context.addIssue({ code: "custom", path: ["priceAmount"], message: "Indicá un precio orientativo." });
});

export const serviceInputSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(30).max(1000),
  categories: z.array(z.string().trim().min(1).max(60)).max(8),
  customService: z.string().trim().max(80).nullable().optional(),
  pricingMode: z.enum(["from", "hourly", "fixed", "quote"]),
  priceAmount: z.number().int().positive().max(100_000_000).nullable(),
  published: z.boolean().default(true),
}).superRefine((value, context) => {
  if (!value.categories.length && !value.customService?.trim()) context.addIssue({ code: "custom", path: ["categories"], message: "Elegí una categoría o usá un servicio personalizado." });
  if (value.pricingMode !== "quote" && value.priceAmount === null) context.addIssue({ code: "custom", path: ["priceAmount"], message: "Indicá el precio." });
});

export function normalizeWhatsapp(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `549${digits}`;
  if (!/^\d{11,15}$/.test(digits)) throw new Error("INVALID_PHONE");
  return digits;
}
