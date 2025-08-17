import type { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Input validation schemas for healthcare data
 * Implements strict validation for sensitive medical information
 */

// Base validation schemas
export const emailSchema = z.string().email('Email inválido').max(255);
export const cpfSchema = z
  .string()
  .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos');
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]{10,20}$/, 'Telefone inválido');
export const crmSchema = z
  .string()
  .regex(/^\d{4,6}\/[A-Z]{2}$/, 'CRM inválido (formato: 123456/SP)');

// Medical data schemas
export const patientIdSchema = z
  .string()
  .uuid('ID do paciente deve ser um UUID válido');
export const medicalRecordSchema = z
  .string()
  .regex(/^MR\d{8}$/, 'Registro médico inválido');

// Authentication schemas
export const passwordSchema = z
  .string()
  .min(12, 'Senha deve ter pelo menos 12 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/\d/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

// File upload schemas
export const fileTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const fileSizeSchema = z
  .number()
  .max(10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB');

/**
 * Comprehensive input sanitization
 * Removes potentially dangerous characters and scripts
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize SQL input to prevent SQL injection
   */
  static sanitizeSql(input: string): string {
    return input
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/sp_/gi, '');
  }

  /**
   * Sanitize file names to prevent path traversal
   */
  static sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255);
  }

  /**
   * Sanitize text input for healthcare data
   * Preserves medical terminology while removing dangerous content
   */
  static sanitizeMedicalText(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 5000); // Limit length for medical notes
  }
}

/**
 * Request validation middleware for healthcare APIs
 * Validates and sanitizes all incoming request data
 */
export class RequestValidator {
  /**
   * Validate request body against schema
   */
  static async validateBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<
    { success: true; data: T } | { success: false; errors: string[] }
  > {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errors = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }

      return { success: true, data: result.data };
    } catch (_error) {
      return { success: false, errors: ['Invalid JSON body'] };
    }
  }

  /**
   * Validate query parameters against schema
   */
  static validateQuery<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams);
      const result = schema.safeParse(params);

      if (!result.success) {
        const errors = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        return { success: false, errors };
      }

      return { success: true, data: result.data };
    } catch (_error) {
      return { success: false, errors: ['Invalid query parameters'] };
    }
  }

  /**
   * Validate file uploads for medical documents
   */
  static validateFileUpload(
    file: File
  ): { success: true; data: File } | { success: false; errors: string[] } {
    const errors: string[] = [];

    // Validate file type
    const typeResult = fileTypeSchema.safeParse(file.type);
    if (!typeResult.success) {
      errors.push('Tipo de arquivo não permitido');
    }

    // Validate file size
    const sizeResult = fileSizeSchema.safeParse(file.size);
    if (!sizeResult.success) {
      errors.push('Arquivo muito grande (máximo 10MB)');
    }

    // Validate file name
    if (!file.name || file.name.length === 0) {
      errors.push('Nome do arquivo é obrigatório');
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = [
      '.exe',
      '.bat',
      '.cmd',
      '.scr',
      '.pif',
      '.vbs',
      '.js',
    ];
    const fileName = file.name.toLowerCase();
    if (suspiciousExtensions.some((ext) => fileName.endsWith(ext))) {
      errors.push('Tipo de arquivo não permitido por motivos de segurança');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: file };
  }

  /**
   * Validate and sanitize medical record data
   */
  static validateMedicalRecord(data: unknown):
    | {
        success: true;
        data: {
          patientId: string;
          recordId: string;
          notes: string;
          diagnosis: string;
          treatment: string;
        };
      }
    | { success: false; errors: string[] } {
    const schema = z.object({
      patientId: patientIdSchema,
      recordId: medicalRecordSchema,
      notes: z
        .string()
        .min(1)
        .max(5000)
        .transform(InputSanitizer.sanitizeMedicalText),
      diagnosis: z
        .string()
        .min(1)
        .max(1000)
        .transform(InputSanitizer.sanitizeMedicalText),
      treatment: z
        .string()
        .min(1)
        .max(2000)
        .transform(InputSanitizer.sanitizeMedicalText),
    });

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }

    return { success: true, data: result.data };
  }
}

/**
 * Common validation schemas for healthcare endpoints
 */
export const validationSchemas = {
  // Patient registration
  patientRegistration: z.object({
    name: z.string().min(2).max(100).transform(InputSanitizer.sanitizeHtml),
    email: emailSchema,
    phone: phoneSchema,
    cpf: cpfSchema,
    birthDate: z.string().datetime(),
    address: z.object({
      street: z.string().min(5).max(200).transform(InputSanitizer.sanitizeHtml),
      city: z.string().min(2).max(100).transform(InputSanitizer.sanitizeHtml),
      state: z.string().length(2),
      zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
    }),
  }),

  // Doctor registration
  doctorRegistration: z.object({
    name: z.string().min(2).max(100).transform(InputSanitizer.sanitizeHtml),
    email: emailSchema,
    phone: phoneSchema,
    cpf: cpfSchema,
    crm: crmSchema,
    specialty: z
      .string()
      .min(2)
      .max(100)
      .transform(InputSanitizer.sanitizeHtml),
    licenseExpiry: z.string().datetime(),
  }),

  // Appointment booking
  appointmentBooking: z.object({
    patientId: patientIdSchema,
    doctorId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    duration: z.number().min(15).max(240), // 15 minutes to 4 hours
    type: z.enum(['consultation', 'followup', 'procedure', 'emergency']),
    notes: z
      .string()
      .max(1000)
      .optional()
      .transform((val) =>
        val ? InputSanitizer.sanitizeMedicalText(val) : val
      ),
  }),

  // LGPD consent
  lgpdConsent: z.object({
    userId: z.string().uuid(),
    purpose: z.enum([
      'medical-treatment',
      'marketing',
      'research',
      'legal-obligation',
    ]),
    lawfulBasis: z.enum([
      'consent',
      'contract',
      'legal-obligation',
      'vital-interests',
      'public-task',
      'legitimate-interests',
    ]),
    dataCategories: z.array(
      z.enum(['personal', 'health', 'financial', 'behavioral'])
    ),
    retentionPeriod: z.number().min(1).max(3650), // 1 day to 10 years
    canWithdraw: z.boolean().default(true),
  }),

  // Medical record update
  medicalRecordUpdate: z.object({
    recordId: medicalRecordSchema,
    updates: z.object({
      symptoms: z
        .string()
        .max(2000)
        .optional()
        .transform((val) =>
          val ? InputSanitizer.sanitizeMedicalText(val) : val
        ),
      diagnosis: z
        .string()
        .max(1000)
        .optional()
        .transform((val) =>
          val ? InputSanitizer.sanitizeMedicalText(val) : val
        ),
      treatment: z
        .string()
        .max(2000)
        .optional()
        .transform((val) =>
          val ? InputSanitizer.sanitizeMedicalText(val) : val
        ),
      medications: z
        .array(
          z.object({
            name: z
              .string()
              .min(1)
              .max(200)
              .transform(InputSanitizer.sanitizeHtml),
            dosage: z
              .string()
              .min(1)
              .max(100)
              .transform(InputSanitizer.sanitizeHtml),
            frequency: z
              .string()
              .min(1)
              .max(100)
              .transform(InputSanitizer.sanitizeHtml),
          })
        )
        .optional(),
    }),
  }),
} as const;

/**
 * Rate-limited endpoint configuration
 * Different validation rules apply based on sensitivity
 */
export const endpointValidationConfig = {
  '/api/auth/login': {
    rateLimitConfig: 'auth',
    requiredValidation: ['email', 'password'],
    additionalSecurity: ['captcha', 'mfa'],
  },
  '/api/patients': {
    rateLimitConfig: 'patientData',
    requiredValidation: ['jwt', 'rbac'],
    additionalSecurity: ['audit'],
  },
  '/api/medical-records': {
    rateLimitConfig: 'patientData',
    requiredValidation: ['jwt', 'rbac', 'medical-license'],
    additionalSecurity: ['audit', 'encryption'],
  },
  '/api/uploads': {
    rateLimitConfig: 'uploads',
    requiredValidation: ['jwt', 'file-type', 'file-size'],
    additionalSecurity: ['virus-scan', 'audit'],
  },
} as const;
