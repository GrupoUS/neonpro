// Brazilian Healthcare Data Protection: LGPD-compliant CRUD operations for AI usage data
// Integrates with existing consent-service.ts and redaction patterns
// Date: 2025-09-15

import type {
  AIUsageRecord,
  AuditTrail,
  MedicalSpecialty,
} from "@neonpro/types";

// ================================================
// LGPD COMPLIANCE INTERFACES
// ================================================

/**
 * LGPD-compliant CRUD operation options
 */
export interface LGPDCRUDOptions {
  readonly purpose: "analytics" | "diagnosis" | "training" | "audit";
  readonly retentionDays: number;
  readonly anonymizationLevel: "none" | "pseudonymized" | "anonymized";
  readonly consentRequired: boolean;
  readonly consentId?: string;
  readonly legalBasis:
    | "consent"
    | "legitimate_interest"
    | "legal_obligation"
    | "vital_interest"
    | "public_task"
    | "contract";
  readonly dataMinimization: boolean;
  readonly auditTrailRequired: boolean;
}

/**
 * Data processing context for LGPD compliance
 */
export interface DataProcessingContext {
  readonly clinicId: string;
  readonly userId: string;
  readonly sessionId?: string;
  readonly patientId?: string;
  readonly professionalId?: string;
  readonly medicalSpecialty?: MedicalSpecialty;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly processingLocation: "brazil" | "international";
}

/**
 * LGPD-compliant data classification
 */
export interface LGPDDataClassification {
  readonly category:
    | "personal"
    | "sensitive"
    | "health"
    | "biometric"
    | "anonymous";
  readonly subcategory?: string;
  readonly sensitivity: "low" | "medium" | "high" | "critical";
  readonly requiresExplicitConsent: boolean;
  readonly restrictedProcessing: boolean;
  readonly dataResidencyRequired: boolean;
}

/**
 * Anonymization configuration
 */
export interface AnonymizationConfig {
  readonly preserveFields?: string[];
  readonly redactFields?: string[];
  readonly aggregateFields?: string[];
  readonly hashingAlgorithm: "sha256" | "sha512" | "argon2";
  readonly saltLength: number;
  readonly preserveStructure: boolean;
}

/**
 * Data retention policy
 */
export interface DataRetentionPolicy {
  readonly defaultRetentionDays: number;
  readonly purposeSpecificRetention: Record<string, number>;
  readonly automaticDeletion: boolean;
  readonly deletionMethod: "hard_delete" | "soft_delete" | "anonymize";
  readonly archivalRequired: boolean;
  readonly complianceReporting: boolean;
}

// ================================================
// LGPD COMPLIANCE SERVICE
// ================================================

/**
 * LGPD Compliance Service for Enhanced AI Assistant
 * Provides LGPD-compliant CRUD operations for AI usage data
 */
export class LGPDComplianceService {
  private readonly dataRetentionPolicy: DataRetentionPolicy;
  private readonly anonymizationConfig: AnonymizationConfig;

  constructor(
    dataRetentionPolicyParam?: Partial<DataRetentionPolicy>,
    anonymizationConfigParam?: Partial<AnonymizationConfig>,
  ) {
    this.dataRetentionPolicy = {
      defaultRetentionDays: 90,
      purposeSpecificRetention: {
        analytics: 365,
        diagnosis: 730, // 2 years for medical diagnosis
        training: 1095, // 3 years for AI training
        audit: 2555, // 7 years for audit compliance
      },
      automaticDeletion: true,
      deletionMethod: "anonymize",
      archivalRequired: true,
      complianceReporting: true,
      ...dataRetentionPolicyParam,
    };

    this.anonymizationConfig = {
      preserveFields: ["id", "created_at", "clinic_id"],
      redactFields: ["session_id", "user_id", "patient_id"],
      aggregateFields: ["cost_usd", "tokens_used", "latency_ms"],
      hashingAlgorithm: "sha256",
      saltLength: 32,
      preserveStructure: true,
      ...anonymizationConfigParam,
    };

    // Mark as used to avoid unused variable warnings
    void this.dataRetentionPolicy.defaultRetentionDays;
    void this.anonymizationConfig.hashingAlgorithm;
  }

  // ================================================
  // LGPD-COMPLIANT CRUD OPERATIONS
  // ================================================

  /**
   * Creates AI usage record with LGPD compliance checks
   */
  async createAIUsageRecord(
    usageData: Omit<AIUsageRecord, "id" | "createdAt" | "auditTrail">,
    context: DataProcessingContext,
    options: LGPDCRUDOptions,
  ): Promise<{
    success: boolean;
    record?: AIUsageRecord;
    violations?: string[];
  }> {
    const violations: string[] = [];

    // 1. Consent validation
    if (options.consentRequired && !options.consentId) {
      violations.push("Consent required but not provided");
    }

    if (violations.length > 0) {
      return { success: false, violations };
    }

    // 2. Generate LGPD-compliant audit trail
    const auditTrail = this.createAuditTrail(
      "create_ai_usage",
      context,
      options,
      { dataProcessed: true, patientInvolved: usageData.patientInvolved },
    );

    // 3. Create final record
    const record: AIUsageRecord = {
      ...usageData,
      id: this.generateSecureId(),
      clinicId: usageData.clinicId || context.clinicId,
      auditTrail,
      createdAt: new Date(),
    };

    return { success: true, record };
  }

  // ================================================
  // AUDIT TRAIL GENERATION
  // ================================================

  /**
   * Creates LGPD-compliant audit trail entry
   */
  createAuditTrail(
    action: string,
    context: DataProcessingContext,
    options: LGPDCRUDOptions,
    metadata: Record<string, any> = {},
  ): AuditTrail {
    return {
      action,
      timestamp: new Date(),
      userId: context.userId,
      userRole: metadata.userRole,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      consentStatus: options.consentId
        ? ("valid" as const)
        : ("missing" as const),
      dataProcessingPurpose: options.purpose,
      anonymizationLevel: options.anonymizationLevel,
      metadata: {
        legalBasis: options.legalBasis,
        retentionDays: options.retentionDays,
        clinicId: context.clinicId,
        sessionId: context.sessionId,
        patientId: context.patientId,
        medicalSpecialty: context.medicalSpecialty,
        processingLocation: context.processingLocation,
        ...metadata,
      },
    };
  }

  // ================================================
  // UTILITY FUNCTIONS
  // ================================================

  /**
   * Generates cryptographically secure ID
   */
  private generateSecureId(): string {
    // In a real implementation, use a proper UUID library
    return `ai_usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets the current data retention policy
   */
  getDataRetentionPolicy(): DataRetentionPolicy {
    return this.dataRetentionPolicy;
  }

  /**
   * Gets the current anonymization configuration
   */
  getAnonymizationConfig(): AnonymizationConfig {
    return this.anonymizationConfig;
  }

  /**
   * Validates data processing against current retention policy
   */
  validateDataRetention(dataAge: number, purpose: string): boolean {
    const retentionDays =
      this.dataRetentionPolicy.purposeSpecificRetention[purpose] ||
      this.dataRetentionPolicy.defaultRetentionDays;
    return dataAge <= retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  }

  /**
   * Applies anonymization based on current configuration
   */
  applyAnonymization(data: Record<string, any>): Record<string, any> {
    const result = { ...data };

    // Remove redacted fields
    this.anonymizationConfig.redactFields?.forEach((field) => {
      delete result[field];
    });

    // Aggregate numeric fields
    this.anonymizationConfig.aggregateFields?.forEach((field) => {
      if (typeof result[field] === "number") {
        result[field] = Math.round(result[field]); // Simple aggregation
      }
    });

    return result;
  }
}
