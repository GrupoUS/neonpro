// Generic Audit Types for Compliance & Healthcare (Phase 4)
// Complements existing AuditService patterns with generic action/actor model

export type ComplianceFramework = "LGPD" | "ANVISA" | "CFM" | "HIPAA" | "GDPR";

export type AuditAction =
  // Data operations
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  // User actions
  | "LOGIN"
  | "LOGOUT"
  | "ACCESS"
  | "MODIFY"
  // Healthcare specific
  | "PRESCRIBE"
  | "DIAGNOSE"
  | "CONSENT_GRANT"
  | "CONSENT_REVOKE"
  // System actions
  | "BACKUP"
  | "RESTORE"
  | "MIGRATE"
  | "AUDIT";

export type ActorType =
  | "PATIENT"
  | "DOCTOR"
  | "NURSE"
  | "ADMIN"
  | "SYSTEM"
  | "EXTERNAL_API"
  | "ANONYMOUS";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ComplianceStatus =
  | "COMPLIANT"
  | "NON_COMPLIANT"
  | "PENDING_REVIEW"
  | "UNKNOWN";

export interface ConsentReference {
  /** Unique consent ID */
  id: string;
  /** Type of consent (data_processing, treatment, etc.) */
  type: string;
  /** When consent was granted */
  grantedAt: string;
  /** When consent expires (optional) */
  expiresAt?: string;
  /** Consent status */
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "PENDING";
  /** Framework this consent applies to */
  framework: ComplianceFramework;
}

export interface GenericAuditEvent {
  /** Unique audit event ID */
  id: string;
  /** Action performed */
  action: AuditAction;
  /** Who performed the action */
  actor: {
    id: string;
    type: ActorType;
    name?: string;
    email?: string;
    role?: string;
  };
  /** When the action occurred */
  timestamp: string;
  /** Resource affected by the action */
  resource: {
    type: string;
    id: string;
    name?: string;
    category?: string;
  };
  /** Clinic/organization context */
  clinicId: string;
  /** Related consent reference (healthcare compliance) */
  consentRef?: ConsentReference;
  /** Risk assessment */
  riskLevel: RiskLevel;
  /** Compliance status */
  complianceStatus: ComplianceStatus;
  /** Additional context */
  metadata?: Record<string, any>;
  /** IP address where action originated */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Session ID if applicable */
  sessionId?: string;
  /** Applicable compliance frameworks */
  frameworks: ComplianceFramework[];
}

export interface ComplianceViolation {
  /** Violation ID */
  id: string;
  /** Which framework was violated */
  framework: ComplianceFramework;
  /** Severity of violation */
  severity: RiskLevel;
  /** Description of violation */
  description: string;
  /** Suggested remediation */
  remediation?: string;
  /** Related audit event */
  auditEventId: string;
}

export interface ComplianceReport {
  /** Report period */
  period: {
    start: string;
    end: string;
  };
  /** Clinic this report covers */
  clinicId: string;
  /** Total events audited */
  totalEvents: number;
  /** Events by compliance status */
  statusBreakdown: Record<ComplianceStatus, number>;
  /** Events by risk level */
  riskBreakdown: Record<RiskLevel, number>;
  /** Violations found */
  violations: ComplianceViolation[];
  /** Compliance score (0-100) */
  complianceScore: number;
  /** Frameworks assessed */
  frameworks: ComplianceFramework[];
  /** Generated at */
  generatedAt: string;
}

export interface AuditSearchFilters {
  /** Filter by action type */
  action?: AuditAction;
  /** Filter by actor type */
  actorType?: ActorType;
  /** Filter by actor ID */
  actorId?: string;
  /** Filter by resource type */
  resourceType?: string;
  /** Filter by resource ID */
  resourceId?: string;
  /** Filter by risk level */
  riskLevel?: RiskLevel;
  /** Filter by compliance status */
  complianceStatus?: ComplianceStatus;
  /** Filter by framework */
  framework?: ComplianceFramework;
  /** Date range start */
  startDate?: string;
  /** Date range end */
  endDate?: string;
  /** Session ID */
  sessionId?: string;
  /** Consent reference ID */
  consentRefId?: string;
}
