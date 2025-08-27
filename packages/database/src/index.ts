/**
 * NeonPro Healthcare Database Package
 * Consolidated database layer with Prisma ORM + Supabase integration
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant support
 */

// ============================================================================
// PRISMA CLIENT EXPORTS (Legacy support during transition)
// ============================================================================
export * from "@prisma/client";

// ============================================================================
// MODERN SUPABASE CLIENT EXPORTS
// ============================================================================

// Healthcare authentication exports
export { getSession, getUser, requireHealthcareProfessional, requireUser, signOut } from "./auth";

// Modern Supabase client exports
export { createClient, createServerClient } from "./client";

// ============================================================================
// TYPESCRIPT TYPE DEFINITIONS
// ============================================================================

// Database types
export type {
  // Appointment types
  Appointment,
  AppointmentInsert,
  AppointmentUpdate,
  // Clinic types
  Clinic,
  ClinicInsert,
  ClinicUpdate,
  Database,
  // Audit log types
  HealthcareAuditLog,
  HealthcareAuditLogInsert,
  HealthcareAuditLogUpdate,
  // Healthcare Professional types
  HealthcareProfessional,
  HealthcareProfessionalInsert,
  HealthcareProfessionalUpdate,
  Json,
  // Notification types
  Notification,
  NotificationInsert,
  NotificationUpdate,
  // Patient types
  Patient,
  PatientInsert,
  PatientUpdate,
} from "./types";

// ============================================================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================================================

// Healthcare-specific database utilities
export const healthcareUtils = {
  // LGPD compliance helpers
  formatCPF: (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, "");
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  validateCPF: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11) return false;

    // CPF validation algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i] || "0") * (10 - i);
    }
    let digit1 = (sum * 10) % 11;
    if (digit1 === 10) digit1 = 0;

    if (parseInt(cleaned[9] || "0") !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i] || "0") * (11 - i);
    }
    let digit2 = (sum * 10) % 11;
    if (digit2 === 10) digit2 = 0;

    return parseInt(cleaned[10] || "0") === digit2;
  },

  // CFM validation
  validateCFM: (cfm: string): boolean => {
    const cleaned = cfm.replace(/\D/g, "");
    return cleaned.length >= 4 && cleaned.length <= 6;
  },

  // CNPJ validation for clinics
  validateCNPJ: (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length !== 14) return false;

    // CNPJ validation algorithm
    let sum = 0;
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i] || "0") * (weights1[i] || 0);
    }

    let digit1 = sum % 11;
    digit1 = digit1 < 2 ? 0 : 11 - digit1;

    if (parseInt(cleaned[12] || "0") !== digit1) return false;

    sum = 0;
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i] || "0") * (weights2[i] || 0);
    }

    let digit2 = sum % 11;
    digit2 = digit2 < 2 ? 0 : 11 - digit2;

    return parseInt(cleaned[13] || "0") === digit2;
  },

  // Brazilian states for address validation
  brazilianStates: [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ] as const,

  // Healthcare specialties (CFM recognized)
  medicalSpecialties: [
    "Cardiologia",
    "Dermatologia",
    "Endocrinologia",
    "Gastroenterologia",
    "Ginecologia",
    "Neurologia",
    "Oftalmologia",
    "Ortopedia",
    "Otorrinolaringologia",
    "Pediatria",
    "Psiquiatria",
    "Radiologia",
    "Urologia",
    "Clínica Médica",
    "Cirurgia Geral",
    "Anestesiologia",
  ] as const,
};

// Database connection helpers
export const dbUtils = {
  // Environment validation
  validateEnvironment: (): boolean => {
    const required = [
      "DATABASE_URL",
      "DIRECT_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    return required.every(env => Boolean(process.env[env]));
  },

  // Connection testing
  isHealthy: async (): Promise<boolean> => {
    try {
      // Simple query to test connection
      const result = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/", {
        headers: {
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        },
      });
      return result.ok;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

export const DATABASE_CONFIG = {
  // Healthcare compliance settings
  LGPD_RETENTION_DAYS: 2555, // 7 years as per Brazilian healthcare regulations
  AUDIT_LOG_RETENTION_DAYS: 2920, // 8 years
  SESSION_TIMEOUT_MINUTES: 30,

  // Appointment configuration
  DEFAULT_APPOINTMENT_DURATION: 30,
  MAX_APPOINTMENT_DURATION: 480, // 8 hours
  APPOINTMENT_BUFFER_MINUTES: 15,

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File upload limits
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"] as const,
} as const;

// Error messages for healthcare compliance
export const HEALTHCARE_ERRORS = {
  LGPD_CONSENT_REQUIRED: "Consentimento LGPD é obrigatório para processar dados pessoais",
  CFM_INVALID: "Número CFM inválido",
  CPF_INVALID: "CPF inválido",
  CNPJ_INVALID: "CNPJ inválido",
  UNAUTHORIZED_PATIENT_ACCESS: "Acesso não autorizado aos dados do paciente",
  AUDIT_LOG_REQUIRED: "Log de auditoria obrigatório para esta operação",
  PROFESSIONAL_VERIFICATION_REQUIRED: "Verificação profissional necessária",
} as const;
