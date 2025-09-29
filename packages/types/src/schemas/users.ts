import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // Professional information
  professional_license: z.string().optional(),
  specialization: z.array(z.string()).optional(),
  // Compliance
  lgpd_consent_date: z.string().datetime().optional(),
  phone_number: z.string().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  // Additional validation for user creation
  email: z.string().email({ message: 'Invalid email format' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone_number: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    .optional(),
});

export const UserClinicSchema = z.object({
  user_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  role: z.enum(['admin', 'professional', 'staff', 'receptionist']),
  permissions: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
});

export const UpdateUserSchema = UserSchema.partial().extend({
  id: z.string().uuid(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserClinic = z.infer<typeof UserClinicSchema>;