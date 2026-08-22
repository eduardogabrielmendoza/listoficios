import { z } from "zod";
export const pricingModeSchema = z.enum(["from", "hourly", "fixed", "quote"]);
export const availabilitySchema = z.enum(["weekdays", "weekends", "emergencies", "coordinate"]);
export const professionalDraftSchema = z.object({ firstName: z.string(), lastName: z.string(), email: z.string(), whatsapp: z.string(), categories: z.array(z.string()), customService: z.string(), experienceYears: z.number(), bio: z.string(), zones: z.array(z.string()), serviceMode: z.enum(["domicilio", "taller", "ambos"]), pricingMode: pricingModeSchema, priceAmount: z.number().nullable(), generalAvailability: z.array(availabilitySchema), preferredContact: z.enum(["whatsapp", "phone", "both"]), publicationStatus: z.enum(["draft", "published", "paused"]), acceptedTerms: z.boolean(), completed: z.boolean() });
export const profileStepSchemas = [
  z.object({ firstName: z.string().trim().min(2, "Ingresá tu nombre"), lastName: z.string().trim().min(2, "Ingresá tu apellido"), email: z.email("Ingresá un correo válido"), whatsapp: z.string().trim().min(8, "Ingresá un WhatsApp válido") }),
  z.object({ categories: z.array(z.string()), customService: z.string().trim().max(80), experienceYears: z.coerce.number().min(0).max(70), bio: z.string().trim().min(40, "Contanos un poco más: mínimo 40 caracteres").max(500) }).refine((d) => d.categories.length > 0 || d.customService.trim().length >= 3, { message: "Elegí una categoría o contanos qué hacés", path: ["customService"] }),
  z.object({ zones: z.array(z.string()).min(1, "Elegí al menos una zona"), serviceMode: z.enum(["domicilio", "taller", "ambos"]) }),
  z.object({ pricingMode: pricingModeSchema, priceAmount: z.number().nullable(), generalAvailability: z.array(availabilitySchema).min(1, "Elegí al menos una opción"), preferredContact: z.enum(["whatsapp", "phone", "both"]) }).refine((d) => d.pricingMode === "quote" || (d.priceAmount !== null && d.priceAmount >= 1), { message: "Ingresá un importe válido", path: ["priceAmount"] }),
  z.object({ acceptedTerms: z.literal(true, { message: "Debés aceptar los términos para continuar" }) }),
];
export const helpFormSchema = z.object({ name: z.string().trim().min(2, "Ingresá tu nombre"), email: z.email("Ingresá un correo válido"), role: z.enum(["cliente", "profesional", "otro"]), topic: z.string().min(1, "Elegí un tema"), message: z.string().trim().min(20, "Describí tu consulta con al menos 20 caracteres").max(800) });
export type HelpFormValues = z.infer<typeof helpFormSchema>;
