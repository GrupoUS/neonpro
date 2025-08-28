/**
 * Healthcare Error Classification System
 * Comprehensive error handling for healthcare applications with LGPD compliance
 */

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  COMPLIANCE = 'compliance',
  PATIENT_DATA = 'patient_data',
  AUDIT_LOG = 'audit_log'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  clinicId?: string;
  patientId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface HealthcareError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  context: ErrorContext;
  patientImpact: boolean;
  complianceRisk: boolean;
  recoverable: boolean;
  timestamp: Date;
  originalError?: Error;
  stack?: string;
}

export interface ErrorHandlingStrategy {
  strategy: 'immediate_user_feedback' | 'exponential_backoff_retry' | 'immediate_escalation' | 'graceful_degradation';
  retry: boolean;
  maxRetries?: number;
  logging: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  notification: 'user_only' | 'admin_alert' | 'compliance_officer' | 'security_team';
  fallback?: string;
  auditTrail?: boolean;
}