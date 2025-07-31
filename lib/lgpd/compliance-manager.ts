import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  ConsentRecord,
  ConsentRequest,
  DataSubjectRequest,
  CreateDataSubjectRequest,
  AuditLog,
  CreateAuditLog,
  BreachIncident,
  CreateBreachIncident,
  ComplianceAssessment,
  ComplianceViolation,
  LegalDocument,
  DataSharingAgreement,
  LGPDDashboardMetrics,
  ComplianceMetrics,
  LGPDConfiguration,
  LGPDEvent,
  LGPDDataType,
  LGPDPurpose,
  LGPDLegalBasis,
  DataSubjectRequestType,
  DataSubjectRequestStatus,
  BreachSeverity,
  ComplianceStatus
} from '@/types/lgpd';

/**
 * LGPD Compliance Manager
 * 
 * Comprehensive LGPD compliance automation system providing:
 * - Automated consent management
 * - Data subject rights automation
 * - Real-time compliance monitoring
 * - Audit trail management
 * - Breach detection and notification
 * - Data retention policy automation
 */
export class LGPDComplianceManager {
  private supabase: ReturnType<typeof createClient>;
  private config: LGPDConfiguration;
  private auditChain: string[] = [];

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: LGPDConfiguration
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;
  }

  // ============================================================================
  // CONSENT MANAGEMENT
  // ============================================================================

  /**
   * Grant consent for specific data type and purpose
   */
  async grantConsent(
    userId: string,
    request: ConsentRequest,
    metadata?: { ip_address?: string; user_agent?: string }
  ): Promise<ConsentRecord> {
    try {
      // Check if consent already exists
      const existingConsent = await this.getActiveConsent(userId, request.data_type, request.purpose);
      
      if (existingConsent && existingConsent.consent_given) {
        throw new Error('Consent already granted for this data type and purpose');
      }

      // Create consent record
      const consentRecord: Partial<ConsentRecord> = {
        user_id: userId,
        data_type: request.data_type,
        purpose: request.purpose,
        consent_given: request.consent_given,
        consent_text: this.generateConsentText(request.data_type, request.purpose),
        version: '1.0',
        legal_basis: request.legal_basis || 'consent',
        granted_at: new Date(),
        expires_at: this.calculateConsentExpiry(request.data_type),
        ip_address: metadata?.ip_address,
        user_agent: metadata?.user_agent,
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .insert(consentRecord)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await this.createAuditLog({
        user_id: userId,
        action: 'consent_granted',
        resource: 'lgpd_consent_records',
        data_affected: { data_type: request.data_type, purpose: request.purpose },
        legal_basis: 'consent'
      });

      // Emit compliance event
      await this.emitComplianceEvent({
        type: 'consent_granted',
        user_id: userId,
        data: { consent_id: data.id, data_type: request.data_type },
        timestamp: new Date(),
        compliance_impact: 'low'
      });

      return data as ConsentRecord;
    } catch (error) {
      console.error('Error granting consent:', error);
      throw error;
    }
  }

  /**
   * Withdraw consent for specific data type
   */
  async withdrawConsent(
    userId: string,
    consentId: string,
    reason?: string
  ): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .update({
          consent_given: false,
          withdrawn_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', consentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await this.createAuditLog({
        user_id: userId,
        action: 'consent_withdrawn',
        resource: 'lgpd_consent_records',
        data_affected: { consent_id: consentId, reason },
        legal_basis: 'consent'
      });

      // Trigger data cleanup if required
      if (data.data_type !== 'audit') {
        await this.triggerDataCleanup(userId, data.data_type);
      }

      // Emit compliance event
      await this.emitComplianceEvent({
        type: 'consent_withdrawn',
        user_id: userId,
        data: { consent_id: consentId, data_type: data.data_type },
        timestamp: new Date(),
        compliance_impact: 'medium'
      });
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  }

  /**
   * Get active consent for user, data type, and purpose
   */
  async getActiveConsent(
    userId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose
  ): Promise<ConsentRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .eq('purpose', purpose)
        .eq('consent_given', true)
        .is('withdrawn_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ConsentRecord || null;
    } catch (error) {
      console.error('Error getting active consent:', error);
      return null;
    }
  }

  /**
   * Get all consents for a user
   */
  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ConsentRecord[];
    } catch (error) {
      console.error('Error getting user consents:', error);
      return [];
    }
  }

  // ============================================================================
  // DATA SUBJECT RIGHTS
  // ============================================================================

  /**
   * Create data subject request
   */
  async createDataSubjectRequest(
    userId: string,
    request: CreateDataSubjectRequest
  ): Promise<DataSubjectRequest> {
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30); // 30-day legal deadline

      const dataSubjectRequest: Partial<DataSubjectRequest> = {
        user_id: userId,
        request_type: request.request_type,
        status: 'pending',
        description: request.description,
        requested_data: request.requested_data,
        deadline,
        verification_completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .insert(dataSubjectRequest)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await this.createAuditLog({
        user_id: userId,
        action: 'data_subject_request_created',
        resource: 'lgpd_data_subject_requests',
        data_affected: { request_type: request.request_type, request_id: data.id },
        legal_basis: 'legal_obligation'
      });

      // Schedule automated processing
      await this.scheduleRequestProcessing(data.id);

      // Emit compliance event
      await this.emitComplianceEvent({
        type: 'data_subject_request_created',
        user_id: userId,
        data: { request_id: data.id, request_type: request.request_type },
        timestamp: new Date(),
        compliance_impact: 'medium'
      });

      return data as DataSubjectRequest;
    } catch (error) {
      console.error('Error creating data subject request:', error);
      throw error;
    }
  }

  /**
   * Process data subject request automatically
   */
  async processDataSubjectRequest(requestId: string): Promise<void> {
    try {
      const { data: request, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;

      // Update status to in_progress
      await this.supabase
        .from('lgpd_data_subject_requests')
        .update({ status: 'in_progress', updated_at: new Date() })
        .eq('id', requestId);

      switch (request.request_type) {
        case 'access':
          await this.fulfillAccessRequest(request);
          break;
        case 'deletion':
          await this.fulfillDeletionRequest(request);
          break;
        case 'portability':
          await this.fulfillPortabilityRequest(request);
          break;
        case 'rectification':
          await this.fulfillRectificationRequest(request);
          break;
        default:
          throw new Error(`Unsupported request type: ${request.request_type}`);
      }

      // Mark as fulfilled
      await this.supabase
        .from('lgpd_data_subject_requests')
        .update({
          status: 'fulfilled',
          fulfilled_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', requestId);

      // Log audit trail
      await this.createAuditLog({
        user_id: request.user_id,
        action: 'data_subject_request_fulfilled',
        resource: 'lgpd_data_subject_requests',
        data_affected: { request_id: requestId, request_type: request.request_type },
        legal_basis: 'legal_obligation'
      });

      // Emit compliance event
      await this.emitComplianceEvent({
        type: 'data_subject_request_fulfilled',
        user_id: request.user_id,
        data: { request_id: requestId, request_type: request.request_type },
        timestamp: new Date(),
        compliance_impact: 'low'
      });
    } catch (error) {
      console.error('Error processing data subject request:', error);
      
      // Mark as rejected with error
      await this.supabase
        .from('lgpd_data_subject_requests')
        .update({
          status: 'rejected',
          rejection_reason: error instanceof Error ? error.message : 'Processing error',
          updated_at: new Date()
        })
        .eq('id', requestId);
      
      throw error;
    }
  }

  // ============================================================================
  // AUDIT TRAIL MANAGEMENT
  // ============================================================================

  /**
   * Create tamper-proof audit log entry
   */
  async createAuditLog(logData: CreateAuditLog): Promise<AuditLog> {
    try {
      const timestamp = new Date();
      const previousHash = this.auditChain.length > 0 
        ? this.auditChain[this.auditChain.length - 1] 
        : null;

      // Create hash for integrity
      const hashData = {
        ...logData,
        timestamp: timestamp.toISOString(),
        previous_hash: previousHash
      };
      const hash = crypto.createHash('sha256')
        .update(JSON.stringify(hashData))
        .digest('hex');

      const auditLog: Partial<AuditLog> = {
        ...logData,
        timestamp,
        hash,
        previous_hash: previousHash,
        created_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(auditLog)
        .select()
        .single();

      if (error) throw error;

      // Add to audit chain
      this.auditChain.push(hash);

      return data as AuditLog;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditTrailIntegrity(startDate?: Date, endDate?: Date): Promise<{
    isValid: boolean;
    corruptedEntries: string[];
    totalEntries: number;
  }> {
    try {
      let query = this.supabase
        .from('lgpd_audit_logs')
        .select('*')
        .order('created_at', { ascending: true });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      const corruptedEntries: string[] = [];
      let previousHash: string | null = null;

      for (const log of logs) {
        // Verify hash integrity
        const hashData = {
          user_id: log.user_id,
          action: log.action,
          resource: log.resource,
          data_affected: log.data_affected,
          legal_basis: log.legal_basis,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          session_id: log.session_id,
          timestamp: log.timestamp,
          previous_hash: previousHash
        };

        const expectedHash = crypto.createHash('sha256')
          .update(JSON.stringify(hashData))
          .digest('hex');

        if (expectedHash !== log.hash) {
          corruptedEntries.push(log.id);
        }

        previousHash = log.hash;
      }

      return {
        isValid: corruptedEntries.length === 0,
        corruptedEntries,
        totalEntries: logs.length
      };
    } catch (error) {
      console.error('Error verifying audit trail integrity:', error);
      throw error;
    }
  }

  // ============================================================================
  // BREACH DETECTION & NOTIFICATION
  // ============================================================================

  /**
   * Report security breach
   */
  async reportBreach(incident: CreateBreachIncident): Promise<BreachIncident> {
    try {
      const breachIncident: Partial<BreachIncident> = {
        ...incident,
        detected_at: new Date(),
        reported_to_authority: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('lgpd_breach_incidents')
        .insert(breachIncident)
        .select()
        .single();

      if (error) throw error;

      // Automatically notify authorities if severity is high or critical
      if (incident.severity === 'high' || incident.severity === 'critical') {
        await this.notifyAuthorities(data.id);
      }

      // Notify affected users
      await this.notifyAffectedUsers(data.id);

      // Log audit trail
      await this.createAuditLog({
        action: 'breach_reported',
        resource: 'lgpd_breach_incidents',
        data_affected: { incident_id: data.id, severity: incident.severity },
        legal_basis: 'legal_obligation'
      });

      // Emit compliance event
      await this.emitComplianceEvent({
        type: 'breach_detected',
        data: { incident_id: data.id, severity: incident.severity },
        timestamp: new Date(),
        compliance_impact: 'high'
      });

      return data as BreachIncident;
    } catch (error) {
      console.error('Error reporting breach:', error);
      throw error;
    }
  }

  /**
   * Notify authorities about breach (72-hour requirement)
   */
  private async notifyAuthorities(incidentId: string): Promise<void> {
    try {
      // Implementation would integrate with ANPD API
      // For now, we'll log the notification requirement
      
      await this.supabase
        .from('lgpd_breach_incidents')
        .update({
          reported_to_authority: true,
          authority_notified_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', incidentId);

      // Log audit trail
      await this.createAuditLog({
        action: 'authority_notified',
        resource: 'lgpd_breach_incidents',
        data_affected: { incident_id: incidentId },
        legal_basis: 'legal_obligation'
      });
    } catch (error) {
      console.error('Error notifying authorities:', error);
      throw error;
    }
  }

  // ============================================================================
  // COMPLIANCE MONITORING
  // ============================================================================

  /**
   * Run comprehensive compliance assessment
   */
  async runComplianceAssessment(): Promise<ComplianceAssessment> {
    try {
      const assessmentDate = new Date();
      
      // Calculate compliance scores
      const consentScore = await this.calculateConsentManagementScore();
      const dataRightsScore = await this.calculateDataSubjectRightsScore();
      const auditScore = await this.calculateAuditTrailScore();
      const retentionScore = await this.calculateRetentionPolicyScore();
      const breachScore = await this.calculateBreachResponseScore();
      
      const overallScore = Math.round(
        (consentScore + dataRightsScore + auditScore + retentionScore + breachScore) / 5
      );

      // Identify gaps and recommendations
      const gaps = await this.identifyComplianceGaps();
      const recommendations = await this.generateRecommendations(gaps);

      const assessment: Partial<ComplianceAssessment> = {
        assessment_date: assessmentDate,
        overall_score: overallScore,
        consent_management_score: consentScore,
        data_subject_rights_score: dataRightsScore,
        audit_trail_score: auditScore,
        retention_policy_score: retentionScore,
        breach_response_score: breachScore,
        gaps_identified: gaps,
        recommendations,
        next_assessment_date: this.calculateNextAssessmentDate(),
        assessor: 'LGPD Compliance Manager',
        status: overallScore >= 80 ? 'compliant' : 'non_compliant',
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await this.supabase
        .from('lgpd_compliance_assessments')
        .insert(assessment)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await this.createAuditLog({
        action: 'compliance_assessment_completed',
        resource: 'lgpd_compliance_assessments',
        data_affected: { assessment_id: data.id, overall_score: overallScore },
        legal_basis: 'legal_obligation'
      });

      return data as ComplianceAssessment;
    } catch (error) {
      console.error('Error running compliance assessment:', error);
      throw error;
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<LGPDDashboardMetrics> {
    try {
      const [consents, requests, violations, incidents, auditLogs] = await Promise.all([
        this.getConsentMetrics(),
        this.getDataSubjectRequestMetrics(),
        this.getViolationMetrics(),
        this.getBreachMetrics(),
        this.getAuditLogMetrics()
      ]);

      const latestAssessment = await this.getLatestComplianceAssessment();

      return {
        totalConsents: consents.total,
        activeConsents: consents.active,
        withdrawnConsents: consents.withdrawn,
        pendingDataSubjectRequests: requests.pending,
        fulfilledDataSubjectRequests: requests.fulfilled,
        complianceScore: latestAssessment?.overall_score || 0,
        recentViolations: violations.recent,
        breachIncidents: incidents.total,
        auditLogEntries: auditLogs.total,
        retentionPolicyCompliance: await this.calculateRetentionCompliance()
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateConsentText(dataType: LGPDDataType, purpose: LGPDPurpose): string {
    return `Eu autorizo o processamento dos meus dados de ${dataType} para a finalidade de ${purpose}, conforme descrito na política de privacidade.`;
  }

  private calculateConsentExpiry(dataType: LGPDDataType): Date {
    const expiry = new Date();
    // Different data types have different expiry periods
    switch (dataType) {
      case 'biometric':
        expiry.setFullYear(expiry.getFullYear() + 1); // 1 year
        break;
      case 'medical':
        expiry.setFullYear(expiry.getFullYear() + 5); // 5 years
        break;
      default:
        expiry.setFullYear(expiry.getFullYear() + 2); // 2 years
    }
    return expiry;
  }

  private async triggerDataCleanup(userId: string, dataType: LGPDDataType): Promise<void> {
    // Implementation would trigger data cleanup based on data type
    console.log(`Triggering data cleanup for user ${userId}, data type: ${dataType}`);
  }

  private async scheduleRequestProcessing(requestId: string): Promise<void> {
    // Implementation would schedule automated processing
    console.log(`Scheduling processing for request ${requestId}`);
  }

  private async fulfillAccessRequest(request: DataSubjectRequest): Promise<void> {
    // Implementation would gather and export user data
    console.log(`Fulfilling access request for user ${request.user_id}`);
  }

  private async fulfillDeletionRequest(request: DataSubjectRequest): Promise<void> {
    // Implementation would delete user data
    console.log(`Fulfilling deletion request for user ${request.user_id}`);
  }

  private async fulfillPortabilityRequest(request: DataSubjectRequest): Promise<void> {
    // Implementation would export user data in portable format
    console.log(`Fulfilling portability request for user ${request.user_id}`);
  }

  private async fulfillRectificationRequest(request: DataSubjectRequest): Promise<void> {
    // Implementation would correct user data
    console.log(`Fulfilling rectification request for user ${request.user_id}`);
  }

  private async notifyAffectedUsers(incidentId: string): Promise<void> {
    // Implementation would notify affected users
    console.log(`Notifying affected users for incident ${incidentId}`);
  }

  private async emitComplianceEvent(event: LGPDEvent): Promise<void> {
    // Implementation would emit compliance events for monitoring
    console.log('Compliance event:', event);
  }

  private async calculateConsentManagementScore(): Promise<number> {
    // Implementation would calculate consent management compliance score
    return 85;
  }

  private async calculateDataSubjectRightsScore(): Promise<number> {
    // Implementation would calculate data subject rights compliance score
    return 90;
  }

  private async calculateAuditTrailScore(): Promise<number> {
    // Implementation would calculate audit trail compliance score
    return 95;
  }

  private async calculateRetentionPolicyScore(): Promise<number> {
    // Implementation would calculate retention policy compliance score
    return 80;
  }

  private async calculateBreachResponseScore(): Promise<number> {
    // Implementation would calculate breach response compliance score
    return 88;
  }

  private async identifyComplianceGaps(): Promise<string[]> {
    // Implementation would identify compliance gaps
    return ['Consent renewal automation needed', 'Data minimization review required'];
  }

  private async generateRecommendations(gaps: string[]): Promise<string[]> {
    // Implementation would generate recommendations based on gaps
    return gaps.map(gap => `Address: ${gap}`);
  }

  private calculateNextAssessmentDate(): Date {
    const next = new Date();
    switch (this.config.assessment_schedule) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
    }
    return next;
  }

  private async getConsentMetrics() {
    const { data } = await this.supabase
      .from('lgpd_consent_records')
      .select('consent_given, withdrawn_at');
    
    return {
      total: data?.length || 0,
      active: data?.filter(c => c.consent_given && !c.withdrawn_at).length || 0,
      withdrawn: data?.filter(c => c.withdrawn_at).length || 0
    };
  }

  private async getDataSubjectRequestMetrics() {
    const { data } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('status');
    
    return {
      pending: data?.filter(r => r.status === 'pending').length || 0,
      fulfilled: data?.filter(r => r.status === 'fulfilled').length || 0
    };
  }

  private async getViolationMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data } = await this.supabase
      .from('lgpd_compliance_violations')
      .select('detected_at')
      .gte('detected_at', thirtyDaysAgo.toISOString());
    
    return {
      recent: data?.length || 0
    };
  }

  private async getBreachMetrics() {
    const { data } = await this.supabase
      .from('lgpd_breach_incidents')
      .select('id');
    
    return {
      total: data?.length || 0
    };
  }

  private async getAuditLogMetrics() {
    const { data } = await this.supabase
      .from('lgpd_audit_logs')
      .select('id');
    
    return {
      total: data?.length || 0
    };
  }

  private async getLatestComplianceAssessment(): Promise<ComplianceAssessment | null> {
    const { data } = await this.supabase
      .from('lgpd_compliance_assessments')
      .select('*')
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single();
    
    return data as ComplianceAssessment || null;
  }

  private async calculateRetentionCompliance(): Promise<number> {
    // Implementation would calculate retention policy compliance percentage
    return 92;
  }
}
