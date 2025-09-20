import { z } from 'zod';
import { getHealthcarePrismaClient, type HealthcarePrismaClient } from '../clients/prisma';
import { type ExportOptions, type LGPDOperationResult } from '../types/lgpd.js';
import { createHealthcareError } from './createHealthcareError.js';
import { lgpdAuditService } from './lgpd-audit-service.js';
import { lgpdConsentService } from './lgpd-consent-service.js';

// Data Subject Request Types
export const RequestType = z.enum([
  'ACCESS',
  'DELETION',
  'CORRECTION',
  'PORTABILITY',
  'OBJECTION',
  'RESTRICTION',
  'AUTOMATED_DECISION_EXPLANATION',
]);

export const RequestStatus = z.enum([
  'PENDING',
  'PROCESSING',
  'REVIEW_REQUIRED',
  'COMPLETED',
  'REJECTED',
  'ESCALATED',
]);

export const ProcessingPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export interface DataSubjectRequest {
  id: string;
  patientId: string;
  requestType: z.infer<typeof RequestType>;
  status: z.infer<typeof RequestStatus>;
  priority: z.infer<typeof ProcessingPriority>;
  description: string;
  requestData?: Record<string, any>;
  response?: string;
  responseData?: any;
  processedAt?: Date;
  processedBy?: string;
  estimatedCompletion?: Date;
  rejectionReason?: string;
  escalationReason?: string;
  reviewNotes?: string;
  complianceReferences?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessRequestData {
  personalData: any;
  healthData: any;
  consentRecords: any;
  auditTrail: any;
  thirdPartySharing?: any;
  automatedDecisions?: any;
  retentionInfo?: any;
}

export interface DeletionScope {
  dataTypes: string[];
  thirdPartyServices: string[];
  backupSystems: string[];
  retentionExceptions?: string[];
}

/**
 * LGPD Data Subject Rights Service
 * Implements LGPD Art. 18 (data subject rights) and Art. 9 (processing of sensitive data)
 */
export class LGPDDataSubjectService {
  private prisma: HealthcarePrismaClient;

  constructor(prisma?: HealthcarePrismaClient) {
    this.prisma = prisma || getHealthcarePrismaClient();
  }

  /**
   * Creates a new data subject request
   * Implements LGPD Art. 18, II (right to information about data processing)
   */
  async createRequest(
    patientId: string,
    requestType: z.infer<typeof RequestType>,
    description: string,
    options: {
      priority?: z.infer<typeof ProcessingPriority>;
      requestData?: Record<string, any>;
      estimatedCompletion?: Date;
    } = {},
  ): Promise<LGPDOperationResult & { requestId?: string }> {
    try {
      const requestId = this.generateRequestId();
      const priority = options.priority || this.assessRequestPriority(requestType);

      // Validate patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw createHealthcareError(
          'PATIENT_NOT_FOUND',
          `Patient not found: ${patientId}`,
          { patientId },
        );
      }

      // Create request record
      const requestEntry = await this.prisma.auditTrail.create({
        data: {
          userId: patientId,
          action: 'DATA_SUBJECT_REQUEST_CREATED',
          entityType: 'DATA_SUBJECT_RIGHTS',
          entityId: requestId,
          metadata: {
            requestType,
            status: 'PENDING',
            priority,
            description,
            requestData: options.requestData,
            estimatedCompletion: options.estimatedCompletion?.toISOString(),
            createdAt: new Date().toISOString(),
            patientId,
          },
        },
      });

      // Create audit trail for request creation
      await lgpdAuditService.recordAudit({
        patientId,
        action: 'RIGHT_REQUEST',
        entityType: 'DATA_SUBJECT_RIGHTS',
        entityId: requestId,
        dataCategory: 'PERSONAL',
        severity: 'MEDIUM',
        description: `Data subject request created: ${requestType}`,
        metadata: {
          requestType,
          requestId,
          priority,
        },
      });

      // Set estimated completion based on request type and priority
      const estimatedCompletion = this.calculateEstimatedCompletion(
        requestType,
        priority,
      );

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `request_${requestEntry.id}`,
        timestamp: new Date().toISOString(),
        requestId,
        estimatedCompletion,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `request_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Processes data access request (LGPD Art. 18, VI)
   */
  async processAccessRequest(
    requestId: string,
    patientId: string,
  ): Promise<LGPDOperationResult & { accessData?: AccessRequestData }> {
    try {
      // Validate request exists and belongs to patient
      const _request = await this.validateRequest(
        requestId,
        patientId,
        'ACCESS',
      );

      // Update request status to processing
      await this.updateRequestStatus(requestId, 'PROCESSING');

      // Gather all patient data
      const accessData = await this.gatherPatientData(patientId);

      // Create comprehensive access report
      const accessReport = {
        generatedAt: new Date().toISOString(),
        requestId,
        patientId,
        dataSummary: {
          personalDataRecords: accessData.personalData?.length || 0,
          healthDataRecords: accessData.healthData?.length || 0,
          consentRecords: accessData.consentRecords?.length || 0,
          auditTrailEntries: accessData.auditTrail?.length || 0,
        },
        ...accessData,
      };

      // Create audit entry for access completion
      await lgpdAuditService.recordAudit({
        patientId,
        action: 'DATA_ACCESS_GRANTED',
        entityType: 'DATA_SUBJECT_RIGHTS',
        entityId: requestId,
        dataCategory: 'PERSONAL',
        severity: 'MEDIUM',
        description: 'Data access request processed and data provided',
        metadata: {
          requestId,
          dataSummary: accessReport.dataSummary,
        },
      });

      // Update request status to completed
      await this.updateRequestStatus(requestId, 'COMPLETED', {
        response: 'Access request completed. Data has been provided.',
        responseData: accessReport,
        processedAt: new Date(),
      });

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `access_${requestId}`,
        timestamp: new Date().toISOString(),
        accessData: accessReport,
      };
    } catch (error) {
      await this.handleRequestError(requestId, error);
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `access_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Processes data deletion request (LGPD Art. 18, VI - "right to be forgotten")
   */
  async processDeletionRequest(
    requestId: string,
    patientId: string,
    scope: DeletionScope = {
      dataTypes: ['ALL'],
      thirdPartyServices: [],
      backupSystems: [],
    },
  ): Promise<LGPDOperationResult> {
    try {
      // Validate request exists and belongs to patient
      const _request = await this.validateRequest(
        requestId,
        patientId,
        'DELETION',
      );

      // Update request status to processing
      await this.updateRequestStatus(requestId, 'PROCESSING');

      // Check for legal retention requirements
      const retentionCheck = await this.checkRetentionRequirements(
        patientId,
        scope.dataTypes,
      );

      if (retentionCheck.hasLegalObligation) {
        throw createHealthcareError(
          'LEGAL_RETENTION_REQUIRED',
          'Data cannot be deleted due to legal retention requirements',
          { patientId, legalBasis: retentionCheck.legalBasis },
        );
      }

      // Process deletion across all systems
      const deletionResult = await this.processDataDeletion(patientId, scope);

      // Notify third-party services if required
      if (scope.thirdPartyServices.length > 0) {
        await this.notifyThirdPartiesForDeletion(
          patientId,
          scope.thirdPartyServices,
        );
      }

      // Create audit entry for deletion completion
      await lgpdAuditService.recordAudit({
        patientId,
        action: 'DATA_DELETED',
        entityType: 'DATA_SUBJECT_RIGHTS',
        entityId: requestId,
        dataCategory: 'PERSONAL',
        severity: 'HIGH',
        description: 'Data deletion request processed',
        metadata: {
          requestId,
          deletionScope: scope,
          deletedRecords: deletionResult.recordsDeleted,
          thirdPartiesNotified: scope.thirdPartyServices.length,
        },
      });

      // Update request status to completed
      await this.updateRequestStatus(requestId, 'COMPLETED', {
        response: 'Deletion request completed. Data has been removed from all systems.',
        processedAt: new Date(),
      });

      return {
        success: true,
        recordsProcessed: deletionResult.recordsDeleted,
        operationId: `deletion_${requestId}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await this.handleRequestError(requestId, error);
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `deletion_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Processes data portability request (LGPD Art. 18, V)
   */
  async processPortabilityRequest(
    requestId: string,
    patientId: string,
    exportOptions: ExportOptions = {},
  ): Promise<LGPDOperationResult & { exportData?: any; exportUrl?: string }> {
    try {
      // Validate request exists and belongs to patient
      const _request = await this.validateRequest(
        requestId,
        patientId,
        'PORTABILITY',
      );

      // Update request status to processing
      await this.updateRequestStatus(requestId, 'PROCESSING');

      // Gather patient data for export
      const patientData = await this.gatherPatientData(patientId);

      // Export data in requested format
      const exportResult = await this.exportPatientData(
        patientData,
        exportOptions,
      );

      // Create audit entry for portability completion
      await lgpdAuditService.recordAudit({
        patientId,
        action: 'DATA_EXPORTED',
        entityType: 'DATA_SUBJECT_RIGHTS',
        entityId: requestId,
        dataCategory: 'PERSONAL',
        severity: 'MEDIUM',
        description: 'Data portability request processed',
        metadata: {
          requestId,
          exportFormat: exportOptions.format,
          exportSize: JSON.stringify(exportResult.exportData).length,
        },
      });

      // Update request status to completed
      await this.updateRequestStatus(requestId, 'COMPLETED', {
        response: 'Portability request completed. Data export is available.',
        responseData: { exportUrl: exportResult.exportUrl },
        processedAt: new Date(),
      });

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `portability_${requestId}`,
        timestamp: new Date().toISOString(),
        exportData: exportResult.exportData,
        exportUrl: exportResult.exportUrl,
      };
    } catch (error) {
      await this.handleRequestError(requestId, error);
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `portability_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Processes automated decision explanation request (LGPD Art. 20)
   */
  async processAutomatedDecisionExplanation(
    requestId: string,
    patientId: string,
    decisionId?: string,
  ): Promise<LGPDOperationResult & { explanation?: any }> {
    try {
      // Validate request exists and belongs to patient
      const _request = await this.validateRequest(
        requestId,
        patientId,
        'AUTOMATED_DECISION_EXPLANATION',
      );

      // Update request status to processing
      await this.updateRequestStatus(requestId, 'PROCESSING');

      // Find automated decisions affecting the patient
      const automatedDecisions = await this.findAutomatedDecisions(
        patientId,
        decisionId,
      );

      // Generate explanations for each decision
      const explanations = await Promise.all(
        automatedDecisions.map(decision => this.generateDecisionExplanation(decision)),
      );

      const explanationReport = {
        generatedAt: new Date().toISOString(),
        requestId,
        patientId,
        decisionsExplained: explanations.length,
        explanations,
        patientRights: {
          humanReview: 'You have the right to request human review of automated decisions',
          contestation: 'You can contest automated decisions that affect your interests',
          clarification: 'You can request clarification of decision logic',
        },
      };

      // Create audit entry for explanation completion
      await lgpdAuditService.recordAudit({
        patientId,
        action: 'AUTOMATED_DECISION_EXPLAINED',
        entityType: 'DATA_SUBJECT_RIGHTS',
        entityId: requestId,
        dataCategory: 'PERSONAL',
        severity: 'MEDIUM',
        description: 'Automated decision explanation request processed',
        metadata: {
          requestId,
          decisionsExplained: explanations.length,
        },
      });

      // Update request status to completed
      await this.updateRequestStatus(requestId, 'COMPLETED', {
        response: 'Automated decision explanation provided.',
        responseData: explanationReport,
        processedAt: new Date(),
      });

      return {
        success: true,
        recordsProcessed: explanations.length,
        operationId: `explanation_${requestId}`,
        timestamp: new Date().toISOString(),
        explanation: explanationReport,
      };
    } catch (error) {
      await this.handleRequestError(requestId, error);
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `explanation_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Gets status of a data subject request
   */
  async getRequestStatus(
    requestId: string,
    patientId: string,
  ): Promise<LGPDOperationResult & { request?: DataSubjectRequest }> {
    try {
      const requestEntry = await this.prisma.auditTrail.findFirst({
        where: {
          entityId: requestId,
          userId: patientId,
          action: 'DATA_SUBJECT_REQUEST_CREATED',
        },
      });

      if (!requestEntry) {
        throw createHealthcareError(
          'REQUEST_NOT_FOUND',
          `Request not found: ${requestId}`,
          { requestId, patientId },
        );
      }

      const request = this.mapToDataSubjectRequest(requestEntry);

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `status_${requestId}`,
        timestamp: new Date().toISOString(),
        request,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `status_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Lists all requests for a patient
   */
  async listPatientRequests(
    patientId: string,
    options: {
      status?: z.infer<typeof RequestStatus>;
      requestType?: z.infer<typeof RequestType>;
      limit?: number;
    } = {},
  ): Promise<LGPDOperationResult & { requests?: DataSubjectRequest[] }> {
    try {
      const { status, requestType, limit = 50 } = options;

      const whereClause: any = {
        userId: patientId,
        action: 'DATA_SUBJECT_REQUEST_CREATED',
      };

      if (status || requestType) {
        whereClause.metadata = {};
        if (status) {
          whereClause.metadata.status = status;
        }
        if (requestType) {
          whereClause.metadata.requestType = requestType;
        }
      }

      const requests = await this.prisma.auditTrail.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const formattedRequests = requests.map(request => this.mapToDataSubjectRequest(request));

      return {
        success: true,
        recordsProcessed: formattedRequests.length,
        operationId: `list_${Date.now()}`,
        timestamp: new Date().toISOString(),
        requests: formattedRequests,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `list_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Private helper methods
  private async validateRequest(
    requestId: string,
    patientId: string,
    expectedType: z.infer<typeof RequestType>,
  ): Promise<any> {
    const request = await this.prisma.auditTrail.findFirst({
      where: {
        entityId: requestId,
        userId: patientId,
        action: 'DATA_SUBJECT_REQUEST_CREATED',
      },
    });

    if (!request) {
      throw createHealthcareError(
        'REQUEST_NOT_FOUND',
        `Request not found: ${requestId}`,
        { requestId, patientId },
      );
    }

    if (request.metadata?.requestType !== expectedType) {
      throw createHealthcareError(
        'INVALID_REQUEST_TYPE',
        `Expected ${expectedType} but got ${request.metadata?.requestType}`,
        { requestId, expectedType, actualType: request.metadata?.requestType },
      );
    }

    return request;
  }

  private async updateRequestStatus(
    requestId: string,
    status: z.infer<typeof RequestStatus>,
    updates: Record<string, any> = {},
  ): Promise<void> {
    await this.prisma.auditTrail.updateMany({
      where: {
        entityId: requestId,
        action: 'DATA_SUBJECT_REQUEST_CREATED',
      },
      data: {
        metadata: {
          path: ['status'],
          equals: status,
        },
      },
    });

    // Create status update entry
    await this.prisma.auditTrail.create({
      data: {
        action: 'DATA_SUBJECT_REQUEST_UPDATED',
        entityType: 'DATA_SUBJECT_RIGHTS',
        entityId: requestId,
        metadata: {
          status,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }

  private async gatherPatientData(
    patientId: string,
  ): Promise<AccessRequestData> {
    // Gather patient data from all sources
    const [patient, appointments, consents, auditTrail] = await Promise.all([
      this.prisma.patient.findUnique({ where: { id: patientId } }),
      this.prisma.appointment.findMany({ where: { patientId } }),
      lgpdConsentService.getPatientConsents(patientId),
      lgpdAuditService.getPatientAuditTrail(patientId, { limit: 100 }),
    ]);

    return {
      personalData: patient,
      healthData: appointments,
      consentRecords: consents,
      auditTrail: auditTrail.auditTrail || [],
      thirdPartySharing: await this.getThirdPartySharingData(patientId),
      automatedDecisions: await this.findAutomatedDecisions(patientId),
      retentionInfo: await this.getDataRetentionInfo(patientId),
    };
  }

  private async processDataDeletion(
    patientId: string,
    scope: DeletionScope,
  ): Promise<{ recordsDeleted: number }> {
    let recordsDeleted = 0;

    // Process each data type
    for (const dataType of scope.dataTypes) {
      if (dataType === 'ALL' || dataType === 'PERSONAL') {
        // Delete or anonymize personal data
        const result = await this.deletePersonalData(patientId);
        recordsDeleted += result;
      }

      if (dataType === 'ALL' || dataType === 'HEALTH') {
        // Delete or anonymize health data
        const result = await this.deleteHealthData(patientId);
        recordsDeleted += result;
      }
    }

    return { recordsDeleted };
  }

  private async checkRetentionRequirements(
    patientId: string,
    dataTypes: string[],
  ): Promise<{ hasLegalObligation: boolean; legalBasis?: string[] }> {
    // Check if data has legal retention requirements
    const legalBasis: string[] = [];

    // Medical records have retention requirements (usually 20+ years)
    if (dataTypes.includes('HEALTH') || dataTypes.includes('ALL')) {
      const hasRecentMedicalData = await this.prisma.appointment.findFirst({
        where: {
          patientId,
          createdAt: {
            gte: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (hasRecentMedicalData) {
        legalBasis.push('Medical record retention requirements');
      }
    }

    // Check for ongoing legal proceedings
    const hasLegalProceedings = await this.prisma.auditTrail.findFirst({
      where: {
        userId: patientId,
        action: 'LEGAL_PROCEEDING',
        metadata: { path: ['status'], equals: 'ACTIVE' },
      },
    });

    if (hasLegalProceedings) {
      legalBasis.push('Active legal proceedings');
    }

    return {
      hasLegalObligation: legalBasis.length > 0,
      legalBasis: legalBasis.length > 0 ? legalBasis : undefined,
    };
  }

  private async notifyThirdPartiesForDeletion(
    patientId: string,
    thirdParties: string[],
  ): Promise<void> {
    // Notify third-party services about data deletion
    for (const thirdParty of thirdParties) {
      await this.prisma.auditTrail.create({
        data: {
          action: 'THIRD_PARTY_DELETION_NOTIFICATION',
          entityType: 'DATA_SUBJECT_RIGHTS',
          entityId: `thirdparty_${Date.now()}`,
          metadata: {
            patientId,
            thirdParty,
            notificationDate: new Date().toISOString(),
            status: 'SENT',
          },
        },
      });
    }
  }

  private async exportPatientData(
    patientData: AccessRequestData,
    options: ExportOptions,
  ): Promise<any> {
    // This would integrate with the existing export functionality
    // For now, return mock export data
    return {
      exportData: patientData,
      exportUrl: `https://api.neonpro.com.br/exports/${Date.now()}.${options.format || 'json'}`,
    };
  }

  private async findAutomatedDecisions(
    patientId: string,
    decisionId?: string,
  ): Promise<any[]> {
    const whereClause: any = {
      userId: patientId,
      metadata: { path: ['automatedDecision'], equals: true },
    };

    if (decisionId) {
      whereClause.entityId = decisionId;
    }

    return this.prisma.auditTrail.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateDecisionExplanation(decision: any): Promise<any> {
    return {
      decisionId: decision.entityId,
      decisionDate: decision.createdAt,
      decisionType: decision.action,
      logic: decision.metadata?.decisionLogic || 'Automated processing logic',
      impact: decision.metadata?.impactAssessment
        || 'No significant impact identified',
      humanReviewAvailable: true,
      contestationProcess: 'Contact support to contest this decision',
      factors: decision.metadata?.factors || [],
    };
  }

  private async getThirdPartySharingData(_patientId: string): Promise<any> {
    // Return third-party data sharing records
    return [];
  }

  private async getDataRetentionInfo(_patientId: string): Promise<any> {
    // Return data retention information
    return {
      personalDataRetention: '10 years after last contact',
      healthDataRetention: '20 years after last appointment',
      legalRetentionExceptions: 'Active legal proceedings extend retention',
    };
  }

  private async deletePersonalData(patientId: string): Promise<number> {
    // Delete personal data (implementation would vary by data model)
    // This is a simplified implementation
    let deletedCount = 0;

    try {
      // Anonymize patient personal information
      await this.prisma.patient.update({
        where: { id: patientId },
        data: {
          // This would be field-specific anonymization
          // For demo purposes, showing the concept
        },
      });
      deletedCount++;
    } catch (error) {
      console.error('Error deleting personal data:', error);
    }

    return deletedCount;
  }

  private async deleteHealthData(patientId: string): Promise<number> {
    // Delete health data (implementation would vary by data model)
    let deletedCount = 0;

    try {
      // Anonymize or delete appointment data
      const appointments = await this.prisma.appointment.findMany({
        where: { patientId },
      });
      deletedCount += appointments.length;

      // This would implement proper anonymization/deletion
      console.log(
        `Would process ${appointments.length} health records for deletion`,
      );
    } catch (error) {
      console.error('Error deleting health data:', error);
    }

    return deletedCount;
  }

  private async handleRequestError(
    requestId: string,
    error: any,
  ): Promise<void> {
    await this.updateRequestStatus(requestId, 'REJECTED', {
      rejectionReason: error instanceof Error ? error.message : 'Unknown error',
      processedAt: new Date(),
    });

    await lgpdAuditService.recordAudit({
      action: 'REQUEST_FAILED',
      entityType: 'DATA_SUBJECT_RIGHTS',
      entityId: requestId,
      dataCategory: 'PERSONAL',
      severity: 'HIGH',
      description: `Data subject request failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });
  }

  private generateRequestId(): string {
    return `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private assessRequestPriority(
    requestType: z.infer<typeof RequestType>,
  ): z.infer<typeof ProcessingPriority> {
    const priorityMap: Record<string, z.infer<typeof ProcessingPriority>> = {
      DELETION: 'HIGH',
      OBJECTION: 'HIGH',
      CORRECTION: 'MEDIUM',
      ACCESS: 'MEDIUM',
      PORTABILITY: 'MEDIUM',
      AUTOMATED_DECISION_EXPLANATION: 'MEDIUM',
      RESTRICTION: 'LOW',
    };

    return priorityMap[requestType] || 'MEDIUM';
  }

  private calculateEstimatedCompletion(
    requestType: z.infer<typeof RequestType>,
    priority: z.infer<typeof ProcessingPriority>,
  ): Date {
    const baseDays: Record<string, number> = {
      ACCESS: 10,
      DELETION: 15,
      CORRECTION: 10,
      PORTABILITY: 15,
      OBJECTION: 20,
      AUTOMATED_DECISION_EXPLANATION: 10,
      RESTRICTION: 15,
    };

    const priorityMultiplier: Record<string, number> = {
      LOW: 1.5,
      MEDIUM: 1.0,
      HIGH: 0.5,
      URGENT: 0.25,
    };

    const days = (baseDays[requestType] || 10) * (priorityMultiplier[priority] || 1.0);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private mapToDataSubjectRequest(audit: any): DataSubjectRequest {
    const metadata = audit.metadata || {};
    return {
      id: audit.entityId,
      patientId: audit.userId,
      requestType: metadata.requestType,
      status: metadata.status,
      priority: metadata.priority,
      description: metadata.description,
      requestData: metadata.requestData,
      response: metadata.response,
      responseData: metadata.responseData,
      processedAt: metadata.processedAt
        ? new Date(metadata.processedAt)
        : undefined,
      processedBy: metadata.processedBy,
      estimatedCompletion: metadata.estimatedCompletion
        ? new Date(metadata.estimatedCompletion)
        : undefined,
      rejectionReason: metadata.rejectionReason,
      escalationReason: metadata.escalationReason,
      reviewNotes: metadata.reviewNotes,
      complianceReferences: metadata.complianceReferences,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    };
  }
}

// Export singleton instance
export const lgpdDataSubjectService = new LGPDDataSubjectService();
