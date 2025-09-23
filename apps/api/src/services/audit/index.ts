/**
 * Audit Services Index
 *
 * Exports all audit-related services and utilities
 */

export { AgentAuditService } from './agent-audit-service';
export type { AuditEvent, AuditQueryOptions } from './agent-audit-service';

// Audit event types
export const AUDIT_EVENTS = {
  DATA_ACCESS: 'data_access',
  AI_QUERY: 'ai_query',
  SESSION_CREATE: 'session_create',
  SESSION_UPDATE: 'session_update',
  SESSION_DELETE: 'session_delete',
  PERMISSION_CHECK: 'permission_check',
  FEEDBACK_SUBMIT: 'feedback_submit',
} as const;

// Sensitivity levels
export const SENSITIVITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Data retention policies
export const RETENTION_POLICIES = {
  PATIENT_DATA: '25_years',
  FINANCIAL_DATA: '7_years',
  AGENT_DATA: '30_days',
  AUDIT_LOGS: '90_days',
  PERMISSION_LOGS: '90_days',
} as const;

// Compliance categories
export const COMPLIANCE_CATEGORIES = {
  LGPD: 'lgpd',
  HIPAA: 'hipaa',
  GDPR: 'gdpr',
  ANVISA: 'anvisa',
  CFM: 'cfm',
} as const;

// Helper functions for audit logging
export const createAuditContext = (
  _request: any,
): {
  ipAddress: string;
  userAgent: string;
} => {
  return {
    ipAddress: request.headers?.['x-forwarded-for']
      || request.headers?.['x-real-ip']
      || request.connection?.remoteAddress
      || request.socket?.remoteAddress
      || 'unknown',
    userAgent: request.headers?.['user-agent'] || 'unknown',
  };
};

export const sanitizeForAudit = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'credit_card',
    'ssn',
    'social_security',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

export const formatAuditMetadata = (metadata: Record<string, any>): string => {
  try {
    return JSON.stringify(sanitizeForAudit(metadata));
  } catch {
    return '[UNPARSEABLE_METADATA]';
  }
};
