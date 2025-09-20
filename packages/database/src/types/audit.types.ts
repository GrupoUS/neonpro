// Audit types for the database service
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details?: any;
}

export interface AuditLogRequest {
  userId: string;
  action?: string;
  resource?: string;
  details?: any;
  eventType?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  clinicId?: string;
  metadata?: any;
  sessionId?: string;
  userRole?: "doctor" | "patient" | "nurse" | "admin" | "system";
  dataClassification?: MedicalDataClassification;
}

export interface ComplianceCheck {
  status?: string;
  risk_level?: string;
  violations: string[];
  riskLevel: string;
  isCompliant: boolean;
}

export interface AuditStatus {
  status?: string;
  risk_level?: string;
  violations?: string[];
}

export interface ComplianceReport {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalEvents: number;
    compliantEvents: number;
    nonCompliantEvents: number;
    complianceRate: number;
  };
  riskLevels: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  violations: Record<string, number>;
  recommendations: string[];
}

export interface AuditSearchCriteria {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  clinicId?: string;
  sessionIds?: string[];
  userIds?: string[];
  eventTypes?: string[];
  dataClassifications?: string[];
  complianceStatus?: boolean;
  limit?: number;
}

export interface MedicalDataClassification {
  id: string;
  dataType: string;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retentionPeriod: number;
  encryptionRequired: boolean;
  accessControls: string[];
  complianceStandards: string[];
}

export interface RTCAuditLogEntry {
  id: string;
  sessionId?: string;
  userId: string;
  eventType: string;
  userRole: string;
  dataClassification: string;
  description?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  clinicId?: string;
  metadata?: Record<string, unknown>;
  complianceCheck: {
    isCompliant: boolean;
    violations: string[];
    riskLevel: string;
  };
}

// Audit status types
export type ResourceType = 'PATIENT_RECORD' | 'PATIENT_DATA' | 'PATIENT_CONSENT' | 'APPOINTMENT' | 'COMMUNICATION' | 'AI_PREDICTION' | 'AI_MODEL_PERFORMANCE' | 'TELEMEDICINE_SESSION' | 'PRESCRIPTION' | 'COMPLIANCE_REPORT' | 'REPORT' | 'SYSTEM_CONFIG' | 'USER_ACCOUNT';
export type AuditStatusType = 'SUCCESS' | 'FAILED' | 'FAILURE' | 'PARTIAL_SUCCESS' | 'BLOCKED';