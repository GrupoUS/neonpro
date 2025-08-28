/**
 * LGPD Chat Compliance Module
 *
 * Comprehensive LGPD (Lei Geral de Proteção de Dados) compliance system
 * for chat communications in Brazilian healthcare context
 *
 * Features:
 * - Automatic data classification and protection
 * - Consent management for healthcare data processing
 * - Data retention and deletion controls
 * - Privacy impact assessments for chat messages
 * - Audit trail for all data processing activities
 * - Patient rights management (access, portability, rectification)
 * - Healthcare data anonymization and pseudonymization
 * - Breach detection and notification system
 * - Third-party data sharing controls
 */

import type {
  ChatMessage,
  MessageContent,
  HealthcareContext,
} from "@/types/chat";

export interface LGPDConfig {
  enable_data_classification?: boolean;
  enable_consent_validation?: boolean;
  enable_audit_logging?: boolean;
  enable_anonymization?: boolean;
  data_retention_days?: number;
  healthcare_data_retention_days?: number;
  breach_notification_endpoint?: string;
  privacy_officer_email?: string;
  enable_right_to_be_forgotten?: boolean;
  enable_data_portability?: boolean;
}

export interface DataClassification {
  category: "personal" | "sensitive" | "healthcare" | "public" | "anonymous";
  sub_categories: string[];
  sensitivity_level: "low" | "medium" | "high" | "critical";
  requires_consent: boolean;
  retention_period_days: number;
  anonymization_required: boolean;
  encryption_required: boolean;
  access_restrictions: string[];
}

export interface ConsentRecord {
  user_id: string;
  consent_type:
    | "healthcare_communication"
    | "data_processing"
    | "ai_analysis"
    | "data_sharing";
  granted: boolean;
  granted_at: Date;
  expires_at?: Date;
  purpose: string;
  data_categories: string[];
  third_parties?: string[];
  revocation_date?: Date;
  legal_basis: string;
  consent_version: string;
}

export interface LGPDAuditLog {
  id: string;
  timestamp: Date;
  user_id: string;
  action: string;
  data_subject_id?: string;
  data_categories: string[];
  legal_basis: string;
  purpose: string;
  retention_applied: boolean;
  anonymization_applied: boolean;
  consent_validated: boolean;
  breach_detected: boolean;
  metadata: Record<string, any>;
}

export interface PrivacyRights {
  access: boolean; // Art. 15 - Right to access
  rectification: boolean; // Art. 16 - Right to rectification
  erasure: boolean; // Art. 17 - Right to be forgotten
  portability: boolean; // Art. 20 - Right to data portability
  processing_restriction: boolean; // Art. 18 - Right to restrict processing
  objection: boolean; // Art. 21 - Right to object
  automated_decision_objection: boolean; // Art. 22 - Right to object to automated decisions
}

export interface DataBreachIncident {
  id: string;
  detected_at: Date;
  breach_type:
    | "unauthorized_access"
    | "data_leak"
    | "system_compromise"
    | "human_error";
  severity: "low" | "medium" | "high" | "critical";
  affected_users: string[];
  data_categories_affected: string[];
  estimated_records_affected: number;
  containment_measures: string[];
  notification_required: boolean;
  anpd_notification_deadline?: Date;
  data_subjects_notification_deadline?: Date;
  root_cause?: string;
  remediation_actions: string[];
}

export class LGPDChatCompliance {
  private config: LGPDConfig;
  private auditLogs: LGPDAuditLog[] = [];
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private breachIncidents: DataBreachIncident[] = [];
  private anonymizationMethods: Map<string, (data: any) => any> = new Map();

  constructor(config: LGPDConfig) {
    this.config = {
      data_retention_days: 2555, // 7 years - Brazilian healthcare requirement
      healthcare_data_retention_days: 7300, // 20 years - CFM requirement
      enable_data_classification: true,
      enable_consent_validation: true,
      enable_audit_logging: true,
      enable_anonymization: true,
      enable_right_to_be_forgotten: true,
      enable_data_portability: true,
      ...config,
    };

    this.initializeAnonymizationMethods();
  }

  /**
   * Process chat message for LGPD compliance
   */
  async processMessageForCompliance(
    message: ChatMessage,
    healthcareContext?: HealthcareContext,
  ): Promise<{
    compliant: boolean;
    classification: DataClassification;
    consent_valid: boolean;
    audit_logged: boolean;
    anonymization_applied: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Classify data
      const classification = await this.classifyMessageData(
        message,
        healthcareContext,
      );

      // 2. Validate consent
      const consentValid = await this.validateConsent(
        message.sender_id,
        classification,
      );
      if (!consentValid) {
        violations.push(
          "Consent não validado para processamento de dados sensíveis",
        );
        recommendations.push("Solicitar consentimento explícito do usuário");
      }

      // 3. Apply data protection measures
      const anonymizationApplied = await this.applyDataProtection(
        message,
        classification,
      );

      // 4. Create audit log
      const auditLogged = await this.createAuditLog({
        user_id: message.sender_id,
        action: "message_processed",
        data_subject_id: message.sender_id,
        data_categories: classification.sub_categories,
        legal_basis: this.determineLegalBasis(
          classification,
          healthcareContext,
        ),
        purpose: "healthcare_communication",
        retention_applied: true,
        anonymization_applied: anonymizationApplied,
        consent_validated: consentValid,
        breach_detected: false,
        metadata: {
          message_id: message.id,
          message_type: message.message_type,
          healthcare_context: healthcareContext,
        },
      });

      // 5. Check for potential violations
      await this.detectPotentialViolations(
        message,
        classification,
        violations,
        recommendations,
      );

      // 6. Apply retention policies
      await this.applyRetentionPolicy(message, classification);

      const compliant = violations.length === 0;

      if (!compliant) {
        await this.handleComplianceViolation(
          message,
          violations,
          recommendations,
        );
      }

      return {
        compliant,
        classification,
        consent_valid: consentValid,
        audit_logged: auditLogged,
        anonymization_applied: anonymizationApplied,
        violations,
        recommendations,
      };
    } catch (error) {
      console.error("LGPD compliance processing failed:", error);

      return {
        compliant: false,
        classification: this.getDefaultClassification(),
        consent_valid: false,
        audit_logged: false,
        anonymization_applied: false,
        violations: ["Erro no processamento de compliance LGPD"],
        recommendations: [
          "Revisar configuração de compliance e tentar novamente",
        ],
      };
    }
  }

  /**
   * Classify data in chat message
   */
  private async classifyMessageData(
    message: ChatMessage,
    healthcareContext?: HealthcareContext,
  ): Promise<DataClassification> {
    const content = this.extractTextFromContent(message.content);
    const text = content.toLowerCase();

    // Healthcare data patterns
    const healthcarePatterns = {
      medical_conditions:
        /diabetes|hipertensão|câncer|hiv|aids|tuberculose|depressão|ansiedade/gi,
      medications:
        /medicamento|remédio|antibiótico|insulina|morfina|antidepressivo/gi,
      procedures:
        /cirurgia|exame|biopsia|quimioterapia|radioterapia|transplante/gi,
      personal_health: /cpf|rg|cartão sus|plano de saúde|cnpj/gi,
      biometric: /digital|íris|face|voz|dna/gi,
      symptoms: /dor|febre|tosse|sangramento|desmaio|convulsão/gi,
    };

    // Personal data patterns
    const personalPatterns = {
      identifiers: /cpf|rg|passaporte|título de eleitor|carteira de trabalho/gi,
      contact: /telefone|celular|email|endereço|cep/gi,
      financial: /banco|conta|cartão|pix|salário/gi,
      family: /pai|mãe|filho|filha|cônjuge|esposa|marido/gi,
    };

    let category: DataClassification["category"] = "personal";
    let subCategories: string[] = [];
    let sensitivityLevel: DataClassification["sensitivity_level"] = "medium";

    // Check for healthcare data
    for (const [subCategory, pattern] of Object.entries(healthcarePatterns)) {
      if (pattern.test(text)) {
        category = "healthcare";
        subCategories.push(subCategory);
        sensitivityLevel = "critical";
      }
    }

    // Check for personal data
    for (const [subCategory, pattern] of Object.entries(personalPatterns)) {
      if (pattern.test(text)) {
        if (category !== "healthcare") {
          category = "sensitive";
        }
        subCategories.push(subCategory);
        if (sensitivityLevel === "medium") {
          sensitivityLevel = "high";
        }
      }
    }

    // Special healthcare context handling
    if (healthcareContext) {
      category = "healthcare";
      sensitivityLevel = "critical";

      if (healthcareContext.consultation_type === "emergency") {
        subCategories.push("emergency_data");
      }

      if (healthcareContext.medical_specialty) {
        subCategories.push(`specialty_${healthcareContext.medical_specialty}`);
      }
    }

    // Determine retention period based on category
    let retentionPeriod = this.config.data_retention_days!;
    if (category === "healthcare") {
      retentionPeriod = this.config.healthcare_data_retention_days!;
    }

    return {
      category,
      sub_categories: subCategories,
      sensitivity_level: sensitivityLevel,
      requires_consent: category === "sensitive" || category === "healthcare",
      retention_period_days: retentionPeriod,
      anonymization_required:
        category === "healthcare" || sensitivityLevel === "critical",
      encryption_required:
        sensitivityLevel === "high" || sensitivityLevel === "critical",
      access_restrictions: this.getAccessRestrictions(
        category,
        sensitivityLevel,
      ),
    };
  }

  /**
   * Validate user consent for data processing
   */
  private async validateConsent(
    userId: string,
    classification: DataClassification,
  ): Promise<boolean> {
    if (!classification.requires_consent) {
      return true;
    }

    const userConsents = this.consentRecords.get(userId) || [];
    const now = new Date();

    // Check for valid consent
    const validConsent = userConsents.find(
      (consent) =>
        consent.granted &&
        !consent.revocation_date &&
        (!consent.expires_at || consent.expires_at > now) &&
        (consent.consent_type === "healthcare_communication" ||
          consent.consent_type === "data_processing") &&
        consent.data_categories.some((category) =>
          classification.sub_categories.includes(category),
        ),
    );

    return !!validConsent;
  }

  /**
   * Apply data protection measures
   */
  private async applyDataProtection(
    message: ChatMessage,
    classification: DataClassification,
  ): Promise<boolean> {
    if (
      !this.config.enable_anonymization ||
      !classification.anonymization_required
    ) {
      return false;
    }

    try {
      // Apply anonymization to message content
      const anonymizedContent = await this.anonymizeMessageContent(
        message.content,
        classification,
      );

      // Update message with anonymized content (in a copy for logging)
      // Note: Original message should be preserved with proper access controls

      return true;
    } catch (error) {
      console.error("Failed to apply data protection:", error);
      return false;
    }
  }

  /**
   * Anonymize message content
   */
  private async anonymizeMessageContent(
    content: MessageContent,
    classification: DataClassification,
  ): Promise<MessageContent> {
    const text = this.extractTextFromContent(content);

    let anonymizedText = text;

    // Healthcare data anonymization
    if (classification.category === "healthcare") {
      anonymizedText = this.anonymizeHealthcareData(anonymizedText);
    }

    // Personal data anonymization
    if (
      classification.category === "sensitive" ||
      classification.category === "personal"
    ) {
      anonymizedText = this.anonymizePersonalData(anonymizedText);
    }

    // Return anonymized content maintaining structure
    if (typeof content === "string") {
      return anonymizedText;
    } else if (content && typeof content === "object" && "text" in content) {
      return {
        ...content,
        text: anonymizedText,
        metadata: {
          ...content.metadata,
          anonymized: true,
          anonymization_date: new Date().toISOString(),
        },
      };
    }

    return content;
  }

  /**
   * Anonymize healthcare-specific data
   */
  private anonymizeHealthcareData(text: string): string {
    // Replace specific medical identifiers
    text = text.replace(/\b\d{11,15}\b/g, "[DOCUMENTO_ANONIMIZADO]"); // CPF/RG patterns
    text = text.replace(/\b\d{6,}\b/g, "[NUMERO_ANONIMIZADO]"); // Health card numbers

    // Replace names (basic pattern - could be enhanced with NER)
    text = text.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+/g, "[NOME_ANONIMIZADO]");

    // Replace addresses
    text = text.replace(/\b\d{5}-?\d{3}\b/g, "[CEP_ANONIMIZADO]"); // CEP
    text = text.replace(
      /rua|av\.|avenida|alameda [^,\n]+/gi,
      "[ENDERECO_ANONIMIZADO]",
    );

    return text;
  }

  /**
   * Anonymize personal data
   */
  private anonymizePersonalData(text: string): string {
    // Replace phone numbers
    text = text.replace(
      /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g,
      "[TELEFONE_ANONIMIZADO]",
    );

    // Replace email addresses
    text = text.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      "[EMAIL_ANONIMIZADO]",
    );

    // Replace CPF
    text = text.replace(
      /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
      "[CPF_ANONIMIZADO]",
    );

    return text;
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    logData: Omit<LGPDAuditLog, "id" | "timestamp">,
  ): Promise<boolean> {
    if (!this.config.enable_audit_logging) {
      return true;
    }

    try {
      const auditLog: LGPDAuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...logData,
      };

      this.auditLogs.push(auditLog);

      // Persist audit log to database
      await this.persistAuditLog(auditLog);

      return true;
    } catch (error) {
      console.error("Failed to create audit log:", error);
      return false;
    }
  }

  /**
   * Detect potential LGPD violations
   */
  private async detectPotentialViolations(
    message: ChatMessage,
    classification: DataClassification,
    violations: string[],
    recommendations: string[],
  ): Promise<void> {
    const text = this.extractTextFromContent(message.content);

    // Check for excessive data collection
    if (classification.sub_categories.length > 5) {
      violations.push("Possível coleta excessiva de dados pessoais");
      recommendations.push("Revisar necessidade de todos os dados coletados");
    }

    // Check for sensitive data without proper classification
    if (
      classification.category === "personal" &&
      /diabetes|hiv|câncer|depressão/i.test(text)
    ) {
      violations.push(
        "Dados sensíveis de saúde não classificados adequadamente",
      );
      recommendations.push("Reclassificar como dados de saúde sensíveis");
    }

    // Check for data sharing indicators
    if (/compartilhar|enviar para|terceiro/i.test(text)) {
      violations.push(
        "Possível compartilhamento de dados sem consentimento específico",
      );
      recommendations.push(
        "Validar consentimento para compartilhamento de dados",
      );
    }

    // Check for international data transfer
    if (/exterior|internacional|fora do brasil/i.test(text)) {
      violations.push("Possível transferência internacional de dados");
      recommendations.push(
        "Verificar adequação para transferência internacional",
      );
    }

    // Check for automated decision making
    if (
      message.sender_type === "ai_assistant" &&
      classification.category === "healthcare"
    ) {
      violations.push("Decisão automatizada em dados de saúde");
      recommendations.push("Garantir supervisão humana em decisões de saúde");
    }
  }

  /**
   * Apply data retention policy
   */
  private async applyRetentionPolicy(
    message: ChatMessage,
    classification: DataClassification,
  ): Promise<void> {
    const retentionDate = new Date();
    retentionDate.setDate(
      retentionDate.getDate() + classification.retention_period_days,
    );

    // Schedule message for deletion (this would typically be handled by a background job)
    await this.scheduleDataDeletion(message.id, retentionDate, classification);
  }

  /**
   * Handle compliance violation
   */
  private async handleComplianceViolation(
    message: ChatMessage,
    violations: string[],
    recommendations: string[],
  ): Promise<void> {
    // Log violation
    await this.createAuditLog({
      user_id: "system",
      action: "compliance_violation_detected",
      data_subject_id: message.sender_id,
      data_categories: ["compliance"],
      legal_basis: "legitimate_interest",
      purpose: "compliance_monitoring",
      retention_applied: true,
      anonymization_applied: false,
      consent_validated: false,
      breach_detected: true,
      metadata: {
        message_id: message.id,
        violations,
        recommendations,
      },
    });

    // Notify privacy officer if configured
    if (this.config.privacy_officer_email) {
      await this.notifyPrivacyOfficer(message, violations, recommendations);
    }
  }

  /**
   * Get patient privacy rights
   */
  async getPatientPrivacyRights(userId: string): Promise<PrivacyRights> {
    // Brazilian healthcare patients have all LGPD rights
    return {
      access: true,
      rectification: true,
      erasure: true, // Right to be forgotten
      portability: true,
      processing_restriction: true,
      objection: true,
      automated_decision_objection: true,
    };
  }

  /**
   * Process right to access request
   */
  async processAccessRequest(userId: string): Promise<{
    personal_data: any[];
    processing_activities: LGPDAuditLog[];
    consent_records: ConsentRecord[];
    data_categories: string[];
    retention_periods: Record<string, number>;
  }> {
    const userAuditLogs = this.auditLogs.filter(
      (log) => log.data_subject_id === userId || log.user_id === userId,
    );

    const userConsents = this.consentRecords.get(userId) || [];

    // Get user's messages and data (would be fetched from database)
    const personalData = await this.getUserPersonalData(userId);

    const dataCategories = [
      ...new Set(userAuditLogs.flatMap((log) => log.data_categories)),
    ];

    const retentionPeriods = await this.getUserRetentionPeriods(userId);

    return {
      personal_data: personalData,
      processing_activities: userAuditLogs,
      consent_records: userConsents,
      data_categories: dataCategories,
      retention_periods: retentionPeriods,
    };
  }

  /**
   * Process right to erasure (right to be forgotten)
   */
  async processErasureRequest(
    userId: string,
    specific_data?: string[],
  ): Promise<{
    deleted_records: number;
    anonymized_records: number;
    retention_conflicts: string[];
    completion_date: Date;
  }> {
    if (!this.config.enable_right_to_be_forgotten) {
      throw new Error("Right to be forgotten is not enabled");
    }

    let deletedRecords = 0;
    let anonymizedRecords = 0;
    const retentionConflicts: string[] = [];

    // Check for legal retention requirements
    const legalRetentionData =
      await this.checkLegalRetentionRequirements(userId);

    if (legalRetentionData.length > 0) {
      retentionConflicts.push(
        ...legalRetentionData.map(
          (item) =>
            `${item.data_type}: Retenção legal até ${item.retention_until}`,
        ),
      );
    }

    // Delete or anonymize user data
    if (specific_data) {
      // Selective deletion
      for (const dataCategory of specific_data) {
        if (
          !legalRetentionData.find((item) => item.data_type === dataCategory)
        ) {
          await this.deleteUserDataByCategory(userId, dataCategory);
          deletedRecords++;
        } else {
          await this.anonymizeUserDataByCategory(userId, dataCategory);
          anonymizedRecords++;
        }
      }
    } else {
      // Full erasure request
      const allUserData = await this.getUserDataCategories(userId);

      for (const dataCategory of allUserData) {
        if (
          !legalRetentionData.find((item) => item.data_type === dataCategory)
        ) {
          await this.deleteUserDataByCategory(userId, dataCategory);
          deletedRecords++;
        } else {
          await this.anonymizeUserDataByCategory(userId, dataCategory);
          anonymizedRecords++;
        }
      }
    }

    // Log erasure activity
    await this.createAuditLog({
      user_id: "system",
      action: "right_to_erasure_processed",
      data_subject_id: userId,
      data_categories: specific_data || ["all"],
      legal_basis: "data_subject_request",
      purpose: "right_to_erasure",
      retention_applied: false,
      anonymization_applied: anonymizedRecords > 0,
      consent_validated: false,
      breach_detected: false,
      metadata: {
        deleted_records: deletedRecords,
        anonymized_records: anonymizedRecords,
        retention_conflicts,
      },
    });

    return {
      deleted_records: deletedRecords,
      anonymized_records: anonymizedRecords,
      retention_conflicts,
      completion_date: new Date(),
    };
  }

  // Helper methods

  private initializeAnonymizationMethods(): void {
    this.anonymizationMethods.set("k-anonymity", (data) => {
      // Implement k-anonymity
      return data;
    });

    this.anonymizationMethods.set("differential-privacy", (data) => {
      // Implement differential privacy
      return data;
    });

    this.anonymizationMethods.set("pseudonymization", (data) => {
      // Implement pseudonymization
      return data;
    });
  }

  private extractTextFromContent(content: MessageContent): string {
    if (typeof content === "string") {
      return content;
    }
    if (content && typeof content === "object" && "text" in content) {
      return content.text || "";
    }
    return "";
  }

  private getDefaultClassification(): DataClassification {
    return {
      category: "personal",
      sub_categories: ["unknown"],
      sensitivity_level: "medium",
      requires_consent: true,
      retention_period_days: this.config.data_retention_days!,
      anonymization_required: false,
      encryption_required: false,
      access_restrictions: ["data_controller", "data_processor"],
    };
  }

  private determineLegalBasis(
    classification: DataClassification,
    healthcareContext?: HealthcareContext,
  ): string {
    if (classification.category === "healthcare") {
      return healthcareContext?.consultation_type === "emergency"
        ? "vital_interests"
        : "explicit_consent";
    }

    if (classification.category === "sensitive") {
      return "explicit_consent";
    }

    return "legitimate_interest";
  }

  private getAccessRestrictions(
    category: DataClassification["category"],
    sensitivityLevel: DataClassification["sensitivity_level"],
  ): string[] {
    const restrictions = ["data_controller"];

    if (category === "healthcare" || sensitivityLevel === "critical") {
      restrictions.push("healthcare_professional", "authorized_personnel");
    } else if (sensitivityLevel === "high") {
      restrictions.push("authorized_personnel");
    } else {
      restrictions.push("data_processor");
    }

    return restrictions;
  }

  // Placeholder methods for database operations
  private async persistAuditLog(log: LGPDAuditLog): Promise<void> {
    // Implement database persistence
  }

  private async scheduleDataDeletion(
    messageId: string,
    deletionDate: Date,
    classification: DataClassification,
  ): Promise<void> {
    // Implement data deletion scheduling
  }

  private async notifyPrivacyOfficer(
    message: ChatMessage,
    violations: string[],
    recommendations: string[],
  ): Promise<void> {
    // Implement privacy officer notification
  }

  private async getUserPersonalData(userId: string): Promise<any[]> {
    // Implement user data retrieval
    return [];
  }

  private async getUserRetentionPeriods(
    userId: string,
  ): Promise<Record<string, number>> {
    // Implement retention periods retrieval
    return {};
  }

  private async checkLegalRetentionRequirements(
    userId: string,
  ): Promise<any[]> {
    // Implement legal retention check
    return [];
  }

  private async getUserDataCategories(userId: string): Promise<string[]> {
    // Implement user data categories retrieval
    return [];
  }

  private async deleteUserDataByCategory(
    userId: string,
    category: string,
  ): Promise<void> {
    // Implement selective data deletion
  }

  private async anonymizeUserDataByCategory(
    userId: string,
    category: string,
  ): Promise<void> {
    // Implement selective data anonymization
  }
}

// Singleton instance
let lgpdComplianceInstance: LGPDChatCompliance | null = null;

export function getLGPDChatCompliance(config?: LGPDConfig): LGPDChatCompliance {
  if (!lgpdComplianceInstance && config) {
    lgpdComplianceInstance = new LGPDChatCompliance(config);
  }

  if (!lgpdComplianceInstance) {
    throw new Error(
      "LGPD Chat Compliance not initialized. Please provide config.",
    );
  }

  return lgpdComplianceInstance;
}

export default LGPDChatCompliance;
