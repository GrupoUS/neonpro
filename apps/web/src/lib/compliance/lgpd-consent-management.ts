// LGPD Consent Management System
// Complete system for managing patient data consent according to Brazilian LGPD

import type {
  LGPDConsent,
  DataSubjectRequest,
  LGPDLegalBasis,
  ConsentPurpose,
  DataCategory,
  AuditTrailEntry,
} from "../../types/compliance";

// =============================================================================
// LGPD CONSENT MANAGEMENT ENGINE
// =============================================================================

export class LGPDConsentManager {
  private consents: Map<string, LGPDConsent> = new Map();
  private dataSubjectRequests: Map<string, DataSubjectRequest> = new Map();
  private auditTrail: AuditTrailEntry[] = [];

  // =============================================================================
  // CONSENT MANAGEMENT
  // =============================================================================

  /**
   * Request patient consent for specific data processing
   */
  async requestConsent(
    patientId: string,
    purpose: ConsentPurpose,
    dataCategories: DataCategory[],
    legalBasis: LGPDLegalBasis = 'consent',
    retentionPeriod: number = 365, // days
    options?: {
      consentText?: string;
      thirdPartySharing?: boolean;
      internationalTransfer?: boolean;
      dataMinimization?: boolean;
    }
  ): Promise<{ success: boolean; consentId?: string; errors?: string[] }> {
    try {
      // Validate data categories
      const validation = this.validateDataCategories(dataCategories, purpose);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Generate consent ID
      const consentId = `lgpd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create consent record
      const consent: LGPDConsent = {
        id: consentId,
        patientId,
        legalBasis,
        purpose,
        dataCategories,
        consentGiven: false, // Initially false, patient must explicitly consent
        consentDate: new Date().toISOString(),
        consentMethod: 'digital_signature',
        consentText: options?.consentText || this.generateConsentText(purpose, dataCategories),
        retentionPeriod,
        dataMinimization: options?.dataMinimization ?? true,
        thirdPartySharing: options?.thirdPartySharing ?? false,
        internationalTransfer: options?.internationalTransfer ?? false,
        auditTrail: [],
      };

      // Add audit entry
      const auditEntry = await this.createAuditEntry({
        userId: 'system',
        userType: 'system',
        action: 'consent_requested',
        resource: 'lgpd_consent',
        resourceId: consentId,
        details: {
          patientId,
          purpose,
          dataCategories,
          legalBasis,
          retentionPeriod,
        },
      });

      consent.auditTrail.push(auditEntry);

      // Store consent
      this.consents.set(consentId, consent);

      // Create audit trail entry in main system
      this.auditTrail.push(auditEntry);

      return {
        success: true,
        consentId,
      };

    } catch (error) {
      console.error("Error requesting consent:", error);
      return {
        success: false,
        errors: [`Erro interno: ${error.message}`],
      };
    }
  }

  /**
   * Grant consent (patient accepts)
   */
  async grantConsent(
    consentId: string,
    consentMethod: 'digital_signature' | 'checkbox' | 'verbal' | 'written',
    userId?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    const consent = this.consents.get(consentId);
    if (!consent) {
      return {
        success: false,
        errors: ["Consentimento não encontrado"],
      };
    }

    if (consent.consentGiven) {
      return {
        success: false,
        errors: ["Consentimento já foi concedido anteriormente"],
      };
    }

    // Update consent
    consent.consentGiven = true;
    consent.consentDate = new Date().toISOString();
    consent.consentMethod = consentMethod;

    // Add audit entry
    const auditEntry = await this.createAuditEntry({
      userId: userId || consent.patientId,
      userType: userId ? 'staff' : 'patient',
      action: 'consent_granted',
      resource: 'lgpd_consent',
      resourceId: consentId,
      details: {
        consentMethod,
        grantedAt: consent.consentDate,
      },
    });

    consent.auditTrail.push(auditEntry);
    this.auditTrail.push(auditEntry);

    return { success: true };
  }

  /**
   * Withdraw consent (patient revokes)
   */
  async withdrawConsent(
    consentId: string,
    withdrawalReason?: string,
    userId?: string
  ): Promise<{ success: boolean; errors?: string[]; dataToDelete?: string[] }> {
    const consent = this.consents.get(consentId);
    if (!consent) {
      return {
        success: false,
        errors: ["Consentimento não encontrado"],
      };
    }

    if (!consent.consentGiven) {
      return {
        success: false,
        errors: ["Não é possível retirar consentimento não concedido"],
      };
    }

    if (consent.withdrawalDate) {
      return {
        success: false,
        errors: ["Consentimento já foi retirado anteriormente"],
      };
    }

    // Update consent
    consent.withdrawalDate = new Date().toISOString();
    consent.withdrawalReason = withdrawalReason;

    // Add audit entry
    const auditEntry = await this.createAuditEntry({
      userId: userId || consent.patientId,
      userType: userId ? 'staff' : 'patient',
      action: 'consent_withdrawn',
      resource: 'lgpd_consent',
      resourceId: consentId,
      details: {
        withdrawalReason,
        withdrawnAt: consent.withdrawalDate,
        affectedDataCategories: consent.dataCategories,
      },
    });

    consent.auditTrail.push(auditEntry);
    this.auditTrail.push(auditEntry);

    // Determine data that needs to be deleted based on legal basis
    const dataToDelete = this.determineDataForDeletion(consent);

    return {
      success: true,
      dataToDelete,
    };
  }

  /**
   * Get consent status for a patient
   */
  getPatientConsents(
    patientId: string,
    options?: {
      purpose?: ConsentPurpose;
      activeOnly?: boolean;
      includeWithdrawn?: boolean;
    }
  ): LGPDConsent[] {
    let consents = Array.from(this.consents.values())
      .filter(c => c.patientId === patientId);

    if (options?.purpose) {
      consents = consents.filter(c => c.purpose === options.purpose);
    }

    if (options?.activeOnly) {
      consents = consents.filter(c => c.consentGiven && !c.withdrawalDate);
    }

    if (!options?.includeWithdrawn) {
      consents = consents.filter(c => !c.withdrawalDate);
    }

    return consents.sort((a, b) => 
      new Date(b.consentDate).getTime() - new Date(a.consentDate).getTime()
    );
  }

  /**
   * Check if patient has given consent for specific purpose and data categories
   */
  hasValidConsent(
    patientId: string,
    purpose: ConsentPurpose,
    dataCategories: DataCategory[]
  ): {
    hasConsent: boolean;
    consentId?: string;
    missingCategories?: DataCategory[];
    expiredConsent?: boolean;
  } {
    const consents = this.getPatientConsents(patientId, { activeOnly: true });
    
    // Find matching consent by purpose
    const matchingConsent = consents.find(c => 
      c.purpose === purpose && c.consentGiven && !c.withdrawalDate
    );

    if (!matchingConsent) {
      return {
        hasConsent: false,
        missingCategories: dataCategories,
      };
    }

    // Check if consent covers all required data categories
    const missingCategories = dataCategories.filter(
      category => !matchingConsent.dataCategories.includes(category)
    );

    if (missingCategories.length > 0) {
      return {
        hasConsent: false,
        consentId: matchingConsent.id,
        missingCategories,
      };
    }

    // Check if consent has expired
    const consentAge = Date.now() - new Date(matchingConsent.consentDate).getTime();
    const maxAge = matchingConsent.retentionPeriod * 24 * 60 * 60 * 1000;
    
    if (consentAge > maxAge) {
      return {
        hasConsent: false,
        consentId: matchingConsent.id,
        expiredConsent: true,
      };
    }

    return {
      hasConsent: true,
      consentId: matchingConsent.id,
    };
  }

  // =============================================================================
  // DATA SUBJECT REQUESTS (LGPD RIGHTS)
  // =============================================================================

  /**
   * Create data subject request (patient exercising LGPD rights)
   */
  async createDataSubjectRequest(
    patientId: string,
    requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection',
    requestDescription: string,
    userId?: string
  ): Promise<{ success: boolean; requestId?: string; errors?: string[] }> {
    try {
      const requestId = `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const request: DataSubjectRequest = {
        id: requestId,
        patientId,
        requestType,
        requestDate: new Date().toISOString(),
        requestDescription,
        status: 'pending',
        processedBy: userId || 'system',
        auditTrail: [],
      };

      // Add audit entry
      const auditEntry = await this.createAuditEntry({
        userId: userId || patientId,
        userType: userId ? 'staff' : 'patient',
        action: 'data_subject_request_created',
        resource: 'data_subject_request',
        resourceId: requestId,
        details: {
          requestType,
          requestDescription,
          patientId,
        },
      });

      request.auditTrail.push(auditEntry);
      this.dataSubjectRequests.set(requestId, request);
      this.auditTrail.push(auditEntry);

      return {
        success: true,
        requestId,
      };

    } catch (error) {
      console.error("Error creating data subject request:", error);
      return {
        success: false,
        errors: [`Erro interno: ${error.message}`],
      };
    }
  }

  /**
   * Process data subject request
   */
  async processDataSubjectRequest(
    requestId: string,
    processedBy: string,
    status: 'completed' | 'rejected',
    responseData?: any,
    legalJustification?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) {
      return {
        success: false,
        errors: ["Solicitação não encontrada"],
      };
    }

    if (request.status !== 'pending' && request.status !== 'processing') {
      return {
        success: false,
        errors: ["Solicitação já foi processada"],
      };
    }

    // Update request
    request.status = status;
    request.responseDate = new Date().toISOString();
    request.responseData = responseData;
    request.legalJustification = legalJustification;
    request.processedBy = processedBy;

    // Add audit entry
    const auditEntry = await this.createAuditEntry({
      userId: processedBy,
      userType: 'staff',
      action: 'data_subject_request_processed',
      resource: 'data_subject_request',
      resourceId: requestId,
      details: {
        status,
        processedAt: request.responseDate,
        legalJustification,
        hasResponseData: !!responseData,
      },
    });

    request.auditTrail.push(auditEntry);
    this.auditTrail.push(auditEntry);

    return { success: true };
  }

  /**
   * Get data subject requests for a patient
   */
  getDataSubjectRequests(
    patientId: string,
    options?: {
      requestType?: DataSubjectRequest['requestType'];
      status?: DataSubjectRequest['status'];
      limit?: number;
    }
  ): DataSubjectRequest[] {
    let requests = Array.from(this.dataSubjectRequests.values())
      .filter(r => r.patientId === patientId);

    if (options?.requestType) {
      requests = requests.filter(r => r.requestType === options.requestType);
    }

    if (options?.status) {
      requests = requests.filter(r => r.status === options.status);
    }

    // Sort by date (most recent first)
    requests.sort((a, b) => 
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );

    if (options?.limit) {
      requests = requests.slice(0, options.limit);
    }

    return requests;
  }

  // =============================================================================
  // COMPLIANCE REPORTING
  // =============================================================================

  /**
   * Generate LGPD compliance report
   */
  generateComplianceReport(
    period: { startDate: string; endDate: string },
    clinicId?: string
  ): {
    summary: {
      totalConsents: number;
      activeConsents: number;
      withdrawnConsents: number;
      dataSubjectRequests: number;
      averageResponseTime: number; // hours
    };
    consentsByPurpose: Record<ConsentPurpose, number>;
    requestsByType: Record<DataSubjectRequest['requestType'], number>;
    complianceScore: number;
    violations: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      affectedRecords: number;
    }>;
    recommendations: string[];
  } {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    // Filter data for period
    const periodConsents = Array.from(this.consents.values())
      .filter(c => {
        const consentDate = new Date(c.consentDate);
        return consentDate >= startDate && consentDate <= endDate;
      });

    const periodRequests = Array.from(this.dataSubjectRequests.values())
      .filter(r => {
        const requestDate = new Date(r.requestDate);
        return requestDate >= startDate && requestDate <= endDate;
      });

    // Calculate summary
    const summary = {
      totalConsents: periodConsents.length,
      activeConsents: periodConsents.filter(c => c.consentGiven && !c.withdrawalDate).length,
      withdrawnConsents: periodConsents.filter(c => c.withdrawalDate).length,
      dataSubjectRequests: periodRequests.length,
      averageResponseTime: this.calculateAverageResponseTime(periodRequests),
    };

    // Consents by purpose
    const consentsByPurpose: Record<ConsentPurpose, number> = {
      medical_treatment: 0,
      appointment_scheduling: 0,
      financial_processing: 0,
      marketing_communication: 0,
      service_improvement: 0,
      legal_compliance: 0,
      emergency_access: 0,
    };

    periodConsents.forEach(c => {
      consentsByPurpose[c.purpose]++;
    });

    // Requests by type
    const requestsByType: Record<DataSubjectRequest['requestType'], number> = {
      access: 0,
      rectification: 0,
      erasure: 0,
      portability: 0,
      restriction: 0,
      objection: 0,
    };

    periodRequests.forEach(r => {
      requestsByType[r.requestType]++;
    });

    // Identify violations and calculate compliance score
    const violations = this.identifyComplianceViolations(periodConsents, periodRequests);
    const complianceScore = this.calculateComplianceScore(violations, summary);

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, summary);

    return {
      summary,
      consentsByPurpose,
      requestsByType,
      complianceScore,
      violations,
      recommendations,
    };
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private validateDataCategories(
    dataCategories: DataCategory[], 
    purpose: ConsentPurpose
  ): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Check for sensitive data categories
    const sensitiveCategories: DataCategory[] = ['health_data', 'biometric_data', 'sensitive_data'];
    const hasSensitiveData = dataCategories.some(cat => sensitiveCategories.includes(cat));

    if (hasSensitiveData && purpose === 'marketing_communication') {
      errors.push("Dados sensíveis não podem ser processados para fins de marketing");
    }

    // Check data minimization principle
    const purposeDataMap: Record<ConsentPurpose, DataCategory[]> = {
      medical_treatment: ['personal_identification', 'health_data', 'contact_information'],
      appointment_scheduling: ['personal_identification', 'contact_information'],
      financial_processing: ['personal_identification', 'financial_data', 'contact_information'],
      marketing_communication: ['personal_identification', 'contact_information', 'behavioral_data'],
      service_improvement: ['behavioral_data', 'contact_information'],
      legal_compliance: ['personal_identification', 'health_data', 'financial_data'],
      emergency_access: ['personal_identification', 'health_data', 'contact_information', 'location_data'],
    };

    const recommendedCategories = purposeDataMap[purpose] || [];
    const unnecessaryCategories = dataCategories.filter(
      cat => !recommendedCategories.includes(cat)
    );

    if (unnecessaryCategories.length > 0) {
      errors.push(
        `Categorias desnecessárias para a finalidade: ${unnecessaryCategories.join(', ')}`
      );
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private generateConsentText(purpose: ConsentPurpose, dataCategories: DataCategory[]): string {
    const purposeDescriptions: Record<ConsentPurpose, string> = {
      medical_treatment: "prestação de cuidados médicos e tratamento de saúde",
      appointment_scheduling: "agendamento e gerenciamento de consultas e procedimentos",
      financial_processing: "processamento de pagamentos e controle financeiro",
      marketing_communication: "comunicação de marketing e ofertas personalizadas",
      service_improvement: "melhoria dos serviços prestados e análise de qualidade",
      legal_compliance: "cumprimento de obrigações legais e regulamentares",
      emergency_access: "acesso emergencial a dados em situações críticas de saúde",
    };

    const categoryDescriptions: Record<DataCategory, string> = {
      personal_identification: "dados de identificação pessoal (nome, CPF, RG)",
      health_data: "dados de saúde e histórico médico",
      financial_data: "dados financeiros e de pagamento",
      contact_information: "informações de contato (telefone, e-mail)",
      behavioral_data: "dados comportamentais e preferências",
      sensitive_data: "dados sensíveis conforme LGPD",
      biometric_data: "dados biométricos",
      location_data: "dados de localização",
    };

    const purposeText = purposeDescriptions[purpose];
    const categoriesText = dataCategories.map(cat => categoryDescriptions[cat]).join(", ");

    return `Autorizo o processamento dos seguintes dados pessoais: ${categoriesText}, para a finalidade de ${purposeText}. Este consentimento é livre, informado e específico, podendo ser retirado a qualquer momento através dos canais disponibilizados pela clínica.`;
  }

  private determineDataForDeletion(consent: LGPDConsent): string[] {
    // If legal basis is consent and it's withdrawn, data should be deleted
    // unless there's another legal basis for keeping it
    if (consent.legalBasis === 'consent') {
      return [
        `patient_data_${consent.patientId}_${consent.purpose}`,
        ...consent.dataCategories.map(cat => `${cat}_${consent.patientId}`),
      ];
    }

    // For other legal bases, evaluate case by case
    return [];
  }

  private calculateAverageResponseTime(requests: DataSubjectRequest[]): number {
    const processedRequests = requests.filter(r => r.responseDate);
    
    if (processedRequests.length === 0) return 0;

    const totalTime = processedRequests.reduce((sum, r) => {
      const requestTime = new Date(r.requestDate).getTime();
      const responseTime = new Date(r.responseDate!).getTime();
      return sum + (responseTime - requestTime);
    }, 0);

    return Math.round(totalTime / processedRequests.length / (1000 * 60 * 60)); // hours
  }

  private identifyComplianceViolations(
    consents: LGPDConsent[], 
    requests: DataSubjectRequest[]
  ): Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high'; affectedRecords: number; }> {
    const violations = [];

    // Check for expired consents
    const expiredConsents = consents.filter(c => {
      const consentAge = Date.now() - new Date(c.consentDate).getTime();
      const maxAge = c.retentionPeriod * 24 * 60 * 60 * 1000;
      return consentAge > maxAge && c.consentGiven && !c.withdrawalDate;
    });

    if (expiredConsents.length > 0) {
      violations.push({
        type: 'expired_consent',
        description: 'Consentimentos expirados que não foram renovados',
        severity: 'high' as const,
        affectedRecords: expiredConsents.length,
      });
    }

    // Check for overdue data subject requests
    const overdueRequests = requests.filter(r => {
      if (r.status !== 'pending') return false;
      const requestAge = Date.now() - new Date(r.requestDate).getTime();
      return requestAge > 15 * 24 * 60 * 60 * 1000; // 15 days
    });

    if (overdueRequests.length > 0) {
      violations.push({
        type: 'overdue_requests',
        description: 'Solicitações de titular de dados em atraso (> 15 dias)',
        severity: 'high' as const,
        affectedRecords: overdueRequests.length,
      });
    }

    // Check for broad consent (too many data categories)
    const broadConsents = consents.filter(c => c.dataCategories.length > 4);
    
    if (broadConsents.length > 0) {
      violations.push({
        type: 'broad_consent',
        description: 'Consentimentos muito abrangentes (princípio da finalidade)',
        severity: 'medium' as const,
        affectedRecords: broadConsents.length,
      });
    }

    return violations;
  }

  private calculateComplianceScore(
    violations: any[], 
    summary: any
  ): number {
    let score = 100;

    violations.forEach(violation => {
      const impact = violation.affectedRecords / Math.max(summary.totalConsents, 1);
      
      switch (violation.severity) {
        case 'high':
          score -= Math.min(30, impact * 50);
          break;
        case 'medium':
          score -= Math.min(20, impact * 30);
          break;
        case 'low':
          score -= Math.min(10, impact * 20);
          break;
      }
    });

    return Math.max(0, Math.round(score));
  }

  private generateRecommendations(violations: any[], summary: any): string[] {
    const recommendations: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'expired_consent':
          recommendations.push(
            "Implementar sistema de renovação automática de consentimentos próximos ao vencimento"
          );
          break;
        case 'overdue_requests':
          recommendations.push(
            "Melhorar processo de resposta a solicitações de titulares de dados (meta: 15 dias)"
          );
          break;
        case 'broad_consent':
          recommendations.push(
            "Revisar consentimentos para garantir maior granularidade e especificidade"
          );
          break;
      }
    });

    if (summary.averageResponseTime > 72) { // > 3 days
      recommendations.push(
        "Otimizar tempo de resposta às solicitações de titulares de dados"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Manter as boas práticas de compliance LGPD implementadas");
    }

    return recommendations;
  }

  private async createAuditEntry(
    entry: Partial<AuditTrailEntry>
  ): Promise<AuditTrailEntry> {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: entry.userId || 'system',
      userType: entry.userType || 'system',
      action: entry.action || 'unknown',
      resource: entry.resource || 'unknown',
      resourceId: entry.resourceId,
      details: entry.details || {},
      success: true,
      legalBasis: entry.legalBasis || 'consent',
      dataCategories: entry.dataCategories || [],
    };
  }
}

// Export singleton instance
export const lgpdManager = new LGPDConsentManager();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get purpose description in Portuguese
 */
export function getPurposeDescription(purpose: ConsentPurpose): string {
  const descriptions: Record<ConsentPurpose, string> = {
    medical_treatment: "Tratamento Médico",
    appointment_scheduling: "Agendamento de Consultas",
    financial_processing: "Processamento Financeiro",
    marketing_communication: "Comunicação de Marketing",
    service_improvement: "Melhoria do Serviço",
    legal_compliance: "Conformidade Legal",
    emergency_access: "Acesso de Emergência",
  };
  return descriptions[purpose];
}

/**
 * Get data category description in Portuguese
 */
export function getDataCategoryDescription(category: DataCategory): string {
  const descriptions: Record<DataCategory, string> = {
    personal_identification: "Identificação Pessoal",
    health_data: "Dados de Saúde",
    financial_data: "Dados Financeiros",
    contact_information: "Informações de Contato",
    behavioral_data: "Dados Comportamentais",
    sensitive_data: "Dados Sensíveis",
    biometric_data: "Dados Biométricos",
    location_data: "Dados de Localização",
  };
  return descriptions[category];
}

/**
 * Get legal basis description in Portuguese
 */
export function getLegalBasisDescription(legalBasis: LGPDLegalBasis): string {
  const descriptions: Record<LGPDLegalBasis, string> = {
    consent: "Consentimento",
    legitimate_interest: "Interesse Legítimo",
    legal_obligation: "Obrigação Legal",
    vital_interests: "Interesses Vitais",
    public_task: "Exercício Regular de Direitos",
    contract: "Execução de Contrato",
  };
  return descriptions[legalBasis];
}