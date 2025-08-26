/**
 * @file Audit logging system types
 * @description Type definitions for audit logging and compliance tracking
 */

// Audit log entry interface
interface AuditLogEntry {
  additional_metadata?: Record<string, unknown>;
  action: string;
  compliance_category: "anvisa" | "cfm" | "general" | "lgpd" | "security";
  id?: string;
  ip_address: string;
  new_values?: Record<string, unknown>;
  old_values?: Record<string, unknown>;
  resource_id: string;
  resource_type: string;
  risk_level: "critical" | "high" | "low" | "medium";
  session_id?: string;
  timestamp: Date;
  user_agent: string;
  user_id: string;
  user_role: string;
}

// Compliance event interface
interface ComplianceEvent {
  affected_data_subjects?: string[];
  compliance_framework: "ANVISA" | "CFM" | "LGPD";
  description: string;
  event_type: string;
  remediation_deadline?: Date;
  remediation_required: boolean;
  severity: "critical" | "error" | "info" | "warning";
  user_id?: string;
}

// Audit log filters interface
interface AuditLogFilters {
  compliance_category?: string;
  end_date?: Date;
  limit?: number;
  resource_type?: string;
  risk_level?: string;
  start_date?: Date;
  user_id?: string;
}

// Compliance metrics interface
interface ComplianceMetrics {
  anvisa?: {
    adverse_events: number;
    product_usage: number;
  };
  cfm?: {
    digital_signatures: number;
    medical_actions: number;
    telemedicine_sessions: number;
  };
  lgpd?: {
    consent_operations: number;
    data_subject_requests: number;
    patient_data_accesses: number;
  };
}

// Audit statistics interface
interface AuditStatistics {
  by_action_type: Record<string, number>;
  by_compliance_category: Record<string, number>;
  by_risk_level: Record<string, number>;
  by_user_role: Record<string, number>;
  critical_events: number;
  total_actions: number;
  unique_users: number;
}

// Audit report interface
interface AuditReport {
  audit_logs_sample: AuditLogEntry[];
  compliance_metrics: ComplianceMetrics;
  framework: string;
  period: {
    end: Date;
    start: Date;
  };
  recommendations: string[];
  statistics: AuditStatistics;
}

// Risk level type
type RiskLevel = "critical" | "high" | "low" | "medium";

// Access type for patient data
type AccessType = "delete" | "edit" | "export" | "view";

// Request type for data subject rights
type DataSubjectRequestType = "access" | "consent_withdrawal" | "deletion" | "portability" | "rectification";

// Processing status type
type ProcessingStatus = "completed" | "processing" | "received" | "rejected";

export {
  type AccessType,
  type AuditLogEntry,
  type AuditLogFilters,
  type AuditReport,
  type AuditStatistics,
  type ComplianceEvent,
  type ComplianceMetrics,
  type DataSubjectRequestType,
  type ProcessingStatus,
  type RiskLevel,
};