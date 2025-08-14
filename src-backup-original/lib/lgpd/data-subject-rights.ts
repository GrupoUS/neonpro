/**
 * LGPD Data Subject Rights Management System
 * Automated processing of data subject requests
 * NeonPro Health Platform - LGPD Compliance Module
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { LGPDImmutableAuditSystem } from './audit-system';
import { LGPDConsentManager } from './consent-manager';

// =====================================================
// TYPE DEFINITIONS & SCHEMAS
// =====================================================

export const DataSubjectRightSchema = z.enum([
  'access',           // Art. 9, I - confirmation and access
  'rectification',    // Art. 9, III - correction
  'deletion',         // Art. 9, VI - deletion
  'portability',      // Art. 9, V - data portability
  'objection',        // Art. 9, IV - objection to processing
  'restriction',      // Processing restriction
  'withdraw_consent', // Art. 9, VII - consent withdrawal
  'information'       // Art. 9, II - information about processing
]);

export const RequestStatusSchema = z.enum([
  'submitted',
  'under_review',
  'identity_verification_required',
  'additional_info_required',
  'processing',
  'completed',
  'rejected',
  'cancelled',
  'expired'
]);

export const RequestPrioritySchema = z.enum([
  'low',
  'normal', 
  'high',
  'urgent'
]);

export const DataSubjectRequestSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  requestType: DataSubjectRightSchema,
  description: z.string().min(10).max(1000),
  status: RequestStatusSchema.default('submitted'),
  priority: RequestPrioritySchema.default('normal'),
  submittedAt: z.date().optional(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  assignedTo: z.string().uuid().optional(),
  verificationMethod: z.string().optional(),
  verificationData: z.record(z.any()).optional(),
  requestData: z.record(z.any()).optional(),
  responseData: z.record(z.any()).optional(),
  rejectionReason: z.string().optional(),
  internalNotes: z.string().optional(),
  communicationLog: z.array(z.record(z.any())).default([]),
  metadata: z.record(z.any()).optional()
});

export const RequestStepSchema = z.object({
  id: z.string().uuid().optional(),
  requestId: z.string().uuid(),
  stepType: z.string(),
  stepName: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'skipped']),
  assignedTo: z.string().uuid().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  result: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  automatedStep: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

export type DataSubjectRight = z.infer<typeof DataSubjectRightSchema>;
export type RequestStatus = z.infer<typeof RequestStatusSchema>;
export type RequestPriority = z.infer<typeof RequestPrioritySchema>;
export type DataSubjectRequest = z.infer<typeof DataSubjectRequestSchema>;
export type RequestStep = z.infer<typeof RequestStepSchema>;

// =====================================================
// DATA SUBJECT RIGHTS MANAGER CLASS
// =====================================================

export class LGPDDataSubjectRightsManager {
  private supabase: any;
  private auditSystem: LGPDImmutableAuditSystem;
  private consentManager: LGPDConsentManager;
  private requestProcessors: Map<DataSubjectRight, RequestProcessor>;
  private notificationService: NotificationService;
  
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    auditSystem?: LGPDImmutableAuditSystem,
    consentManager?: LGPDConsentManager
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditSystem = auditSystem || new LGPDImmutableAuditSystem(supabaseUrl, supabaseKey);
    this.consentManager = consentManager || new LGPDConsentManager(supabaseUrl, supabaseKey);
    this.requestProcessors = new Map();
    this.notificationService = new NotificationService(this.supabase);
    this.initializeRequestProcessors();
  }

  /**
   * Submit data subject request
   */
  async submitRequest(
    userId: string,
    requestType: DataSubjectRight,
    description: string,
    requestData?: any,
    verificationData?: any
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      // Validate request
      const request: Omit<DataSubjectRequest, 'id'> = {
        userId,
        requestType,
        description,
        status: 'submitted',
        priority: this.calculatePriority(requestType),
        submittedAt: new Date(),
        dueDate: this.calculateDueDate(requestType),
        requestData: requestData || {},
        verificationData: verificationData || {},
        communicationLog: [{
          timestamp: new Date().toISOString(),
          type: 'request_submitted',
          message: 'Request submitted by user',
          actor: userId
        }]
      };

      const validatedRequest = DataSubjectRequestSchema.parse(request);

      // Check for duplicate requests
      const duplicateCheck = await this.checkForDuplicateRequest(userId, requestType);
      if (duplicateCheck.hasDuplicate) {
        return {
          success: false,
          error: `Similar ${requestType} request already exists: ${duplicateCheck.requestId}`
        };
      }

      // Insert request
      const { data, error } = await this.supabase
        .from('lgpd_data_requests')
        .insert({
          user_id: validatedRequest.userId,
          request_type: validatedRequest.requestType,
          description: validatedRequest.description,
          status: validatedRequest.status,
          priority: validatedRequest.priority,
          submitted_at: validatedRequest.submittedAt?.toISOString(),
          due_date: validatedRequest.dueDate?.toISOString(),
          request_data: validatedRequest.requestData,
          verification_data: validatedRequest.verificationData,
          communication_log: validatedRequest.communicationLog,
          metadata: validatedRequest.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit request: ${error.message}`);
      }

      // Create processing steps
      await this.createProcessingSteps(data.id, requestType);

      // Log audit event
      await this.auditSystem.logEvent({
        eventType: 'data_access',
        userId,
        resourceType: 'data_subject_request',
        resourceId: data.id,
        action: 'submit',
        newValues: validatedRequest,
        purpose: `LGPD data subject right: ${requestType}`,
        legalBasis: 'legal_obligation'
      });

      // Send confirmation notification
      await this.notificationService.sendRequestConfirmation(userId, data.id, requestType);

      // Start automated processing if applicable
      await this.startAutomatedProcessing(data.id);

      return { success: true, requestId: data.id };
    } catch (error) {
      console.error('Error submitting data subject request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process pending requests
   */
  async processPendingRequests(
    limit: number = 50
  ): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: Array<{ requestId: string; success: boolean; error?: string }>;
  }> {
    try {
      // Get pending requests
      const { data: requests, error } = await this.supabase
        .from('lgpd_data_requests')
        .select('*')
        .in('status', ['submitted', 'under_review', 'processing'])
        .order('priority', { ascending: false })
        .order('submitted_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch pending requests: ${error.message}`);
      }

      const results = [];
      let successful = 0;
      let failed = 0;

      for (const request of requests) {
        try {
          const result = await this.processRequest(request.id);
          
          if (result.success) {
            successful++;
          } else {
            failed++;
          }

          results.push({
            requestId: request.id,
            success: result.success,
            error: result.error
          });
        } catch (processingError) {
          failed++;
          const errorMessage = processingError instanceof Error ?
            processingError.message : 'Unknown processing error';
          
          results.push({
            requestId: request.id,
            success: false,
            error: errorMessage
          });
        }
      }

      return {
        processed: requests.length,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Error processing pending requests:', error);
      throw error;
    }
  }

  /**
   * Process individual request
   */
  async processRequest(
    requestId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get request details
      const { data: request, error } = await this.supabase
        .from('lgpd_data_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !request) {
        return { success: false, error: 'Request not found' };
      }

      // Get processor for request type
      const processor = this.requestProcessors.get(request.request_type);
      if (!processor) {
        return { success: false, error: `No processor found for request type: ${request.request_type}` };
      }

      // Execute processing steps
      const processingResult = await processor.processRequest(request);
      
      if (processingResult.success) {
        // Update request status
        await this.updateRequestStatus(
          requestId,
          processingResult.finalStatus || 'completed',
          processingResult.responseData
        );

        // Send completion notification
        await this.notificationService.sendRequestCompletion(
          request.user_id,
          requestId,
          request.request_type,
          processingResult.responseData
        );
      } else {
        // Update request with error
        await this.updateRequestStatus(
          requestId,
          'rejected',
          undefined,
          processingResult.error
        );

        // Send rejection notification
        await this.notificationService.sendRequestRejection(
          request.user_id,
          requestId,
          request.request_type,
          processingResult.error
        );
      }

      return processingResult;
    } catch (error) {
      console.error('Error processing request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get request status and details
   */
  async getRequestStatus(
    requestId: string
  ): Promise<{
    request?: DataSubjectRequest;
    steps?: RequestStep[];
    progress?: number;
    estimatedCompletion?: Date;
  }> {
    try {
      // Get request
      const { data: request, error: requestError } = await this.supabase
        .from('lgpd_data_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        return {};
      }

      // Get processing steps
      const { data: steps, error: stepsError } = await this.supabase
        .from('lgpd_request_steps')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (stepsError) {
        console.error('Error fetching request steps:', stepsError);
      }

      // Calculate progress
      const totalSteps = steps?.length || 0;
      const completedSteps = steps?.filter(s => s.status === 'completed').length || 0;
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

      // Estimate completion
      const estimatedCompletion = this.estimateCompletion(request, steps || []);

      return {
        request: this.mapDatabaseToDataSubjectRequest(request),
        steps: steps?.map(s => this.mapDatabaseToRequestStep(s)) || [],
        progress,
        estimatedCompletion
      };
    } catch (error) {
      console.error('Error getting request status:', error);
      return {};
    }
  }

  /**
   * Get user's request history
   */
  async getUserRequestHistory(
    userId: string,
    limit: number = 50
  ): Promise<{
    requests: DataSubjectRequest[];
    summary: {
      total: number;
      byType: Record<DataSubjectRight, number>;
      byStatus: Record<RequestStatus, number>;
      averageProcessingTime: number;
    };
  }> {
    try {
      const { data: requests, error } = await this.supabase
        .from('lgpd_data_requests')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch user request history: ${error.message}`);
      }

      const mappedRequests = requests.map(r => this.mapDatabaseToDataSubjectRequest(r));
      
      // Calculate summary statistics
      const summary = {
        total: requests.length,
        byType: this.groupByRequestType(requests),
        byStatus: this.groupByStatus(requests),
        averageProcessingTime: this.calculateAverageProcessingTime(requests)
      };

      return {
        requests: mappedRequests,
        summary
      };
    } catch (error) {
      console.error('Error getting user request history:', error);
      throw error;
    }
  }

  /**
   * Generate data subject rights report
   */
  async generateRightsReport(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    period: { start?: Date; end?: Date };
    overview: any;
    requestMetrics: any;
    processingMetrics: any;
    complianceMetrics: any;
  }> {
    try {
      let query = this.supabase
        .from('lgpd_data_requests')
        .select('*');

      if (startDate) {
        query = query.gte('submitted_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('submitted_at', endDate.toISOString());
      }

      const { data: requests, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch requests for report: ${error.message}`);
      }

      // Calculate metrics
      const overview = {
        totalRequests: requests.length,
        uniqueUsers: new Set(requests.map(r => r.user_id)).size,
        requestTypes: this.groupByRequestType(requests),
        statusDistribution: this.groupByStatus(requests),
        priorityDistribution: this.groupByPriority(requests)
      };

      const requestMetrics = {
        dailyVolume: this.calculateDailyVolume(requests),
        averageRequestsPerUser: requests.length / overview.uniqueUsers || 0,
        peakRequestHours: this.calculatePeakHours(requests),
        requestTrends: this.calculateRequestTrends(requests)
      };

      const processingMetrics = {
        averageProcessingTime: this.calculateAverageProcessingTime(requests),
        processingTimeByType: this.calculateProcessingTimeByType(requests),
        completionRate: this.calculateCompletionRate(requests),
        slaCompliance: this.calculateSLACompliance(requests)
      };

      const complianceMetrics = {
        responseTimeCompliance: this.calculateResponseTimeCompliance(requests),
        automationRate: this.calculateAutomationRate(requests),
        rejectionRate: this.calculateRejectionRate(requests),
        escalationRate: this.calculateEscalationRate(requests)
      };

      return {
        period: { start: startDate, end: endDate },
        overview,
        requestMetrics,
        processingMetrics,
        complianceMetrics
      };
    } catch (error) {
      console.error('Error generating rights report:', error);
      throw error;
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private calculatePriority(requestType: DataSubjectRight): RequestPriority {
    const priorityMap: Record<DataSubjectRight, RequestPriority> = {
      'deletion': 'high',
      'objection': 'high',
      'withdraw_consent': 'high',
      'access': 'normal',
      'portability': 'normal',
      'rectification': 'normal',
      'restriction': 'normal',
      'information': 'low'
    };

    return priorityMap[requestType] || 'normal';
  }

  private calculateDueDate(requestType: DataSubjectRight): Date {
    // LGPD requires response within 15 days (Art. 19)
    const baseDays = 15;
    
    // Some request types may need additional time
    const additionalDays: Record<DataSubjectRight, number> = {
      'access': 0,
      'rectification': 0,
      'deletion': 5,
      'portability': 10,
      'objection': 0,
      'restriction': 0,
      'withdraw_consent': 0,
      'information': 0
    };

    const totalDays = baseDays + (additionalDays[requestType] || 0);
    return new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
  }

  private async checkForDuplicateRequest(
    userId: string,
    requestType: DataSubjectRight
  ): Promise<{ hasDuplicate: boolean; requestId?: string }> {
    const { data, error } = await this.supabase
      .from('lgpd_data_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('request_type', requestType)
      .in('status', ['submitted', 'under_review', 'processing'])
      .limit(1)
      .single();

    return {
      hasDuplicate: !error && !!data,
      requestId: data?.id
    };
  }

  private async createProcessingSteps(
    requestId: string,
    requestType: DataSubjectRight
  ): Promise<void> {
    const stepTemplates = this.getStepTemplates(requestType);
    
    for (const template of stepTemplates) {
      await this.supabase
        .from('lgpd_request_steps')
        .insert({
          request_id: requestId,
          step_type: template.type,
          step_name: template.name,
          status: 'pending',
          automated_step: template.automated,
          metadata: template.metadata || {}
        });
    }
  }

  private getStepTemplates(requestType: DataSubjectRight): any[] {
    const commonSteps = [
      { type: 'identity_verification', name: 'Identity Verification', automated: true },
      { type: 'request_validation', name: 'Request Validation', automated: true }
    ];

    const typeSpecificSteps: Record<DataSubjectRight, any[]> = {
      'access': [
        { type: 'data_collection', name: 'Data Collection', automated: true },
        { type: 'data_formatting', name: 'Data Formatting', automated: true },
        { type: 'data_delivery', name: 'Data Delivery', automated: false }
      ],
      'rectification': [
        { type: 'data_validation', name: 'Data Validation', automated: false },
        { type: 'data_update', name: 'Data Update', automated: true },
        { type: 'confirmation', name: 'Confirmation', automated: true }
      ],
      'deletion': [
        { type: 'impact_assessment', name: 'Impact Assessment', automated: false },
        { type: 'data_deletion', name: 'Data Deletion', automated: true },
        { type: 'deletion_verification', name: 'Deletion Verification', automated: true }
      ],
      'portability': [
        { type: 'data_extraction', name: 'Data Extraction', automated: true },
        { type: 'format_conversion', name: 'Format Conversion', automated: true },
        { type: 'data_delivery', name: 'Data Delivery', automated: false }
      ],
      'objection': [
        { type: 'legal_review', name: 'Legal Review', automated: false },
        { type: 'processing_halt', name: 'Processing Halt', automated: true },
        { type: 'confirmation', name: 'Confirmation', automated: true }
      ],
      'restriction': [
        { type: 'restriction_setup', name: 'Restriction Setup', automated: true },
        { type: 'system_update', name: 'System Update', automated: true },
        { type: 'confirmation', name: 'Confirmation', automated: true }
      ],
      'withdraw_consent': [
        { type: 'consent_withdrawal', name: 'Consent Withdrawal', automated: true },
        { type: 'processing_halt', name: 'Processing Halt', automated: true },
        { type: 'confirmation', name: 'Confirmation', automated: true }
      ],
      'information': [
        { type: 'info_compilation', name: 'Information Compilation', automated: true },
        { type: 'info_delivery', name: 'Information Delivery', automated: true }
      ]
    };

    return [...commonSteps, ...(typeSpecificSteps[requestType] || [])];
  }

  private async startAutomatedProcessing(requestId: string): Promise<void> {
    // Start automated processing in background
    setTimeout(async () => {
      try {
        await this.processRequest(requestId);
      } catch (error) {
        console.error('Error in automated processing:', error);
      }
    }, 1000); // Small delay to ensure transaction completion
  }

  private async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    responseData?: any,
    rejectionReason?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.response_data = responseData;
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    await this.supabase
      .from('lgpd_data_requests')
      .update(updateData)
      .eq('id', requestId);
  }

  private estimateCompletion(request: any, steps: any[]): Date | undefined {
    const pendingSteps = steps.filter(s => s.status === 'pending').length;
    const avgStepTime = 2; // hours per step (estimate)
    
    if (pendingSteps === 0) {
      return undefined; // Already completed or no steps
    }

    return new Date(Date.now() + pendingSteps * avgStepTime * 60 * 60 * 1000);
  }

  private mapDatabaseToDataSubjectRequest(dbRecord: any): DataSubjectRequest {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      requestType: dbRecord.request_type,
      description: dbRecord.description,
      status: dbRecord.status,
      priority: dbRecord.priority,
      submittedAt: new Date(dbRecord.submitted_at),
      dueDate: dbRecord.due_date ? new Date(dbRecord.due_date) : undefined,
      completedAt: dbRecord.completed_at ? new Date(dbRecord.completed_at) : undefined,
      assignedTo: dbRecord.assigned_to,
      verificationMethod: dbRecord.verification_method,
      verificationData: dbRecord.verification_data,
      requestData: dbRecord.request_data,
      responseData: dbRecord.response_data,
      rejectionReason: dbRecord.rejection_reason,
      internalNotes: dbRecord.internal_notes,
      communicationLog: dbRecord.communication_log || [],
      metadata: dbRecord.metadata
    };
  }

  private mapDatabaseToRequestStep(dbRecord: any): RequestStep {
    return {
      id: dbRecord.id,
      requestId: dbRecord.request_id,
      stepType: dbRecord.step_type,
      stepName: dbRecord.step_name,
      status: dbRecord.status,
      assignedTo: dbRecord.assigned_to,
      startedAt: dbRecord.started_at ? new Date(dbRecord.started_at) : undefined,
      completedAt: dbRecord.completed_at ? new Date(dbRecord.completed_at) : undefined,
      result: dbRecord.result,
      errorMessage: dbRecord.error_message,
      automatedStep: dbRecord.automated_step,
      metadata: dbRecord.metadata
    };
  }

  private groupByRequestType(requests: any[]): Record<DataSubjectRight, number> {
    return requests.reduce((groups, request) => {
      const type = request.request_type;
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {} as Record<DataSubjectRight, number>);
  }

  private groupByStatus(requests: any[]): Record<RequestStatus, number> {
    return requests.reduce((groups, request) => {
      const status = request.status;
      groups[status] = (groups[status] || 0) + 1;
      return groups;
    }, {} as Record<RequestStatus, number>);
  }

  private groupByPriority(requests: any[]): Record<RequestPriority, number> {
    return requests.reduce((groups, request) => {
      const priority = request.priority;
      groups[priority] = (groups[priority] || 0) + 1;
      return groups;
    }, {} as Record<RequestPriority, number>);
  }

  private calculateAverageProcessingTime(requests: any[]): number {
    const completedRequests = requests.filter(r => 
      r.status === 'completed' && r.submitted_at && r.completed_at
    );

    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, request) => {
      const submitted = new Date(request.submitted_at).getTime();
      const completed = new Date(request.completed_at).getTime();
      return sum + (completed - submitted);
    }, 0);

    return totalTime / completedRequests.length / (1000 * 60 * 60); // Convert to hours
  }

  private calculateDailyVolume(requests: any[]): Record<string, number> {
    return requests.reduce((volume, request) => {
      const date = new Date(request.submitted_at).toISOString().split('T')[0];
      volume[date] = (volume[date] || 0) + 1;
      return volume;
    }, {});
  }

  private calculatePeakHours(requests: any[]): Record<number, number> {
    return requests.reduce((hours, request) => {
      const hour = new Date(request.submitted_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
      return hours;
    }, {});
  }

  private calculateRequestTrends(requests: any[]): any {
    // Simplified trend calculation
    const last30Days = requests.filter(r => {
      const requestDate = new Date(r.submitted_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return requestDate >= thirtyDaysAgo;
    });

    const previous30Days = requests.filter(r => {
      const requestDate = new Date(r.submitted_at);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return requestDate >= sixtyDaysAgo && requestDate < thirtyDaysAgo;
    });

    const trend = last30Days.length - previous30Days.length;
    return {
      last30Days: last30Days.length,
      previous30Days: previous30Days.length,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      changePercent: previous30Days.length > 0 ? 
        ((trend / previous30Days.length) * 100).toFixed(1) : '0'
    };
  }

  private calculateProcessingTimeByType(requests: any[]): Record<DataSubjectRight, number> {
    const typeGroups = this.groupByRequestType(requests);
    const result: Record<DataSubjectRight, number> = {} as any;

    Object.keys(typeGroups).forEach(type => {
      const typeRequests = requests.filter(r => r.request_type === type);
      result[type as DataSubjectRight] = this.calculateAverageProcessingTime(typeRequests);
    });

    return result;
  }

  private calculateCompletionRate(requests: any[]): number {
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    return requests.length > 0 ? (completedRequests / requests.length) * 100 : 0;
  }

  private calculateSLACompliance(requests: any[]): number {
    const completedRequests = requests.filter(r => 
      r.status === 'completed' && r.submitted_at && r.completed_at && r.due_date
    );

    if (completedRequests.length === 0) return 100;

    const onTimeRequests = completedRequests.filter(r => {
      const completed = new Date(r.completed_at);
      const due = new Date(r.due_date);
      return completed <= due;
    }).length;

    return (onTimeRequests / completedRequests.length) * 100;
  }

  private calculateResponseTimeCompliance(requests: any[]): number {
    // LGPD requires response within 15 days
    const respondedRequests = requests.filter(r => 
      ['completed', 'rejected'].includes(r.status) && r.submitted_at
    );

    if (respondedRequests.length === 0) return 100;

    const compliantRequests = respondedRequests.filter(r => {
      const submitted = new Date(r.submitted_at);
      const responded = new Date(r.completed_at || r.updated_at);
      const daysDiff = (responded.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 15;
    }).length;

    return (compliantRequests / respondedRequests.length) * 100;
  }

  private calculateAutomationRate(requests: any[]): number {
    // This would be calculated based on how many requests were processed automatically
    // For now, return a placeholder
    return 75; // 75% automation rate
  }

  private calculateRejectionRate(requests: any[]): number {
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
    return requests.length > 0 ? (rejectedRequests / requests.length) * 100 : 0;
  }

  private calculateEscalationRate(requests: any[]): number {
    // This would be calculated based on requests that required manual intervention
    // For now, return a placeholder
    return 15; // 15% escalation rate
  }

  private initializeRequestProcessors(): void {
    // Initialize processors for each request type
    this.requestProcessors.set('access', new AccessRequestProcessor(this.supabase, this.auditSystem));
    this.requestProcessors.set('rectification', new RectificationRequestProcessor(this.supabase, this.auditSystem));
    this.requestProcessors.set('deletion', new DeletionRequestProcessor(this.supabase, this.auditSystem));
    this.requestProcessors.set('portability', new PortabilityRequestProcessor(this.supabase, this.auditSystem));
    this.requestProcessors.set('objection', new ObjectionRequestProcessor(this.supabase, this.auditSystem));
    this.requestProcessors.set('restriction', new RestrictionRequestProcessor(this.supabase, this.auditSystem));
    this.requestProcessors.set('withdraw_consent', new ConsentWithdrawalProcessor(this.supabase, this.auditSystem, this.consentManager));
    this.requestProcessors.set('information', new InformationRequestProcessor(this.supabase, this.auditSystem));
  }
}

// =====================================================
// REQUEST PROCESSOR INTERFACES & IMPLEMENTATIONS
// =====================================================

export interface RequestProcessor {
  processRequest(request: any): Promise<{
    success: boolean;
    finalStatus?: RequestStatus;
    responseData?: any;
    error?: string;
  }>;
}

export class AccessRequestProcessor implements RequestProcessor {
  constructor(
    private supabase: any,
    private auditSystem: LGPDImmutableAuditSystem
  ) {}

  async processRequest(request: any): Promise<{
    success: boolean;
    finalStatus?: RequestStatus;
    responseData?: any;
    error?: string;
  }> {
    try {
      // Collect user data from all relevant tables
      const userData = await this.collectUserData(request.user_id);
      
      // Format data for delivery
      const formattedData = this.formatDataForDelivery(userData);
      
      // Log data access
      await this.auditSystem.logEvent({
        eventType: 'data_access',
        userId: request.user_id,
        resourceType: 'user_data_export',
        action: 'export',
        purpose: 'LGPD data subject access request',
        legalBasis: 'legal_obligation'
      });

      return {
        success: true,
        finalStatus: 'completed',
        responseData: {
          dataExport: formattedData,
          exportDate: new Date().toISOString(),
          format: 'JSON'
        }
      };
    } catch (error) {
      console.error('Error processing access request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async collectUserData(userId: string): Promise<any> {
    // Collect data from all relevant tables
    const [profile, appointments, medicalRecords, communications] = await Promise.all([
      this.supabase.from('user_profiles').select('*').eq('id', userId),
      this.supabase.from('appointments').select('*').eq('user_id', userId),
      this.supabase.from('medical_records').select('*').eq('patient_id', userId),
      this.supabase.from('communications').select('*').eq('user_id', userId)
    ]);

    return {
      profile: profile.data || [],
      appointments: appointments.data || [],
      medicalRecords: medicalRecords.data || [],
      communications: communications.data || []
    };
  }

  private formatDataForDelivery(userData: any): any {
    // Remove sensitive internal fields and format for user consumption
    return {
      personalData: userData.profile,
      healthData: {
        appointments: userData.appointments.map((apt: any) => ({
          date: apt.appointment_date,
          type: apt.appointment_type,
          status: apt.status,
          notes: apt.notes
        })),
        medicalRecords: userData.medicalRecords.map((record: any) => ({
          date: record.created_at,
          type: record.record_type,
          diagnosis: record.diagnosis,
          treatment: record.treatment_plan
        }))
      },
      communicationData: userData.communications.map((comm: any) => ({
        date: comm.created_at,
        type: comm.communication_type,
        subject: comm.subject,
        content: comm.content
      }))
    };
  }
}

export class ConsentWithdrawalProcessor implements RequestProcessor {
  constructor(
    private supabase: any,
    private auditSystem: LGPDImmutableAuditSystem,
    private consentManager: LGPDConsentManager
  ) {}

  async processRequest(request: any): Promise<{
    success: boolean;
    finalStatus?: RequestStatus;
    responseData?: any;
    error?: string;
  }> {
    try {
      // Get user's active consents
      const { consents } = await this.consentManager.getUserConsents(request.user_id);
      const activeConsents = consents.filter(c => c.status === 'active');

      // Withdraw all active consents
      const withdrawalResults = [];
      for (const consent of activeConsents) {
        const result = await this.consentManager.withdrawConsent(
          request.user_id,
          consent.consentType,
          'user_request_via_lgpd_rights'
        );
        withdrawalResults.push({
          consentType: consent.consentType,
          success: result.success,
          error: result.error
        });
      }

      const successfulWithdrawals = withdrawalResults.filter(r => r.success).length;
      const totalConsents = activeConsents.length;

      return {
        success: successfulWithdrawals === totalConsents,
        finalStatus: 'completed',
        responseData: {
          withdrawnConsents: successfulWithdrawals,
          totalConsents,
          withdrawalResults,
          withdrawalDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error processing consent withdrawal request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Placeholder implementations for other processors
export class RectificationRequestProcessor implements RequestProcessor {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async processRequest(request: any): Promise<{ success: boolean; finalStatus?: RequestStatus; responseData?: any; error?: string; }> {
    // Implementation for data rectification
    return { success: true, finalStatus: 'completed' };
  }
}

export class DeletionRequestProcessor implements RequestProcessor {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async processRequest(request: any): Promise<{ success: boolean; finalStatus?: RequestStatus; responseData?: any; error?: string; }> {
    // Implementation for data deletion
    return { success: true, finalStatus: 'completed' };
  }
}

export class PortabilityRequestProcessor implements RequestProcessor {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async processRequest(request: any): Promise<{ success: boolean; finalStatus?: RequestStatus; responseData?: any; error?: string; }> {
    // Implementation for data portability
    return { success: true, finalStatus: 'completed' };
  }
}

export class ObjectionRequestProcessor implements RequestProcessor {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async processRequest(request: any): Promise<{ success: boolean; finalStatus?: RequestStatus; responseData?: any; error?: string; }> {
    // Implementation for processing objection
    return { success: true, finalStatus: 'completed' };
  }
}

export class RestrictionRequestProcessor implements RequestProcessor {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async processRequest(request: any): Promise<{ success: boolean; finalStatus?: RequestStatus; responseData?: any; error?: string; }> {
    // Implementation for processing restriction
    return { success: true, finalStatus: 'completed' };
  }
}

export class InformationRequestProcessor implements RequestProcessor {
  constructor(private supabase: any, private auditSystem: LGPDImmutableAuditSystem) {}
  
  async processRequest(request: any): Promise<{ success: boolean; finalStatus?: RequestStatus; responseData?: any; error?: string; }> {
    // Implementation for information request
    return { success: true, finalStatus: 'completed' };
  }
}

// =====================================================
// NOTIFICATION SERVICE
// =====================================================

export class NotificationService {
  constructor(private supabase: any) {}

  async sendRequestConfirmation(
    userId: string,
    requestId: string,
    requestType: DataSubjectRight
  ): Promise<void> {
    // Implementation for sending confirmation notification
    console.log(`Sending confirmation for ${requestType} request ${requestId} to user ${userId}`);
  }

  async sendRequestCompletion(
    userId: string,
    requestId: string,
    requestType: DataSubjectRight,
    responseData?: any
  ): Promise<void> {
    // Implementation for sending completion notification
    console.log(`Sending completion notification for ${requestType} request ${requestId} to user ${userId}`);
  }

  async sendRequestRejection(
    userId: string,
    requestId: string,
    requestType: DataSubjectRight,
    reason?: string
  ): Promise<void> {
    // Implementation for sending rejection notification
    console.log(`Sending rejection notification for ${requestType} request ${requestId} to user ${userId}: ${reason}`);
  }
}

export default LGPDDataSubjectRightsManager;