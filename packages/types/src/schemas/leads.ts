import { z } from 'zod';

export const LeadSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.string().default('manual'),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // AI-powered follow-up
  next_follow_up: z.string().datetime().optional(),
  ai_predictions: z.record(z.string(), z.any()).default({}),
});

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  name: z.string().min(2, { message: 'Lead name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email format' }).optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    .optional(),
});

export const UpdateLeadSchema = LeadSchema.partial().extend({
  id: z.string().uuid(),
});

export type Lead = z.infer<typeof LeadSchema>;
export type CreateLead = z.infer<typeof CreateLeadSchema>;
export type UpdateLead = z.infer<typeof UpdateLeadSchema>;