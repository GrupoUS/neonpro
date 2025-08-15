/**
 * 🏥 ENHANCED HEALTHCARE AUDIT TRAIL SYSTEM
 * 
 * Constitutional LGPD compliance for Brazilian healthcare with:
 * - Complete audit trail for all patient data access WITHOUT PHI exposure
 * - Regulatory reporting capabilities (ANVISA/CFM compliance)
 * - Real-time compliance violation monitoring and alerting
 * - <1 minute alert response performance requirement
 * - Constitutional patient privacy protection in audit logs
 * 
 * Quality Standard: ≥9.9/10 (Healthcare Regulatory Compliance)
 * Compliance: LGPD + ANVISA + CFM + Brazilian Constitutional Requirements
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// 🏥 HEALTHCARE AUDIT ACTION TYPES (Constitutional Classification)
export enum HealthcareAuditAction {
  // Patient Data Operations
  PATIENT_DATA_ACCESSED = 'patient_data_accessed',
  PATIENT_DATA_CREATED = 'patient_data_created',
  PATIENT_DATA_UPDATED = 'patient_data_updated',
  PATIENT_DATA_DELETED = 'patient_data_deleted',
  PATIENT_DATA_EXPORTED = 'patient_data_exported',
  
  // Medical Operations (ANVISA/CFM Compliance)
  MEDICAL_RECORD_ACCESSED = 'medical_record_accessed',
  TREATMENT_PLAN_CREATED = 'treatment_plan_created',
  PRESCRIPTION_ISSUED = 'prescription_issued',
  DIAGNOSTIC_PERFORMED = 'diagnostic_performed',
  
  // Consent Management (Constitutional)
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  CONSENT_VALIDATED = 'consent_validated',
  CONSENT_EXPIRED = 'consent_expired',
  
  // Security and Compliance
  LOGIN_ATTEMPT = 'login_attempt',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  ENCRYPTION_KEY_ROTATED = 'encryption_key_rotated',
  COMPLIANCE_VIOLATION_DETECTED = 'compliance_violation_detected',
  
  // Regulatory Reporting (ANVISA/CFM)
  REGULATORY_REPORT_GENERATED = 'regulatory_report_generated',
  ADVERSE_EVENT_REPORTED = 'adverse_event_reported',
  PROFESSIONAL_LICENSE_VERIFIED = 'professional_license_verified'
}

// 🚨 COMPLIANCE VIOLATION SEVERITY (Constitutional Alert Levels)
export enum ViolationSeverity {
  LOW = 'low',           // Minor policy violations
  MEDIUM = 'medium',     // Potential compliance issues
  HIGH = 'high',         // LGPD violations
  CRITICAL = 'critical'  // Constitutional violations, immediate action required
}

// 📋 AUDIT ENTRY SCHEMA (Constitutional Data Protection - NO PHI)
export const HealthcareAuditEntrySchema = z.object({
  id: z.string().uuid(),
  
  // Action Context (Constitutional Compliance)
  action: z.nativeEnum(HealthcareAuditAction),
  resource_type: z.string(),
  resource_id: z.string().uuid().optional(),
  
  // Anonymized Context (NO PHI - Patient Identifiable Information)
  clinic_id: z.string().uuid(),
  user_role: z.string(),
  
  // Constitutional Compliance Metadata
  legal_basis: z.string().optional(),
  regulatory_context: z.enum(['LGPD', 'ANVISA', 'CFM', 'SBIS', 'CONSTITUTIONAL']),
  
  // Performance and Quality Metrics
  duration_ms: z.number().optional(),
  success: z.boolean(),
  error_type: z.string().optional(),
  
  // Security Context (Anonymized)
  session_id: z.string().optional(),
  ip_hash: z.string().optional(), // Hashed IP for privacy
  user_agent_hash: z.string().optional(), // Hashed user agent
  
  // Compliance Violation Detection
  violation_detected: z.boolean().default(false),
  violation_severity: z.nativeEnum(ViolationSeverity).optional(),
  violation_details: z.string().optional(),
  
  // Constitutional Timestamps
  created_at: z.date(),
  
  // Metadata (NO PHI - Aggregated Data Only)
  metadata: z.record(z.any()).optional()
});

export type HealthcareAuditEntry = z.infer<typeof HealthcareAuditEntrySchema>;

/**
 * 🏥 ENHANCED HEALTHCARE AUDIT TRAIL MANAGER
 * 
 * Constitutional LGPD compliance with healthcare-specific requirements
 */export class HealthcareAuditTrailManager {
  private supabase: any;
  private alertResponseTarget = 60000; // <1 minute alert response (60,000ms)

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * 📋 LOG HEALTHCARE AUDIT ENTRY - Constitutional Compliance (NO PHI)
   */
  async logAuditEntry(entry: {
    action: HealthcareAuditAction;
    resource_type: string;
    resource_id?: string;
    clinic_id: string;
    user_id: string;
    user_role: string;
    legal_basis?: string;
    regulatory_context: 'LGPD' | 'ANVISA' | 'CFM' | 'SBIS' | 'CONSTITUTIONAL';
    duration_ms?: number;
    success: boolean;
    error_type?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; audit_id?: string; error?: string }> {
    const startTime = Date.now();

    try {
      // 🔒 CRITICAL: Anonymize all potentially identifying information
      const anonymizedEntry: Partial<HealthcareAuditEntry> = {
        id: crypto.randomUUID(),
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        
        // 🏥 Clinic context only (NO patient identifiers)
        clinic_id: entry.clinic_id,
        user_role: entry.user_role,
        
        // Constitutional compliance metadata
        legal_basis: entry.legal_basis,
        regulatory_context: entry.regulatory_context,
        
        // Performance tracking
        duration_ms: entry.duration_ms,
        success: entry.success,
        error_type: entry.error_type,
        
        // 🔐 Security context (anonymized for constitutional compliance)
        session_id: entry.session_id,
        ip_hash: entry.ip_address ? this.hashSensitiveData(entry.ip_address) : undefined,
        user_agent_hash: entry.user_agent ? this.hashSensitiveData(entry.user_agent) : undefined,
        
        created_at: new Date(),
        
        // 📊 Metadata (NO PHI - aggregated data only)
        metadata: this.sanitizeMetadata(entry.metadata)
      };

      // 🚨 COMPLIANCE VIOLATION DETECTION
      const violationCheck = await this.detectComplianceViolation(anonymizedEntry, entry.user_id);
      if (violationCheck.violationDetected) {
        anonymizedEntry.violation_detected = true;
        anonymizedEntry.violation_severity = violationCheck.severity;
        anonymizedEntry.violation_details = violationCheck.details;

        // 🚨 CRITICAL: Trigger immediate alert for violations
        await this.triggerComplianceAlert(violationCheck, entry.clinic_id);
      }

      // ⚡ High-Performance Audit Storage
      const { data, error } = await this.supabase
        .from('healthcare_audit_logs')
        .insert(anonymizedEntry)
        .select('id')
        .single();

      if (error) {
        throw new Error(`Audit logging failed: ${error.message}`);
      }

      // 📊 Performance Monitoring
      const auditDuration = Date.now() - startTime;
      if (auditDuration > 500) { // Audit should be fast and not impact operations
        console.warn(`Audit logging slow: ${auditDuration}ms`);
      }

      return { success: true, audit_id: data.id };

    } catch (error) {
      console.error('Audit logging failed:', error);
      
      // 🚨 CRITICAL: Audit failure is a serious compliance issue
      await this.logAuditFailure({
        original_action: entry.action,
        clinic_id: entry.clinic_id,
        error: error instanceof Error ? error.message : 'Unknown audit failure',
        duration_ms: Date.now() - startTime
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Audit logging failed' 
      };
    }
  }  /**
   * 🚨 COMPLIANCE VIOLATION DETECTION - Constitutional Healthcare Monitoring
   */
  private async detectComplianceViolation(
    auditEntry: Partial<HealthcareAuditEntry>,
    user_id: string
  ): Promise<{
    violationDetected: boolean;
    severity?: ViolationSeverity;
    details?: string;
  }> {
    try {
      const violations: Array<{severity: ViolationSeverity; details: string}> = [];

      // 🔍 Pattern 1: Unusual access patterns (Constitutional Privacy Protection)
      if (auditEntry.action === HealthcareAuditAction.PATIENT_DATA_ACCESSED) {
        const recentAccess = await this.supabase
          .from('healthcare_audit_logs')
          .select('created_at')
          .eq('action', HealthcareAuditAction.PATIENT_DATA_ACCESSED)
          .eq('clinic_id', auditEntry.clinic_id)
          .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
          .eq('metadata->user_context', user_id);

        if (recentAccess.data && recentAccess.data.length > 50) {
          violations.push({
            severity: ViolationSeverity.HIGH,
            details: 'Unusual high-frequency patient data access detected'
          });
        }
      }

      // 🔍 Pattern 2: After-hours access without emergency context
      const currentHour = new Date().getHours();
      if ((currentHour < 6 || currentHour > 22) && 
          auditEntry.action === HealthcareAuditAction.PATIENT_DATA_ACCESSED &&
          !auditEntry.metadata?.emergency_context) {
        violations.push({
          severity: ViolationSeverity.MEDIUM,
          details: 'After-hours patient data access without emergency justification'
        });
      }

      // 🔍 Pattern 3: Failed login attempts (Security Monitoring)
      if (auditEntry.action === HealthcareAuditAction.LOGIN_ATTEMPT && !auditEntry.success) {
        const recentFailures = await this.supabase
          .from('healthcare_audit_logs')
          .select('created_at')
          .eq('action', HealthcareAuditAction.LOGIN_ATTEMPT)
          .eq('success', false)
          .eq('ip_hash', auditEntry.ip_hash)
          .gte('created_at', new Date(Date.now() - 900000).toISOString()); // Last 15 minutes

        if (recentFailures.data && recentFailures.data.length > 5) {
          violations.push({
            severity: ViolationSeverity.CRITICAL,
            details: 'Multiple failed login attempts detected - potential security breach'
          });
        }
      }

      // 🔍 Pattern 4: Unauthorized access attempts (Constitutional Violation)
      if (auditEntry.action === HealthcareAuditAction.UNAUTHORIZED_ACCESS_ATTEMPT) {
        violations.push({
          severity: ViolationSeverity.CRITICAL,
          details: 'Unauthorized access attempt to patient data - constitutional violation'
        });
      }

      // 🔍 Pattern 5: Data export without proper consent
      if (auditEntry.action === HealthcareAuditAction.PATIENT_DATA_EXPORTED &&
          !auditEntry.metadata?.consent_verified) {
        violations.push({
          severity: ViolationSeverity.HIGH,
          details: 'Patient data export without verified consent - LGPD violation'
        });
      }

      if (violations.length === 0) {
        return { violationDetected: false };
      }

      // Return the most severe violation
      const mostSevere = violations.reduce((prev, current) => {
        const severityOrder = {
          [ViolationSeverity.LOW]: 1,
          [ViolationSeverity.MEDIUM]: 2,
          [ViolationSeverity.HIGH]: 3,
          [ViolationSeverity.CRITICAL]: 4
        };
        return severityOrder[current.severity] > severityOrder[prev.severity] ? current : prev;
      });

      return {
        violationDetected: true,
        severity: mostSevere.severity,
        details: violations.map(v => v.details).join('; ')
      };

    } catch (error) {
      console.error('Compliance violation detection failed:', error);
      return { violationDetected: false };
    }
  }  /**
   * 🚨 TRIGGER COMPLIANCE ALERT - Constitutional Healthcare Alert System (<1 minute response)
   */
  private async triggerComplianceAlert(
    violation: {
      violationDetected: boolean;
      severity?: ViolationSeverity;
      details?: string;
    },
    clinic_id: string
  ): Promise<void> {
    const alertStartTime = Date.now();

    try {
      if (!violation.violationDetected || !violation.severity) return;

      // 🚨 CRITICAL: Constitutional compliance violation detected
      const alertId = crypto.randomUUID();
      const alertEntry = {
        id: alertId,
        alert_type: 'COMPLIANCE_VIOLATION',
        severity: violation.severity,
        clinic_id: clinic_id,
        details: violation.details,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        
        // Constitutional alert context
        regulatory_context: 'HEALTHCARE_COMPLIANCE',
        requires_immediate_action: violation.severity === ViolationSeverity.CRITICAL,
        
        // Alert escalation based on severity
        escalation_level: this.getEscalationLevel(violation.severity),
        response_deadline: new Date(Date.now() + this.getResponseDeadline(violation.severity)).toISOString()
      };

      // ⚡ High-Priority Alert Storage
      await this.supabase
        .from('compliance_alerts')
        .insert(alertEntry);

      // 📧 Immediate Notification Based on Severity
      await this.sendImmediateNotification(alertEntry);

      // 📊 Alert Response Performance Monitoring
      const alertDuration = Date.now() - alertStartTime;
      if (alertDuration > this.alertResponseTarget) {
        console.error(`CRITICAL: Alert response exceeded target: ${alertDuration}ms > ${this.alertResponseTarget}ms`);
      }

      // 📋 Log alert creation in audit trail
      await this.logAuditEntry({
        action: HealthcareAuditAction.COMPLIANCE_VIOLATION_DETECTED,
        resource_type: 'compliance_alert',
        resource_id: alertId,
        clinic_id: clinic_id,
        user_id: 'SYSTEM',
        user_role: 'COMPLIANCE_MONITOR',
        regulatory_context: 'CONSTITUTIONAL',
        duration_ms: alertDuration,
        success: true,
        metadata: {
          severity: violation.severity,
          alert_id: alertId,
          response_target_met: alertDuration <= this.alertResponseTarget
        }
      });

    } catch (error) {
      console.error('CRITICAL: Compliance alert failed:', error);
      
      // 🚨 Emergency escalation for alert system failure
      await this.emergencyEscalation({
        error: error instanceof Error ? error.message : 'Alert system failure',
        clinic_id: clinic_id,
        original_violation: violation.details,
        duration_ms: Date.now() - alertStartTime
      });
    }
  }

  /**
   * 📶 GET ESCALATION LEVEL - Constitutional Alert Escalation
   */
  private getEscalationLevel(severity: ViolationSeverity): number {
    switch (severity) {
      case ViolationSeverity.LOW: return 1;
      case ViolationSeverity.MEDIUM: return 2;
      case ViolationSeverity.HIGH: return 3;
      case ViolationSeverity.CRITICAL: return 4; // Immediate escalation
      default: return 1;
    }
  }

  /**
   * ⏰ GET RESPONSE DEADLINE - Constitutional Response Requirements
   */
  private getResponseDeadline(severity: ViolationSeverity): number {
    switch (severity) {
      case ViolationSeverity.LOW: return 24 * 60 * 60 * 1000; // 24 hours
      case ViolationSeverity.MEDIUM: return 4 * 60 * 60 * 1000; // 4 hours
      case ViolationSeverity.HIGH: return 60 * 60 * 1000; // 1 hour
      case ViolationSeverity.CRITICAL: return 15 * 60 * 1000; // 15 minutes
      default: return 60 * 60 * 1000; // 1 hour default
    }
  }  /**
   * 📧 SEND IMMEDIATE NOTIFICATION - Constitutional Alert Distribution
   */
  private async sendImmediateNotification(alertEntry: any): Promise<void> {
    try {
      // 🚨 Real-time notification channels based on severity
      const notification = {
        id: crypto.randomUUID(),
        alert_id: alertEntry.id,
        type: 'COMPLIANCE_ALERT',
        severity: alertEntry.severity,
        clinic_id: alertEntry.clinic_id,
        
        // Constitutional notification content (NO PHI)
        subject: `Healthcare Compliance Alert - ${alertEntry.severity} Severity`,
        message: `Compliance violation detected in healthcare system. Alert ID: ${alertEntry.id}`,
        details: alertEntry.details,
        
        // Notification channels based on severity
        channels: this.getNotificationChannels(alertEntry.severity),
        
        created_at: new Date().toISOString(),
        status: 'PENDING'
      };

      // ⚡ High-priority notification queue
      await this.supabase
        .from('notification_queue')
        .insert(notification);

      // 🔔 For CRITICAL violations, also trigger real-time alerts
      if (alertEntry.severity === ViolationSeverity.CRITICAL) {
        await this.triggerRealTimeAlert(notification);
      }

    } catch (error) {
      console.error('Notification sending failed:', error);
    }
  }

  /**
   * 📱 GET NOTIFICATION CHANNELS - Constitutional Alert Distribution
   */
  private getNotificationChannels(severity: ViolationSeverity): string[] {
    switch (severity) {
      case ViolationSeverity.LOW:
        return ['dashboard', 'weekly_report'];
      case ViolationSeverity.MEDIUM:
        return ['dashboard', 'email', 'daily_report'];
      case ViolationSeverity.HIGH:
        return ['dashboard', 'email', 'sms', 'immediate_report'];
      case ViolationSeverity.CRITICAL:
        return ['dashboard', 'email', 'sms', 'phone_call', 'emergency_notification'];
      default:
        return ['dashboard'];
    }
  }

  /**
   * 🚨 TRIGGER REAL-TIME ALERT - Constitutional Emergency Response
   */
  private async triggerRealTimeAlert(notification: any): Promise<void> {
    try {
      // 📡 Real-time alert via Supabase channels
      await this.supabase
        .channel(`compliance-alerts-${notification.clinic_id}`)
        .send({
          type: 'broadcast',
          event: 'critical_compliance_violation',
          payload: {
            alert_id: notification.alert_id,
            severity: notification.severity,
            message: notification.message,
            timestamp: notification.created_at
          }
        });

    } catch (error) {
      console.error('Real-time alert failed:', error);
    }
  }

  /**
   * 🆘 EMERGENCY ESCALATION - Constitutional System Failure Response
   */
  private async emergencyEscalation(context: {
    error: string;
    clinic_id: string;
    original_violation?: string;
    duration_ms: number;
  }): Promise<void> {
    try {
      // 🚨 CRITICAL: Audit/Alert system failure is a constitutional compliance emergency
      const emergencyAlert = {
        id: crypto.randomUUID(),
        type: 'SYSTEM_FAILURE',
        severity: ViolationSeverity.CRITICAL,
        clinic_id: context.clinic_id,
        error: context.error,
        original_violation: context.original_violation,
        created_at: new Date().toISOString(),
        requires_immediate_intervention: true,
        constitutional_impact: 'AUDIT_SYSTEM_FAILURE'
      };

      // 📞 Emergency notification (highest priority)
      await this.supabase
        .from('emergency_alerts')
        .insert(emergencyAlert);

      console.error('CONSTITUTIONAL EMERGENCY: Audit system failure escalated', emergencyAlert);

    } catch (error) {
      // 💥 If even emergency escalation fails, log to console as last resort
      console.error('CRITICAL SYSTEM FAILURE: Emergency escalation failed', {
        original_error: context.error,
        escalation_error: error instanceof Error ? error.message : 'Unknown',
        clinic_id: context.clinic_id,
        timestamp: new Date().toISOString()
      });
    }
  }