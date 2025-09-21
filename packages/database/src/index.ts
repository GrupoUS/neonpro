/**
 * Centralized database exports for monorepo sharing
 * Healthcare-optimized database utilities and services
 */

// Core database clients - factory functions
export {
  createClient,
  createServiceClient,
  // Legacy function exports for backward compatibility
  supabase,
  supabaseBrowser,
  prisma,
} from "./client";

// Database types
export type { Database } from "./types/supabase";
export type { SupabaseClient } from "./client";
export type * from "./types/audit.types";
export type * from "./types/index";

// Service implementations - only existing ones
export { AuditService } from "./services/audit-service";
export { ConsentService } from "./services/consent-service";
export { BaseService } from "./services/base.service";
export { WebRTCSessionService } from "./services/webrtc-session.service";

// Export types from services
export type { 
  ConsentRequest, 
  ConsentRecord 
} from "./services/consent-service";

export type {
  AuditLogRequest,
  ComplianceCheck,
  ComplianceReport,
  AuditSearchCriteria,
  MedicalDataClassification,
  ResourceType,
  AuditStatusType
} from "./services/audit-service";

export type {
  WebRTCConfig,
  SessionParticipant,
  SessionQualityMetrics,
  SessionRecording
} from "./services/webrtc-session.service";

// Application services using repository pattern
export { PatientService } from "./application";

// Repository implementations with dependency injection
export {
  PatientRepository,
  ConsentRepository,
  AppointmentRepository,
  RepositoryContainer
} from "./repositories";

// Utility functions
export {
  checkDatabaseHealth,
  closeDatabaseConnections,
} from "./client";