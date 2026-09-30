import { z } from "zod";

export const propertyTypes = ["house", "community", "industrial", "agricultural", "commercial", "other"] as const;
export const surfaces = ["lt50", "50-200", "200-1000", "gt1000", "unknown"] as const;
export const services = ["asbestos", "roof", "both", "efficiency", "advice"] as const;

const text = (max: number) => z.string().trim().min(1).max(max);
// Acceptem espais, guions, parèntesis i prefix internacional; comptem només les xifres.
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s().-]+$/)
  .refine((value) => value.replace(/\D/g, "").length >= 9 && value.replace(/\D/g, "").length <= 15);

const base = {
  locale: z.enum(["es", "ca"]),
  name: text(120),
  email: z.string().trim().max(200).pipe(z.email()),
  phone,
  privacy: z.literal(true),
};

export const quoteSchema = z.object({
  ...base,
  kind: z.literal("quote"),
  propertyType: z.enum(propertyTypes),
  municipality: text(120),
  surface: z.enum(surfaces).optional(),
  service: z.enum(services),
  message: z.string().trim().max(4000).optional(),
});

export const contactSchema = z.object({
  ...base,
  kind: z.literal("contact"),
  message: text(4000),
});

export const leadSchema = z.discriminatedUnion("kind", [quoteSchema, contactSchema]);

export type Lead = z.infer<typeof leadSchema>;
export type QuoteLead = z.infer<typeof quoteSchema>;
export type LeadField = "name" | "email" | "phone" | "propertyType" | "municipality" | "service" | "message" | "privacy";

/** Converteix el FormData del navegador a l'objecte que valida l'esquema. */
export function leadInputFromFormData(formData: FormData) {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value !== "" ? value : undefined;
  };
  return {
    kind: get("kind"),
    locale: get("locale"),
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    propertyType: get("propertyType"),
    municipality: get("municipality"),
    surface: get("surface"),
    service: get("service"),
    message: get("message"),
    privacy: formData.get("privacy") === "on",
    // Trampes antibrossa: camp ocult i moment en què es va obrir el formulari.
    website: get("website"),
    startedAt: Number(get("startedAt") ?? 0),
  };
}
