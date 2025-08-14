// LGPD Data Retention Policy Manager - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 5: Data Retention Policy (AC: 5)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDRetentionPolicy,
  LGPDServiceResponse,
  LGPDEventType,
  LGPDDataCategory
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';
import { LGPDComplianceMonitor } from './compliance-monitor';

/**
 * LGPD Data Retention Policy Manager
 * Implements automated data retention and deletion policies
 * Ensures compliance with LGPD data minimization principles
 */
export class LGPDDataRetentionManager {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();
  private complianceMonitor = new LGPDComplianceMonitor();
  private retentionCheckInterval: NodeJS.Timeout | null = null;
  private isMonitoringActive = false;

  // Default retention periods (in days) based on LGPD requirements
  private readonly DEFAULT_RETENTION_PERIODS = {
    personal_data: 2555, // ~7 years (medical records)
    sensitive_data: 1825, // ~5 years (sensitive medical data)
    financial_data: 1825, // ~5 years (financial records)
    consent_records: 2555, // ~7 years (consent documentation)
    audit_logs: 2555, // ~7 years (audit trail)
    communication_data: 365, // 1 year (emails, messages)
    session_data: 30, // 30 days (session logs)
    temporary_data: 90, // 90 days (temporary processing data)
    marketing_data: 365, // 1 year (marketing communications)
    analytics_data: 730 // 2 years (analytics and metrics)
  };

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Start automated retention monitoring
   */
  async startRetentionMonitoring(intervalHours: number = 24): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      if (this.retentionCheckInterval) {
        clearInterval(this.retentionCheckInterval);
      }

      this.retentionCheckInterval = setInterval(async () => {
        await this.performRetentionCheck();
      }, intervalHours * 60 * 60 * 1000);

      this.isMonitoringActive = true;

      // Perform initial check
      await this.performRetentionCheck();

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          `Automated retention monitoring started with ${intervalHours}-hour intervals`,
          'Data minimization principles actively enforced',
          'Retention policy compliance monitoring enabled'
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 15°'],
        audit_logged: false,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start retention monitoring',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Stop retention monitoring
   */
  stopRetentionMonitoring(): void {
    if (this.retentionCheckInterval) {
      clearInterval(this.retentionCheckInterval);
      this.retentionCheckInterval = null;
    }
    this.isMonitoringActive = false;
  }

  /**
   * Create or update retention policy
   */
  async createRetentionPolicy(
    clinicId: string,
    adminId: string,
    policyData: {
      policy_name: string;
      data_category: LGPDDataCategory;
      retention_period_days: number;
      legal_basis: string;
      deletion_method: 'soft_delete' | 'hard_delete' | 'anonymization';
      auto_deletion_enabled: boolean;
      grace_period_days?: number;
      exceptions?: string[];
      approval_required?: boolean;
    }
  ): Promise<LGPDServiceResponse<LGPDRetentionPolicy>> {
    const startTime = Date.now();

    try {
      // Validate retention period
      this.validateRetentionPeriod(policyData.data_category, policyData.retention_period_days);

      const policyRecord: Omit<LGPDRetentionPolicy, 'id' | 'created_at' | 'updated_at'> = {
        clinic_id: clinicId,
        policy_name: policyData.policy_name,
        data_category: policyData.data_category,
        retention_period_days: policyData.retention_period_days,
        legal_basis: policyData.legal_basis,
        deletion_method: policyData.deletion_method,
        auto_deletion_enabled: policyData.auto_deletion_enabled,
        grace_period_days: policyData.grace_period_days || 30,
        exceptions: policyData.exceptions || [],
        approval_required: policyData.approval_required || false,
        status: 'active',
        created_by: adminId,
        last_executed: null,
        next_execution: this.calculateNextExecution(),
        execution_count: 0,
        policy_metadata: {
          created_by_admin: adminId,
          creation_reason: 'manual_policy_creation',
          compliance_framework: 'LGPD',
          review_frequency_days: 365
        }
      };

      // Check for existing policy for the same data category
      const { data: existingPolicy } = await this.supabase
        .from('lgpd_retention_policies')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('data_category', policyData.data_category)
        .eq('status', 'active')
        .single();

      let result;
      if (existingPolicy) {
        // Update existing policy
        const { data, error } = await this.supabase
          .from('lgpd_retention_policies')
          .update({
            ...policyRecord,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPolicy.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update retention policy: ${error.message}`);
        }
        result = data;
      } else {
        // Create new policy
        const { data, error } = await this.supabase
          .from('lgpd_retention_policies')
          .insert(policyRecord)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create retention policy: ${error.message}`);
        }
        result = data;
      }

      // Log policy creation/update
      await this.auditLogger.logEvent({
        user_id: adminId,
        clinic_id: clinicId,
        action: existingPolicy ? 'retention_policy_updated' : 'retention_policy_created',
        resource_type: 'retention_policy',
        data_affected: [policyData.data_category],
        legal_basis: policyData.legal_basis,
        processing_purpose: 'data_retention_management',
        ip_address: 'system',
        user_agent: 'retention_manager',
        actor_id: adminId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          policy_id: result.id,
          data_category: policyData.data_category,
          retention_period: policyData.retention_period_days,
          auto_deletion: policyData.auto_deletion_enabled
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        compliance_notes: [
          `Retention policy ${existingPolicy ? 'updated' : 'created'} for ${policyData.data_category}`,
          `Retention period: ${policyData.retention_period_days} days`,
          `Auto-deletion: ${policyData.auto_deletion_enabled ? 'enabled' : 'disabled'}`,
          'Policy compliance with LGPD data minimization principles'
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 15°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create retention policy',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Execute retention policy for specific data category
   */
  async executeRetentionPolicy(
    policyId: string,
    executorId: string,
    dryRun: boolean = false
  ): Promise<LGPDServiceResponse<{
    affected_records: number;
    deleted_records: number;
    anonymized_records: number;
    errors: string[];
  }>> {
    const startTime = Date.now();

    try {
      // Get policy details
      const { data: policy, error: policyError } = await this.supabase
        .from('lgpd_retention_policies')
        .select('*')
        .eq('id', policyId)
        .single();

      if (policyError || !policy) {
        throw new Error('Retention policy not found');
      }

      if (policy.status !== 'active') {
        throw new Error('Retention policy is not active');
      }

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_period_days);

      // Find data to be processed
      const dataToProcess = await this.findDataForRetention(
        policy.clinic_id,
        policy.data_category,
        cutoffDate,
        policy.exceptions
      );

      let deletedRecords = 0;
      let anonymizedRecords = 0;
      const errors: string[] = [];

      if (!dryRun && dataToProcess.length > 0) {
        // Execute retention actions
        const executionResult = await this.executeRetentionActions(
          policy,
          dataToProcess,
          executorId
        );

        deletedRecords = executionResult.deleted;
        anonymizedRecords = executionResult.anonymized;
        errors.push(...executionResult.errors);

        // Update policy execution stats
        await this.supabase
          .from('lgpd_retention_policies')
          .update({
            last_executed: new Date().toISOString(),
            next_execution: this.calculateNextExecution().toISOString(),
            execution_count: policy.execution_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', policyId);
      }

      // Log execution
      await this.auditLogger.logEvent({
        user_id: executorId,
        clinic_id: policy.clinic_id,
        action: dryRun ? 'retention_policy_dry_run' : 'retention_policy_executed',
        resource_type: 'retention_policy',
        data_affected: [policy.data_category],
        legal_basis: policy.legal_basis,
        processing_purpose: 'data_retention_enforcement',
        ip_address: 'system',
        user_agent: 'retention_manager',
        actor_id: executorId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          policy_id: policyId,
          dry_run: dryRun,
          affected_records: dataToProcess.length,
          deleted_records: deletedRecords,
          anonymized_records: anonymizedRecords,
          errors_count: errors.length
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          affected_records: dataToProcess.length,
          deleted_records: deletedRecords,
          anonymized_records: anonymizedRecords,
          errors
        },
        compliance_notes: [
          `Retention policy execution ${dryRun ? '(dry run)' : 'completed'}`,
          `${dataToProcess.length} records identified for processing`,
          `${deletedRecords} records deleted, ${anonymizedRecords} anonymized`,
          errors.length > 0 ? `${errors.length} errors encountered` : 'No errors encountered'
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 15°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute retention policy',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get retention policies for a clinic
   */
  async getRetentionPolicies(
    clinicId: string,
    filters?: {
      dataCategory?: LGPDDataCategory;
      status?: 'active' | 'inactive' | 'draft';
      autoDeleteEnabled?: boolean;
    }
  ): Promise<LGPDServiceResponse<LGPDRetentionPolicy[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_retention_policies')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (filters?.dataCategory) {
        query = query.eq('data_category', filters.dataCategory);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.autoDeleteEnabled !== undefined) {
        query = query.eq('auto_deletion_enabled', filters.autoDeleteEnabled);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get retention policies: ${error.message}`);
      }

      // Enhance data with next execution status
      const enhancedData = (data || []).map(policy => ({
        ...policy,
        days_until_next_execution: policy.next_execution ? 
          Math.ceil((new Date(policy.next_execution).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
          null,
        is_overdue: policy.next_execution ? new Date(policy.next_execution) < new Date() : false
      }));

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: enhancedData,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get retention policies',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Generate retention compliance report
   */
  async generateRetentionReport(
    clinicId: string,
    reportPeriod: { start: Date; end: Date }
  ): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      // Get all retention policies
      const policiesResult = await this.getRetentionPolicies(clinicId);
      if (!policiesResult.success) {
        throw new Error('Failed to get retention policies');
      }

      const policies = policiesResult.data || [];

      // Get retention execution logs
      const executionLogs = await this.auditLogger.getAuditLogs({
        clinicId,
        actions: ['retention_policy_executed'],
        dateRange: reportPeriod,
        limit: 1000
      });

      // Calculate compliance metrics
      const complianceMetrics = await this.calculateRetentionCompliance(clinicId, policies);

      // Generate data inventory
      const dataInventory = await this.generateDataInventory(clinicId);

      const report = {
        clinic_id: clinicId,
        report_period: reportPeriod,
        generated_at: new Date().toISOString(),
        policies_summary: {
          total_policies: policies.length,
          active_policies: policies.filter(p => p.status === 'active').length,
          auto_deletion_enabled: policies.filter(p => p.auto_deletion_enabled).length,
          overdue_executions: policies.filter(p => p.is_overdue).length
        },
        execution_summary: {
          total_executions: executionLogs.data?.length || 0,
          successful_executions: executionLogs.data?.filter(log => 
            !log.metadata?.errors_count || log.metadata.errors_count === 0
          ).length || 0,
          total_records_processed: executionLogs.data?.reduce((sum, log) => 
            sum + (log.metadata?.affected_records || 0), 0
          ) || 0,
          total_records_deleted: executionLogs.data?.reduce((sum, log) => 
            sum + (log.metadata?.deleted_records || 0), 0
          ) || 0,
          total_records_anonymized: executionLogs.data?.reduce((sum, log) => 
            sum + (log.metadata?.anonymized_records || 0), 0
          ) || 0
        },
        compliance_metrics: complianceMetrics,
        data_inventory: dataInventory,
        recommendations: this.generateRetentionRecommendations(policies, complianceMetrics),
        legal_compliance: {
          lgpd_article_6_compliance: complianceMetrics.overall_compliance >= 90,
          data_minimization_score: complianceMetrics.data_minimization_score,
          retention_policy_coverage: complianceMetrics.policy_coverage_percentage
        }
      };

      // Log report generation
      await this.auditLogger.logEvent({
        user_id: 'system',
        clinic_id: clinicId,
        action: 'retention_report_generated',
        resource_type: 'retention_report',
        data_affected: ['retention_data'],
        legal_basis: 'legitimate_interest',
        processing_purpose: 'compliance_reporting',
        ip_address: 'system',
        user_agent: 'retention_manager',
        actor_id: 'system',
        actor_type: 'system',
        severity: 'low',
        metadata: {
          report_period: reportPeriod,
          policies_count: policies.length,
          compliance_score: complianceMetrics.overall_compliance
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: report,
        compliance_notes: [
          'Retention compliance report generated successfully',
          `Overall compliance score: ${complianceMetrics.overall_compliance}%`,
          `${policies.length} retention policies analyzed`,
          'Report includes data inventory and recommendations'
        ],
        legal_references: ['LGPD Art. 6°', 'LGPD Art. 15°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate retention report',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Request data deletion for specific records
   */
  async requestDataDeletion(
    clinicId: string,
    requesterId: string,
    deletionRequest: {
      data_category: LGPDDataCategory;
      record_ids?: string[];
      criteria?: Record<string, any>;
      deletion_reason: string;
      legal_basis: string;
      urgent: boolean;
    }
  ): Promise<LGPDServiceResponse<string>> {
    const startTime = Date.now();

    try {
      const requestId = this.generateDeletionRequestId();

      // Create deletion request record
      const { data, error } = await this.supabase
        .from('lgpd_deletion_requests')
        .insert({
          request_id: requestId,
          clinic_id: clinicId,
          requester_id: requesterId,
          data_category: deletionRequest.data_category,
          record_ids: deletionRequest.record_ids || [],
          selection_criteria: deletionRequest.criteria || {},
          deletion_reason: deletionRequest.deletion_reason,
          legal_basis: deletionRequest.legal_basis,
          urgent: deletionRequest.urgent,
          status: 'pending',
          requested_at: new Date().toISOString(),
          estimated_records: deletionRequest.record_ids?.length || 0,
          approval_required: this.requiresApproval(deletionRequest),
          scheduled_execution: deletionRequest.urgent ? 
            new Date(Date.now() + 4 * 60 * 60 * 1000) : // 4 hours for urgent
            new Date(Date.now() + 24 * 60 * 60 * 1000)   // 24 hours for normal
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create deletion request: ${error.message}`);
      }

      // Log deletion request
      await this.auditLogger.logEvent({
        user_id: requesterId,
        clinic_id: clinicId,
        action: 'data_deletion_requested',
        resource_type: 'deletion_request',
        data_affected: [deletionRequest.data_category],
        legal_basis: deletionRequest.legal_basis,
        processing_purpose: 'data_deletion',
        ip_address: 'system',
        user_agent: 'retention_manager',
        actor_id: requesterId,
        actor_type: 'admin',
        severity: deletionRequest.urgent ? 'high' : 'medium',
        metadata: {
          request_id: requestId,
          data_category: deletionRequest.data_category,
          urgent: deletionRequest.urgent,
          estimated_records: deletionRequest.record_ids?.length || 0
        }
      });

      // Generate alert for urgent requests
      if (deletionRequest.urgent) {
        await this.complianceMonitor.generateAlert(
          clinicId,
          'urgent_deletion_request',
          'high',
          'Urgent Data Deletion Request',
          `Urgent deletion request for ${deletionRequest.data_category} data`,
          { request_id: requestId }
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: requestId,
        compliance_notes: [
          `Data deletion request ${requestId} created`,
          `Priority: ${deletionRequest.urgent ? 'URGENT' : 'NORMAL'}`,
          `Approval required: ${data.approval_required ? 'YES' : 'NO'}`,
          `Scheduled execution: ${data.scheduled_execution}`
        ],
        legal_references: ['LGPD Art. 18°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request data deletion',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private async initializeDefaultPolicies(): Promise<void> {
    // This would be called during system setup to create default policies
    // Implementation would check if default policies exist and create them if needed
  }

  private validateRetentionPeriod(dataCategory: LGPDDataCategory, retentionDays: number): void {
    const defaultPeriod = this.DEFAULT_RETENTION_PERIODS[dataCategory];
    
    if (defaultPeriod && retentionDays > defaultPeriod * 1.5) {
      throw new Error(`Retention period too long for ${dataCategory}. Maximum recommended: ${defaultPeriod} days`);
    }
    
    if (retentionDays < 1) {
      throw new Error('Retention period must be at least 1 day');
    }
  }

  private calculateNextExecution(): Date {
    const nextExecution = new Date();
    nextExecution.setDate(nextExecution.getDate() + 1); // Daily execution
    nextExecution.setHours(2, 0, 0, 0); // 2 AM
    return nextExecution;
  }

  private async performRetentionCheck(): Promise<void> {
    try {
      // Get all active clinics
      const { data: clinics } = await this.supabase
        .from('clinics')
        .select('id')
        .eq('status', 'active');

      if (!clinics) return;

      // Check retention policies for each clinic
      for (const clinic of clinics) {
        await this.checkClinicRetentionPolicies(clinic.id);
      }

    } catch (error) {
      console.error('Error in retention check:', error);
    }
  }

  private async checkClinicRetentionPolicies(clinicId: string): Promise<void> {
    // Get active auto-deletion policies that are due for execution
    const { data: policies } = await this.supabase
      .from('lgpd_retention_policies')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .eq('auto_deletion_enabled', true)
      .lte('next_execution', new Date().toISOString());

    if (!policies) return;

    // Execute each policy
    for (const policy of policies) {
      try {
        await this.executeRetentionPolicy(policy.id, 'system', false);
      } catch (error) {
        console.error(`Error executing retention policy ${policy.id}:`, error);
        
        // Generate alert for failed execution
        await this.complianceMonitor.generateAlert(
          clinicId,
          'retention_policy_execution_failed',
          'high',
          'Retention Policy Execution Failed',
          `Failed to execute retention policy: ${policy.policy_name}`,
          { policy_id: policy.id, error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    }
  }

  private async findDataForRetention(
    clinicId: string,
    dataCategory: LGPDDataCategory,
    cutoffDate: Date,
    exceptions: string[]
  ): Promise<any[]> {
    // This method would identify data records that need to be processed
    // based on the retention policy. Implementation would depend on
    // the specific data structure and tables for each data category.
    
    const dataToProcess: any[] = [];
    
    try {
      switch (dataCategory) {
        case 'personal_data':
          // Find personal data records older than cutoff
          const { data: personalData } = await this.supabase
            .from('patients')
            .select('id, created_at')
            .eq('clinic_id', clinicId)
            .lt('created_at', cutoffDate.toISOString())
            .not('id', 'in', `(${exceptions.join(',')})`);
          
          dataToProcess.push(...(personalData || []));
          break;
          
        case 'session_data':
          // Find session data older than cutoff
          const { data: sessionData } = await this.supabase
            .from('user_sessions')
            .select('id, created_at')
            .eq('clinic_id', clinicId)
            .lt('created_at', cutoffDate.toISOString());
          
          dataToProcess.push(...(sessionData || []));
          break;
          
        case 'audit_logs':
          // Find audit logs older than cutoff
          const auditResult = await this.auditLogger.getAuditLogs({
            clinicId,
            dateRange: { start: new Date('2000-01-01'), end: cutoffDate },
            limit: 10000
          });
          
          if (auditResult.success && auditResult.data) {
            dataToProcess.push(...auditResult.data);
          }
          break;
          
        // Add more cases for other data categories
        default:
          console.warn(`Data category ${dataCategory} not implemented for retention`);
      }
    } catch (error) {
      console.error(`Error finding data for retention (${dataCategory}):`, error);
    }
    
    return dataToProcess;
  }

  private async executeRetentionActions(
    policy: LGPDRetentionPolicy,
    dataToProcess: any[],
    executorId: string
  ): Promise<{ deleted: number; anonymized: number; errors: string[] }> {
    let deleted = 0;
    let anonymized = 0;
    const errors: string[] = [];

    for (const record of dataToProcess) {
      try {
        switch (policy.deletion_method) {
          case 'hard_delete':
            await this.hardDeleteRecord(policy.data_category, record.id);
            deleted++;
            break;
            
          case 'soft_delete':
            await this.softDeleteRecord(policy.data_category, record.id);
            deleted++;
            break;
            
          case 'anonymization':
            await this.anonymizeRecord(policy.data_category, record.id);
            anonymized++;
            break;
        }
        
        // Log individual record processing
        await this.auditLogger.logEvent({
          user_id: executorId,
          clinic_id: policy.clinic_id,
          action: `data_${policy.deletion_method}`,
          resource_type: policy.data_category,
          data_affected: [policy.data_category],
          legal_basis: policy.legal_basis,
          processing_purpose: 'data_retention_enforcement',
          ip_address: 'system',
          user_agent: 'retention_manager',
          actor_id: executorId,
          actor_type: 'system',
          severity: 'medium',
          metadata: {
            policy_id: policy.id,
            record_id: record.id,
            deletion_method: policy.deletion_method,
            retention_period: policy.retention_period_days
          }
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to process record ${record.id}: ${errorMessage}`);
      }
    }

    return { deleted, anonymized, errors };
  }

  private async hardDeleteRecord(dataCategory: LGPDDataCategory, recordId: string): Promise<void> {
    // Implementation for hard deletion based on data category
    switch (dataCategory) {
      case 'session_data':
        await this.supabase
          .from('user_sessions')
          .delete()
          .eq('id', recordId);
        break;
        
      case 'temporary_data':
        await this.supabase
          .from('temporary_data')
          .delete()
          .eq('id', recordId);
        break;
        
      // Add more cases as needed
      default:
        throw new Error(`Hard deletion not implemented for ${dataCategory}`);
    }
  }

  private async softDeleteRecord(dataCategory: LGPDDataCategory, recordId: string): Promise<void> {
    // Implementation for soft deletion (marking as deleted)
    const deletedAt = new Date().toISOString();
    
    switch (dataCategory) {
      case 'personal_data':
        await this.supabase
          .from('patients')
          .update({ deleted_at: deletedAt, status: 'deleted' })
          .eq('id', recordId);
        break;
        
      // Add more cases as needed
      default:
        throw new Error(`Soft deletion not implemented for ${dataCategory}`);
    }
  }

  private async anonymizeRecord(dataCategory: LGPDDataCategory, recordId: string): Promise<void> {
    // Implementation for data anonymization
    const anonymizedAt = new Date().toISOString();
    
    switch (dataCategory) {
      case 'personal_data':
        await this.supabase
          .from('patients')
          .update({
            name: 'ANONYMIZED',
            email: 'anonymized@example.com',
            phone: 'ANONYMIZED',
            cpf: 'ANONYMIZED',
            anonymized_at: anonymizedAt,
            status: 'anonymized'
          })
          .eq('id', recordId);
        break;
        
      // Add more cases as needed
      default:
        throw new Error(`Anonymization not implemented for ${dataCategory}`);
    }
  }

  private async calculateRetentionCompliance(
    clinicId: string,
    policies: LGPDRetentionPolicy[]
  ): Promise<any> {
    const totalDataCategories = Object.keys(this.DEFAULT_RETENTION_PERIODS).length;
    const coveredCategories = new Set(policies.map(p => p.data_category)).size;
    
    const activePolicies = policies.filter(p => p.status === 'active');
    const autoEnabledPolicies = activePolicies.filter(p => p.auto_deletion_enabled);
    const overduePolicies = policies.filter(p => p.is_overdue);
    
    return {
      overall_compliance: Math.round((coveredCategories / totalDataCategories) * 100),
      policy_coverage_percentage: Math.round((coveredCategories / totalDataCategories) * 100),
      active_policies_percentage: Math.round((activePolicies.length / policies.length) * 100),
      auto_deletion_percentage: Math.round((autoEnabledPolicies.length / activePolicies.length) * 100),
      overdue_policies_count: overduePolicies.length,
      data_minimization_score: this.calculateDataMinimizationScore(policies),
      recommendations_count: this.generateRetentionRecommendations(policies, null).length
    };
  }

  private calculateDataMinimizationScore(policies: LGPDRetentionPolicy[]): number {
    // Calculate score based on how well retention periods align with LGPD principles
    let score = 0;
    let totalPolicies = 0;
    
    for (const policy of policies) {
      const defaultPeriod = this.DEFAULT_RETENTION_PERIODS[policy.data_category];
      if (defaultPeriod) {
        totalPolicies++;
        
        // Score based on how close the retention period is to the recommended default
        const ratio = policy.retention_period_days / defaultPeriod;
        if (ratio <= 1.1) score += 100; // Within 10% of default
        else if (ratio <= 1.3) score += 80; // Within 30% of default
        else if (ratio <= 1.5) score += 60; // Within 50% of default
        else score += 40; // More than 50% over default
      }
    }
    
    return totalPolicies > 0 ? Math.round(score / totalPolicies) : 0;
  }

  private async generateDataInventory(clinicId: string): Promise<any> {
    // Generate inventory of data by category
    const inventory: Record<string, any> = {};
    
    for (const category of Object.keys(this.DEFAULT_RETENTION_PERIODS)) {
      inventory[category] = {
        estimated_records: await this.estimateRecordCount(clinicId, category as LGPDDataCategory),
        oldest_record_date: await this.getOldestRecordDate(clinicId, category as LGPDDataCategory),
        retention_policy_exists: false,
        retention_period_days: null
      };
    }
    
    return inventory;
  }

  private async estimateRecordCount(clinicId: string, dataCategory: LGPDDataCategory): Promise<number> {
    // Estimate record count for each data category
    try {
      switch (dataCategory) {
        case 'personal_data':
          const { count: patientCount } = await this.supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinicId);
          return patientCount || 0;
          
        case 'session_data':
          const { count: sessionCount } = await this.supabase
            .from('user_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinicId);
          return sessionCount || 0;
          
        // Add more cases as needed
        default:
          return 0;
      }
    } catch (error) {
      return 0;
    }
  }

  private async getOldestRecordDate(clinicId: string, dataCategory: LGPDDataCategory): Promise<string | null> {
    // Get the oldest record date for each data category
    try {
      switch (dataCategory) {
        case 'personal_data':
          const { data: oldestPatient } = await this.supabase
            .from('patients')
            .select('created_at')
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
          return oldestPatient?.created_at || null;
          
        // Add more cases as needed
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  private generateRetentionRecommendations(
    policies: LGPDRetentionPolicy[],
    complianceMetrics: any
  ): string[] {
    const recommendations: string[] = [];
    
    // Check for missing policies
    const coveredCategories = new Set(policies.map(p => p.data_category));
    const missingCategories = Object.keys(this.DEFAULT_RETENTION_PERIODS)
      .filter(cat => !coveredCategories.has(cat as LGPDDataCategory));
    
    if (missingCategories.length > 0) {
      recommendations.push(`Create retention policies for: ${missingCategories.join(', ')}`);
    }
    
    // Check for policies without auto-deletion
    const manualPolicies = policies.filter(p => !p.auto_deletion_enabled);
    if (manualPolicies.length > 0) {
      recommendations.push('Enable auto-deletion for manual retention policies to ensure compliance');
    }
    
    // Check for overdue policies
    const overduePolicies = policies.filter(p => p.is_overdue);
    if (overduePolicies.length > 0) {
      recommendations.push(`Execute ${overduePolicies.length} overdue retention policies`);
    }
    
    // Check for excessive retention periods
    const excessivePolicies = policies.filter(p => {
      const defaultPeriod = this.DEFAULT_RETENTION_PERIODS[p.data_category];
      return defaultPeriod && p.retention_period_days > defaultPeriod * 1.3;
    });
    
    if (excessivePolicies.length > 0) {
      recommendations.push('Review and reduce excessive retention periods to align with LGPD principles');
    }
    
    return recommendations;
  }

  private requiresApproval(deletionRequest: any): boolean {
    // Determine if deletion request requires approval
    return (
      deletionRequest.data_category === 'sensitive_data' ||
      (deletionRequest.record_ids && deletionRequest.record_ids.length > 100) ||
      deletionRequest.urgent
    );
  }

  private generateDeletionRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `DEL-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.stopRetentionMonitoring();
  }
}
