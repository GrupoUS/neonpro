// Compliance & Audit Module (Phase 4)
// Generic action/actor audit logging with healthcare compliance validation

export * from './compliance-audit-service'
export * from './types'
export * from './validators'

// Re-export main classes for convenience
export { ComplianceAuditService } from './compliance-audit-service'
export { ANVISAValidator, CFMValidator, ComplianceValidator, LGPDValidator } from './validators'

// Re-export key types for convenience
export type {
  ActorType,
  AuditAction,
  AuditSearchFilters,
  ComplianceFramework,
  ComplianceReport,
  ComplianceStatus,
  ComplianceViolation,
  ConsentReference,
  GenericAuditEvent,
  RiskLevel,
} from './types'
