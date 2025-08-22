import { z } from 'zod';

// Base User Role Schema
export const UserRoleSchema = z.enum([
  'admin',
  'clinic_owner',
  'clinic_manager',
  'professional',
  'receptionist',
  'patient',
]);

export const UserPermissionSchema = z.enum([
  // Admin permissions
  'admin:manage_system',
  'admin:view_all_data',

  // Clinic management
  'clinic:create',
  'clinic:update',
  'clinic:delete',
  'clinic:view_analytics',

  // Professional management
  'professional:create',
  'professional:update',
  'professional:delete',
  'professional:view_schedule',

  // Patient management
  'patient:create',
  'patient:update',
  'patient:delete',
  'patient:view_records',

  // Appointment management
  'appointment:create',
  'appointment:update',
  'appointment:cancel',
  'appointment:view_all',

  // Service management
  'service:create',
  'service:update',
  'service:delete',
  'service:price_management',

  // Financial
  'finance:view_reports',
  'finance:manage_payments',

  // Compliance
  'compliance:view_logs',
  'compliance:manage_consent',

  // Analytics
  'analytics:view_dashboard',
  'analytics:export_data',
]);

// MFA Method Schema
export const MFAMethodSchema = z.enum([
  'sms',
  'email',
  'authenticator',
  'backup_codes'
]);

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserPermission = z.infer<typeof UserPermissionSchema>;
export type MFAMethod = z.infer<typeof MFAMethodSchema>;

// User Base Schema
export const UserBaseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email deve ser válido'),
  first_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Telefone deve estar no formato (XX) XXXXX-XXXX'
    )
    .optional(),
  role: UserRoleSchema,
  permissions: z.array(UserPermissionSchema).default([]),
  is_active: z.boolean().default(true),
  is_verified: z.boolean().default(false),
  clinic_id: z.string().uuid().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login: z.string().datetime().optional(),

  // LGPD Compliance
  lgpd_consent_date: z.string().datetime().optional(),
  lgpd_consent_version: z.string().optional(),
  data_retention_date: z.string().datetime().optional(),
});

// Authentication Schemas
export const LoginRequestSchema = z.object({
  email: z.string().email('Email deve ser válido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres'),
  remember_me: z.boolean().optional().default(false),
  device_info: z
    .object({
      user_agent: z.string().optional(),
      ip_address: z.string().ip().optional(),
      device_type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    })
    .optional(),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      user: UserBaseSchema,
      access_token: z.string(),
      refresh_token: z.string(),
      token_type: z.literal('Bearer').default('Bearer'),
      expires_in: z.number(), // seconds
      expires_at: z.string().datetime(),
      permissions: z.array(UserPermissionSchema),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.any()).optional(),
    })
    .optional(),
});

export const RegisterRequestSchema = z
  .object({
    email: z.string().email('Email deve ser válido'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos: 1 minúscula, 1 maiúscula, 1 número e 1 símbolo'
      ),
    confirm_password: z.string(),
    first_name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(50, 'Nome deve ter no máximo 50 caracteres'),
    last_name: z
      .string()
      .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
      .max(50, 'Sobrenome deve ter no máximo 50 caracteres'),
    phone: z
      .string()
      .regex(
        /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        'Telefone deve estar no formato (XX) XXXXX-XXXX'
      ),
    role: UserRoleSchema.default('patient'),

    // LGPD Compliance
    lgpd_consent: z
      .boolean()
      .refine((val) => val === true, 'Consentimento LGPD é obrigatório'),
    marketing_consent: z.boolean().optional().default(false),
    terms_accepted: z
      .boolean()
      .refine((val) => val === true, 'Aceitação dos termos é obrigatória'),

    // Professional specific fields
    professional_data: z
      .object({
        cpf: z
          .string()
          .regex(
            /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
            'CPF deve estar no formato XXX.XXX.XXX-XX'
          ),
        crm: z.string().optional(),
        specialization: z.string().optional(),
        bio: z.string().max(500).optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Senhas não conferem',
    path: ['confirm_password'],
  });

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      user: UserBaseSchema,
      verification_required: z.boolean(),
      verification_method: z.enum(['email', 'sms', 'none']).optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.any()).optional(),
    })
    .optional(),
});

// Token Management Schemas
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
});

export const RefreshTokenResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      access_token: z.string(),
      refresh_token: z.string(),
      token_type: z.literal('Bearer').default('Bearer'),
      expires_in: z.number(),
      expires_at: z.string().datetime(),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.any()).optional(),
    })
    .optional(),
});

export const LogoutRequestSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
  logout_all_devices: z.boolean().optional().default(false),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Password Management Schemas
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Email deve ser válido'),
});

export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ResetPasswordRequestSchema = z
  .object({
    reset_token: z.string().min(1, 'Token de reset é obrigatório'),
    new_password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos: 1 minúscula, 1 maiúscula, 1 número e 1 símbolo'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Senhas não conferem',
    path: ['confirm_password'],
  });

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ChangePasswordRequestSchema = z
  .object({
    current_password: z.string().min(1, 'Senha atual é obrigatória'),
    new_password: z
      .string()
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .max(128, 'Nova senha deve ter no máximo 128 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Nova senha deve conter pelo menos: 1 minúscula, 1 maiúscula, 1 número e 1 símbolo'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Senhas não conferem',
    path: ['confirm_password'],
  });

export const ChangePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Profile Management Schemas
export const UpdateProfileRequestSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .optional(),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .optional(),
  phone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Telefone deve estar no formato (XX) XXXXX-XXXX'
    )
    .optional(),

  // Professional specific updates
  professional_data: z
    .object({
      crm: z.string().optional(),
      specialization: z.string().optional(),
      bio: z.string().max(500).optional(),
    })
    .optional(),
});

export const UpdateProfileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      user: UserBaseSchema,
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      details: z.record(z.any()).optional(),
    })
    .optional(),
});

// Email Verification Schemas
export const VerifyEmailRequestSchema = z.object({
  verification_token: z.string().min(1, 'Token de verificação é obrigatório'),
});

export const VerifyEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ResendVerificationRequestSchema = z.object({
  email: z.string().email('Email deve ser válido'),
});

export const ResendVerificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Session Management Schemas
export const SessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  device_info: z.object({
    user_agent: z.string().optional(),
    ip_address: z.string().ip(),
    device_type: z.enum(['desktop', 'mobile', 'tablet']),
    location: z.string().optional(),
  }),
  is_active: z.boolean(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
  last_activity: z.string().datetime(),
});

export const GetSessionsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      sessions: z.array(SessionSchema),
      current_session_id: z.string().uuid(),
    })
    .optional(),
});

export const RevokeSessionRequestSchema = z.object({
  session_id: z.string().uuid(),
});

export const RevokeSessionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// JWT Payload Schema (for internal use)
export const JWTPayloadSchema = z.object({
  sub: z.string().uuid(), // user_id
  email: z.string().email(),
  role: UserRoleSchema,
  permissions: z.array(UserPermissionSchema),
  clinic_id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  iat: z.number(),
  exp: z.number(),
  iss: z.string(),
  aud: z.string(),
});

// Type exports removed to avoid duplication - see top of file
export type UserBase = z.infer<typeof UserBaseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ChangePasswordResponse = z.infer<
  typeof ChangePasswordResponseSchema
>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;
export type ResendVerificationRequest = z.infer<
  typeof ResendVerificationRequestSchema
>;
export type ResendVerificationResponse = z.infer<
  typeof ResendVerificationResponseSchema
>;
export type Session = z.infer<typeof SessionSchema>;
export type GetSessionsResponse = z.infer<typeof GetSessionsResponseSchema>;
export type RevokeSessionRequest = z.infer<typeof RevokeSessionRequestSchema>;
export type RevokeSessionResponse = z.infer<typeof RevokeSessionResponseSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Additional exports for compatibility
export type AuthToken = LoginResponse;
export type AuthUser = UserBase;
