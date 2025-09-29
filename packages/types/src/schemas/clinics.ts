import { z } from 'zod';

export const ClinicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  settings: z.record(z.string(), z.any()).default({}),
  // Clinic configuration
  timezone: z.string().default('America/Sao_Paulo'),
  language: z.string().default('pt-BR'),
  currency: z.string().default('BRL'),
  // Compliance fields
  lgpd_consent_date: z.string().datetime().optional(),
  anvisa_registration: z.string().optional(),
  professional_council_number: z.string().optional(),
});

export const CreateClinicSchema = ClinicSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  name: z.string().min(2, { message: 'Clinic name must be at least 2 characters' }),
  slug: z.string()
    .min(3, { message: 'Slug must be at least 3 characters' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' }),
});

export const UpdateClinicSchema = ClinicSchema.partial().extend({
  id: z.string().uuid(),
});

export type Clinic = z.infer<typeof ClinicSchema>;
export type CreateClinic = z.infer<typeof CreateClinicSchema>;
export type UpdateClinic = z.infer<typeof UpdateClinicSchema>;