import { z } from "zod";

/**
 * 🏥 Clinic Schemas - NeonPro Healthcare
 * ======================================
 *
 * Schemas Zod para validação de dados de clínicas estéticas
 * com compliance ANVISA e validações específicas do setor.
 */

// Business hours schema
export const BusinessHoursSchema = z
  .object({
    day: z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
    isOpen: z.boolean(),
    openTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Horário deve estar no formato HH:MM",
      ),
    closeTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Horário deve estar no formato HH:MM",
      ),
  })
  .refine((data) => {
    if (!(data.isOpen && data.openTime && data.closeTime)) {
      return true;
    }

    const openTimeParts = data.openTime.split(":").map(Number);
    const closeTimeParts = data.closeTime.split(":").map(Number);

    if (openTimeParts.length !== 2 || closeTimeParts.length !== 2) {
      return false;
    }

    const [openHour] = openTimeParts;
    const openMin = openTimeParts[1];
    const [closeHour] = closeTimeParts;
    const closeMin = closeTimeParts[1];

    if (
      typeof openHour !== "number" ||
      typeof openMin !== "number" ||
      typeof closeHour !== "number" ||
      typeof closeMin !== "number" ||
      Number.isNaN(openHour) ||
      Number.isNaN(openMin) ||
      Number.isNaN(closeHour) ||
      Number.isNaN(closeMin)
    ) {
      return false;
    }

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return openMinutes < closeMinutes;
  }, "Horário de abertura deve ser anterior ao de fechamento");

// Contact information schema
export const ContactInfoSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Telefone inválido"),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "WhatsApp inválido")
    .optional(),
  email: z.string().email("Email inválido"),
  website: z.string().url("Website deve ser uma URL válida").optional(),
  socialMedia: z
    .object({
      instagram: z.string().max(100).optional(),
      facebook: z.string().max(100).optional(),
      tiktok: z.string().max(100).optional(),
    })
    .optional(),
});

// Address schema (more detailed for clinic)
export const ClinicAddressSchema = z.object({
  street: z.string().min(5).max(200),
  number: z.string().max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().max(100),
  city: z.string().max(100),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{8}$/, "CEP deve conter 8 dígitos"),
  country: z.string().default("Brasil"),

  // Geographic coordinates for maps
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Additional location info
  landmark: z.string().max(200).optional(),
  parkingAvailable: z.boolean().default(false),
  accessibilityFeatures: z.array(z.string().max(100)).default([]),
});

// Clinic services/treatments
export const ClinicServiceSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.enum([
    "injectables", // Injetáveis (botox, preenchimento)
    "laser", // Tratamentos a laser
    "skincare", // Cuidados com a pele
    "body_treatments", // Tratamentos corporais
    "hair_removal", // Depilação
    "wellness", // Bem-estar
    "consultation", // Consultas
    "other",
  ]),
  description: z.string().max(500).optional(),
  duration: z.number().min(15).max(480), // minutes
  price: z.number().min(0).max(50_000).optional(),
  isActive: z.boolean().default(true),
});

// Staff/Professional basic info
export const ClinicStaffSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  role: z.enum([
    "doctor",
    "nurse",
    "aesthetician",
    "receptionist",
    "manager",
    "owner",
  ]),
  specialization: z.string().max(100).optional(),
  licenseNumber: z.string().max(50).optional(), // CRM, COREN, etc.
  isActive: z.boolean().default(true),
});

// Base clinic schema
export const ClinicBaseSchema = z.object({
  // Basic information
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres"),

  tradeName: z
    .string()
    .max(200, "Nome fantasia deve ter no máximo 200 caracteres")
    .optional(),

  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),

  // Legal information (Brazil)
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos")
    .refine((val) => {
      // Basic CNPJ validation would go here
      return val.length === 14;
    }, "CNPJ inválido"),

  stateRegistration: z.string().max(50).optional(),
  municipalRegistration: z.string().max(50).optional(),

  // ANVISA compliance
  anvisaLicense: z
    .string()
    .min(5, "Licença ANVISA deve ter pelo menos 5 caracteres")
    .max(50)
    .optional(),

  // Contact and location
  contact: ContactInfoSchema,
  address: ClinicAddressSchema,
  businessHours: z.array(BusinessHoursSchema).length(7),

  // Services and staff
  services: z.array(ClinicServiceSchema).default([]),
  capacity: z.number().min(1).max(100), // Number of simultaneous appointments

  // Settings
  isActive: z.boolean().default(true),
  acceptsInsurance: z.boolean().default(false),
  acceptedPaymentMethods: z
    .array(
      z.enum([
        "cash",
        "credit_card",
        "debit_card",
        "pix",
        "bank_transfer",
        "installments",
      ]),
    )
    .default(["cash"]),

  // Branding
  logo: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),

  // Operational settings
  bookingSettings: z
    .object({
      allowOnlineBooking: z.boolean().default(true),
      requireApproval: z.boolean().default(false),
      advanceBookingDays: z.number().min(1).max(365).default(30),
      cancellationHours: z.number().min(1).max(48).default(24),
      reminderEnabled: z.boolean().default(true),
      reminderHours: z.number().min(1).max(48).default(24),
    })
    .default({}),
});

// Create clinic schema
export const CreateClinicSchema = ClinicBaseSchema.omit({
  isActive: true,
});

// Update clinic schema
export const UpdateClinicSchema = ClinicBaseSchema.partial().extend({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

// Clinic response schema
export const ClinicResponseSchema = ClinicBaseSchema.extend({
  id: z.string().uuid(),
  ownerId: z.string().uuid(), // User who owns this clinic
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Statistics
  stats: z
    .object({
      totalPatients: z.number().default(0),
      totalAppointments: z.number().default(0),
      activeStaff: z.number().default(0),
      averageRating: z.number().min(0).max(5).default(0),
      totalReviews: z.number().default(0),
    })
    .optional(),

  // Staff list (populated)
  staff: z.array(ClinicStaffSchema).default([]),

  // Remove sensitive data
  cnpj: z.string().transform((_val) => "**.***.***/****-**"),
});

// Search/filter clinics
export const ClinicSearchSchema = z.object({
  query: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  serviceCategory: z
    .enum([
      "injectables",
      "laser",
      "skincare",
      "body_treatments",
      "hair_removal",
      "wellness",
      "consultation",
      "other",
    ])
    .optional(),
  acceptsInsurance: z.boolean().optional(),
  hasOnlineBooking: z.boolean().optional(),

  // Location-based search
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusKm: z.number().min(0.1).max(100).default(10),

  // Pagination and sorting
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z
    .enum(["name", "createdAt", "averageRating", "totalPatients"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Clinic availability schema
export const ClinicAvailabilitySchema = z.object({
  clinicId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  professionalId: z.string().uuid().optional(),
  serviceType: z.string().max(100).optional(),
});

// Export types
export type BusinessHours = z.infer<typeof BusinessHoursSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type ClinicAddress = z.infer<typeof ClinicAddressSchema>;
export type ClinicService = z.infer<typeof ClinicServiceSchema>;
export type ClinicStaff = z.infer<typeof ClinicStaffSchema>;
export type ClinicBase = z.infer<typeof ClinicBaseSchema>;
export type CreateClinic = z.infer<typeof CreateClinicSchema>;
export type UpdateClinic = z.infer<typeof UpdateClinicSchema>;
export type ClinicResponse = z.infer<typeof ClinicResponseSchema>;
export type ClinicSearch = z.infer<typeof ClinicSearchSchema>;
export type ClinicAvailability = z.infer<typeof ClinicAvailabilitySchema>;
