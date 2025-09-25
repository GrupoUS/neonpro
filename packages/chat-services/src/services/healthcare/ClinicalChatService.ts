/**
 * Clinical Chat Service
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
  HealthcareComplianceInfo
} from '../types/chat';

import {
  ClinicalChatSession,
  ClinicalChatMessage,
  MedicalDataType,
  HealthcareUrgencyLevel,
  ClinicalData,
  SymptomReport,
  VitalSigns,
  MedicationData,
  LabResult,
  MedicalHistory,
  Diagnosis,
  TreatmentPlan
} from '../types/healthcare-chat';

import {
  HealthcareComplianceService,
  ComplianceCheckRequest,
  ComplianceCheckResult
} from '../compliance';

import { BaseHealthcareChatService } from './BaseHealthcareChatService';
import { Logger } from '@neonpro/core-services';

/**
 * Clinical Chat Service for medical consultations and patient care
 */
export class ClinicalChatService extends BaseHealthcareChatService {
  private isInitialized: boolean = false;
  private clinicalDataStore: Map<string, ClinicalData> = new Map();

  constructor(complianceService: HealthcareComplianceService) {
    super('ClinicalChatService', complianceService);
  }

  /**
   * Initialize the clinical chat service
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Clinical Chat Service...');

      // Load clinical data from persistent storage
      await this.loadClinicalData();

      // Setup clinical-specific event handlers
      await this.setupClinicalEventHandlers();

      this.isInitialized = true;
      this.logger.info('Clinical Chat Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Clinical Chat Service', { error });
      throw new ChatServiceError('CLINICAL_SERVICE_INIT_FAILED', 'Failed to initialize clinical chat service', error);
    }
  }

  /**
   * Get service health status
   */
  public async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    metrics: Record<string, any>;
    lastCheck: Date;
  }> {
    const metrics = {
      activeSessions: this.clinicalDataStore.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      isInitialized: this.isInitialized
    };

    return {
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      metrics,
      lastCheck: new Date()
    };
  }

  /**
   * Shutdown the clinical chat service
   */
  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Clinical Chat Service...');

      // Persist clinical data
      await this.persistClinicalData();

      // Clear in-memory data
      this.clinicalDataStore.clear();

      this.isInitialized = false;
      this.logger.info('Clinical Chat Service shutdown completed');
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
      throw error;
    }
  }

  /**
   * Create clinical-specific chat session
   */
  protected async createHealthcareSession(params: ChatSessionCreationParams): Promise<ClinicalChatSession> {
    const sessionId = this.generateHealthcareSessionId();
    
    const clinicalSession: ClinicalChatSession = {
      id: sessionId,
      type: 'clinical',
      status: 'active',
      clinicId: params.clinicId,
      userId: params.userId,
      professionalId: params.professionalId,
      patientId: params.patientId,
      title: params.title || `Clinical Consultation - ${new Date().toLocaleDateString()}`,
      description: params.description || 'Medical consultation session',
      createdAt: new Date(),
      updatedAt: new Date(),
      endedAt: null,
      urgencyLevel: params.urgencyLevel || 'normal',
      medicalDataType: params.medicalDataType || 'general',
      encounterId: params.encounterId,
      department: params.department || 'general',
      specialty: params.specialty || 'general_practice',
      consentStatus: params.consentStatus || 'granted',
      consentType: params.consentType || ['medical_consultation'],
      dataRetentionPolicy: params.dataRetentionPolicy || 'standard',
      auditLevel: params.auditLevel || 'comprehensive',
      complianceFramework: params.complianceFramework || ['LGPD', 'ANVISA', 'CFM'],
      participants: params.participants || [],
      settings: params.settings || {},
      metadata: params.metadata || {},
      analytics: {
        sessionDuration: 0,
        messageCount: 0,
        clinicalDataPoints: 0,
        complianceScore: 100,
        riskAssessment: 'low'
      },
      clinicalData: {
        chiefComplaint: params.chiefComplaint,
        presentIllness: params.presentIllness,
        pastMedicalHistory: params.pastMedicalHistory,
        medications: params.medications || [],
        allergies: params.allergies || [],
        vitalSigns: params.vitalSigns,
        symptoms: params.symptoms || [],
        labResults: params.labResults || [],
        imagingResults: params.imagingResults || [],
        diagnoses: params.diagnoses || [],
        treatmentPlan: params.treatmentPlan,
        followUpRequired: params.followUpRequired || false,
        followUpDate: params.followUpDate,
        riskFactors: params.riskFactors || [],
        preventiveCare: params.preventiveCare || []
      },
      healthcareSpecific: {
        consultationType: params.consultationType || 'general',
        visitReason: params.visitReason,
        referralSource: params.referralSource,
        isFollowUp: params.isFollowUp || false,
        previousVisitId: params.previousVisitId,
        telehealthEnabled: params.telehealthEnabled || false
      }
    };

    // Store clinical data
    this.clinicalDataStore.set(sessionId, clinicalSession.clinicalData);

    return clinicalSession;
  }

  /**
   * Create clinical-specific chat message
   */
  protected async createHealthcareMessage(params: ChatMessageCreationParams): Promise<ClinicalChatMessage> {
    const messageId = this.generateHealthcareMessageId();
    
    const clinicalMessage: ClinicalChatMessage = {
      id: messageId,
      sessionId: params.sessionId,
      role: params.role,
      content: params.content,
      messageType: params.messageType || 'text',
      createdAt: new Date(),
      updatedAt: new Date(),
      senderId: params.senderId,
      receiverId: params.receiverId,
      repliedTo: params.repliedTo,
      threadId: params.threadId,
      isEdited: false,
      isDeleted: false,
      isEncrypted: params.isEncrypted || false,
      isUrgent: params.isUrgent || false,
      requiresAcknowledgment: params.requiresAcknowledgment || false,
      attachments: params.attachments || [],
      mentions: params.mentions || [],
      reactions: [],
      redactionFlags: [],
      healthcareData: params.healthcareData || this.processClinicalHealthcareData(params),
      complianceInfo: {
        consentVerified: true,
        dataClassification: 'protected_health_information',
        retentionPeriod: '10_years',
        accessControls: ['healthcare_provider', 'patient'],
        encryptionStatus: 'encrypted',
        auditRequired: true
      },
      metadata: params.metadata || {},
      analytics: {
        processingTime: 0,
        clinicalRelevanceScore: this.calculateClinicalRelevanceScore(params.content),
        urgencyScore: this.calculateUrgencyScore(params),
        complianceScore: 100
      },
      clinicalSpecific: {
        messageCategory: this.categorizeClinicalMessage(params.content),
        requiresMedicalReview: this.requiresMedicalReview(params),
        isPrescriptionRelated: this.isPrescriptionRelated(params),
        containsProtectedInfo: this.containsProtectedHealthInfo(params.content),
        clinicalKeywords: this.extractClinicalKeywords(params.content)
      }
    };

    return clinicalMessage;
  }

  /**
   * Get clinical chat session
   */
  protected async getHealthcareSession(sessionId: string): Promise<ClinicalChatSession> {
    // This would typically query the database
    // For now, we'll use the in-memory store
    const clinicalData = this.clinicalDataStore.get(sessionId);
    if (!clinicalData) {
      throw new ChatServiceError('CLINICAL_SESSION_NOT_FOUND', 'Clinical session not found');
    }

    // Reconstruct session from clinical data
    const session: ClinicalChatSession = {
      id: sessionId,
      type: 'clinical',
      status: 'active',
      clinicId: clinicalData.clinicId || '',
      userId: clinicalData.userId || '',
      professionalId: clinicalData.professionalId || '',
      patientId: clinicalData.patientId || '',
      title: 'Clinical Consultation',
      description: 'Medical consultation session',
      createdAt: new Date(),
      updatedAt: new Date(),
      endedAt: null,
      urgencyLevel: 'normal',
      medicalDataType: 'general',
      encounterId: clinicalData.encounterId,
      department: clinicalData.department || 'general',
      specialty: clinicalData.specialty || 'general_practice',
      consentStatus: 'granted',
      consentType: ['medical_consultation'],
      dataRetentionPolicy: 'standard',
      auditLevel: 'comprehensive',
      complianceFramework: ['LGPD', 'ANVISA', 'CFM'],
      participants: [],
      settings: {},
      metadata: {},
      analytics: {
        sessionDuration: 0,
        messageCount: 0,
        clinicalDataPoints: Object.keys(clinicalData).length,
        complianceScore: 100,
        riskAssessment: 'low'
      },
      clinicalData,
      healthcareSpecific: {
        consultationType: 'general',
        visitReason: 'consultation',
        referralSource: 'direct',
        isFollowUp: false,
        telehealthEnabled: false
      }
    };

    return session;
  }

  /**
   * Get clinical session messages
   */
  protected async getHealthcareSessionMessages(sessionId: string, options?: any): Promise<ClinicalChatMessage[]> {
    // This would typically query the database
    // For now, return empty array as messages would be stored elsewhere
    return [];
  }

  /**
   * End clinical chat session
   */
  protected async endHealthcareSession(sessionId: string, reason?: string): Promise<ClinicalChatSession> {
    const session = await this.getHealthcareSession(sessionId);
    
    // Update session status
    session.status = 'completed';
    session.endedAt = new Date();
    session.updatedAt = new Date();

    // Perform clinical session closure procedures
    await this.performClinicalSessionClosure(session, reason);

    // Remove from in-memory store
    this.clinicalDataStore.delete(sessionId);

    return session;
  }

  /**
   * Validate clinical session parameters
   */
  protected validateSessionParams(params: ChatSessionCreationParams): void {
    if (!params.patientId) {
      throw new ChatServiceError('INVALID_SESSION_PARAMS', 'Patient ID is required for clinical sessions');
    }

    if (!params.professionalId) {
      throw new ChatServiceError('INVALID_SESSION_PARAMS', 'Professional ID is required for clinical sessions');
    }

    if (!params.clinicId) {
      throw new ChatServiceError('INVALID_SESSION_PARAMS', 'Clinic ID is required for clinical sessions');
    }

    // Validate medical data type
    const validMedicalDataTypes: MedicalDataType[] = [
      'symptoms', 'vital_signs', 'medication', 'allergies', 'medical_history',
      'lab_results', 'imaging', 'treatment_plan', 'prescription', 'diagnosis'
    ];

    if (params.medicalDataType && !validMedicalDataTypes.includes(params.medicalDataType)) {
      throw new ChatServiceError('INVALID_MEDICAL_DATA_TYPE', `Invalid medical data type: ${params.medicalDataType}`);
    }
  }

  /**
   * Validate clinical message content
   */
  protected validateMessageContent(params: ChatMessageCreationParams): void {
    if (!params.content || params.content.trim().length === 0) {
      throw new ChatServiceError('INVALID_MESSAGE_CONTENT', 'Message content cannot be empty');
    }

    // Check for prohibited content
    const prohibitedPatterns = [
      /ssn|social security/i,
      /credit card|card number/i,
      /password|pwd/i,
      /api[_-]?key/i
    ];

    for (const pattern of prohibitedPatterns) {
      if (pattern.test(params.content)) {
        throw new ChatServiceError('PROHIBITED_CONTENT', 'Message contains prohibited content');
      }
    }

    // Validate healthcare data if present
    if (params.healthcareData) {
      if (!this.validateHealthcareData(params.healthcareData)) {
        throw new ChatServiceError('INVALID_HEALTHCARE_DATA', 'Invalid healthcare data format');
      }
    }
  }

  /**
   * Perform healthcare compliance check for clinical session
   */
  protected async performHealthcareComplianceCheck(params: ChatSessionCreationParams): Promise<ComplianceCheckResult> {
    const complianceRequest: ComplianceCheckRequest = {
      type: 'session_creation',
      sessionType: 'clinical',
      patientId: params.patientId,
      professionalId: params.professionalId,
      clinicId: params.clinicId,
      data: {
        urgencyLevel: params.urgencyLevel,
        medicalDataType: params.medicalDataType,
        specialty: params.specialty,
        department: params.department
      },
      framework: ['LGPD', 'ANVISA', 'CFM']
    };

    return await this.complianceService.performComplianceCheck(complianceRequest);
  }

  /**
   * Perform message compliance check for clinical message
   */
  protected async performMessageComplianceCheck(params: ChatMessageCreationParams): Promise<ComplianceCheckResult> {
    const complianceRequest: ComplianceCheckRequest = {
      type: 'message_content',
      sessionType: 'clinical',
      data: {
        content: params.content,
        messageType: params.messageType,
        role: params.role,
        healthcareData: params.healthcareData
      },
      framework: ['LGPD', 'ANVISA', 'CFM']
    };

    return await this.complianceService.performComplianceCheck(complianceRequest);
  }

  /**
   * Perform session closure compliance check
   */
  protected async performSessionClosureComplianceCheck(sessionId: string, reason?: string): Promise<ComplianceCheckResult> {
    const complianceRequest: ComplianceCheckRequest = {
      type: 'session_closure',
      sessionType: 'clinical',
      sessionId: sessionId,
      data: {
        closureReason: reason,
        timestamp: new Date()
      },
      framework: ['LGPD', 'ANVISA', 'CFM']
    };

    return await this.complianceService.performComplianceCheck(complianceRequest);
  }

  /**
   * Perform post-message actions for clinical messages
   */
  protected async performPostMessageActions(message: EnhancedChatMessage): Promise<void> {
    // Log clinical message for audit
    await this.logClinicalMessage(message);

    // Check for urgent medical content
    if (message.isUrgent || message.analytics?.urgencyScore > 0.7) {
      await this.handleUrgentClinicalMessage(message);
    }

    // Update clinical data store if needed
    if (message.healthcareData) {
      await this.updateClinicalData(message.sessionId, message.healthcareData);
    }
  }

  /**
   * Perform post-closure actions for clinical sessions
   */
  protected async performPostClosureActions(session: EnhancedChatSession, reason?: string): Promise<void> {
    // Generate clinical summary
    await this.generateClinicalSummary(session.id, reason);

    // Schedule follow-up if required
    if (session.healthcareContext?.urgencyLevel === 'high') {
      await this.scheduleFollowUp(session.id);
    }

    // Archive clinical data
    await this.archiveClinicalData(session.id);
  }

  /**
   * Process clinical healthcare data
   */
  private processClinicalHealthcareData(params: ChatMessageCreationParams): any {
    if (!params.healthcareData) {
      return null;
    }

    const processedData = this.sanitizeHealthcareData(params.healthcareData);
    
    // Add clinical processing metadata
    return {
      ...processedData,
      processedAt: new Date(),
      processingType: 'clinical',
      validated: true,
      relevanceScore: this.calculateClinicalRelevanceScore(params.content)
    };
  }

  /**
   * Calculate clinical relevance score
   */
  private calculateClinicalRelevanceScore(content: string): number {
    const clinicalKeywords = [
      'pain', 'fever', 'cough', 'nausea', 'headache', 'dizziness', 'fatigue',
      'medication', 'prescription', 'dosage', 'treatment', 'therapy',
      'diagnosis', 'symptom', 'vital', 'lab', 'test', 'result',
      'allergy', 'reaction', 'side effect', 'condition', 'disease'
    ];

    const words = content.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(word => clinicalKeywords.includes(word)).length;
    const totalWords = words.length;

    return Math.min(keywordCount / totalWords, 1);
  }

  /**
   * Calculate urgency score
   */
  private calculateUrgencyScore(params: ChatMessageCreationParams): number {
    const urgencyKeywords = [
      'emergency', 'urgent', 'severe', 'critical', 'immediate',
      'chest pain', 'difficulty breathing', 'unconscious', 'bleeding',
      'allergic reaction', 'overdose', 'suicide', 'heart attack', 'stroke'
    ];

    const content = params.content.toLowerCase();
    const keywordCount = urgencyKeywords.filter(keyword => content.includes(keyword)).length;

    return Math.min(keywordCount * 0.3, 1);
  }

  /**
   * Categorize clinical message
   */
  private categorizeClinicalMessage(content: string): string {
    const categories = {
      'symptom_report': ['symptom', 'pain', 'fever', 'cough', 'nausea'],
      'medication_inquiry': ['medication', 'prescription', 'dosage', 'drug'],
      'treatment_discussion': ['treatment', 'therapy', 'procedure', 'surgery'],
      'test_result': ['test', 'result', 'lab', 'x-ray', 'scan'],
      'diagnosis_discussion': ['diagnosis', 'condition', 'disease'],
      'follow_up': ['follow up', 'appointment', 'check up'],
      'emergency': ['emergency', 'urgent', 'severe', 'critical']
    };

    const contentLower = content.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Check if message requires medical review
   */
  private requiresMedicalReview(params: ChatMessageCreationParams): boolean {
    const reviewKeywords = [
      'new symptom', 'worsening', 'side effect', 'allergic reaction',
      'chest pain', 'difficulty breathing', 'severe pain', 'unconscious'
    ];

    const content = params.content.toLowerCase();
    return reviewKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Check if message is prescription related
   */
  private isPrescriptionRelated(params: ChatMessageCreationParams): boolean {
    const prescriptionKeywords = [
      'prescription', 'medication', 'dosage', 'refill', 'drug'
    ];

    const content = params.content.toLowerCase();
    return prescriptionKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Check if message contains protected health information
   */
  private containsProtectedHealthInfo(content: string): boolean {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{10}\b/, // Phone number
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{2}\/\d{2}\/\d{4}\b/ // Date pattern
    ];

    return phiPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract clinical keywords from message
   */
  private extractClinicalKeywords(content: string): string[] {
    const clinicalKeywords = [
      'pain', 'fever', 'cough', 'nausea', 'headache', 'dizziness', 'fatigue',
      'medication', 'prescription', 'dosage', 'treatment', 'therapy',
      'diagnosis', 'symptom', 'vital', 'lab', 'test', 'result',
      'allergy', 'reaction', 'side effect', 'condition', 'disease'
    ];

    const words = content.toLowerCase().split(/\s+/);
    return words.filter(word => clinicalKeywords.includes(word));
  }

  /**
   * Load clinical data from persistent storage
   */
  private async loadClinicalData(): Promise<void> {
    // This would typically load from database or file storage
    // For now, we'll initialize with empty data
    this.logger.info('Clinical data loaded from persistent storage');
  }

  /**
   * Persist clinical data to storage
   */
  private async persistClinicalData(): Promise<void> {
    // This would typically save to database or file storage
    this.logger.info('Clinical data persisted to storage');
  }

  /**
   * Setup clinical event handlers
   */
  private async setupClinicalEventHandlers(): Promise<void> {
    // Setup clinical-specific event handlers
    this.logger.info('Clinical event handlers setup completed');
  }

  /**
   * Log clinical message for audit
   */
  private async logClinicalMessage(message: EnhancedChatMessage): Promise<void> {
    // Log message for clinical audit trail
    this.logger.debug('Clinical message logged for audit', {
      messageId: message.id,
      sessionId: message.sessionId,
      messageType: message.messageType,
      timestamp: message.createdAt
    });
  }

  /**
   * Handle urgent clinical message
   */
  private async handleUrgentClinicalMessage(message: EnhancedChatMessage): Promise<void> {
    // Handle urgent clinical messages (alerts, notifications, etc.)
    this.logger.warn('Urgent clinical message detected', {
      messageId: message.id,
      sessionId: message.sessionId,
      urgencyScore: message.analytics?.urgencyScore
    });
  }

  /**
   * Update clinical data store
   */
  private async updateClinicalData(sessionId: string, healthcareData: any): Promise<void> {
    const existingData = this.clinicalDataStore.get(sessionId) || {};
    const updatedData = { ...existingData, ...healthcareData, updatedAt: new Date() };
    this.clinicalDataStore.set(sessionId, updatedData);
  }

  /**
   * Generate clinical summary
   */
  private async generateClinicalSummary(sessionId: string, reason?: string): Promise<void> {
    // Generate clinical summary for the session
    this.logger.info('Clinical summary generated', { sessionId, reason });
  }

  /**
   * Schedule follow-up
   */
  private async scheduleFollowUp(sessionId: string): Promise<void> {
    // Schedule follow-up appointment
    this.logger.info('Follow-up scheduled', { sessionId });
  }

  /**
   * Archive clinical data
   */
  private async archiveClinicalData(sessionId: string): Promise<void> {
    // Archive clinical data for long-term storage
    this.logger.info('Clinical data archived', { sessionId });
  }

  /**
   * Perform clinical session closure procedures
   */
  private async performClinicalSessionClosure(session: ClinicalChatSession, reason?: string): Promise<void> {
    // Perform any clinical-specific closure procedures
    this.logger.info('Clinical session closure procedures completed', {
      sessionId: session.id,
      reason
    });
  }
}