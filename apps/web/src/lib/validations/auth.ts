/**
 * Authentication Validation Schemas
 * Zod schemas for form validation and type safety
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
});

/**
 * Password validation schema
 * Requirements: minimum 8 characters, at least one letter and one number
 */
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

/**
 * Sign up form validation schema
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirme sua senha'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .optional(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Você deve aceitar os termos de uso'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
});

/**
 * Password reset schema (with token)
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirme sua senha'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

/**
 * Update password schema (for logged in users)
 */
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirme a nova senha'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'Nova senha deve ser diferente da atual',
  path: ['newPassword'],
});

/**
 * Auth form schema (unified login/signup)
 */
export const authFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .optional(),
  firstname: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome muito longo')
    .optional(),
  lastname: z
    .string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(50, 'Sobrenome muito longo')
    .optional(),
  crm: z
    .string()
    .max(20, 'CRM muito longo')
    .optional(),
});

/**
 * Type exports for TypeScript
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
export type AuthFormData = z.infer<typeof authFormSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;

/**
 * Helper function to validate email
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse({ email });
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to validate password strength
 */
export function isValidPassword(password: string): boolean {
  try {
    passwordSchema.parse({ password });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get password strength (weak, medium, strong)
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';

  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const strength = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (strength <= 2) return 'weak';
  if (strength === 3) return 'medium';
  return 'strong';
}
