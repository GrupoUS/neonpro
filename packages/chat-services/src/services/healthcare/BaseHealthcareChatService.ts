/**
 * Base Healthcare Chat Service
 * @package @neonpro/chat-services
 */

import {
  EnhancedChatSession,
  EnhancedChatMessage,
  ChatSessionCreationParams,
  ChatMessageCreationParams,
  ChatServiceResponse,
  ChatServiceError,
  HealthcareContext,
  HealthcareComplianceInfo,
  HealthcareMetadata
} from '../types/chat';

import {
  HealthcareChatSession,
  HealthcareChatMessage,
  MedicalDataType,
  HealthcareUrgencyLevel
} from '../types/healthcare-chat';

import {
  HealthcareComplianceService,
  ComplianceCheckRequest,
  ComplianceCheckResult
} from './compliance';

import { Logger } from '@neonpro/core-services';

/**
 * Base class for all healthcare-specific chat services
 */
export abstract class BaseHealthcareChatService {
  protected logger: Logger;
  protected complianceService: HealthcareComplianceService;
  protected serviceName: string;

  constructor(serviceName: string, complianceService: HealthcareComplianceService) {
    this.serviceName = serviceName;
    this.logger = new Logger(serviceName);
    this.complianceService = complianceService;
  }

  /**
   * Initialize the service
   */
  public abstract initialize(): Promise<void>;

  /**
   * Get service health status
   */
  public abstract getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    metrics: Record<string, any>;
    lastCheck: Date;
  }>;

  /**
   * Shutdown the service
   */
  public abstract shutdown(): Promise<void>;

  /**
   * Create a new healthcare chat session
   */
  public async createSession(params: ChatSessionCreationParams): Promise<EnhancedChatSession> {
    try {
      // Validate session parameters for healthcare context
      this.validateSessionParams(params);

      // Perform healthcare-specific compliance checks
      const complianceCheck = await this.performHealthcareComplianceCheck(params);
      if (!complianceCheck.passed) {
        throw new ChatServiceError('HEALTHCARE_COMPLIANCE_FAILED', 
          'Session creation failed healthcare compliance check', complianceCheck);
      }

      // Create healthcare-specific session
      const healthcareSession = await this.createHealthcareSession(params);

      // Convert to enhanced session
      const session = this.convertToEnhancedSession(healthcareSession);

      this.logger.info('Healthcare chat session created successfully', { 
        sessionId: session.id, 
        type: session.type,
        patientId: healthcareSession.patientId 
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to create healthcare chat session', { error, params });
      throw error instanceof ChatServiceError ? error : 
        new ChatServiceError('HEALTHCARE_SESSION_CREATION_FAILED', 
          'Failed to create healthcare chat session', error);
    }
  }

  /**
   * Send a message in healthcare chat session
   */
  public async sendMessage(params: ChatMessageCreationParams): Promise<EnhancedChatMessage> {
    try {
      // Validate message content for healthcare context
      this.validateMessageContent(params);

      // Perform message compliance checks
      const complianceCheck = await this.performMessageComplianceCheck(params);
      if (!complianceCheck.passed) {
        throw new ChatServiceError('MESSAGE_COMPLIANCE_FAILED', 
          'Message failed healthcare compliance check', complianceCheck);
      }

      // Create healthcare-specific message
      const healthcareMessage = await this.createHealthcareMessage(params);

      // Convert to enhanced message
      const message = this.convertToEnhancedMessage(healthcareMessage);

      // Perform post-message actions
      await this.performPostMessageActions(message);

      this.logger.info('Healthcare chat message sent successfully', { 
        messageId: message.id, 
        sessionId: params.sessionId,
        messageType: message.messageType 
      });

      return message;
    } catch (error) {
      this.logger.error('Failed to send healthcare chat message', { error, params });
      throw error instanceof ChatServiceError ? error : 
        new ChatServiceError('HEALTHCARE_MESSAGE_SEND_FAILED', 
          'Failed to send healthcare chat message', error);
    }
  }

  /**
   * Get healthcare chat session
   */
  public async getSession(sessionId: string): Promise<EnhancedChatSession> {
    try {
      const healthcareSession = await this.getHealthcareSession(sessionId);
      const session = this.convertToEnhancedSession(healthcareSession);

      return session;
    } catch (error) {
      this.logger.error('Failed to get healthcare chat session', { error, sessionId });
      throw error instanceof ChatServiceError ? error : 
        new ChatServiceError('HEALTHCARE_SESSION_GET_FAILED', 
          'Failed to get healthcare chat session', error);
    }
  }

  /**
   * Get session messages
   */
  public async getSessionMessages(sessionId: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<EnhancedChatMessage[]> {
    try {
      const healthcareMessages = await this.getHealthcareSessionMessages(sessionId, options);
      const messages = healthcareMessages.map(msg => this.convertToEnhancedMessage(msg));

      return messages;
    } catch (error) {
      this.logger.error('Failed to get healthcare session messages', { error, sessionId });
      throw error instanceof ChatServiceError ? error : 
        new ChatServiceError('HEALTHCARE_MESSAGES_GET_FAILED', 
          'Failed to get healthcare session messages', error);
    }
  }

  /**
   * End healthcare chat session
   */
  public async endSession(sessionId: string, reason?: string): Promise<EnhancedChatSession> {
    try {
      // Perform session closure compliance checks
      const complianceCheck = await this.performSessionClosureComplianceCheck(sessionId, reason);
      if (!complianceCheck.passed) {
        throw new ChatServiceError('SESSION_CLOSURE_COMPLIANCE_FAILED', 
          'Session closure failed healthcare compliance check', complianceCheck);
      }

      const healthcareSession = await this.endHealthcareSession(sessionId, reason);
      const session = this.convertToEnhancedSession(healthcareSession);

      // Perform post-closure actions
      await this.performPostClosureActions(session, reason);

      this.logger.info('Healthcare chat session ended successfully', { 
        sessionId, 
        reason 
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to end healthcare chat session', { error, sessionId });
      throw error instanceof ChatServiceError ? error : 
        new ChatServiceError('HEALTHCARE_SESSION_END_FAILED', 
          'Failed to end healthcare chat session', error);
    }
  }

  /**
   * Abstract methods to be implemented by specific healthcare services
   */
  protected abstract createHealthcareSession(params: ChatSessionCreationParams): Promise<HealthcareChatSession>;
  protected abstract createHealthcareMessage(params: ChatMessageCreationParams): Promise<HealthcareChatMessage>;
  protected abstract getHealthcareSession(sessionId: string): Promise<HealthcareChatSession>;
  protected abstract getHealthcareSessionMessages(sessionId: string, options?: any): Promise<HealthcareChatMessage[]>;
  protected abstract endHealthcareSession(sessionId: string, reason?: string): Promise<HealthcareChatSession>;

  /**
   * Service-specific validation methods
   */
  protected abstract validateSessionParams(params: ChatSessionCreationParams): void;
  protected abstract validateMessageContent(params: ChatMessageCreationParams): void;
  protected abstract performHealthcareComplianceCheck(params: ChatSessionCreationParams): Promise<ComplianceCheckResult>;
  protected abstract performMessageComplianceCheck(params: ChatMessageCreationParams): Promise<ComplianceCheckResult>;
  protected abstract performSessionClosureComplianceCheck(sessionId: string, reason?: string): Promise<ComplianceCheckResult>;

  /**
   * Service-specific post-actions
   */
  protected abstract performPostMessageActions(message: EnhancedChatMessage): Promise<void>;
  protected abstract performPostClosureActions(session: EnhancedChatSession, reason?: string): Promise<void>;

  /**
   * Convert healthcare-specific session to enhanced session
   */
  protected convertToEnhancedSession(healthcareSession: HealthcareChatSession): EnhancedChatSession {
    const session: EnhancedChatSession = {
      id: healthcareSession.id,
      type: healthcareSession.type,
      status: healthcareSession.status,
      clinicId: healthcareSession.clinicId,
      userId: healthcareSession.userId,
      professionalId: healthcareSession.professionalId,
      patientId: healthcareSession.patientId,
      title: healthcareSession.title,
      description: healthcareSession.description,
      startedAt: healthcareSession.createdAt,
      endedAt: healthcareSession.endedAt,
      lastActivityAt: healthcareSession.updatedAt,
      healthcareContext: {
        patientId: healthcareSession.patientId,
        professionalId: healthcareSession.professionalId,
        clinicId: healthcareSession.clinicId,
        sessionType: healthcareSession.type,
        urgencyLevel: healthcareSession.urgencyLevel,
        medicalDataType: healthcareSession.medicalDataType,
        encounterId: healthcareSession.encounterId,
        department: healthcareSession.department,
        specialty: healthcareSession.specialty
      },
      complianceInfo: {
        consentStatus: healthcareSession.consentStatus,
        consentType: healthcareSession.consentType,
        dataRetentionPolicy: healthcareSession.dataRetentionPolicy,
        auditLevel: healthcareSession.auditLevel,
        complianceFramework: healthcareSession.complianceFramework
      },
      metadata: {
        ...healthcareSession.metadata,
        healthcareSpecific: healthcareSession.healthcareSpecific
      },
      participants: healthcareSession.participants,
      settings: healthcareSession.settings,
      analytics: healthcareSession.analytics
    };

    return session;
  }

  /**
   * Convert healthcare-specific message to enhanced message
   */
  protected convertToEnhancedMessage(healthcareMessage: HealthcareChatMessage): EnhancedChatMessage {
    const message: EnhancedChatMessage = {
      id: healthcareMessage.id,
      sessionId: healthcareMessage.sessionId,
      role: healthcareMessage.role,
      content: healthcareMessage.content,
      messageType: healthcareMessage.messageType,
      createdAt: healthcareMessage.createdAt,
      updatedAt: healthcareMessage.updatedAt,
      senderId: healthcareMessage.senderId,
      receiverId: healthcareMessage.receiverId,
      repliedTo: healthcareMessage.repliedTo,
      threadId: healthcareMessage.threadId,
      isEdited: healthcareMessage.isEdited,
      isDeleted: healthcareMessage.isDeleted,
      isEncrypted: healthcareMessage.isEncrypted,
      isUrgent: healthcareMessage.isUrgent,
      requiresAcknowledgment: healthcareMessage.requiresAcknowledgment,
      attachments: healthcareMessage.attachments,
      mentions: healthcareMessage.mentions,
      reactions: healthcareMessage.reactions,
      redactionFlags: healthcareMessage.redactionFlags,
      healthcareData: healthcareMessage.healthcareData,
      complianceInfo: healthcareMessage.complianceInfo,
      metadata: healthcareMessage.metadata,
      analytics: healthcareMessage.analytics
    };

    return message;
  }

  /**
   * Create healthcare context from session parameters
   */
  protected createHealthcareContext(params: ChatSessionCreationParams): HealthcareContext {
    return {
      patientId: params.patientId,
      professionalId: params.professionalId,
      clinicId: params.clinicId,
      sessionType: params.type,
      urgencyLevel: params.urgencyLevel || 'normal',
      medicalDataType: params.medicalDataType || 'general',
      encounterId: params.encounterId,
      department: params.department,
      specialty: params.specialty
    };
  }

  /**
   * Create compliance info from session parameters
   */
  protected createComplianceInfo(params: ChatSessionCreationParams): HealthcareComplianceInfo {
    return {
      consentStatus: params.consentStatus || 'granted',
      consentType: params.consentType || ['medical_consultation'],
      dataRetentionPolicy: params.dataRetentionPolicy || 'standard',
      auditLevel: params.auditLevel || 'detailed',
      complianceFramework: params.complianceFramework || ['LGPD', 'ANVISA']
    };
  }

  /**
   * Validate healthcare data format
   */
  protected validateHealthcareData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check for required fields based on medical data type
    const requiredFields = this.getRequiredFieldsForDataType(data.medicalDataType);
    return requiredFields.every(field => field in data);
  }

  /**
   * Get required fields for medical data type
   */
  protected getRequiredFieldsForDataType(dataType: MedicalDataType): string[] {
    switch (dataType) {
      case 'symptoms':
        return ['symptoms', 'severity', 'duration'];
      case 'vital_signs':
        return ['vitals', 'timestamp'];
      case 'medication':
        return ['medication', 'dosage', 'frequency'];
      case 'allergies':
        return ['allergen', 'reaction', 'severity'];
      case 'medical_history':
        return ['condition', 'diagnosisDate', 'status'];
      case 'lab_results':
        return ['testType', 'result', 'referenceRange', 'timestamp'];
      case 'imaging':
        return ['imageType', 'findings', 'impression'];
      case 'treatment_plan':
        return ['diagnosis', 'treatment', 'duration'];
      case 'prescription':
        return ['medication', 'dosage', 'instructions'];
      default:
        return [];
    }
  }

  /**
   * Sanitize healthcare data for compliance
   */
  protected sanitizeHealthcareData(data: any): any {
    // Remove sensitive fields that shouldn't be stored
    const sensitiveFields = ['ssn', 'creditCard', 'password', 'apiKey'];
    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  /**
   * Generate unique healthcare session ID
   */
  protected generateHealthcareSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `hc_${this.serviceName.toLowerCase()}_${timestamp}_${random}`;
  }

  /**
   * Generate unique healthcare message ID
   */
  protected generateHealthcareMessageId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `hcm_${this.serviceName.toLowerCase()}_${timestamp}_${random}`;
  }

  /**
   * Log healthcare-specific event
   */
  protected logHealthcareEvent(event: string, data: any): void {
    this.logger.info(`Healthcare event: ${event}`, {
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Handle healthcare-specific error
   */
  protected handleHealthcareError(error: Error, context: any): void {
    this.logger.error('Healthcare service error', {
      service: this.serviceName,
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
}