/**
 * LGPD Audit Logging Service for Calendar Operations
 * Implements comprehensive audit trail requirements as per LGPD Art. 37º
 */

import { supabase } from '@/integrations/supabase/client';
import type { CalendarAppointment } from '@/services/appointments.service';
import type {
  CalendarLGPDPurpose,
  ConsentValidationResult,
  DataMinimizationLevel,
} from './calendar-consent.service';

// LGPD Audit Actions
export enum LGPDAuditAction {
  // Consent actions
  CONSENT_VALIDATED = 'consent_validated',
  CONSENT_DENIED = 'consent_denied',
  CONSENT_EXPIRED = 'consent_expired',
  CONSENT_WITHDRAWN = 'consent_withdrawn',

  // Data access actions
  APPOINTMENT_ACCESSED = 'appointment_accessed',
  APPOINTMENT_VIEWED = 'appointment_viewed',
  APPOINTMENT_LIST_VIEWED = 'appointment_list_viewed',
  CALENDAR_VIEWED = 'calendar_viewed',

  // Data modification actions
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_DELETED = 'appointment_deleted',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',

  // Data processing actions
  DATA_MINIMIZED = 'data_minimized',
  DATA_EXPORTED = 'data_exported',
  DATA_SHARED = 'data_shared',
  DATA_ANONYMIZED = 'data_anonymmized',

  // Compliance actions
  COMPLIANCE_CHECK = 'compliance_check',
  RISK_ASSESSMENT = 'risk_assessment',
  DATA_SUBJECT_REQUEST = 'data_subject_request',
  BREACH_REPORTED = 'breach_reported',

  // System actions
  BATCH_PROCESSED = 'batch_processed',
  ERROR_OCCURRED = 'error_occurred',
  SECURITY_EVENT = 'security_event',
}

// LGPD Audit Log Entry Schema
export interface LGPDAuditLog {
  id?: string;
  patientId: string;
  action: LGPDAuditAction;
  dataCategory: string[];
  purpose: CalendarLGPDPurpose;
  userId: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details: AuditDetails;
  complianceStatus: 'compliant' | 'partial' | 'non_compliant' | 'unknown';
  legalBasis: string;
  retentionDays: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Detailed audit information
export interface AuditDetails {
  appointmentId?: string;
  appointmentStatus?: string;
  consentId?: string;
  consentLevel?: DataMinimizationLevel;
  dataMinimizationApplied?: boolean;
  dataElementsAccessed?: string[];
  processingLocation?: string;
  thirdPartyInvolved?: boolean;
  automatedDecision?: boolean;
  consentResult?: ConsentValidationResult;
  errorDetails?: string;
  securityContext?: {
    authenticationMethod: string;
    sessionDuration: number;
    privilegeLevel: string;
  };
  riskAssessment?: {
    identifiedRisks: string[];
    mitigationApplied: string[];
    residualRisk: 'low' | 'medium' | 'high';
  };
}

// Audit filtering and search criteria
export interface AuditFilter {
  patientId?: string;
  userId?: string;
  action?: LGPDAuditAction[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  complianceStatus?: ('compliant' | 'partial' | 'non_compliant')[];
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  purpose?: CalendarLGPDPurpose[];
}

// Audit aggregation and reporting
export interface AuditReport {
  totalOperations: number;
  compliantOperations: number;
  nonCompliantOperations: number;
  highRiskOperations: number;
  averageComplianceScore: number;
  topRisks: Array<{
    risk: string;
    count: number;
    severity: string;
  }>;
  userActivity: Array<{
    userId: string;
    userRole: string;
    operationCount: number;
    lastActivity: Date;
  }>;
  dataAccessPatterns: Array<{
    dataCategory: string;
    accessCount: number;
    averageRiskLevel: string;
  }>;
  recommendations: string[];
  generatedAt: Date;
}

/**
 * LGPD Audit Logging Service for Calendar Operations
 */
export class CalendarLGPDAuditService {
  private supabase = supabase;
  private readonly DEFAULT_RETENTION_DAYS = 2555; // 7 years for medical data

  /**
   * Log calendar appointment access with full LGPD compliance
   */
  async logAppointmentAccess(
    appointment: CalendarAppointment,
    userId: string,
    userRole: string,
    consentResult: ConsentValidationResult,
    minimizationLevel: DataMinimizationLevel,
    context: 'view' | 'edit' | 'export' = 'view',
    metadata?: Partial<AuditDetails>,
  ): Promise<string> {
    try {
      const auditLog: LGPDAuditLog = {
        patientId: appointment.id, // Using appointment ID as patient identifier proxy
        action: context === 'view'
          ? LGPDAuditAction.APPOINTMENT_VIEWED
          : context === 'edit'
          ? LGPDAuditAction.APPOINTMENT_UPDATED
          : LGPDAuditAction.DATA_EXPORTED,
        dataCategory: this.determineDataCategories(minimizationLevel),
        purpose: CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
        userId,
        userRole,
        timestamp: new Date(),
        details: {
          appointmentId: appointment.id,
          appointmentStatus: appointment.status,
          consentId: consentResult.consentId,
          consentLevel: minimizationLevel,
          dataMinimizationApplied: minimizationLevel !== DataMinimizationLevel.FULL,
          dataElementsAccessed: this.getAccessedDataElements(minimizationLevel),
          processingLocation: 'calendar_component',
          consentResult,
          ...metadata,
        },
        complianceStatus: this.determineComplianceStatus(
          consentResult,
          minimizationLevel,
        ),
        legalBasis: consentResult.legalBasis,
        retentionDays: this.calculateRetentionPeriod(appointment.status),
        riskLevel: this.assessRiskLevel(
          consentResult,
          minimizationLevel,
          context,
        ),
      };

      const { data: log, error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(auditLog)
        .select('id')
        .single();

      if (error) {
        console.error('Error logging appointment access:', error);
        throw new Error(`Failed to log audit: ${error.message}`);
      }

      return log.id;
    } catch (error) {
      console.error('Error in logAppointmentAccess:', error);
      throw error;
    }
  }

  /**
   * Log calendar batch operations with comprehensive audit trail
   */
  async logBatchOperation(
    appointments: CalendarAppointment[],
    userId: string,
    userRole: string,
    action: LGPDAuditAction,
    purpose: CalendarLGPDPurpose,
    consentResults: ConsentValidationResult[],
    minimizationResults: any[],
    metadata?: Partial<AuditDetails>,
  ): Promise<string> {
    try {
      const auditLog: LGPDAuditLog = {
        patientId: 'batch_operation',
        action,
        dataCategory: ['appointment_data', 'batch_processing'],
        purpose,
        userId,
        userRole,
        timestamp: new Date(),
        details: {
          processingLocation: 'calendar_component',
          dataElementsAccessed: [
            'appointment_list',
            'consent_status',
            'minimization_level',
          ],
          thirdPartyInvolved: false,
          automatedDecision: true,
          riskAssessment: {
            identifiedRisks: this.identifyBatchRisks(
              consentResults,
              minimizationResults,
            ),
            mitigationApplied: ['data_minimization', 'consent_validation'],
            residualRisk: this.calculateBatchResidualRisk(consentResults),
          },
          ...metadata,
        },
        complianceStatus: this.determineBatchComplianceStatus(consentResults),
        legalBasis: 'LGPD Art. 7º, V - Execução de contrato',
        retentionDays: this.DEFAULT_RETENTION_DAYS,
        riskLevel: this.assessBatchRiskLevel(
          consentResults,
          minimizationResults,
        ),
      };

      const { data: log, error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(auditLog)
        .select('id')
        .single();

      if (error) {
        console.error('Error logging batch operation:', error);
        throw new Error(`Failed to log batch audit: ${error.message}`);
      }

      return log.id;
    } catch (error) {
      console.error('Error in logBatchOperation:', error);
      throw error;
    }
  }

  /**
   * Log consent validation events
   */
  async logConsentValidation(
    patientId: string,
    userId: string,
    userRole: string,
    purpose: CalendarLGPDPurpose,
    consentResult: ConsentValidationResult,
    context: 'calendar_view' | 'appointment_access' | 'data_export',
  ): Promise<string> {
    try {
      const auditLog: LGPDAuditLog = {
        patientId,
        action: consentResult.isValid
          ? LGPDAuditAction.CONSENT_VALIDATED
          : LGPDAuditAction.CONSENT_DENIED,
        dataCategory: ['consent_data', 'personal_data'],
        purpose,
        userId,
        userRole,
        timestamp: new Date(),
        details: {
          consentId: consentResult.consentId,
          consentResult,
          processingLocation: context,
          automatedDecision: true,
          dataElementsAccessed: ['consent_status', 'patient_id'],
        },
        complianceStatus: consentResult.isValid ? 'compliant' : 'non_compliant',
        legalBasis: consentResult.legalBasis,
        retentionDays: 365,
        riskLevel: consentResult.isValid ? 'low' : 'medium',
      };

      const { data: log, error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(auditLog)
        .select('id')
        .single();

      if (error) {
        console.error('Error logging consent validation:', error);
        throw new Error(`Failed to log consent audit: ${error.message}`);
      }

      return log.id;
    } catch (error) {
      console.error('Error in logConsentValidation:', error);
      throw error;
    }
  }

  /**
   * Log data minimization operations
   */
  async logDataMinimization(
    patientId: string,
    userId: string,
    userRole: string,
    originalData: CalendarAppointment,
    minimizedData: any,
    minimizationLevel: DataMinimizationLevel,
    context: string,
  ): Promise<string> {
    try {
      const auditLog: LGPDAuditLog = {
        patientId,
        action: LGPDAuditAction.DATA_MINIMIZED,
        dataCategory: this.determineDataCategories(minimizationLevel),
        purpose: CALENDAR_LGPD_PURPOSES.APPOINTMENT_MANAGEMENT,
        userId,
        userRole,
        timestamp: new Date(),
        details: {
          appointmentId: originalData.id,
          consentLevel: minimizationLevel,
          dataMinimizationApplied: true,
          dataElementsAccessed: this.getAccessedDataElements(minimizationLevel),
          processingLocation: context,
          automatedDecision: true,
        },
        complianceStatus: 'compliant',
        legalBasis: 'LGPD Art. 6º, VII - Princípio da minimização',
        retentionDays: this.DEFAULT_RETENTION_DAYS,
        riskLevel: 'low',
      };

      const { data: log, error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(auditLog)
        .select('id')
        .single();

      if (error) {
        console.error('Error logging data minimization:', error);
        throw new Error(`Failed to log minimization audit: ${error.message}`);
      }

      return log.id;
    } catch (error) {
      console.error('Error in logDataMinimization:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report from audit logs
   */
  async generateComplianceReport(
    filter?: AuditFilter,
    dateRange?: { start: Date; end: Date },
  ): Promise<AuditReport> {
    try {
      let query = this.supabase.from('lgpd_audit_logs').select('*');

      // Apply filters
      if (filter?.patientId) {
        query = query.eq('patient_id', filter.patientId);
      }
      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter?.action?.length) {
        query = query.in('action', filter.action);
      }
      if (filter?.complianceStatus?.length) {
        query = query.in('compliance_status', filter.complianceStatus);
      }
      if (filter?.riskLevel?.length) {
        query = query.in('risk_level', filter.riskLevel);
      }
      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start.toISOString())
          .lte('timestamp', dateRange.end.toISOString());
      }

      const { data: logs, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return this.analyzeAuditLogs(logs || []);
    } catch (error) {
      console.error('Error in generateComplianceReport:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for specific patient (for data subject requests)
   */
  async getPatientAuditLogs(
    patientId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<LGPDAuditLog[]> {
    try {
      let query = this.supabase
        .from('lgpd_audit_logs')
        .select('*')
        .eq('patient_id', patientId)
        .order('timestamp', { ascending: false });

      if (dateRange) {
        query = query
          .gte('timestamp', dateRange.start.toISOString())
          .lte('timestamp', dateRange.end.toISOString());
      }

      const { data: logs, error } = await query;

      if (error) {
        console.error('Error fetching patient audit logs:', error);
        throw new Error(`Failed to fetch patient audit logs: ${error.message}`);
      }

      return (logs || []).map(log => ({
        ...log,
        timestamp: new Date(log.timestamp),
      })) as LGPDAuditLog[];
    } catch (error) {
      console.error('Error in getPatientAuditLogs:', error);
      throw error;
    }
  }

  /**
   * Helper methods for audit processing
   */
  private determineDataCategories(level: DataMinimizationLevel): string[] {
    const categories = ['appointment_data'];

    switch (level) {
      case DataMinimizationLevel.FULL:
        categories.push(
          'personal_identification',
          'health_data',
          'sensitive_health_data',
        );
        break;
      case DataMinimizationLevel.STANDARD:
        categories.push('personal_identification', 'health_data');
        break;
      case DataMinimizationLevel.RESTRICTED:
        categories.push('personal_identification');
        break;
    }

    return categories;
  }

  private getAccessedDataElements(level: DataMinimizationLevel): string[] {
    const elements = ['appointment_id', 'time_slot', 'status'];

    switch (level) {
      case DataMinimizationLevel.FULL:
        elements.push('patient_full_name', 'service_details', 'medical_notes');
        break;
      case DataMinimizationLevel.STANDARD:
        elements.push('patient_name', 'service_type');
        break;
      case DataMinimizationLevel.RESTRICTED:
        elements.push('patient_initials', 'service_category');
        break;
    }

    return elements;
  }

  private determineComplianceStatus(
    consentResult: ConsentValidationResult,
    minimizationLevel: DataMinimizationLevel,
  ): 'compliant' | 'partial' | 'non_compliant' | 'unknown' {
    if (!consentResult.isValid) return 'non_compliant';
    if (
      minimizationLevel === DataMinimizationLevel.FULL
      && consentResult.isExplicit
    ) {
      return 'compliant';
    }
    if (minimizationLevel !== DataMinimizationLevel.MINIMAL) return 'partial';
    return 'unknown';
  }

  private calculateRetentionPeriod(appointmentStatus: string): number {
    // Medical records retention varies by status
    switch (appointmentStatus) {
      case 'cancelled':
        return 90; // 3 months for cancelled appointments
      case 'completed':
        return 2555; // 7 years for completed medical care
      case 'emergency':
        return 3650; // 10 years for emergency care
      default:
        return 1825; // 5 years default
    }
  }

  private assessRiskLevel(
    consentResult: ConsentValidationResult,
    minimizationLevel: DataMinimizationLevel,
    context: 'view' | 'edit' | 'export',
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (!consentResult.isValid) return 'high';
    if (
      context === 'export'
      && minimizationLevel !== DataMinimizationLevel.MINIMAL
    ) {
      return 'high';
    }
    if (!consentResult.isExplicit) return 'medium';
    return 'low';
  }

  private identifyBatchRisks(
    consentResults: ConsentValidationResult[],
    minimizationResults: any[],
  ): string[] {
    const risks: string[] = [];

    const invalidConsents = consentResults.filter(r => !r.isValid).length;
    if (invalidConsents > 0) {
      risks.push(`${invalidConsents} appointments without valid consent`);
    }

    const highMinimization = minimizationResults.filter(
      r => r.consentLevel === DataMinimizationLevel.FULL,
    ).length;
    if (highMinimization > consentResults.length * 0.5) {
      risks.push('High data exposure in batch processing');
    }

    return risks;
  }

  private calculateBatchResidualRisk(
    consentResults: ConsentValidationResult[],
  ): 'low' | 'medium' | 'high' {
    const validConsents = consentResults.filter(r => r.isValid).length;
    const ratio = validConsents / consentResults.length;

    if (ratio >= 0.9) return 'low';
    if (ratio >= 0.7) return 'medium';
    return 'high';
  }

  private determineBatchComplianceStatus(
    consentResults: ConsentValidationResult[],
  ): 'compliant' | 'partial' | 'non_compliant' {
    const validConsents = consentResults.filter(r => r.isValid).length;
    const ratio = validConsents / consentResults.length;

    if (ratio === 1) return 'compliant';
    if (ratio >= 0.8) return 'partial';
    return 'non_compliant';
  }

  private assessBatchRiskLevel(
    consentResults: ConsentValidationResult[],
    _minimizationResults: any[],
  ): 'low' | 'medium' | 'high' | 'critical' {
    const invalidConsents = consentResults.filter(r => !r.isValid).length;
    const totalRecords = consentResults.length;

    if (invalidConsents / totalRecords > 0.3) return 'critical';
    if (invalidConsents / totalRecords > 0.1) return 'high';
    if (invalidConsents > 0) return 'medium';
    return 'low';
  }

  private analyzeAuditLogs(logs: any[]): AuditReport {
    const totalOperations = logs.length;
    const compliantOperations = logs.filter(
      l => l.compliance_status === 'compliant',
    ).length;
    const nonCompliantOperations = logs.filter(
      l => l.compliance_status === 'non_compliant',
    ).length;
    const highRiskOperations = logs.filter(
      l => l.risk_level === 'high' || l.risk_level === 'critical',
    ).length;

    const averageComplianceScore = totalOperations > 0
      ? Math.round((compliantOperations / totalOperations) * 100)
      : 0;

    // Analyze patterns and generate recommendations
    const recommendations = this.generateReportRecommendations(
      logs,
      averageComplianceScore,
    );

    return {
      totalOperations,
      compliantOperations,
      nonCompliantOperations,
      highRiskOperations,
      averageComplianceScore,
      topRisks: [], // Would need detailed risk analysis
      userActivity: [], // Would need user aggregation
      dataAccessPatterns: [], // Would need data category analysis
      recommendations,
      generatedAt: new Date(),
    };
  }

  private generateReportRecommendations(
    logs: any[],
    complianceScore: number,
  ): string[] {
    const recommendations: string[] = [];

    if (complianceScore < 80) {
      recommendations.push(
        'Investigar operações não conformes e implementar correções',
      );
    }

    const highRiskOps = logs.filter(
      l => l.risk_level === 'high' || l.risk_level === 'critical',
    ).length;
    if (highRiskOps > logs.length * 0.1) {
      recommendations.push(
        'Revisar e fortalecer controles de acesso a dados sensíveis',
      );
    }

    const consentDenials = logs.filter(
      l => l.action === 'consent_denied',
    ).length;
    if (consentDenials > logs.length * 0.05) {
      recommendations.push('Revisar processo de obtenção de consentimentos');
    }

    if (complianceScore >= 95) {
      recommendations.push(
        'Manter controles atuais e realizar monitoramento regular',
      );
    }

    return recommendations;
  }
}

// Export purpose constant for easy access
const CALENDAR_LGPD_PURPOSES = {
  APPOINTMENT_SCHEDULING: 'appointment_scheduling' as const,
  APPOINTMENT_MANAGEMENT: 'appointment_management' as const,
  HEALTHCARE_COORDINATION: 'healthcare_coordination' as const,
  MEDICAL_CARE_ACCESS: 'medical_care_access' as const,
};

export const calendarLGPDAuditService = new CalendarLGPDAuditService();
export { CALENDAR_LGPD_PURPOSES };
