import type { z } from "zod";

export const customerInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  document: z.string().min(11).max(14), // CPF or CNPJ
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("Brasil"),
  }),
});

export const taxCalculationRequestSchema = z.object({
  clinicId: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      category: z.string(),
      taxCode: z.string().optional(),
    }),
  ),
  serviceLocation: z.object({
    state: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
  calculationType: z.enum(["service", "product", "mixed"]),
});

export const taxConfigurationSchema = z.object({
  clinicId: z.string().uuid(),
  taxRegime: z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]),
  issRate: z.number().min(0).max(5), // ISS rate percentage
  pisRate: z.number().default(0.65),
  cofinsRate: z.number().default(3),
  csllRate: z.number().default(1),
  irRate: z.number().default(1.5),
  simplexNacionalRate: z.number().optional(),
  municipalTaxId: z.string().optional(),
  stateTaxId: z.string().optional(),
  federalTaxId: z.string().optional(),
  active: z.boolean().default(true),
  updatedAt: z.date().default(() => new Date()),
});

export const nfeGenerationRequestSchema = z.object({
  clinicId: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      total: z.number().positive(),
      taxCode: z.string().optional(),
      serviceCode: z.string().optional(),
    }),
  ),
  services: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        issRate: z.number(),
        serviceCode: z.string(),
      }),
    )
    .optional(),
  totalAmount: z.number().positive(),
  observations: z.string().optional(),
  dueDate: z.date().optional(),
});

export const nfeDocumentSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  series: z.string(),
  clinicId: z.string().uuid(),
  customerId: z.string().uuid(),
  totalAmount: z.number(),
  taxes: z.object({
    iss: z.number(),
    pis: z.number(),
    cofins: z.number(),
    csll: z.number(),
    ir: z.number(),
  }),
  status: z.enum(["draft", "pending", "issued", "cancelled", "error"]),
  issuedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
  xmlContent: z.string().optional(),
  pdfUrl: z.string().optional(),
  verificationCode: z.string().optional(),
  errors: z.array(z.string()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;
export type TaxCalculationRequest = z.infer<typeof taxCalculationRequestSchema>;
export type TaxConfiguration = z.infer<typeof taxConfigurationSchema>;
export type NFEGenerationRequest = z.infer<typeof nfeGenerationRequestSchema>;
export type NFEDocument = z.infer<typeof nfeDocumentSchema>;
