import type {
  LGPDConsentRecord,
  LGPDConsentType,
  LGPDConsentWithdrawalRequest,
  LGPDDataCategory,
  LGPDDataDeletionRequest,
  LGPDDataPortabilityRequest,
  LGPDDataProcessingActivity,
  LGPDDataRectificationRequest,
  LGPDProcessingPurpose,
  ValidationResponse,
} from "@/types/compliance";
import { LGPDConsentStatus, LGPDDataSubjectRights, LGPDLegalBasis } from "@/types/compliance";

/**
 * LGPD (Lei Geral de Proteção de Dados) Consent Management Service
 *
 * Manages data processing consent, data subject rights, and privacy compliance
 * for Brazilian healthcare platforms according to LGPD requirements.
 *
 * Features:
 * - Consent lifecycle management (collection, storage, validation, withdrawal)
 * - Data subject rights enforcement (access, portability, deletion, rectification)
 * - Processing activity tracking and audit trails
 * - Legal basis validation and documentation
 * - Cookie consent management
 * - Data retention policy enforcement
 * - Privacy impact assessment support
 *
 * Compliance Framework:
 * - Lei nº 13.709/2018 (LGPD)
 * - Resolution CFM nº 2.314/2022 (Medical Records)
 * - Resolution CFM nº 2.215/2018 (Telemedicine)
 * - ANPD (Autoridade Nacional de Proteção de Dados) Guidelines
 */
export class LGPDConsentManagementService {
  private static instance: LGPDConsentManagementService;
  private consentRecords: Map<string, LGPDConsentRecord> = new Map();
  private processingActivities: Map<string, LGPDDataProcessingActivity> = new Map();
  private withdrawalRequests: Map<string, LGPDConsentWithdrawalRequest> = new Map();
  private auditLog: {
    timestamp: Date;
    action: string;
    userId?: string;
    details: Record<string, unknown>;
  }[] = [];

  private constructor() {
    this.initializeDefaultActivities();
  }

  public static getInstance(): LGPDConsentManagementService {
    if (!LGPDConsentManagementService.instance) {
      LGPDConsentManagementService.instance = new LGPDConsentManagementService();
    }
    return LGPDConsentManagementService.instance;
  }

  /**
   * Initialize default data processing activities for healthcare platform
   */
  private initializeDefaultActivities(): void {
    const defaultActivities: LGPDDataProcessingActivity[] = [
      {
        id: "medical-records",
        name: "Gestão de Prontuários Médicos",
        description: "Criação, armazenamento e gestão de prontuários médicos eletrônicos",
        controller: {
          name: "NeonPro Healthcare",
          contact: "dpo@neonpro.com.br",
          representative: "Encarregado de Dados",
        },
        dataCategories: ["health-data", "identification-data", "contact-data"],
        processingPurposes: ["medical-care", "legal-obligation"],
        legalBasis: "vital-interests",
        retentionPeriod: "20 anos após último atendimento",
        dataSubjects: ["patients", "healthcare-providers"],
        recipients: ["healthcare-providers", "insurance-companies"],
        internationalTransfer: false,
        isActive: true,
        lastUpdated: new Date(),
        riskAssessment: {
          level: "high",
          mitigationMeasures: [
            "Criptografia de dados",
            "Controle de acesso baseado em funções",
            "Auditoria de acesso",
            "Backup seguro",
          ],
        },
      },
      {
        id: "appointment-management",
        name: "Gestão de Agendamentos",
        description: "Agendamento, confirmação e gestão de consultas médicas",
        controller: {
          name: "NeonPro Healthcare",
          contact: "dpo@neonpro.com.br",
          representative: "Encarregado de Dados",
        },
        dataCategories: [
          "identification-data",
          "contact-data",
          "preference-data",
        ],
        processingPurposes: ["service-provision", "communication"],
        legalBasis: "contract",
        retentionPeriod: "5 anos após último agendamento",
        dataSubjects: ["patients"],
        recipients: ["healthcare-providers"],
        internationalTransfer: false,
        isActive: true,
        lastUpdated: new Date(),
        riskAssessment: {
          level: "medium",
          mitigationMeasures: [
            "Acesso restrito por função",
            "Log de atividades",
            "Criptografia em trânsito",
          ],
        },
      },
      {
        id: "financial-management",
        name: "Gestão Financeira",
        description: "Processamento de pagamentos, faturamento e gestão financeira",
        controller: {
          name: "NeonPro Healthcare",
          contact: "dpo@neonpro.com.br",
          representative: "Encarregado de Dados",
        },
        dataCategories: [
          "financial-data",
          "identification-data",
          "transaction-data",
        ],
        processingPurposes: [
          "payment-processing",
          "accounting",
          "legal-obligation",
        ],
        legalBasis: "contract",
        retentionPeriod: "10 anos conforme legislação fiscal",
        dataSubjects: ["patients", "suppliers"],
        recipients: ["payment-processors", "tax-authorities"],
        internationalTransfer: false,
        isActive: true,
        lastUpdated: new Date(),
        riskAssessment: {
          level: "high",
          mitigationMeasures: [
            "Tokenização de dados de pagamento",
            "PCI DSS compliance",
            "Criptografia forte",
            "Monitoramento de fraudes",
          ],
        },
      },
      {
        id: "marketing-communication",
        name: "Comunicação de Marketing",
        description: "Envio de comunicações promocionais e educacionais",
        controller: {
          name: "NeonPro Healthcare",
          contact: "dpo@neonpro.com.br",
          representative: "Encarregado de Dados",
        },
        dataCategories: ["contact-data", "preference-data", "behavioral-data"],
        processingPurposes: ["marketing", "communication"],
        legalBasis: "consent",
        retentionPeriod: "Até retirada do consentimento",
        dataSubjects: ["patients", "prospects"],
        recipients: ["marketing-partners"],
        internationalTransfer: false,
        isActive: true,
        lastUpdated: new Date(),
        riskAssessment: {
          level: "low",
          mitigationMeasures: [
            "Opt-in explícito",
            "Unsubscribe fácil",
            "Segmentação responsável",
          ],
        },
      },
    ];

    defaultActivities.forEach((activity) => {
      this.processingActivities.set(activity.id, activity);
    });
  }

  /**
   * Collect consent from data subject
   */
  public async collectConsent(
    dataSubjectId: string,
    consentData: {
      processingActivityId: string;
      consentType: LGPDConsentType;
      purposes: LGPDProcessingPurpose[];
      dataCategories: LGPDDataCategory[];
      optionalConsents?: { purpose: string; granted: boolean; }[];
      communicationChannel: "web" | "mobile" | "email" | "sms" | "in-person";
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    },
  ): Promise<ValidationResponse<LGPDConsentRecord>> {
    try {
      // Validate processing activity
      const activity = this.processingActivities.get(
        consentData.processingActivityId,
      );
      if (!activity) {
        return {
          isValid: false,
          errors: [
            `Atividade de processamento não encontrada: ${consentData.processingActivityId}`,
          ],
        };
      }

      // Validate consent requirements
      const validation = this.validateConsentRequirements(
        consentData,
        activity,
      );
      if (!validation.isValid) {
        return validation;
      }

      // Generate consent record
      const consentRecord: LGPDConsentRecord = {
        id: this.generateConsentId(),
        dataSubjectId,
        processingActivityId: consentData.processingActivityId,
        consentType: consentData.consentType,
        status: "given",
        purposes: consentData.purposes,
        dataCategories: consentData.dataCategories,
        legalBasis: activity.legalBasis,
        consentDate: new Date(),
        expirationDate: this.calculateExpirationDate(
          consentData.consentType,
          activity,
        ),
        consentMethod: {
          channel: consentData.communicationChannel,
          ipAddress: consentData.ipAddress,
          userAgent: consentData.userAgent,
          location: consentData.location,
          timestamp: new Date(),
        },
        optionalConsents: consentData.optionalConsents || [],
        withdrawalHistory: [],
        lastUpdated: new Date(),
        version: "1.0",
        language: "pt-BR",
      };

      // Store consent record
      this.consentRecords.set(consentRecord.id, consentRecord);

      // Log audit trail
      this.logActivity("consent-collected", dataSubjectId, {
        consentId: consentRecord.id,
        processingActivity: consentData.processingActivityId,
        consentType: consentData.consentType,
        channel: consentData.communicationChannel,
      });

      return {
        isValid: true,
        data: consentRecord,
      };
    } catch (error) {
      console.error("Error collecting consent:", error);
      return {
        isValid: false,
        errors: ["Erro interno ao coletar consentimento"],
      };
    }
  }

  /**
   * Validate consent requirements
   */
  private validateConsentRequirements(
    consentData: unknown,
    activity: LGPDDataProcessingActivity,
  ): ValidationResponse<void> {
    const errors: string[] = [];

    // Check if consent is required for this legal basis
    if (
      activity.legalBasis === "consent"
      && consentData.consentType === "implied"
    ) {
      errors.push("Consentimento explícito é obrigatório para esta atividade");
    }

    // Validate purposes alignment
    const invalidPurposes = consentData.purposes.filter(
      (purpose: LGPDProcessingPurpose) => !activity.processingPurposes.includes(purpose),
    );
    if (invalidPurposes.length > 0) {
      errors.push(`Finalidades não autorizadas: ${invalidPurposes.join(", ")}`);
    }

    // Validate data categories alignment
    const invalidCategories = consentData.dataCategories.filter(
      (category: LGPDDataCategory) => !activity.dataCategories.includes(category),
    );
    if (invalidCategories.length > 0) {
      errors.push(
        `Categorias de dados não autorizadas: ${invalidCategories.join(", ")}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Calculate consent expiration date based on type and activity
   */
  private calculateExpirationDate(
    consentType: LGPDConsentType,
    activity: LGPDDataProcessingActivity,
  ): Date | undefined {
    if (activity.legalBasis !== "consent") {
      return undefined; // No expiration for non-consent bases
    }

    const now = new Date();

    switch (consentType) {
      case "explicit":
        // Explicit consent expires after 2 years for non-essential services
        return new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

      case "implied":
        // Implied consent expires after 1 year
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      case "granular":
        // Granular consent expires after 2 years
        return new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

      default:
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Withdraw consent
   */
  public async withdrawConsent(
    consentId: string,
    reason?: string,
    effectiveDate?: Date,
  ): Promise<ValidationResponse<LGPDConsentWithdrawalRequest>> {
    try {
      const consent = this.consentRecords.get(consentId);
      if (!consent) {
        return {
          isValid: false,
          errors: ["Registro de consentimento não encontrado"],
        };
      }

      if (consent.status === "withdrawn") {
        return {
          isValid: false,
          errors: ["Consentimento já foi retirado"],
        };
      }

      const withdrawal: LGPDConsentWithdrawalRequest = {
        id: this.generateWithdrawalId(),
        consentId,
        dataSubjectId: consent.dataSubjectId,
        requestDate: new Date(),
        effectiveDate: effectiveDate || new Date(),
        reason,
        status: "approved",
        processedDate: new Date(),
      };

      // Update consent record
      consent.status = "withdrawn";
      consent.withdrawalHistory.push({
        withdrawalId: withdrawal.id,
        date: withdrawal.effectiveDate,
        reason: reason || "Solicitação do titular",
      });
      consent.lastUpdated = new Date();

      // Store withdrawal request
      this.withdrawalRequests.set(withdrawal.id, withdrawal);

      // Log audit trail
      this.logActivity("consent-withdrawn", consent.dataSubjectId, {
        consentId,
        withdrawalId: withdrawal.id,
        reason,
      });

      return {
        isValid: true,
        data: withdrawal,
      };
    } catch (error) {
      console.error("Error withdrawing consent:", error);
      return {
        isValid: false,
        errors: ["Erro interno ao retirar consentimento"],
      };
    }
  }

  /**
   * Get consent status for data subject
   */
  public async getConsentStatus(
    dataSubjectId: string,
    processingActivityId?: string,
  ): Promise<ValidationResponse<LGPDConsentRecord[]>> {
    try {
      let consents = Array.from(this.consentRecords.values()).filter(
        (consent) => consent.dataSubjectId === dataSubjectId,
      );

      if (processingActivityId) {
        consents = consents.filter(
          (consent) => consent.processingActivityId === processingActivityId,
        );
      }

      // Check for expired consents
      const now = new Date();
      consents.forEach((consent) => {
        if (
          consent.expirationDate
          && consent.expirationDate < now
          && consent.status === "given"
        ) {
          consent.status = "expired";
          consent.lastUpdated = new Date();
        }
      });

      return {
        isValid: true,
        data: consents,
      };
    } catch (error) {
      console.error("Error getting consent status:", error);
      return {
        isValid: false,
        errors: ["Erro interno ao consultar status de consentimento"],
      };
    }
  }

  /**
   * Process data subject rights request (access, portability, deletion, rectification)
   */
  public async processDataSubjectRightsRequest(
    requestType: "access" | "portability" | "deletion" | "rectification",
    dataSubjectId: string,
    requestDetails: unknown,
  ): Promise<ValidationResponse<unknown>> {
    try {
      switch (requestType) {
        case "access":
          return this.processDataAccessRequest(dataSubjectId, requestDetails);

        case "portability":
          return this.processDataPortabilityRequest(
            dataSubjectId,
            requestDetails,
          );

        case "deletion":
          return this.processDataDeletionRequest(dataSubjectId, requestDetails);

        case "rectification":
          return this.processDataRectificationRequest(
            dataSubjectId,
            requestDetails,
          );

        default:
          return {
            isValid: false,
            errors: ["Tipo de solicitação não suportado"],
          };
      }
    } catch (error) {
      console.error("Error processing data subject rights request:", error);
      return {
        isValid: false,
        errors: [
          "Erro interno ao processar solicitação de direitos do titular",
        ],
      };
    }
  }

  /**
   * Process data access request
   */
  private async processDataAccessRequest(
    dataSubjectId: string,
    requestDetails: unknown,
  ): Promise<ValidationResponse<unknown>> {
    // Get all consent records
    const consents = await this.getConsentStatus(dataSubjectId);

    // Get all processing activities related to this data subject
    const activities = Array.from(this.processingActivities.values()).filter(
      (activity) => activity.dataSubjects.includes("patients"),
    ); // Simplified check

    // Compile data access report
    const accessReport = {
      dataSubjectId,
      requestDate: new Date(),
      consentRecords: consents.data || [],
      processingActivities: activities,
      dataCategories: this.getDataCategoriesForSubject(dataSubjectId),
      retentionPeriods: activities.map((a) => ({
        activity: a.name,
        retentionPeriod: a.retentionPeriod,
      })),
      thirdPartyRecipients: activities.flatMap((a) => a.recipients),
    };

    this.logActivity("data-access-request", dataSubjectId, {
      requestId: this.generateRequestId(),
      categories: accessReport.dataCategories.length,
    });

    return {
      isValid: true,
      data: accessReport,
    };
  }

  /**
   * Process data portability request
   */
  private async processDataPortabilityRequest(
    dataSubjectId: string,
    requestDetails: {
      format?: "json" | "csv" | "xml";
      categories?: LGPDDataCategory[];
    },
  ): Promise<ValidationResponse<LGPDDataPortabilityRequest>> {
    const request: LGPDDataPortabilityRequest = {
      id: this.generateRequestId(),
      dataSubjectId,
      requestDate: new Date(),
      format: requestDetails.format || "json",
      categories: requestDetails.categories || [
        "identification-data",
        "contact-data",
      ],
      status: "processing",
      estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    this.logActivity("data-portability-request", dataSubjectId, {
      requestId: request.id,
      format: request.format,
      categories: request.categories,
    });

    return {
      isValid: true,
      data: request,
    };
  }

  /**
   * Process data deletion request
   */
  private async processDataDeletionRequest(
    dataSubjectId: string,
    requestDetails: {
      reason?: string;
      categories?: LGPDDataCategory[];
      retainForLegal?: boolean;
    },
  ): Promise<ValidationResponse<LGPDDataDeletionRequest>> {
    // Check for legal retention requirements
    const activities = Array.from(this.processingActivities.values());
    const hasLegalRetention = activities.some(
      (activity) => activity.legalBasis === "legal-obligation" && activity.isActive,
    );

    const request: LGPDDataDeletionRequest = {
      id: this.generateRequestId(),
      dataSubjectId,
      requestDate: new Date(),
      reason: requestDetails.reason || "Solicitação do titular",
      categories: requestDetails.categories || ["all"],
      status: hasLegalRetention ? "partial" : "approved",
      legalRetentionApplies: hasLegalRetention,
      estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.logActivity("data-deletion-request", dataSubjectId, {
      requestId: request.id,
      hasLegalRetention,
      categories: request.categories,
    });

    return {
      isValid: true,
      data: request,
    };
  }

  /**
   * Process data rectification request
   */
  private async processDataRectificationRequest(
    dataSubjectId: string,
    requestDetails: {
      field: string;
      currentValue: string;
      newValue: string;
      justification?: string;
    },
  ): Promise<ValidationResponse<LGPDDataRectificationRequest>> {
    const request: LGPDDataRectificationRequest = {
      id: this.generateRequestId(),
      dataSubjectId,
      requestDate: new Date(),
      field: requestDetails.field,
      currentValue: requestDetails.currentValue,
      newValue: requestDetails.newValue,
      justification: requestDetails.justification || "Correção solicitada pelo titular",
      status: "approved",
      processedDate: new Date(),
    };

    this.logActivity("data-rectification-request", dataSubjectId, {
      requestId: request.id,
      field: requestDetails.field,
    });

    return {
      isValid: true,
      data: request,
    };
  }

  /**
   * Get data categories for a specific data subject
   */
  private getDataCategoriesForSubject(
    dataSubjectId: string,
  ): LGPDDataCategory[] {
    const consents = Array.from(this.consentRecords.values()).filter(
      (consent) => consent.dataSubjectId === dataSubjectId,
    );

    const categories = new Set<LGPDDataCategory>();
    consents.forEach((consent) => {
      consent.dataCategories.forEach((category) => categories.add(category));
    });

    return Array.from(categories);
  }

  /**
   * Generate audit report for compliance
   */
  public generateAuditReport(
    startDate: Date,
    endDate: Date,
  ): ValidationResponse<{
    period: { start: Date; end: Date; };
    totalConsents: number;
    consentsByType: Record<LGPDConsentType, number>;
    withdrawals: number;
    dataSubjectRequests: number;
    processingActivities: number;
    complianceScore: number;
    recommendations: string[];
  }> {
    try {
      const consentsInPeriod = Array.from(this.consentRecords.values()).filter(
        (consent) => consent.consentDate >= startDate && consent.consentDate <= endDate,
      );

      const withdrawalsInPeriod = Array.from(
        this.withdrawalRequests.values(),
      ).filter(
        (withdrawal) =>
          withdrawal.requestDate >= startDate
          && withdrawal.requestDate <= endDate,
      );

      const requestsInPeriod = this.auditLog.filter(
        (log) =>
          log.timestamp >= startDate
          && log.timestamp <= endDate
          && log.action.includes("request"),
      );

      const consentsByType = consentsInPeriod.reduce(
        (acc, consent) => {
          acc[consent.consentType] = (acc[consent.consentType] || 0) + 1;
          return acc;
        },
        {} as Record<LGPDConsentType, number>,
      );

      // Calculate compliance score (simplified)
      let complianceScore = 100;
      const recommendations: string[] = [];

      // Check for expired consents
      const expiredConsents = consentsInPeriod.filter(
        (c) => c.status === "expired",
      );
      if (expiredConsents.length > 0) {
        complianceScore -= 10;
        recommendations.push("Renovar consentimentos expirados");
      }

      // Check response time for data subject requests
      if (requestsInPeriod.length > 0) {
        complianceScore -= 5; // Simplified penalty
        recommendations.push(
          "Revisar tempos de resposta para solicitações de titulares",
        );
      }

      const report = {
        period: { start: startDate, end: endDate },
        totalConsents: consentsInPeriod.length,
        consentsByType,
        withdrawals: withdrawalsInPeriod.length,
        dataSubjectRequests: requestsInPeriod.length,
        processingActivities: this.processingActivities.size,
        complianceScore,
        recommendations,
      };

      return {
        isValid: true,
        data: report,
      };
    } catch (error) {
      console.error("Error generating audit report:", error);
      return {
        isValid: false,
        errors: ["Erro ao gerar relatório de auditoria"],
      };
    }
  }

  // Utility methods
  private generateConsentId(): string {
    return `consent-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateWithdrawalId(): string {
    return `withdrawal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateRequestId(): string {
    return `request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private logActivity(
    action: string,
    userId?: string,
    details: Record<string, unknown> = {},
  ): void {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      userId,
      details,
    });
  }

  // Public getters for testing and monitoring
  public getAuditLog(): {
    timestamp: Date;
    action: string;
    userId?: string;
    details: Record<string, unknown>;
  }[] {
    return [...this.auditLog];
  }

  public getProcessingActivities(): LGPDDataProcessingActivity[] {
    return Array.from(this.processingActivities.values());
  }

  public getConsentRecords(): LGPDConsentRecord[] {
    return Array.from(this.consentRecords.values());
  }
}
