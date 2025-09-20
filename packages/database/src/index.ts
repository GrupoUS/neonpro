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
} from "./client.js";

// Database types
export type { Database } from "./types/supabase";
export type { SupabaseClient } from "./client";
export type * from "./types/audit.types.js";
export type * from "./types/index.js";

// Service implementations - only existing ones
export { AuditService } from "./services/audit-service";
export { ConsentService } from "./services/consent-service";
export { BaseService } from "./services/base.service";

// Export types from services
export type { 
  ConsentRequest, 
  ConsentRecord 
} from "./services/consent-service.js";

export type {
  AuditLogRequest,
  ComplianceCheck,
  ComplianceReport,
  AuditSearchCriteria,
  MedicalDataClassification,
  ResourceType,
  AuditStatusType
} from "./services/audit-service";

// Utility functions
export {
  checkDatabaseHealth,
  closeDatabaseConnections,
} from "./client.js";