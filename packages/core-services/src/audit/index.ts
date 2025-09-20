// Compliance & Audit Module (Phase 4)
// Generic action/actor audit logging with healthcare compliance validation

export * from "./types";
export * from "./validators";
export * from "./compliance-audit-service";

// Re-export main classes for convenience
export { ComplianceAuditService } from "./compliance-audit-service";
export {
  ComplianceValidator,
  LGPDValidator,
  ANVISAValidator,
  CFMValidator,
} from "./validators";

// Re-export key types for convenience
export type {
  GenericAuditEvent,
  ConsentReference,
  ComplianceReport,
  AuditSearchFilters,
  ComplianceViolation,
  ComplianceFramework,
  AuditAction,
  ActorType,
  RiskLevel,
  ComplianceStatus,
} from "./types";
