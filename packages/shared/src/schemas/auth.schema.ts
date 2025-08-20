import { z } from 'zod';

/**
 * 🔐 Authentication Schemas - NeonPro Healthcare
 * ==============================================
 * 
 * Schemas Zod para validação de autenticação e autorização
 * com segurança reforçada para dados médicos sensíveis.
 */

// Password validation with strong security requirements
export const PasswordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha deve ter no máximo 128 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 símbolo');

// User roles in the system
export const UserRole = z.enum([
  'super_admin',    // Super administrador do sistema
  'admin',          // Administrador da clínica
  'doctor',         // Médico/Dermatologista
  'nurse',          // Enfermeiro
  'aesthetician',   // Esteticista
  'receptionist',   // Recepcionista
  'manager',        // Gerente
  'patient'         // Paciente
]);

// MFA methods
export const MFAMethod = z.enum([
  'sms',           // SMS
  'email',         // Email
  'totp',          // Time-based OTP (Google Authenticator)
  'backup_codes'   // Códigos de backup
]);

// Login schema
export const LoginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .max(128, 'Senha deve ter no máximo 128 caracteres'),
  
  // Device/session info
  deviceInfo: z.object({
    userAgent: z.string().max(500).optional(),
    ipAddress: z.string().ip().optional(),
    deviceId: z.string().max(100).optional(),
    platform: z.enum(['web', 'mobile', 'desktop']).default('web'),
  }).optional(),
  
  // MFA
  mfaCode: z.string().length(6).optional(),
  rememberDevice: z.boolean().default(false),
});

// Register schema
export const RegisterSchema = z.object({
  // Personal info
  fullName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  password: PasswordSchema,
  confirmPassword: z.string(),
  
  // User type and role
  role: UserRole,
  
  // Professional info (if applicable)
  licenseNumber: z.string()
    .max(50, 'Número da licença deve ter no máximo 50 caracteres')
    .optional(),
  
  specialization: z.string()
    .max(100, 'Especialização deve ter no máximo 100 caracteres')
    .optional(),
  
  // Clinic association
  clinicId: z.string().uuid().optional(),
  inviteCode: z.string().max(100).optional(),
  
  // Terms and privacy
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos de uso' })
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar a política de privacidade' })
  }),
  
  // LGPD consent for healthcare
  consentDataProcessing: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento para processamento de dados é obrigatório' })
  }),
  
  marketingConsent: z.boolean().default(false),
  
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Password reset schemas
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const ResetPasswordSchema = z.object({
  token: z.string()
    .min(10, 'Token inválido')
    .max(200, 'Token inválido'),
  
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// MFA setup schemas
export const EnableMFASchema = z.object({
  method: MFAMethod,
  password: z.string().min(1, 'Senha é obrigatória'),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .optional(),
});

export const VerifyMFASchema = z.object({
  code: z.string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
  method: MFAMethod,
});

// User profile update
export const UpdateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .optional(),
  
  avatar: z.string().url('Avatar deve ser uma URL válida').optional(),
  
  // Professional info
  licenseNumber: z.string().max(50).optional(),
  specialization: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  
  // Preferences
  preferences: z.object({
    language: z.enum(['pt', 'en', 'es']).default('pt'),
    timezone: z.string().max(50).default('America/Sao_Paulo'),
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
  }).optional(),
});

// Auth response schemas
export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(), // seconds
  scope: z.string().optional(),
});

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  role: UserRole,
  avatar: z.string().url().optional(),
  
  // Status
  isActive: z.boolean(),
  isVerified: z.boolean(),
  isMFAEnabled: z.boolean(),
  
  // Professional info
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  
  // Clinic association
  clinicId: z.string().uuid().optional(),
  clinicName: z.string().optional(),
  
  // Timestamps
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
  
  // Permissions (computed based on role)
  permissions: z.array(z.string()).default([]),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  user: AuthUserSchema,
  tokens: AuthTokenSchema,
  requiresMFA: z.boolean().default(false),
  message: z.string().optional(),
});

// Session management
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const RevokeTokenSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  tokenType: z.enum(['access', 'refresh']).default('refresh'),
});

// Device management
export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.enum(['web', 'mobile', 'desktop']),
  userAgent: z.string(),
  ipAddress: z.string().ip(),
  lastSeen: z.string().datetime(),
  isCurrent: z.boolean(),
  isTrusted: z.boolean(),
});

export const RevokeDeviceSchema = z.object({
  deviceId: z.string().min(1, 'ID do dispositivo é obrigatório'),
});

// Audit log for auth events
export const AuthAuditEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  event: z.enum([
    'login_success',
    'login_failed', 
    'logout',
    'password_changed',
    'mfa_enabled',
    'mfa_disabled',
    'password_reset_requested',
    'password_reset_completed',
    'account_locked',
    'account_unlocked'
  ]),
  ipAddress: z.string().ip(),
  userAgent: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

// Export types
export type UserRole = z.infer<typeof UserRole>;
export type MFAMethod = z.infer<typeof MFAMethod>;
export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type EnableMFA = z.infer<typeof EnableMFASchema>;
export type VerifyMFA = z.infer<typeof VerifyMFASchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type RevokeToken = z.infer<typeof RevokeTokenSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type RevokeDevice = z.infer<typeof RevokeDeviceSchema>;
export type AuthAuditEvent = z.infer<typeof AuthAuditEventSchema>;