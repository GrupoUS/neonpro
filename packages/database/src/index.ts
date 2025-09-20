/**
 * Centralized database exports for monorepo sharing
 * Healthcare-optimized database utilities and services
 */

// Core database clients - factory functions
export {
  createClient,
  createServiceClient,
  getSupabase,
  getSupabaseBrowser,
  getPrisma,
  // Legacy function exports for backward compatibility
  supabase,
  supabaseBrowser,
  prisma,
} from "./client.js";

// Database types
export type { Database } from "./types/supabase";
export type { SupabaseClient } from "./client.js";

// Base service class
export { BaseService } from "./services/base.service.js";

// Service implementations
export { AuditService } from "./services/audit.service.js";
export { ConsentService } from "./services/consent.service.js";
export { PatientService } from "./services/patient.service.js";
export { ClinicService } from "./services/clinic.service.js";
export { AppointmentService } from "./services/appointment.service.js";
export { MedicalRecordService } from "./services/medical-record.service.js";
export { NotificationService } from "./services/notification.service.js";
export { AnalyticsService } from "./services/analytics.service.js";
export { ComplianceService } from "./services/compliance.service.js";
export { IntegrationService } from "./services/integration.service.js";
export { BackupService } from "./services/backup.service.js";
export { SecurityService } from "./services/security.service.js";

// Utility functions
export {
  checkTablesExist,
  validateSchema,
  migrateData,
  checkDatabaseHealth,
  closeDatabaseConnections,
} from "./utils/validation.js";

export {
  validatePatientData,
  validateClinicData,
  validateAppointmentData,
  validateMedicalRecordData,
  validateConsentData,
  validateNotificationData,
  validateAnalyticsData,
  validateComplianceData,
  validateIntegrationData,
  validateBackupData,
  validateSecurityData,
} from "./utils/validation.js";

export {
  formatPatientData,
  formatClinicData,
  formatAppointmentData,
  formatMedicalRecordData,
  formatConsentData,
  formatNotificationData,
  formatAnalyticsData,
  formatComplianceData,
  formatIntegrationData,
  formatBackupData,
  formatSecurityData,
} from "./utils/formatting.js";

export {
  encryptSensitiveData,
  decryptSensitiveData,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  validateToken,
} from "./utils/encryption.js";

export {
  auditLog,
  createAuditEntry,
  getAuditTrail,
  cleanupOldAuditLogs,
} from "./utils/audit.js";

export {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear,
  cacheExists,
} from "./utils/cache.js";

export {
  rateLimitCheck,
  rateLimitReset,
  rateLimitStatus,
} from "./utils/rate-limit.js";

export {
  sendEmail,
  sendSMS,
  sendPushNotification,
  createNotificationTemplate,
} from "./utils/notifications.js";

export {
  generateReport,
  exportData,
  importData,
  scheduleBackup,
} from "./utils/reporting.js";

export {
  validateHIPAACompliance,
  validateGDPRCompliance,
  generateComplianceReport,
} from "./utils/compliance.js";

export {
  syncWithEHR,
  syncWithBilling,
  syncWithLab,
  validateIntegration,
} from "./utils/integrations.js";

export {
  performHealthCheck,
  monitorPerformance,
  alertOnIssues,
} from "./utils/monitoring.js";

export {
  backupDatabase,
  restoreDatabase,
  scheduleBackups,
  validateBackup,
} from "./utils/backup.js";

export {
  scanForVulnerabilities,
  updateSecurityPolicies,
  generateSecurityReport,
} from "./utils/security.js";

// Type definitions
export type {
  PatientData,
  ClinicData,
  AppointmentData,
  MedicalRecordData,
  ConsentData,
  NotificationData,
  AnalyticsData,
  ComplianceData,
  IntegrationData,
  BackupData,
  SecurityData,
  AuditLogData,
  CacheData,
  RateLimitData,
  ReportData,
  MonitoringData,
} from "./types/index.js";

// Enums
export {
  AppointmentStatus,
  ConsentStatus,
  MedicalDataClassification,
  NotificationPriority,
  AuditEventType,
  ComplianceStandard,
  IntegrationType,
  BackupType,
  SecurityLevel,
} from "./types/enums.js";

// Constants
export {
  DATABASE_CONSTANTS,
  VALIDATION_RULES,
  ENCRYPTION_CONFIG,
  AUDIT_CONFIG,
  CACHE_CONFIG,
  RATE_LIMIT_CONFIG,
  NOTIFICATION_CONFIG,
  REPORTING_CONFIG,
  COMPLIANCE_CONFIG,
  INTEGRATION_CONFIG,
  MONITORING_CONFIG,
  BACKUP_CONFIG,
  SECURITY_CONFIG,
} from "./constants/index.js";

// Hooks (if using React)
export {
  usePatient,
  useClinic,
  useAppointment,
  useMedicalRecord,
  useConsent,
  useNotification,
  useAnalytics,
  useCompliance,
  useIntegration,
  useBackup,
  useSecurity,
  useAudit,
  useCache,
  useRateLimit,
  useReporting,
  useMonitoring,
} from "./hooks/index.js";

// Middleware
export {
  authMiddleware,
  auditMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
  encryptionMiddleware,
  complianceMiddleware,
  monitoringMiddleware,
} from "./middleware/index.js";

// Error classes
export {
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ComplianceError,
  IntegrationError,
  BackupError,
  SecurityError,
} from "./errors/index.js";

// Migration utilities
export {
  runMigrations,
  rollbackMigration,
  getMigrationStatus,
  createMigration,
} from "./migrations/index.js";

// Test utilities
export {
  createTestClient,
  createMockData,
  cleanupTestData,
  seedTestDatabase,
} from "./test-utils/index.js";

// Development utilities
export {
  generateSchema,
  generateTypes,
  validateEnvironment,
  setupDevelopmentData,
} from "./dev-utils/index.js";