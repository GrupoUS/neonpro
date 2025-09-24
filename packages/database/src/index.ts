/**
 * Centralized database exports for monorepo sharing
 * Healthcare-optimized database utilities and services
 */

// Core database clients - factory functions
export { createClient, createServiceClient } from './client';

// Prisma client
export { prisma } from './client';

// Database types
export type { SupabaseClient } from './client';
export type { Database } from './types/supabase-generated';

// Service implementations - only existing ones
export { AuditService } from './services/audit-service';
export { BaseService } from './services/base.service';
export { ConsentService } from './services/consent-service';
export { WebRTCSessionService } from './services/webrtc-session.service';

// Export types from services
export type { ConsentRecord, ConsentRequest } from './services/consent-service';

export type {
  AuditLogRequest,
  AuditSearchCriteria,
  AuditStatusType,
  ComplianceCheck,
  ComplianceReport,
  MedicalDataClassification,
  ResourceType,
} from './services/audit-service';

export type {
  SessionParticipant,
  SessionQualityMetrics,
  SessionRecording,
  WebRTCConfig,
} from './services/webrtc-session.service';

// Application services using repository pattern
export { PatientService } from './application';

// Repository implementations with dependency injection
export {
  AestheticRepository,
  AppointmentRepository,
  ConsentRepository,
  PatientRepository,
  RepositoryContainer,
} from './repositories';

// Type exports for aesthetic clinic features
export type * from './types/aesthetic-types';

// Utility functions
export { checkDatabaseHealth, closeDatabaseConnections } from './client';

export { sanitizeForAI } from "./utils/validation";
