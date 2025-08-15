// NEONPRO HEALTHCARE - Critical Database Configuration for Patient Safety
// ≥9.9/10 Quality Standard for Healthcare Operations

export const HEALTHCARE_DB_CONFIG = {
  // São Paulo region for LGPD compliance
  region: 'sa-east-1',

  // Healthcare performance targets
  performance: {
    connectionTimeout: 5000, // 5s max for medical workflows
    queryTimeout: 10_000, // 10s max for patient data queries
    retryAttempts: 3, // Critical healthcare data retry
    retryDelay: 1000, // 1s between retries
  },

  // Patient data protection settings
  security: {
    enableRLS: true, // Mandatory Row Level Security
    auditLogging: true, // Full audit trail for LGPD
    encryptionAtRest: true, // Patient data encryption
    fieldLevelEncryption: ['medical_records', 'patient_notes'], // Sensitive fields
  },

  // Healthcare connection pooling
  connectionPool: {
    min: 2, // Minimum connections for emergency access
    max: 20, // Maximum for high-traffic clinic operations
    acquireTimeoutMillis: 5000, // 5s timeout for medical urgency
    idleTimeoutMillis: 300_000, // 5min idle timeout
    reapIntervalMillis: 1000, // 1s connection reaping
  },

  // Real-time configuration for healthcare workflows
  realtime: {
    enableHeartbeat: true,
    heartbeatIntervalMs: 30_000, // 30s heartbeat for patient monitoring
    reconnectDelayMs: 1000, // 1s reconnect for medical continuity
    maxReconnectAttempts: 10, // High retry for healthcare critical ops
  },

  // LGPD compliance settings
  lgpdCompliance: {
    dataRetentionDays: 1825, // 5 years medical record retention
    anonymizationSchedule: true, // Automatic data anonymization
    consentTracking: true, // Granular consent management
    dataPortability: true, // Patient data export rights
    rightToForget: true, // Patient data deletion rights
  },
} as const;

export type HealthcareDbConfig = typeof HEALTHCARE_DB_CONFIG;
