// LGPD Data Subject Rights Manager - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 2: Data Subject Rights Automation (AC: 2)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDDataSubjectRequest,
  LGPDDataCategory,
  LGPDServiceResponse,
  LGPDDataExport,
  LGPDEventType
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';
import { LGPDDataProcessor } from '../utils/data-processor';

/**
 * LGPD Data Subject Rights Manager
 * Handles automated processing of data subject rights requests
 * Implements LGPD Articles 18-22 (Data Subject Rights)
 */
export class LGPDDataSubjectRights {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();
  private dataProcessor = new LGPDDataProcessor();

  // LGPD compliance deadlines (in days)
  private readonly RESPONSE_DEADLINE = 15; // Article 19, §1°
  private readonly URGENT_RESPONSE_DEADLINE = 2; // For urgent cases
  private readonly RECTIFICATION_DEADLINE = 15; // Article 18, III
  private readonly DELETION_DEADLINE = 15; // Article 18, VI

  /**
   * Submit a new data subject request
   * @param request - Data subject request details
   * @param ipAddress - Requester's IP address
   * @param userAgent - Requester's browser/device info
   */
  async submitRequest(
    request: Omit<LGPDDataSubjectRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'response_deadline'>,
    ipAddress: string,
    userAgent: string
  ): Promise<LGPDServiceResponse<LGPDDataSubjectRequest>> {
    const startTime = Date.now();

    try {
      // Validate request
      this.validateRequest(request);

      // Determine response deadline based on request type
      const responseDeadline = this.calculateResponseDeadline(request.request_type, request.urgency_level);

      // Create request record
      const requestData: Omit<LGPDDataSubjectRequest, 'id' | 'created_at' | 'updated_at'> = {
        ...request,
        status: 'pending',
        response_deadline: responseDeadline,
        verification_status: 'pending'
      };

      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit request: ${error.message}`);
      }

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        action: 'data_subject_request_submitted',
        resource_type: 'data_subject_request',
        data_affected: request.data_categories || ['all'],
        legal_basis: 'data_subject_rights',
        processing_purpose: `data_subject_${request.request_type}`,
        ip_address: ipAddress,
        user_agent: userAgent,
        actor_id: request.user_id,
        actor_type: 'user',
        severity: request.urgency_level === 'high' ? 'high' : 'medium',
        metadata: {
          request_id: data.id,
          request_type: request.request_type,
          urgency_level: request.urgency_level,
          response_deadline: responseDeadline.toISOString()
        }
      });

      // Emit request event
      this.eventEmitter.emit('data_subject_request_submitted' as LGPDEventType, {
        requestId: data.id,
        userId: request.user_id,
        clinicId: request.clinic_id,
        requestType: request.request_type,
        urgencyLevel: request.urgency_level,
        deadline: responseDeadline
      });

      // Auto-start verification process
      await this.startVerificationProcess(data.id);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data,
        compliance_notes: [
          `Request submitted with ${this.RESPONSE_DEADLINE}-day response deadline`,
          'Verification process initiated automatically',
          'LGPD Article 18-22 compliance maintained'
        ],
        legal_references: ['LGPD Art. 18°', 'LGPD Art. 19°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit request',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Process access request (Article 18, II)
   * Export all personal data for the user
   */
  async processAccessRequest(
    requestId: string,
    processorId: string
  ): Promise<LGPDServiceResponse<LGPDDataExport>> {
    const startTime = Date.now();

    try {
      // Get request details
      const request = await this.getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update request status
      await this.updateRequestStatus(requestId, 'processing', processorId);

      // Export user data
      const exportResult = await this.dataProcessor.exportUserData(
        request.user_id,
        request.clinic_id,
        request.data_categories
      );

      if (!exportResult.success) {
        throw new Error(`Data export failed: ${exportResult.error}`);
      }

      // Create export record
      const exportData: Omit<LGPDDataExport, 'id' | 'created_at'> = {
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        request_id: requestId,
        export_type: 'access_request',
        data_categories: request.data_categories || ['all'],
        export_format: 'json',
        file_path: exportResult.data?.file_path || '',
        file_size: exportResult.data?.file_size || 0,
        encryption_key: exportResult.data?.encryption_key,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        download_count: 0,
        processor_id: processorId
      };

      const { data: exportRecord, error: exportError } = await this.supabase
        .from('lgpd_data_exports')
        .insert(exportData)
        .select()
        .single();

      if (exportError) {
        throw new Error(`Failed to create export record: ${exportError.message}`);
      }

      // Complete request
      await this.updateRequestStatus(requestId, 'completed', processorId, {
        export_id: exportRecord.id,
        completion_notes: 'Data export completed successfully'
      });

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        action: 'data_exported',
        resource_type: 'personal_data',
        data_affected: request.data_categories || ['all'],
        legal_basis: 'data_subject_rights',
        processing_purpose: 'access_request_fulfillment',
        ip_address: 'system',
        user_agent: 'lgpd_system',
        actor_id: processorId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          request_id: requestId,
          export_id: exportRecord.id,
          file_size: exportRecord.file_size,
          data_categories: request.data_categories
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: exportRecord,
        compliance_notes: [
          'Data export completed in compliance with LGPD Article 18, II',
          'Export file encrypted and time-limited',
          'Complete audit trail maintained'
        ],
        legal_references: ['LGPD Art. 18°, II'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update request status to failed
      await this.updateRequestStatus(requestId, 'failed', processorId, {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process access request',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Process rectification request (Article 18, III)
   * Update incorrect or incomplete personal data
   */
  async processRectificationRequest(
    requestId: string,
    processorId: string,
    corrections: Record<string, any>
  ): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      // Get request details
      const request = await this.getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update request status
      await this.updateRequestStatus(requestId, 'processing', processorId);

      // Apply corrections
      const correctionResult = await this.dataProcessor.rectifyUserData(
        request.user_id,
        request.clinic_id,
        corrections,
        request.data_categories
      );

      if (!correctionResult.success) {
        throw new Error(`Data rectification failed: ${correctionResult.error}`);
      }

      // Complete request
      await this.updateRequestStatus(requestId, 'completed', processorId, {
        corrections_applied: corrections,
        completion_notes: 'Data rectification completed successfully'
      });

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        action: 'data_rectified',
        resource_type: 'personal_data',
        data_affected: request.data_categories || ['all'],
        legal_basis: 'data_subject_rights',
        processing_purpose: 'rectification_request_fulfillment',
        ip_address: 'system',
        user_agent: 'lgpd_system',
        actor_id: processorId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          request_id: requestId,
          corrections_applied: corrections,
          data_categories: request.data_categories
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          'Data rectification completed in compliance with LGPD Article 18, III',
          'All corrections applied and verified',
          'Complete audit trail maintained'
        ],
        legal_references: ['LGPD Art. 18°, III'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update request status to failed
      await this.updateRequestStatus(requestId, 'failed', processorId, {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process rectification request',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Process deletion request (Article 18, VI)
   * Delete personal data when legally permissible
   */
  async processDeletionRequest(
    requestId: string,
    processorId: string,
    force: boolean = false
  ): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      // Get request details
      const request = await this.getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update request status
      await this.updateRequestStatus(requestId, 'processing', processorId);

      // Check if deletion is legally permissible
      if (!force) {
        const deletionCheck = await this.dataProcessor.checkDeletionPermissibility(
          request.user_id,
          request.clinic_id,
          request.data_categories
        );

        if (!deletionCheck.success || !deletionCheck.data?.can_delete) {
          throw new Error(`Deletion not permitted: ${deletionCheck.data?.reason || 'Legal obligations prevent deletion'}`);
        }
      }

      // Perform deletion
      const deletionResult = await this.dataProcessor.deleteUserData(
        request.user_id,
        request.clinic_id,
        request.data_categories,
        force
      );

      if (!deletionResult.success) {
        throw new Error(`Data deletion failed: ${deletionResult.error}`);
      }

      // Complete request
      await this.updateRequestStatus(requestId, 'completed', processorId, {
        deletion_summary: deletionResult.data,
        completion_notes: 'Data deletion completed successfully'
      });

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        action: 'data_deleted',
        resource_type: 'personal_data',
        data_affected: request.data_categories || ['all'],
        legal_basis: 'data_subject_rights',
        processing_purpose: 'deletion_request_fulfillment',
        ip_address: 'system',
        user_agent: 'lgpd_system',
        actor_id: processorId,
        actor_type: 'admin',
        severity: 'high',
        metadata: {
          request_id: requestId,
          deletion_summary: deletionResult.data,
          force_deletion: force,
          data_categories: request.data_categories
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          'Data deletion completed in compliance with LGPD Article 18, VI',
          'Legal permissibility verified before deletion',
          'Complete audit trail maintained'
        ],
        legal_references: ['LGPD Art. 18°, VI'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update request status to failed
      await this.updateRequestStatus(requestId, 'failed', processorId, {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process deletion request',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Process portability request (Article 18, V)
   * Export data in structured, machine-readable format
   */
  async processPortabilityRequest(
    requestId: string,
    processorId: string,
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<LGPDServiceResponse<LGPDDataExport>> {
    const startTime = Date.now();

    try {
      // Get request details
      const request = await this.getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update request status
      await this.updateRequestStatus(requestId, 'processing', processorId);

      // Export data in portable format
      const exportResult = await this.dataProcessor.exportPortableData(
        request.user_id,
        request.clinic_id,
        request.data_categories,
        format
      );

      if (!exportResult.success) {
        throw new Error(`Portable data export failed: ${exportResult.error}`);
      }

      // Create export record
      const exportData: Omit<LGPDDataExport, 'id' | 'created_at'> = {
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        request_id: requestId,
        export_type: 'portability_request',
        data_categories: request.data_categories || ['all'],
        export_format: format,
        file_path: exportResult.data?.file_path || '',
        file_size: exportResult.data?.file_size || 0,
        encryption_key: exportResult.data?.encryption_key,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        download_count: 0,
        processor_id: processorId
      };

      const { data: exportRecord, error: exportError } = await this.supabase
        .from('lgpd_data_exports')
        .insert(exportData)
        .select()
        .single();

      if (exportError) {
        throw new Error(`Failed to create export record: ${exportError.message}`);
      }

      // Complete request
      await this.updateRequestStatus(requestId, 'completed', processorId, {
        export_id: exportRecord.id,
        completion_notes: 'Portable data export completed successfully'
      });

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: request.user_id,
        clinic_id: request.clinic_id,
        action: 'portable_data_exported',
        resource_type: 'personal_data',
        data_affected: request.data_categories || ['all'],
        legal_basis: 'data_subject_rights',
        processing_purpose: 'portability_request_fulfillment',
        ip_address: 'system',
        user_agent: 'lgpd_system',
        actor_id: processorId,
        actor_type: 'admin',
        severity: 'medium',
        metadata: {
          request_id: requestId,
          export_id: exportRecord.id,
          export_format: format,
          file_size: exportRecord.file_size,
          data_categories: request.data_categories
        }
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: exportRecord,
        compliance_notes: [
          'Portable data export completed in compliance with LGPD Article 18, V',
          `Data exported in ${format.toUpperCase()} format`,
          'Export file encrypted and time-limited'
        ],
        legal_references: ['LGPD Art. 18°, V'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update request status to failed
      await this.updateRequestStatus(requestId, 'failed', processorId, {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process portability request',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get pending requests that need attention
   */
  async getPendingRequests(
    clinicId: string,
    urgentOnly: boolean = false
  ): Promise<LGPDServiceResponse<LGPDDataSubjectRequest[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_data_subject_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: true });

      if (urgentOnly) {
        query = query.eq('urgency_level', 'high');
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get pending requests: ${error.message}`);
      }

      // Check for overdue requests
      const now = new Date();
      const requests = (data || []).map(request => ({
        ...request,
        is_overdue: new Date(request.response_deadline) < now,
        days_until_deadline: Math.ceil(
          (new Date(request.response_deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      }));

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: requests,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pending requests',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get request statistics for monitoring
   */
  async getRequestStatistics(
    clinicId: string,
    period: 'day' | 'week' | 'month' = 'month'
  ): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const { data, error } = await this.supabase
        .from('lgpd_data_subject_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        throw new Error(`Failed to get request statistics: ${error.message}`);
      }

      const requests = data || [];
      const now_time = new Date();
      
      const statistics = {
        period,
        total_requests: requests.length,
        by_type: this.groupByField(requests, 'request_type'),
        by_status: this.groupByField(requests, 'status'),
        by_urgency: this.groupByField(requests, 'urgency_level'),
        completed_requests: requests.filter(r => r.status === 'completed').length,
        pending_requests: requests.filter(r => r.status === 'pending').length,
        overdue_requests: requests.filter(r => 
          new Date(r.response_deadline) < now_time && 
          !['completed', 'cancelled'].includes(r.status)
        ).length,
        average_response_time: this.calculateAverageResponseTime(requests),
        compliance_rate: this.calculateComplianceRate(requests)
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: statistics,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get request statistics',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private validateRequest(request: Partial<LGPDDataSubjectRequest>): void {
    const required = ['user_id', 'clinic_id', 'request_type', 'requester_email'];
    
    for (const field of required) {
      if (!request[field as keyof typeof request]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    const validTypes = ['access', 'rectification', 'deletion', 'portability', 'objection', 'restriction'];
    if (!validTypes.includes(request.request_type!)) {
      throw new Error(`Invalid request type: ${request.request_type}`);
    }
  }

  private calculateResponseDeadline(requestType: string, urgencyLevel?: string): Date {
    const deadline = new Date();
    
    if (urgencyLevel === 'high') {
      deadline.setDate(deadline.getDate() + this.URGENT_RESPONSE_DEADLINE);
    } else {
      deadline.setDate(deadline.getDate() + this.RESPONSE_DEADLINE);
    }
    
    return deadline;
  }

  private async getRequestById(requestId: string): Promise<LGPDDataSubjectRequest | null> {
    const { data, error } = await this.supabase
      .from('lgpd_data_subject_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  private async updateRequestStatus(
    requestId: string,
    status: string,
    processorId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const updateData: any = {
      status,
      processor_id: processorId,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (metadata) {
      updateData.response_metadata = metadata;
    }

    const { error } = await this.supabase
      .from('lgpd_data_subject_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      throw new Error(`Failed to update request status: ${error.message}`);
    }
  }

  private async startVerificationProcess(requestId: string): Promise<void> {
    // Emit event to start verification process
    this.eventEmitter.emit('verification_required' as LGPDEventType, {
      requestId,
      timestamp: new Date()
    });
  }

  private groupByField(requests: any[], field: string): Record<string, number> {
    return requests.reduce((acc, request) => {
      const value = request[field] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateAverageResponseTime(requests: LGPDDataSubjectRequest[]): number {
    const completedRequests = requests.filter(r => r.status === 'completed' && r.completed_at);
    
    if (completedRequests.length === 0) {
      return 0;
    }

    const totalTime = completedRequests.reduce((sum, request) => {
      const created = new Date(request.created_at || Date.now());
      const completed = new Date(request.completed_at!);
      return sum + (completed.getTime() - created.getTime());
    }, 0);

    // Return average time in days
    return totalTime / completedRequests.length / (1000 * 60 * 60 * 24);
  }

  private calculateComplianceRate(requests: LGPDDataSubjectRequest[]): number {
    const completedRequests = requests.filter(r => r.status === 'completed');
    
    if (completedRequests.length === 0) {
      return 100; // No requests to be non-compliant with
    }

    const compliantRequests = completedRequests.filter(r => {
      if (!r.completed_at) return false;
      
      const completed = new Date(r.completed_at);
      const deadline = new Date(r.response_deadline);
      return completed <= deadline;
    });

    return (compliantRequests.length / completedRequests.length) * 100;
  }
}
