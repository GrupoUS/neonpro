/**
 * Healthcare-compliant OpenTelemetry configuration types and utilities
 * Designed for LGPD compliance and Brazilian healthcare regulations
 */

export interface HealthcareTelemetryConfig {
  enabled: boolean;
  serviceName: string;
  serviceVersion: string;
  environment: string;

  // LGPD compliance settings
  lgpdCompliant: boolean;
  dataRetentionDays: number;
  sensitiveDataSampling: boolean;

  // Exporter configuration
  exporters: {
    traces: {
      endpoint: string;
      apiKey?: string;
      batchSize: number;
      timeoutMs: number;
    };
    metrics: {
      endpoint: string;
      apiKey?: string;
      intervalMs: number;
    };
  };

  // Healthcare-specific settings
  healthcare: {
    patientDataProtection: boolean;
    auditTrailRequired: boolean;
    complianceLevel: "basic" | "enhanced" | "maximum";
    allowedDataClassifications: string[];
  };
}

export interface TelemetryContext {
  clinicId?: string;
  _userId?: string;
  sessionId?: string;
  requestId?: string;
  feature?: string;
  complianceLevel?: "public" | "internal" | "sensitive";
}

export interface HealthcareMetrics {
  // API metrics
  apiRequestDuration: number;
  apiRequestTotal: number;
  apiErrorRate: number;

  // Healthcare-specific metrics
  patientDataAccess: number;
  appointmentOperations: number;
  medicalRecordViews: number;
  complianceViolations: number;

  // Performance metrics
  databaseQueryTime: number;
  renderTime: number;
  memoryUsage: number;
}

export interface ComplianceEvent {
  eventType: "data_access" | "data_export" | "data_deletion" | "consent_update";
  timestamp: string;
  _userId: string;
  clinicId: string;
  dataClassification: string;
  complianceNotes: string;
  auditTrailId: string;
}

// Default configuration for healthcare telemetry
export const DEFAULT_HEALTHCARE_TELEMETRY_CONFIG: HealthcareTelemetryConfig = {
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_TRACING === "true",
  serviceName: "neonpro-healthcare-platform",
  serviceVersion: process.env.APP_VERSION || "1.0.0",
  environment: process.env.NODE_ENV || "development",

  lgpdCompliant: true,
  dataRetentionDays: 30, // LGPD requirement for healthcare data
  sensitiveDataSampling: false, // Never sample sensitive healthcare data

  exporters: {
    traces: {
      endpoint:
        process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
        "http://localhost:4318/v1/traces",
      apiKey: process.env.OTEL_API_KEY,
      batchSize: 100,
      timeoutMs: 5000,
    },
    metrics: {
      endpoint:
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
        "http://localhost:4318/v1/metrics",
      apiKey: process.env.OTEL_API_KEY,
      intervalMs: 30000,
    },
  },

  healthcare: {
    patientDataProtection: true,
    auditTrailRequired: true,
    complianceLevel: "maximum",
    allowedDataClassifications: ["public", "internal"],
  },
};

// Healthcare data classification levels
export enum DataClassification {
  PUBLIC = "public", // No sensitive data
  INTERNAL = "internal", // Internal business data
  PERSONAL = "personal", // Personal data (LGPD protected)
  MEDICAL = "medical", // Medical data (highest protection)
  FINANCIAL = "financial", // Financial data
}

// Compliance levels for operations
export enum ComplianceLevel {
  PUBLIC = "public", // No compliance restrictions
  INTERNAL = "internal", // Internal operations only
  SENSITIVE = "sensitive", // High compliance requirements
}

// Healthcare operation types
export enum HealthcareOperationType {
  READ = "read",
  WRITE = "write",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",
  IMPORT = "import",
  SHARE = "share",
  BACKUP = "backup",
}

// Sensitive data patterns for redaction
export const _SENSITIVE_DATA_PATTERNS = [
  // Brazilian documents
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
  /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g, // RG
  /\b\d{3}\.\d{2}\.\d{3}-\d{2}\b/g, // CNPJ

  // Healthcare identifiers
  /\b\d{15}\b/g, // SUS card
  /\bCRM[A-Z]{2}\s?\d{4,6}\b/gi, // CRM (medical license)
  /\bCRO[A-Z]{2}\s?\d{4,6}\b/gi, // CRO (dental license)

  // Contact information
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\(?(\d{2})\)?\s?9?\d{4}-?\d{4}\b/g, // Brazilian phone

  // Medical codes
  /\b[A-Z]\d{2}\.?\d{1,2}\b/g, // CID-10
  /\b\d{8}\.\d{2}\.\d{2}\b/g, // TUSS procedures
];

// Field names that contain sensitive data
export const _SENSITIVE_FIELD_NAMES = [
  "cpf",
  "rg",
  "cnpj",
  "email",
  "phone",
  "telefone",
  "celular",
  "endereco",
  "address",
  "cep",
  "birthdate",
  "nascimento",
  "password",
  "senha",
  "token",
  "secret",
  "chave",
  "medical_history",
  "historico_medico",
  "diagnosis",
  "diagnostico",
  "prescription",
  "receita",
  "treatment",
  "tratamento",
  "patient_name",
  "nome_paciente",
  "patient_data",
  "dados_paciente",
  "health_record",
  "prontuario",
  "sus_card",
  "cartao_sus",
  "crm",
  "cro",
  "professional_id",
  "id_profissional",
];

export { initializeGlobalTelemetry, getGlobalTelemetryManager } from "./index";
