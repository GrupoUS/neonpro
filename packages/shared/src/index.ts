/**
 * 🔗 NeonPro Shared Package - Main Export
 * ========================================
 *
 * Ponto de entrada principal para o package @neonpro/shared
 * Exports centralizados para schemas, types e utilitários.
 */

// Schemas (Zod validation schemas)
export * from './schemas';

// Types (TypeScript interfaces and types)
export * from './types';

// Package version and metadata
export const PACKAGE_VERSION = '1.0.0';
export const PACKAGE_NAME = '@neonpro/shared';

// Common constants
export const CONSTANTS = {
  // Brazilian specific
  CPF_LENGTH: 11,
  CNPJ_LENGTH: 14,
  CEP_LENGTH: 8,

  // Appointment settings
  MIN_APPOINTMENT_DURATION: 15, // minutes
  MAX_APPOINTMENT_DURATION: 480, // minutes (8 hours)
  DEFAULT_APPOINTMENT_DURATION: 60, // minutes

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Phone number formats
  BRAZIL_PHONE_REGEX: /^(\+55|55)?(\d{2})(\d{4,5})(\d{4})$/,

  // Brazilian document validation
  CPF_REGEX: /^\d{11}$/,
  CNPJ_REGEX: /^\d{14}$/,
  CEP_REGEX: /^\d{8}$/,

  // Time formats
  TIME_FORMAT: 'HH:mm',
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss.sssZ',

  // Cache TTL (seconds)
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86_400, // 24 hours
  },

  // Rate limiting
  RATE_LIMITS: {
    AUTH: { requests: 5, window: 60 }, // 5 requests per minute
    API: { requests: 100, window: 60 }, // 100 requests per minute
    SEARCH: { requests: 20, window: 60 }, // 20 requests per minute
  },

  // LGPD retention periods (days)
  DATA_RETENTION: {
    PATIENT_DATA: 365 * 20, // 20 years for medical data
    APPOINTMENT_DATA: 365 * 5, // 5 years
    AUDIT_LOGS: 365 * 7, // 7 years
    SESSION_DATA: 30, // 30 days
  },
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  MFA_REQUIRED: 'MFA_REQUIRED',
  MFA_INVALID: 'MFA_INVALID',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_CPF: 'INVALID_CPF',
  INVALID_CNPJ: 'INVALID_CNPJ',

  // Business logic
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  APPOINTMENT_PAST_DATE: 'APPOINTMENT_PAST_DATE',
  APPOINTMENT_TOO_FAR: 'APPOINTMENT_TOO_FAR',
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  PROFESSIONAL_NOT_AVAILABLE: 'PROFESSIONAL_NOT_AVAILABLE',
  CLINIC_CLOSED: 'CLINIC_CLOSED',
  SERVICE_NOT_AVAILABLE: 'SERVICE_NOT_AVAILABLE',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // File operations
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // LGPD/Privacy
  DATA_RETENTION_EXPIRED: 'DATA_RETENTION_EXPIRED',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  CONSENT_WITHDRAWN: 'CONSENT_WITHDRAWN',
  DATA_EXPORT_FAILED: 'DATA_EXPORT_FAILED',
  DATA_DELETION_FAILED: 'DATA_DELETION_FAILED',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso',
  REGISTER_SUCCESS: 'Cadastro realizado com sucesso',
  PASSWORD_CHANGED: 'Senha alterada com sucesso',
  PASSWORD_RESET_SENT: 'Link de recuperação enviado por email',

  // CRUD operations
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso',
  DELETED: 'Removido com sucesso',

  // Appointments
  APPOINTMENT_CREATED: 'Consulta agendada com sucesso',
  APPOINTMENT_UPDATED: 'Consulta atualizada com sucesso',
  APPOINTMENT_CANCELLED: 'Consulta cancelada com sucesso',
  APPOINTMENT_RESCHEDULED: 'Consulta reagendada com sucesso',

  // Notifications
  NOTIFICATION_SENT: 'Notificação enviada com sucesso',
  EMAIL_SENT: 'Email enviado com sucesso',
  SMS_SENT: 'SMS enviado com sucesso',

  // File operations
  FILE_UPLOADED: 'Arquivo enviado com sucesso',
  FILE_DELETED: 'Arquivo removido com sucesso',

  // LGPD/Privacy
  CONSENT_UPDATED: 'Consentimento atualizado com sucesso',
  DATA_EXPORTED: 'Dados exportados com sucesso',
  DATA_DELETED: 'Dados removidos com sucesso',
} as const;

// Utility functions
export const utils = {
  // Brazilian document validation
  isValidCPF: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(.)\1*$/.test(cleaned)) {
      return false;
    }

    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== Number.parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;

    return remainder === Number.parseInt(cleaned.charAt(10));
  },

  isValidCNPJ: (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14 || /^(.)\1*$/.test(cleaned)) {
      return false;
    }

    // Validate CNPJ algorithm
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += Number.parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== Number.parseInt(cleaned.charAt(12))) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += Number.parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return digit2 === Number.parseInt(cleaned.charAt(13));
  },

  // Phone formatting
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  // CPF/CNPJ formatting
  formatCPF: (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  },

  formatCNPJ: (cnpj: string): string => {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return cnpj;
  },

  // CEP formatting
  formatCEP: (cep: string): string => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  },

  // Date utilities
  formatDate: (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  formatDateTime: (date: string | Date): string => {
    return new Date(date).toISOString();
  },

  // String utilities
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Generate random IDs
  generateId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
} as const;

// Type definitions export (for convenience)
export type ErrorCode = keyof typeof ERROR_CODES;
export type SuccessMessage = keyof typeof SUCCESS_MESSAGES;
