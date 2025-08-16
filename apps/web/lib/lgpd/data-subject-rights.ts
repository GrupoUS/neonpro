/**
 * LGPD Data Subject Rights Management System
 * Implements automated handling of data subject rights requests
 *
 * Features:
 * - Automated request processing for all LGPD rights
 * - Data portability with multiple export formats
 * - Data rectification with audit trails
 * - Data erasure with compliance verification
 * - Processing restriction management
 * - Objection handling with legal basis validation
 * - Automated decision-making opt-out
 * - Request tracking and status management
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { EventEmitter } from 'node:events';

// ============================================================================
// DATA SUBJECT RIGHTS TYPES & INTERFACES
// ============================================================================

/**
 * LGPD Data Subject Rights
 */
export enum DataSubjectRight {
  ACCESS = 'access', // Art. 9, I - Confirmação e acesso
  RECTIFICATION = 'rectification', // Art. 9, III - Correção
  ERASURE = 'erasure', // Art. 9, VI - Eliminação
  PORTABILITY = 'portability', // Art. 9, V - Portabilidade
  RESTRICTION = 'restriction', // Art. 9, IV - Limitação do tratamento
  OBJECTION = 'objection', // Art. 9, II - Oposição
  AUTOMATED_DECISION_OPT_OUT = 'automated_decision_opt_out', // Art. 9, VII
  INFORMATION = 'information', // Art. 9, VIII - Informações sobre compartilhamento
  CONSENT_WITHDRAWAL = 'consent_withdrawal', // Art. 8, §5º
}

/**
 * Request Status Types
 */
export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Request Priority Levels
 */
export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Data Export Formats
 */
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PDF = 'pdf',
}

/**
 * Data Subject Rights Request Interface
 */
export type DataSubjectRightsRequest = {
  id: string;
  userId: string;
  requestType: DataSubjectRight;
  status: RequestStatus;
  priority: RequestPriority;
  description: string;
  requestData: {
    specificData?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    exportFormat?: ExportFormat;
    rectificationData?: Record<string, any>;
    erasureReason?: string;
    objectionReason?: string;
    restrictionReason?: string;
  };
  verification: {
    method: 'email' | 'sms' | 'document' | 'biometric';
    verified: boolean;
    verificationDate?: Date;
    verificationData?: Record<string, any>;
  };
  processing: {
    assignedTo?: string;
    startedAt?: Date;
    completedAt?: Date;
    estimatedCompletion?: Date;
    processingNotes?: string[];
    automatedProcessing: boolean;
  };
  response: {
    responseData?: any;
    responseFormat?: ExportFormat;
    downloadUrl?: string;
    expiryDate?: Date;
    deliveryMethod: 'download' | 'email' | 'api';
  };
  compliance: {
    legalBasis: string;
    complianceNotes: string[];
    reviewRequired: boolean;
    reviewedBy?: string;
    reviewDate?: Date;
  };
  auditTrail: RequestAuditEntry[];
  metadata: {
    ipAddress: string;
    userAgent: string;
    requestSource: string;
    language: 'pt' | 'en';
    urgencyJustification?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Request Audit Entry
 */
export type RequestAuditEntry = {
  id: string;
  action: string;
  actor: {
    type: 'user' | 'system' | 'admin';
    id: string;
    name?: string;
  };
  timestamp: Date;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
};

/**
 * Data Access Response
 */
export type DataAccessResponse = {
  personalData: {
    basic: Record<string, any>;
    authentication: Record<string, any>;
    preferences: Record<string, any>;
    activity: Record<string, any>;
  };
  processingActivities: {
    purpose: string;
    legalBasis: string;
    dataTypes: string[];
    retention: string;
    sharing: {
      recipients: string[];
      purpose: string;
    }[];
  }[];
  consents: {
    dataType: string;
    purpose: string;
    status: string;
    date: Date;
    expiryDate?: Date;
  }[];
  dataSharing: {
    recipient: string;
    purpose: string;
    dataTypes: string[];
    date: Date;
    legalBasis: string;
  }[];
  automatedDecisions: {
    decision: string;
    logic: string;
    significance: string;
    date: Date;
  }[];
  retentionPolicies: {
    dataType: string;
    retentionPeriod: string;
    deletionDate?: Date;
  }[];
  metadata: {
    generatedAt: Date;
    format: ExportFormat;
    language: 'pt' | 'en';
    requestId: string;
  };
};

/**
 * Data Portability Package
 */
export type DataPortabilityPackage = {
  userData: Record<string, any>;
  metadata: {
    exportDate: Date;
    format: ExportFormat;
    version: string;
    checksum: string;
  };
  structure: {
    tables: {
      name: string;
      fields: string[];
      recordCount: number;
    }[];
    relationships: {
      from: string;
      to: string;
      type: string;
    }[];
  };
  compliance: {
    lgpdCompliant: boolean;
    dataMinimization: boolean;
    purposeLimitation: boolean;
  };
};

/**
 * Rights Request Events
 */
export type RightsRequestEvents = {
  'request:created': { request: DataSubjectRightsRequest };
  'request:verified': { request: DataSubjectRightsRequest };
  'request:processing': { request: DataSubjectRightsRequest };
  'request:completed': { request: DataSubjectRightsRequest; response: any };
  'request:rejected': { request: DataSubjectRightsRequest; reason: string };
  'request:expired': { request: DataSubjectRightsRequest };
  'data:accessed': { userId: string; dataTypes: string[] };
  'data:rectified': { userId: string; changes: Record<string, any> };
  'data:erased': { userId: string; dataTypes: string[] };
  'data:restricted': { userId: string; restrictions: string[] };
  'audit:violation': {
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
};

// ============================================================================
// DATA SUBJECT RIGHTS MANAGER
// ============================================================================

/**
 * Data Subject Rights Management System
 *
 * Provides comprehensive management of LGPD data subject rights including:
 * - Automated request processing and verification
 * - Data access and portability with multiple formats
 * - Data rectification and erasure with audit trails
 * - Processing restriction and objection handling
 * - Compliance monitoring and reporting
 */
export class DataSubjectRightsManager extends EventEmitter {
  private readonly requests: Map<string, DataSubjectRightsRequest> = new Map();
  private readonly processingQueue: string[] = [];
  private isInitialized = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: {
      autoProcessing: boolean;
      verificationRequired: boolean;
      processingTimeoutDays: number;
      responseExpiryDays: number;
      maxConcurrentRequests: number;
      processingIntervalMinutes: number;
      cleanupIntervalHours: number;
      supportedFormats: ExportFormat[];
      defaultLanguage: 'pt' | 'en';
    } = {
      autoProcessing: true,
      verificationRequired: true,
      processingTimeoutDays: 30,
      responseExpiryDays: 90,
      maxConcurrentRequests: 10,
      processingIntervalMinutes: 5,
      cleanupIntervalHours: 24,
      supportedFormats: [ExportFormat.JSON, ExportFormat.CSV, ExportFormat.PDF],
      defaultLanguage: 'pt',
    },
  ) {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Initialize the rights management system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load existing requests
      await this.loadRequests();

      // Start processing intervals
      if (this.config.autoProcessing) {
        this.startProcessingInterval();
      }
      this.startCleanupInterval();

      this.isInitialized = true;
      this.addAuditEntry('system', 'rights_manager_initialized', {
        timestamp: new Date(),
      });
    } catch (error) {
      throw new Error(`Failed to initialize rights manager: ${error}`);
    }
  }

  /**
   * Create a new data subject rights request
   */
  async createRequest(
    userId: string,
    requestType: DataSubjectRight,
    requestData: any,
    metadata: {
      ipAddress: string;
      userAgent: string;
      requestSource: string;
      language?: 'pt' | 'en';
      urgencyJustification?: string;
    },
  ): Promise<DataSubjectRightsRequest> {
    const request: DataSubjectRightsRequest = {
      id: this.generateRequestId(),
      userId,
      requestType,
      status: RequestStatus.PENDING,
      priority: this.determinePriority(requestType, requestData),
      description: this.generateDescription(
        requestType,
        this.config.defaultLanguage,
      ),
      requestData,
      verification: {
        method: 'email',
        verified: !this.config.verificationRequired,
      },
      processing: {
        automatedProcessing: this.canAutoProcess(requestType),
      },
      response: {
        deliveryMethod: 'download',
      },
      compliance: {
        legalBasis: this.getLegalBasis(requestType),
        complianceNotes: [],
        reviewRequired: this.requiresReview(requestType),
      },
      auditTrail: [
        {
          id: this.generateId(),
          action: 'request_created',
          actor: { type: 'user', id: userId },
          timestamp: new Date(),
          details: {
            requestType,
            priority: this.determinePriority(requestType, requestData),
          },
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        },
      ],
      metadata: {
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        requestSource: metadata.requestSource,
        language: metadata.language || this.config.defaultLanguage,
        urgencyJustification: metadata.urgencyJustification,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store request
    this.requests.set(request.id, request);
    await this.saveRequest(request);

    // Add to processing queue if auto-processing is enabled
    if (this.config.autoProcessing && !this.config.verificationRequired) {
      this.processingQueue.push(request.id);
    }

    // Emit event
    this.emit('request:created', { request });

    return request;
  }

  /**
   * Verify a request
   */
  async verifyRequest(
    requestId: string,
    verificationData: {
      method: 'email' | 'sms' | 'document' | 'biometric';
      verificationCode?: string;
      documentData?: any;
      biometricData?: any;
    },
  ): Promise<DataSubjectRightsRequest> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.verification.verified) {
      throw new Error('Request already verified');
    }

    // Perform verification logic here
    const verified = await this.performVerification(request, verificationData);

    if (verified) {
      request.verification.verified = true;
      request.verification.verificationDate = new Date();
      request.verification.method = verificationData.method;
      request.verification.verificationData = verificationData;
      request.updatedAt = new Date();

      // Add audit entry
      request.auditTrail.push({
        id: this.generateId(),
        action: 'request_verified',
        actor: { type: 'user', id: request.userId },
        timestamp: new Date(),
        details: { method: verificationData.method },
        ipAddress: request.metadata.ipAddress,
        userAgent: request.metadata.userAgent,
      });

      // Add to processing queue
      if (this.config.autoProcessing) {
        this.processingQueue.push(requestId);
      }

      await this.saveRequest(request);
      this.emit('request:verified', { request });
    } else {
      throw new Error('Verification failed');
    }

    return request;
  }

  /**
   * Process a data access request
   */
  async processAccessRequest(requestId: string): Promise<DataAccessResponse> {
    const request = this.requests.get(requestId);
    if (!request || request.requestType !== DataSubjectRight.ACCESS) {
      throw new Error('Invalid access request');
    }

    try {
      // Update request status
      request.status = RequestStatus.IN_PROGRESS;
      request.processing.startedAt = new Date();
      await this.saveRequest(request);

      // Gather user data
      const userData = await this.gatherUserData(
        request.userId,
        request.requestData,
      );

      // Create access response
      const response: DataAccessResponse = {
        personalData: userData.personalData,
        processingActivities: userData.processingActivities,
        consents: userData.consents,
        dataSharing: userData.dataSharing,
        automatedDecisions: userData.automatedDecisions,
        retentionPolicies: userData.retentionPolicies,
        metadata: {
          generatedAt: new Date(),
          format: request.requestData.exportFormat || ExportFormat.JSON,
          language: request.metadata.language,
          requestId: request.id,
        },
      };

      // Complete request
      await this.completeRequest(request, response);

      // Emit event
      this.emit('data:accessed', {
        userId: request.userId,
        dataTypes: Object.keys(userData.personalData),
      });

      return response;
    } catch (error) {
      await this.rejectRequest(request.id, `Processing failed: ${error}`);
      throw error;
    }
  }

  /**
   * Process a data portability request
   */
  async processPortabilityRequest(
    requestId: string,
  ): Promise<DataPortabilityPackage> {
    const request = this.requests.get(requestId);
    if (!request || request.requestType !== DataSubjectRight.PORTABILITY) {
      throw new Error('Invalid portability request');
    }

    try {
      // Update request status
      request.status = RequestStatus.IN_PROGRESS;
      request.processing.startedAt = new Date();
      await this.saveRequest(request);

      // Create portability package
      const userData = await this.gatherPortableData(
        request.userId,
        request.requestData,
      );
      const format = request.requestData.exportFormat || ExportFormat.JSON;

      const portabilityPackage: DataPortabilityPackage = {
        userData,
        metadata: {
          exportDate: new Date(),
          format,
          version: '1.0',
          checksum: this.generateChecksum(userData),
        },
        structure: await this.generateDataStructure(userData),
        compliance: {
          lgpdCompliant: true,
          dataMinimization: true,
          purposeLimitation: true,
        },
      };

      // Complete request
      await this.completeRequest(request, portabilityPackage);

      return portabilityPackage;
    } catch (error) {
      await this.rejectRequest(
        request.id,
        `Portability processing failed: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Process a data rectification request
   */
  async processRectificationRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request || request.requestType !== DataSubjectRight.RECTIFICATION) {
      throw new Error('Invalid rectification request');
    }

    try {
      // Update request status
      request.status = RequestStatus.IN_PROGRESS;
      request.processing.startedAt = new Date();
      await this.saveRequest(request);

      // Perform data rectification
      const changes = await this.rectifyUserData(
        request.userId,
        request.requestData.rectificationData,
      );

      // Complete request
      await this.completeRequest(request, { changes });

      // Emit event
      this.emit('data:rectified', {
        userId: request.userId,
        changes,
      });
    } catch (error) {
      await this.rejectRequest(request.id, `Rectification failed: ${error}`);
      throw error;
    }
  }

  /**
   * Process a data erasure request
   */
  async processErasureRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request || request.requestType !== DataSubjectRight.ERASURE) {
      throw new Error('Invalid erasure request');
    }

    try {
      // Update request status
      request.status = RequestStatus.IN_PROGRESS;
      request.processing.startedAt = new Date();
      await this.saveRequest(request);

      // Validate erasure request
      const canErase = await this.validateErasureRequest(request);
      if (!canErase.allowed) {
        await this.rejectRequest(request.id, canErase.reason!);
        return;
      }

      // Perform data erasure
      const erasedData = await this.eraseUserData(
        request.userId,
        request.requestData.specificData,
        request.requestData.erasureReason,
      );

      // Complete request
      await this.completeRequest(request, { erasedData });

      // Emit event
      this.emit('data:erased', {
        userId: request.userId,
        dataTypes: erasedData,
      });
    } catch (error) {
      await this.rejectRequest(request.id, `Erasure failed: ${error}`);
      throw error;
    }
  }

  /**
   * Process a processing restriction request
   */
  async processRestrictionRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request || request.requestType !== DataSubjectRight.RESTRICTION) {
      throw new Error('Invalid restriction request');
    }

    try {
      // Update request status
      request.status = RequestStatus.IN_PROGRESS;
      request.processing.startedAt = new Date();
      await this.saveRequest(request);

      // Apply processing restrictions
      const restrictions = await this.applyProcessingRestrictions(
        request.userId,
        request.requestData.specificData,
        request.requestData.restrictionReason,
      );

      // Complete request
      await this.completeRequest(request, { restrictions });

      // Emit event
      this.emit('data:restricted', {
        userId: request.userId,
        restrictions,
      });
    } catch (error) {
      await this.rejectRequest(request.id, `Restriction failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): DataSubjectRightsRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Get user requests
   */
  getUserRequests(userId: string): DataSubjectRightsRequest[] {
    return Array.from(this.requests.values())
      .filter((request) => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get requests by status
   */
  getRequestsByStatus(status: RequestStatus): DataSubjectRightsRequest[] {
    return Array.from(this.requests.values())
      .filter((request) => request.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId: string, reason: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status === RequestStatus.COMPLETED) {
      throw new Error('Cannot cancel completed request');
    }

    request.status = RequestStatus.CANCELLED;
    request.updatedAt = new Date();

    // Add audit entry
    request.auditTrail.push({
      id: this.generateId(),
      action: 'request_cancelled',
      actor: { type: 'user', id: request.userId },
      timestamp: new Date(),
      details: { reason },
      ipAddress: request.metadata.ipAddress,
      userAgent: request.metadata.userAgent,
    });

    await this.saveRequest(request);
  }

  /**
   * Complete a request
   */
  private async completeRequest(
    request: DataSubjectRightsRequest,
    responseData: any,
  ): Promise<void> {
    request.status = RequestStatus.COMPLETED;
    request.processing.completedAt = new Date();
    request.response.responseData = responseData;
    request.response.expiryDate = new Date(
      Date.now() + this.config.responseExpiryDays * 24 * 60 * 60 * 1000,
    );
    request.updatedAt = new Date();

    // Add audit entry
    request.auditTrail.push({
      id: this.generateId(),
      action: 'request_completed',
      actor: { type: 'system', id: 'rights_manager' },
      timestamp: new Date(),
      details: { responseSize: JSON.stringify(responseData).length },
      ipAddress: 'system',
      userAgent: 'system',
    });

    await this.saveRequest(request);
    this.emit('request:completed', { request, response: responseData });
  }

  /**
   * Reject a request
   */
  private async rejectRequest(
    requestId: string,
    reason: string,
  ): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    request.status = RequestStatus.REJECTED;
    request.compliance.complianceNotes.push(reason);
    request.updatedAt = new Date();

    // Add audit entry
    request.auditTrail.push({
      id: this.generateId(),
      action: 'request_rejected',
      actor: { type: 'system', id: 'rights_manager' },
      timestamp: new Date(),
      details: { reason },
      ipAddress: 'system',
      userAgent: 'system',
    });

    await this.saveRequest(request);
    this.emit('request:rejected', { request, reason });
  }

  /**
   * Start processing interval
   */
  private startProcessingInterval(): void {
    this.processingInterval = setInterval(
      async () => {
        await this.processQueue();
      },
      this.config.processingIntervalMinutes * 60 * 1000,
    );
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        await this.cleanupExpiredRequests();
      },
      this.config.cleanupIntervalHours * 60 * 60 * 1000,
    );
  }

  /**
   * Process request queue
   */
  private async processQueue(): Promise<void> {
    const processingCount = Array.from(this.requests.values()).filter(
      (r) => r.status === RequestStatus.IN_PROGRESS,
    ).length;

    if (processingCount >= this.config.maxConcurrentRequests) {
      return;
    }

    const requestsToProcess = this.processingQueue.splice(
      0,
      this.config.maxConcurrentRequests - processingCount,
    );

    for (const requestId of requestsToProcess) {
      try {
        const request = this.requests.get(requestId);
        if (!request?.verification.verified) {
          continue;
        }

        switch (request.requestType) {
          case DataSubjectRight.ACCESS:
            await this.processAccessRequest(requestId);
            break;
          case DataSubjectRight.PORTABILITY:
            await this.processPortabilityRequest(requestId);
            break;
          case DataSubjectRight.RECTIFICATION:
            await this.processRectificationRequest(requestId);
            break;
          case DataSubjectRight.ERASURE:
            await this.processErasureRequest(requestId);
            break;
          case DataSubjectRight.RESTRICTION:
            await this.processRestrictionRequest(requestId);
            break;
        }
      } catch (_error) {}
    }
  }

  /**
   * Cleanup expired requests
   */
  private async cleanupExpiredRequests(): Promise<void> {
    const now = new Date();
    const expiredRequests: DataSubjectRightsRequest[] = [];

    for (const request of this.requests.values()) {
      // Check if request has expired
      const expiryDate = new Date(
        request.createdAt.getTime() +
          this.config.processingTimeoutDays * 24 * 60 * 60 * 1000,
      );

      if (now > expiryDate && request.status === RequestStatus.PENDING) {
        request.status = RequestStatus.EXPIRED;
        request.updatedAt = now;
        expiredRequests.push(request);
        await this.saveRequest(request);
        this.emit('request:expired', { request });
      }

      // Check if response has expired
      if (
        request.response.expiryDate &&
        now > request.response.expiryDate &&
        request.status === RequestStatus.COMPLETED
      ) {
        // Clear response data
        request.response.responseData = null;
        request.response.downloadUrl = undefined;
        await this.saveRequest(request);
      }
    }
  }

  // Helper methods (implementation details)
  private determinePriority(
    requestType: DataSubjectRight,
    _requestData: any,
  ): RequestPriority {
    if (requestType === DataSubjectRight.ERASURE) {
      return RequestPriority.HIGH;
    }
    if (requestType === DataSubjectRight.OBJECTION) {
      return RequestPriority.MEDIUM;
    }
    return RequestPriority.LOW;
  }

  private generateDescription(
    requestType: DataSubjectRight,
    language: 'pt' | 'en',
  ): string {
    const descriptions = {
      pt: {
        [DataSubjectRight.ACCESS]: 'Solicitação de acesso aos dados pessoais',
        [DataSubjectRight.RECTIFICATION]:
          'Solicitação de correção de dados pessoais',
        [DataSubjectRight.ERASURE]:
          'Solicitação de eliminação de dados pessoais',
        [DataSubjectRight.PORTABILITY]: 'Solicitação de portabilidade de dados',
        [DataSubjectRight.RESTRICTION]:
          'Solicitação de limitação do tratamento',
        [DataSubjectRight.OBJECTION]: 'Oposição ao tratamento de dados',
        [DataSubjectRight.AUTOMATED_DECISION_OPT_OUT]:
          'Opt-out de decisões automatizadas',
        [DataSubjectRight.INFORMATION]:
          'Solicitação de informações sobre compartilhamento',
        [DataSubjectRight.CONSENT_WITHDRAWAL]: 'Retirada de consentimento',
      },
      en: {
        [DataSubjectRight.ACCESS]: 'Personal data access request',
        [DataSubjectRight.RECTIFICATION]: 'Personal data rectification request',
        [DataSubjectRight.ERASURE]: 'Personal data erasure request',
        [DataSubjectRight.PORTABILITY]: 'Data portability request',
        [DataSubjectRight.RESTRICTION]: 'Processing restriction request',
        [DataSubjectRight.OBJECTION]: 'Data processing objection',
        [DataSubjectRight.AUTOMATED_DECISION_OPT_OUT]:
          'Automated decision-making opt-out',
        [DataSubjectRight.INFORMATION]: 'Data sharing information request',
        [DataSubjectRight.CONSENT_WITHDRAWAL]: 'Consent withdrawal',
      },
    };
    return descriptions[language][requestType];
  }

  private canAutoProcess(requestType: DataSubjectRight): boolean {
    return [
      DataSubjectRight.ACCESS,
      DataSubjectRight.PORTABILITY,
      DataSubjectRight.INFORMATION,
    ].includes(requestType);
  }

  private getLegalBasis(requestType: DataSubjectRight): string {
    const legalBasis = {
      [DataSubjectRight.ACCESS]: 'LGPD Art. 9, I',
      [DataSubjectRight.RECTIFICATION]: 'LGPD Art. 9, III',
      [DataSubjectRight.ERASURE]: 'LGPD Art. 9, VI',
      [DataSubjectRight.PORTABILITY]: 'LGPD Art. 9, V',
      [DataSubjectRight.RESTRICTION]: 'LGPD Art. 9, IV',
      [DataSubjectRight.OBJECTION]: 'LGPD Art. 9, II',
      [DataSubjectRight.AUTOMATED_DECISION_OPT_OUT]: 'LGPD Art. 9, VII',
      [DataSubjectRight.INFORMATION]: 'LGPD Art. 9, VIII',
      [DataSubjectRight.CONSENT_WITHDRAWAL]: 'LGPD Art. 8, §5º',
    };
    return legalBasis[requestType];
  }

  private requiresReview(requestType: DataSubjectRight): boolean {
    return [
      DataSubjectRight.ERASURE,
      DataSubjectRight.OBJECTION,
      DataSubjectRight.RESTRICTION,
    ].includes(requestType);
  }

  private async performVerification(
    _request: DataSubjectRightsRequest,
    _verificationData: any,
  ): Promise<boolean> {
    // Implementation would depend on verification method
    return true;
  }

  private async gatherUserData(
    _userId: string,
    _requestData: any,
  ): Promise<any> {
    // Implementation would gather actual user data
    return {
      personalData: {},
      processingActivities: [],
      consents: [],
      dataSharing: [],
      automatedDecisions: [],
      retentionPolicies: [],
    };
  }

  private async gatherPortableData(
    _userId: string,
    _requestData: any,
  ): Promise<any> {
    // Implementation would gather portable user data
    return {};
  }

  private async rectifyUserData(
    _userId: string,
    _rectificationData: any,
  ): Promise<any> {
    // Implementation would perform data rectification
    return {};
  }

  private async validateErasureRequest(
    _request: DataSubjectRightsRequest,
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Implementation would validate if erasure is allowed
    return { allowed: true };
  }

  private async eraseUserData(
    _userId: string,
    _specificData?: string[],
    _reason?: string,
  ): Promise<string[]> {
    // Implementation would perform data erasure
    return [];
  }

  private async applyProcessingRestrictions(
    _userId: string,
    _specificData?: string[],
    _reason?: string,
  ): Promise<string[]> {
    // Implementation would apply processing restrictions
    return [];
  }

  private generateDataStructure(_userData: any): Promise<any> {
    // Implementation would generate data structure metadata
    return Promise.resolve({
      tables: [],
      relationships: [],
    });
  }

  private generateChecksum(_data: any): string {
    // Implementation would generate data checksum
    return 'checksum';
  }

  private async loadRequests(): Promise<void> {
    // Implementation would load requests from database
  }

  private async saveRequest(_request: DataSubjectRightsRequest): Promise<void> {
    // Implementation would save request to database
  }

  private addAuditEntry(_actor: string, _action: string, _details: any): void {
    // Implementation would add audit entry
  }

  private generateRequestId(): string {
    return `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the rights manager
   */
  async shutdown(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.removeAllListeners();
    this.isInitialized = false;
  }

  /**
   * Health check
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const issues: string[] = [];

    if (!this.isInitialized) {
      issues.push('Rights manager not initialized');
    }

    const pendingRequests = Array.from(this.requests.values()).filter(
      (r) => r.status === RequestStatus.PENDING,
    ).length;

    if (pendingRequests > 100) {
      issues.push(`High number of pending requests: ${pendingRequests}`);
    }

    const status =
      issues.length === 0
        ? 'healthy'
        : issues.length <= 2
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      details: {
        initialized: this.isInitialized,
        totalRequests: this.requests.size,
        pendingRequests,
        queueLength: this.processingQueue.length,
        issues,
      },
    };
  }
}

/**
 * Default rights manager instance
 */
export const dataSubjectRightsManager = new DataSubjectRightsManager();

/**
 * Export types for external use
 */
export type {
  DataSubjectRightsRequest,
  DataAccessResponse,
  DataPortabilityPackage,
  RequestAuditEntry,
  RightsRequestEvents,
};
