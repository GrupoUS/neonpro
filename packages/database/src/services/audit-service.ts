import type { Database } from '@neonpro/database';
import type { 
  RTCAuditLogEntry, 
  MedicalDataClassification 
} from '@neonpro/types';
import { createClient } from '@supabase/supabase-js';
import { BaseService } from './base.service';

// Types for audit logging
export interface AuditLogRequest {
  sessionId: string;
  eventType: 'session-start' | 'session-end' | 'participant-join' | 'participant-leave' | 
             'recording-start' | 'recording-stop' | 'data-access' | 'consent-given' | 
             'consent-revoked' | 'error-occurred';
  userId: string;
  userRole: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system';
  dataClassification: MedicalDataClassification;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  clinicId: string;
  metadata?: Record<string, any>;
}

export interface ComplianceCheck {
  isCompliant: boolean;
  violations?: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * LGPD-compliant audit logging service for telemedicine
 * Tracks all data access and consent events for compliance
 */
export class AuditService extends BaseService {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
    super();
    this.supabase = supabaseClient;
  }

  /**
   * Create a WebRTC audit log entry
   * @param request - Audit log request data
   * @returns Promise<string> - Audit log entry ID
   */
  async createAuditLog(request: AuditLogRequest): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .insert({
          session_id: request.sessionId,
          action: request.eventType,
          user_id: request.userId,
          resource: request.description,
          resource_type: 'session', // Default resource type
          ip_address: request.ipAddress || 'unknown',
          user_agent: request.userAgent || 'unknown',
          clinic_id: request.clinicId,
          additional_info: JSON.stringify(request.metadata || {}),
          risk_level: 'LOW' // Default risk level
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create audit log:', error);
        throw new Error(`Failed to create audit log: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('AuditService.createAuditLog error:', error);
      throw error;
    }
  }

  /**
   * Log telemedicine session start
   * @param sessionId - WebRTC session ID
   * @param doctorId - Doctor user ID
   * @param patientId - Patient user ID
   * @param clinicId - Clinic ID
   * @param metadata - Additional session metadata
   */
  async logSessionStart(
    sessionId: string,
    doctorId: string,
    patientId: string,
    clinicId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Log doctor joining session
      await this.createAuditLog({
        sessionId,
        eventType: 'session-start',
        userId: doctorId,
        userRole: 'doctor',
        dataClassification: 'internal',
        description: `Doctor started telemedicine session`,
        clinicId,
        metadata: { ...metadata, patientId, role: 'doctor' }
      });

      // Log patient joining session
      await this.createAuditLog({
        sessionId,
        eventType: 'participant-join',
        userId: patientId,
        userRole: 'patient',
        dataClassification: 'internal',
        description: `Patient joined telemedicine session`,
        clinicId,
        metadata: { ...metadata, doctorId, role: 'patient' }
      });
    } catch (error) {
      console.error('AuditService.logSessionStart error:', error);
      throw error;
    }
  }

  /**
   * Log telemedicine session end
   * @param sessionId - WebRTC session ID
   * @param userId - User ending the session
   * @param userRole - Role of user ending session
   * @param clinicId - Clinic ID
   * @param duration - Session duration in milliseconds
   */
  async logSessionEnd(
    sessionId: string,
    userId: string,
    userRole: 'doctor' | 'patient',
    clinicId: string,
    duration: number
  ): Promise<void> {
    try {
      await this.createAuditLog({
        sessionId,
        eventType: 'session-end',
        userId,
        userRole,
        dataClassification: 'internal',
        description: `Telemedicine session ended by ${userRole}`,
        clinicId,
        metadata: { duration, endedBy: userRole }
      });
    } catch (error) {
      console.error('AuditService.logSessionEnd error:', error);
      throw error;
    }
  }

  /**
   * Log participant leaving session
   * @param sessionId - WebRTC session ID
   * @param userId - User leaving session
   * @param userRole - Role of user leaving
   * @param clinicId - Clinic ID
   * @param reason - Reason for leaving
   */
  async logParticipantLeave(
    sessionId: string,
    userId: string,
    userRole: 'doctor' | 'patient',
    clinicId: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.createAuditLog({
        sessionId,
        eventType: 'participant-leave',
        userId,
        userRole,
        dataClassification: 'internal',
        description: `${userRole} left telemedicine session`,
        clinicId,
        metadata: { reason, role: userRole }
      });
    } catch (error) {
      console.error('AuditService.logParticipantLeave error:', error);
      throw error;
    }
  }

  /**
   * Log data access event
   * @param sessionId - WebRTC session ID
   * @param userId - User accessing data
   * @param userRole - Role of user accessing data
   * @param dataClassification - Type of data being accessed
   * @param description - Description of data access
   * @param clinicId - Clinic ID
   * @param metadata - Additional metadata
   */
  async logDataAccess(
    sessionId: string,
    userId: string,
    userRole: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system',
    dataClassification: MedicalDataClassification,
    description: string,
    clinicId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        sessionId,
        eventType: 'data-access',
        userId,
        userRole,
        dataClassification,
        description,
        clinicId,
        metadata
      });
    } catch (error) {
      console.error('AuditService.logDataAccess error:', error);
      throw error;
    }
  }

  /**
   * Log consent given event
   * @param sessionId - WebRTC session ID
   * @param userId - Patient user ID
   * @param dataTypes - Types of data consent was given for
   * @param purpose - Purpose of consent
   * @param clinicId - Clinic ID
   */
  async logConsentGiven(
    sessionId: string,
    userId: string,
    dataTypes: MedicalDataClassification[],
    purpose: string,
    clinicId: string
  ): Promise<void> {
    try {
      await this.createAuditLog({
        sessionId,
        eventType: 'consent-given',
        userId,
        userRole: 'patient',
        dataClassification: 'internal',
        description: `Patient granted consent for ${purpose}`,
        clinicId,
        metadata: { dataTypes, purpose }
      });
    } catch (error) {
      console.error('AuditService.logConsentGiven error:', error);
      throw error;
    }
  }

  /**
   * Log consent revoked event
   * @param sessionId - WebRTC session ID
   * @param userId - Patient user ID
   * @param dataType - Type of data consent was revoked for
   * @param reason - Reason for revocation
   * @param clinicId - Clinic ID
   */
  async logConsentRevoked(
    sessionId: string,
    userId: string,
    dataType: MedicalDataClassification,
    reason: string,
    clinicId: string
  ): Promise<void> {
    try {
      await this.createAuditLog({
        sessionId,
        eventType: 'consent-revoked',
        userId,
        userRole: 'patient',
        dataClassification: dataType,
        description: `Patient revoked consent for ${dataType}`,
        clinicId,
        metadata: { reason, dataType }
      });
    } catch (error) {
      console.error('AuditService.logConsentRevoked error:', error);
      throw error;
    }
  }

  /**
   * Log error event
   * @param sessionId - WebRTC session ID
   * @param userId - User ID where error occurred
   * @param userRole - Role of user
   * @param error - Error that occurred
   * @param clinicId - Clinic ID
   */
  async logError(
    sessionId: string,
    userId: string,
    userRole: 'doctor' | 'patient' | 'nurse' | 'admin' | 'system',
    error: Error | string,
    clinicId: string
  ): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      await this.createAuditLog({
        sessionId,
        eventType: 'error-occurred',
        userId,
        userRole,
        dataClassification: 'public',
        description: `Error in telemedicine session: ${errorMessage}`,
        clinicId,
        metadata: { 
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    } catch (auditError) {
      console.error('AuditService.logError error:', auditError);
      // Don't throw here to avoid infinite error loops
    }
  }

  /**
   * Get audit logs for a specific session
   * @param sessionId - WebRTC session ID
   * @param clinicId - Clinic ID for access control
   * @returns Promise<RTCAuditLogEntry[]> - Array of audit log entries
   */
  async getSessionAuditLogs(sessionId: string, clinicId: string): Promise<RTCAuditLogEntry[]> {
    try {
      const { data: auditLogs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('session_id', sessionId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to get session audit logs:', error);
        return [];
      }

      return auditLogs.map(log => ({
        id: log.id,
        sessionId: log.session_id || sessionId,
        eventType: log.action as any,
        timestamp: log.created_at || new Date().toISOString(),
        userId: log.user_id,
        userRole: 'patient' as any, // Default role, should be determined from user data
        dataClassification: 'internal' as MedicalDataClassification,
        description: log.additional_info || log.resource_type || 'Audit log entry',
        ipAddress: log.ip_address || 'unknown',
        userAgent: log.user_agent || 'unknown',
        clinicId: log.clinic_id,
        metadata: {},
        complianceCheck: {
          isCompliant: true, // Default to compliant since status field doesn't exist in schema
          violations: [],
          riskLevel: log.risk_level?.toLowerCase() || 'low'
        }
      }));
    } catch (error) {
      console.error('AuditService.getSessionAuditLogs error:', error);
      return [];
    }
  }

  async getUserAuditLogs(userId: string, clinicId: string, limit: number = 100): Promise<RTCAuditLogEntry[]> {
    try {
      const { data: auditLogs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get user audit logs:', error);
        return [];
      }

      return auditLogs.map(log => ({
        id: log.id,
        sessionId: log.session_id || 'unknown',
        eventType: log.action as any,
        timestamp: log.created_at || new Date().toISOString(),
        userId: log.user_id,
        userRole: 'patient' as any, // Default role, should be determined from user data
        dataClassification: 'internal' as MedicalDataClassification,
        description: log.additional_info || log.resource_type || 'Audit log entry',
        ipAddress: log.ip_address || 'unknown',
        userAgent: log.user_agent || 'unknown',
        clinicId: log.clinic_id,
        metadata: {},
        complianceCheck: {
          isCompliant: true, // Default to compliant since status field doesn't exist in schema
          violations: [],
          riskLevel: log.risk_level?.toLowerCase() || 'low'
        }
      }));
    } catch (error) {
      console.error('AuditService.getUserAuditLogs error:', error);
      return [];
    }
  }

  /**
   * Get compliance report for a date range
   * @param clinicId - Clinic ID
   * @param startDate - Start date for report
   * @param endDate - End date for report
   * @returns Promise<any> - Compliance report data
   */
  async getComplianceReport(clinicId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data: auditLogs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to get compliance report:', error);
        return null;
      }

      // Analyze compliance data
      const totalEvents = auditLogs.length;
      const compliantEvents = auditLogs.filter(log => 
        (log.compliance_check as any)?.isCompliant !== false
      ).length;
      
      const violations = auditLogs
        .filter(log => (log.compliance_check as any)?.violations?.length > 0)
        .map(log => ({
          id: log.id,
          sessionId: log.session_id,
          timestamp: log.timestamp,
          violations: (log.compliance_check as any)?.violations || [],
          riskLevel: (log.compliance_check as any)?.riskLevel || 'unknown'
        }));

      const riskLevels = auditLogs.reduce((acc, log) => {
        const riskLevel = (log.compliance_check as any)?.riskLevel || 'low';
        acc[riskLevel] = (acc[riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const eventTypes = auditLogs.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        reportPeriod: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        summary: {
          totalEvents,
          compliantEvents,
          complianceRate: totalEvents > 0 ? (compliantEvents / totalEvents) * 100 : 100,
          totalViolations: violations.length
        },
        violations,
        riskLevels,
        eventTypes,
        clinicId
      };
    } catch (error) {
      console.error('AuditService.getComplianceReport error:', error);
      return null;
    }
  }

  /**
   * Search audit logs with filters
   * @param clinicId - Clinic ID
   * @param filters - Search filters
   * @param limit - Maximum number of results
   * @returns Promise<RTCAuditLogEntry[]> - Filtered audit log entries
   */
  async searchAuditLogs(
    clinicId: string,
    filters: {
      sessionId?: string;
      userId?: string;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
      riskLevel?: string;
    },
    limit: number = 100
  ): Promise<RTCAuditLogEntry[]> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .eq('clinic_id', clinicId);

      if (filters.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.eventType) {
        query = query.eq('action', filters.eventType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data: auditLogs, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to search audit logs:', error);
        return [];
      }

      let results = auditLogs.map(log => ({
        id: log.id,
        sessionId: log.session_id || 'unknown',
        eventType: log.action as any,
        timestamp: log.created_at || new Date().toISOString(),
        userId: log.user_id,
        userRole: 'patient' as any, // Default role, should be determined from user data
        dataClassification: 'internal' as MedicalDataClassification,
        description: log.additional_info || log.resource_type || 'Audit log entry',
        ipAddress: log.ip_address || 'unknown',
        userAgent: log.user_agent || 'unknown',
        clinicId: log.clinic_id,
        metadata: {},
        complianceCheck: {
          isCompliant: true, // Default to compliant since status field doesn't exist in schema
          violations: [],
          riskLevel: log.risk_level?.toLowerCase() || 'low'
        }
      }));

      // Client-side filtering for risk level if specified
      if (filters.riskLevel) {
        results = results.filter(log => 
          log.complianceCheck.riskLevel === filters.riskLevel?.toLowerCase()
        );
      }

      return results;
    } catch (error) {
      console.error('AuditService.searchAuditLogs error:', error);
      return [];
    }
  }
}

export default AuditService;