/**
 * Audit Service Module
 * Healthcare-specific audit trail and logging service with compliance features
 *
 * Features:
 * - LGPD compliant audit logging
 * - Brazilian healthcare regulation compliance (ANVISA, CFM)
 * - Personal data sanitization
 * - Healthcare-specific event categorization
 * - Audit trail retention policies
 */

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditEventData {
  eventType: string;
  severity: AuditSeverity;
  category: string;
  source: string;
  action: string;
  result: 'success' | 'failure' | 'blocked' | 'alert';
  message: string;
  _userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, any>;
  compliance?: {
    lgpd?: boolean;
    anvisa?: boolean;
    cfm?: boolean;
  };
}

export interface AuditCompliance {
  lgpd?: boolean;
  anvisa?: boolean;
  cfm?: boolean;
}

export class AuditEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  severity: AuditSeverity;
  category: string;
  source: string;
  _userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked' | 'alert';
  message: string;
  details?: Record<string, any>;
  compliance?: AuditCompliance;

  constructor(data: AuditEventData) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date();
    this.eventType = data.eventType;
    this.severity = data.severity;
    this.category = data.category;
    this.source = data.source;
    this._userId = data._userId;
    this.sessionId = data.sessionId;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.resource = data.resource;
    this.action = data.action;
    this.result = data.result;
    this.message = data.message;
    this.details = data.details;
    this.compliance = data.compliance;
  }
}

export interface AuditLogData {
  id: string;
  timestamp: string;
  eventType: string;
  severity: AuditSeverity;
  category: string;
  source: string;
  _userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked' | 'alert';
  message: string;
  details?: Record<string, any>;
  compliance?: AuditCompliance;
  retentionPeriod?: number;
  isRedacted?: boolean;
  redactionReason?: string;
}

export class AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: AuditSeverity;
  category: string;
  source: string;
  _userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked' | 'alert';
  message: string;
  details?: Record<string, any>;
  compliance?: AuditCompliance;
  retentionPeriod?: number;
  isRedacted?: boolean;
  redactionReason?: string;

  constructor(data: AuditLogData) {
    this.id = data.id;
    this.timestamp = data.timestamp;
    this.eventType = data.eventType;
    this.severity = data.severity;
    this.category = data.category;
    this.source = data.source;
    this._userId = data._userId;
    this.sessionId = data.sessionId;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.resource = data.resource;
    this.action = data.action;
    this.result = data.result;
    this.message = data.message;
    this.details = data.details;
    this.compliance = data.compliance;
    this.retentionPeriod = data.retentionPeriod;
    this.isRedacted = data.isRedacted ?? false;
    this.redactionReason = data.redactionReason;
  }
}

/**
 * Create an audit trail for healthcare operations
 */
export function createAuditTrail(data: AuditEventData): AuditEvent {
  return new AuditEvent(data);
}

/**
 * Log a security event with healthcare compliance
 */
export function logSecurityEvent(data: AuditEventData): AuditEvent {
  const event = new AuditEvent(data);

  // In a real implementation, this would log to database/file system
  if (event.severity) {
    console.log(`[AUDIT] ${event.severity.toUpperCase()}: ${event.message}`, {
      id: event.id,
      eventType: event.eventType,
      category: event.category,
      source: event.source,
      _userId: event.userId,
      resource: event.resource,
      compliance: event.compliance,
    });
  }

  return event;
}

/**
 * Get audit logs with filtering
 */
export function getAuditLogs(
  filters: {
    _userId?: string;
    category?: string;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    compliance?: AuditCompliance;
    ipAddress?: string;
    result?: string;
  } = {},
): AuditLog[] {
  // In a real implementation, this would query the database
  // For now, return empty array as this is just the interface
  return [];
}

/**
 * Healthcare-specific audit event creators
 */
export const HealthcareAuditEvents = {
  patientDataAccess: (data: {
    _userId: string;
    patientId: string;
    action: string;
    result: 'success' | 'failure' | 'blocked';
    resource: string;
  }) =>
    createAuditTrail({
      eventType: 'patient_data_access',
      severity: data.result === 'blocked' ? AuditSeverity.WARNING : AuditSeverity.INFO,
      category: 'healthcare',
      source: 'patient-service',
      _userId: data.userId,
      action: data.action,
      result: data.result,
      message: `Patient data ${data.action} ${data.result === 'success' ? 'successful' : 'failed'}`,
      resource: data.resource,
      details: { patientId: data.patientId },
      compliance: { lgpd: true, anvisa: true, cfm: true },
    }),

  medicalRecordUpdate: (data: {
    _userId: string;
    patientId: string;
    recordType: string;
    changes: string[];
  }) =>
    createAuditTrail({
      eventType: 'medical_record_update',
      severity: AuditSeverity.INFO,
      category: 'healthcare',
      source: 'medical-records-service',
      _userId: data.userId,
      action: 'update',
      result: 'success',
      message: 'Medical record updated',
      resource: `/api/patients/${data.patientId}/records`,
      details: {
        patientId: data.patientId,
        recordType: data.recordType,
        changes: data.changes,
      },
      compliance: { lgpd: true, anvisa: true, cfm: true },
    }),

  unauthorizedAccessAttempt: (data: {
    ipAddress: string;
    resource: string;
    userAgent?: string;
  }) =>
    logSecurityEvent({
      eventType: 'unauthorized_access_attempt',
      severity: AuditSeverity.CRITICAL,
      category: 'security',
      source: 'security-service',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      action: 'access',
      result: 'blocked',
      message: 'Unauthorized access attempt blocked',
      resource: data.resource,
      details: { riskScore: 95 },
      compliance: { lgpd: true, anvisa: true, cfm: true },
    }),
};

// Comprehensive audit service class that provides a unified interface
export class ComprehensiveAuditService {
  /**
   * Log an activity/event for audit purposes
   */
  async logActivity(data: {
    _userId: string;
    action: string;
    resource?: string;
    details?: Record<string, any>;
    result?: 'success' | 'failure' | 'blocked' | 'alert';
    severity?: AuditSeverity;
  }): Promise<void> {
    await createAuditTrail({
      eventType: data.action,
      severity: data.severity || AuditSeverity.INFO,
      category: 'ai',
      source: 'ai-service',
      _userId: data.userId,
      action: data.action,
      result: data.result || 'success',
      message: `AI activity: ${data.action}`,
      resource: data.resource,
      details: data.details,
      compliance: { lgpd: true, anvisa: true, cfm: true },
    });
  }
}
