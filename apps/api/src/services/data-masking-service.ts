/**
 * Data Masking Service for LGPD Compliance
 * Provides automated data masking for sensitive information in list views and exports
 * Implements LGPD Articles 7º, 11º, 18º with healthcare-specific data protection
 */

import { LGPDDataCategory } from "../middleware/lgpd-compliance";

// ============================================================================
// Data Masking Configuration
// ============================================================================

export interface MaskingRule {
  id: string;
  fieldName: string;
  dataCategory: LGPDDataCategory;
  maskingType: "full" | "partial" | "hash" | "tokenize" | "redact";
  pattern?: RegExp;
  replacementPattern?: string;
  context:
    | "list_view"
    | "detail_view"
    | "export"
    | "api_response"
    | "audit_log";
  conditions?: {
    userRole?: string[];
    purpose?: string[];
    consentRequired?: boolean;
  };
  priority: number; // Higher number = higher priority
}

export interface MaskingContext {
  userId: string;
  userRole: string;
  purpose: string[];
  patientId?: string;
  hasExplicitConsent: boolean;
  isEmergencyAccess: boolean;
  isHealthcareProfessional: boolean;
  viewContext: "list" | "detail" | "export" | "audit";
  requestScope: "self" | "patient" | "clinic" | "system";
}

export interface MaskingResult {
  originalData: any;
  maskedData: any;
  maskingApplied: boolean;
  rulesApplied: string[];
  dataCategoriesMasked: LGPDDataCategory[];
  confidentialityLevel:
    | "public"
    | "restricted"
    | "confidential"
    | "highly_confidential";
  auditLog?: {
    maskingEvent: string;
    userId: string;
    timestamp: Date;
    fieldsMasked: string[];
    reason: string;
  };
}

// ============================================================================
// Healthcare-Specific Masking Patterns
// ============================================================================

const HEALTHCARE_MASKING_RULES: MaskingRule[] = [
  // Personal Identification
  {
    id: "cpf_masking",
    fieldName: "cpf",
    dataCategory: LGPDDataCategory.PERSONAL,
    maskingType: "partial",
    pattern: /\b(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})\b/g,
    replacementPattern: "$1.***.***-$4",
    context: "list_view",
    priority: 100,
  },
  {
    id: "cpf_full_mask",
    fieldName: "cpf",
    dataCategory: LGPDDataCategory.PERSONAL,
    maskingType: "full",
    context: "export",
    priority: 95,
  },
  {
    id: "phone_masking",
    fieldName: ["phone", "telefone", "celular"],
    dataCategory: LGPDDataCategory.PERSONAL,
    maskingType: "partial",
    pattern: /\b(?:\+55\s?)?\(?(\d{2})\)?\s?9?(\d{4})-?(\d{4})\b/g,
    replacementPattern: "($1) *****-$3",
    context: "list_view",
    priority: 90,
  },
  {
    id: "email_masking",
    fieldName: ["email", "email_address"],
    dataCategory: LGPDDataCategory.PERSONAL,
    maskingType: "partial",
    pattern: /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g,
    replacementPattern: "***@$2",
    context: "list_view",
    priority: 85,
  },

  // Medical Data
  {
    id: "medical_record_masking",
    fieldName: ["medical_record", "prontuario", "patient_record"],
    dataCategory: LGPDDataCategory.MEDICAL,
    maskingType: "hash",
    context: "list_view",
    priority: 150,
  },
  {
    id: "diagnosis_masking_list",
    fieldName: ["diagnosis", "diagnostico", "cid_code"],
    dataCategory: LGPDDataCategory.MEDICAL,
    maskingType: "redact",
    context: "list_view",
    priority: 140,
    conditions: {
      userRole: ["receptionist", "admin"],
    },
  },
  {
    id: "medication_masking",
    fieldName: ["medication", "medicamento", "prescription"],
    dataCategory: LGPDDataCategory.MEDICAL,
    maskingType: "partial",
    context: "list_view",
    priority: 130,
  },

  // Financial Data
  {
    id: "credit_card_masking",
    fieldName: ["credit_card", "card_number", "numero_cartao"],
    dataCategory: LGPDDataCategory.FINANCIAL,
    maskingType: "full",
    pattern: /\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g,
    replacementPattern: "****-****-****-$4",
    context: "all",
    priority: 200,
  },
  {
    id: "financial_data_masking",
    fieldName: ["bank_account", "agency", "conta_bancaria"],
    dataCategory: LGPDDataCategory.FINANCIAL,
    maskingType: "partial",
    context: "list_view",
    priority: 110,
  },

  // Biometric Data
  {
    id: "biometric_full_mask",
    fieldName: [
      "fingerprint",
      "facial_recognition",
      "iris_scan",
      "biometric_data",
    ],
    dataCategory: LGPDDataCategory.BIOMETRIC,
    maskingType: "redact",
    context: "all",
    priority: 300,
  },

  // Address Information
  {
    id: "address_masking",
    fieldName: ["address", "endereco", "street_address"],
    dataCategory: LGPDDataCategory.PERSONAL,
    maskingType: "partial",
    context: "list_view",
    priority: 80,
  },
  {
    id: "postal_code_masking",
    fieldName: ["postal_code", "cep", "zip_code"],
    dataCategory: LGPDDataCategory.PERSONAL,
    maskingType: "partial",
    pattern: /\b(\d{5})-?(\d{3})\b/g,
    replacementPattern: "$1-***",
    context: "list_view",
    priority: 75,
  },
];

// ============================================================================
// Data Masking Service Implementation
// ============================================================================

export class DataMaskingService {
  private maskingRules: MaskingRule[] = HEALTHCARE_MASKING_RULES;
  private auditLog: Array<{
    timestamp: Date;
    userId: string;
    action: string;
    details: any;
  }> = [];

  /**
   * Apply data masking to object based on context and rules
   */
  async maskData(
    data: any,
    context: MaskingContext,
    customRules?: MaskingRule[],
  ): Promise<MaskingResult> {
    try {
      const startTime = Date.now();
      const rulesToApply = customRules || this.getApplicableRules(context);

      // Deep clone data to avoid modifying original
      const maskedData = JSON.parse(JSON.stringify(data));
      const rulesApplied: string[] = [];
      const dataCategoriesMasked = new Set<LGPDDataCategory>();
      const fieldsMasked: string[] = [];

      // Apply masking rules
      this.applyMaskingRules(maskedData, rulesToApply, context, {
        rulesApplied,
        dataCategoriesMasked,
        fieldsMasked,
      });

      // Determine confidentiality level
      const confidentialityLevel = this.determineConfidentialityLevel(
        Array.from(dataCategoriesMasked),
        rulesApplied.length,
      );

      // Create audit log entry
      const auditLog = this.createAuditLogEntry(
        context,
        fieldsMasked,
        rulesApplied,
      );

      const result: MaskingResult = {
        originalData: data,
        maskedData,
        maskingApplied: rulesApplied.length > 0,
        rulesApplied,
        dataCategoriesMasked: Array.from(dataCategoriesMasked),
        confidentialityLevel,
        auditLog,
      };

      // Log masking activity
      await this.logMaskingActivity(result, Date.now() - startTime);

      return result;
    } catch (error) {
      console.error("Error in maskData:", error);
      throw new Error("Failed to apply data masking");
    }
  }

  /**
   * Get applicable masking rules for the given context
   */
  private getApplicableRules(context: MaskingContext): MaskingRule[] {
    return this.maskingRules
      .filter((rule) => {
        // Check context applicability
        if (rule.context !== "all" && rule.context !== context.viewContext) {
          return false;
        }

        // Check conditions
        if (rule.conditions) {
          // Check user role conditions
          if (
            rule.conditions.userRole &&
            !rule.conditions.userRole.includes(context.userRole)
          ) {
            return false;
          }

          // Check purpose conditions
          if (
            rule.conditions.purpose &&
            !rule.conditions.purpose.some((p) => context.purpose.includes(p))
          ) {
            return false;
          }

          // Check consent requirements
          if (rule.conditions.consentRequired && !context.hasExplicitConsent) {
            return false;
          }
        }

        // Emergency access override for critical healthcare data
        if (
          context.isEmergencyAccess &&
          rule.dataCategory === LGPDDataCategory.MEDICAL
        ) {
          return false; // Don't mask medical data during emergency access
        }

        return true;
      })
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Apply masking rules to data object
   */
  private applyMaskingRules(
    data: any,
    rules: MaskingRule[],
    context: MaskingContext,
    tracking: {
      rulesApplied: string[];
      dataCategoriesMasked: Set<LGPDDataCategory>;
      fieldsMasked: string[];
    },
    path: string = "",
  ): void {
    if (typeof data !== "object" || data === null) {
      return;
    }

    Object.keys(data).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;
      const value = data[key];

      // Apply rules to this field
      const applicableRules = rules.filter((rule) => {
        const fieldNames = Array.isArray(rule.fieldName)
          ? rule.fieldName
          : [rule.fieldName];
        return (
          fieldNames.includes(key) ||
          fieldNames.some((fieldName) =>
            key.toLowerCase().includes(fieldName.toLowerCase()),
          )
        );
      });

      if (applicableRules.length > 0) {
        const rule = applicableRules[0]; // Use highest priority rule

        // Track applied rules and categories
        tracking.rulesApplied.push(rule.id);
        tracking.dataCategoriesMasked.add(rule.dataCategory);
        tracking.fieldsMasked.push(currentPath);

        // Apply masking based on type
        data[key] = this.applyMasking(value, rule, context);
      }

      // Recursively process nested objects and arrays
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              this.applyMaskingRules(
                item,
                rules,
                context,
                tracking,
                `${currentPath}[${index}]`,
              );
            }
          });
        } else {
          this.applyMaskingRules(value, rules, context, tracking, currentPath);
        }
      }
    });
  }

  /**
   * Apply specific masking transformation
   */
  private applyMasking(
    value: any,
    rule: MaskingRule,
    context: MaskingContext,
  ): any {
    if (typeof value !== "string") {
      return value;
    }

    switch (rule.maskingType) {
      case "full":
        return "***";

      case "partial":
        if (rule.pattern && rule.replacementPattern) {
          return value.replace(rule.pattern, rule.replacementPattern);
        }
        // Default partial masking
        if (value.length <= 4) return "***";
        const start = value.substring(0, 2);
        const end = value.substring(value.length - 2);
        const middle = "*".repeat(Math.max(1, value.length - 4));
        return `${start}${middle}${end}`;

      case "hash":
        return this.hashValue(value);

      case "tokenize":
        return this.tokenizeValue(value, context);

      case "redact":
        return "[REDACTED]";

      default:
        return value;
    }
  }

  /**
   * Hash value for consistent masking
   */
  private hashValue(value: string): string {
    // Simple hash for demo - use proper crypto in production
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Tokenize value for reversible masking
   */
  private tokenizeValue(value: string, context: MaskingContext): string {
    // In production, this would integrate with a tokenization service
    return `token_${Buffer.from(value).toString("base64").substring(0, 8)}`;
  }

  /**
   * Determine confidentiality level
   */
  private determineConfidentialityLevel(
    dataCategories: LGPDDataCategory[],
    rulesAppliedCount: number,
  ): "public" | "restricted" | "confidential" | "highly_confidential" {
    if (
      dataCategories.includes(LGPDDataCategory.MEDICAL) ||
      dataCategories.includes(LGPDDataCategory.BIOMETRIC)
    ) {
      return rulesAppliedCount > 0 ? "highly_confidential" : "confidential";
    }

    if (
      dataCategories.includes(LGPDDataCategory.FINANCIAL) ||
      dataCategories.includes(LGPDDataCategory.SENSITIVE)
    ) {
      return rulesAppliedCount > 0 ? "confidential" : "restricted";
    }

    return rulesAppliedCount > 0 ? "restricted" : "public";
  }

  /**
   * Create audit log entry
   */
  private createAuditLogEntry(
    context: MaskingContext,
    fieldsMasked: string[],
    rulesApplied: string[],
  ) {
    return {
      maskingEvent: "data_masking_applied",
      userId: context.userId,
      timestamp: new Date(),
      fieldsMasked,
      reason: `Applied ${rulesApplied.length} masking rules for ${context.viewContext} context`,
    };
  }

  /**
   * Log masking activity
   */
  private async logMaskingActivity(
    result: MaskingResult,
    processingTime: number,
  ): Promise<void> {
    try {
      const logEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: "system", // Would be actual user in real implementation
        action: "data_masking",
        details: {
          processingTime,
          rulesApplied: result.rulesApplied.length,
          fieldsMasked: result.auditLog?.fieldsMasked.length,
          confidentialityLevel: result.confidentialityLevel,
          dataCategories: result.dataCategoriesMasked,
        },
      };

      // In production, this would write to your audit log system
      this.auditLog.push(logEntry);
      console.log("[Data Masking Audit]", JSON.stringify(logEntry, null, 2));
    } catch (error) {
      console.error("Error logging masking activity:", error);
    }
  }

  /**
   * Add custom masking rule
   */
  addCustomRule(rule: MaskingRule): void {
    this.maskingRules.push(rule);
    // Sort by priority
    this.maskingRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove masking rule
   */
  removeRule(ruleId: string): boolean {
    const initialLength = this.maskingRules.length;
    this.maskingRules = this.maskingRules.filter((rule) => rule.id !== ruleId);
    return this.maskingRules.length < initialLength;
  }

  /**
   * Get masking rules for data category
   */
  getRulesForCategory(dataCategory: LGPDDataCategory): MaskingRule[] {
    return this.maskingRules.filter(
      (rule) => rule.dataCategory === dataCategory,
    );
  }

  /**
   * Preview masking without applying it
   */
  async previewMasking(
    data: any,
    context: MaskingContext,
  ): Promise<{
    previewData: any;
    affectedFields: string[];
    rulesToApply: string[];
    confidentialityLevel: string;
  }> {
    const result = await this.maskData(data, {
      ...context,
      viewContext: "detail",
    });

    return {
      previewData: result.maskedData,
      affectedFields: result.auditLog?.fieldsMasked || [],
      rulesToApply: result.rulesApplied,
      confidentialityLevel: result.confidentialityLevel,
    };
  }

  /**
   * Get masking statistics
   */
  getMaskingStatistics(): {
    totalRules: number;
    rulesByCategory: Record<LGPDDataCategory, number>;
    auditLogSize: number;
    recentActivity: number; // Last 24 hours
  } {
    const rulesByCategory = {} as Record<LGPDDataCategory, number>;

    this.maskingRules.forEach((rule) => {
      rulesByCategory[rule.dataCategory] =
        (rulesByCategory[rule.dataCategory] || 0) + 1;
    });

    const recentActivity = this.auditLog.filter(
      (entry) => Date.now() - entry.timestamp.getTime() < 24 * 60 * 60 * 1000,
    ).length;

    return {
      totalRules: this.maskingRules.length,
      rulesByCategory,
      auditLogSize: this.auditLog.length,
      recentActivity,
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create default masking context for healthcare operations
 */
export function createHealthcareMaskingContext(
  userId: string,
  userRole: string,
  purpose: string[],
  patientId?: string,
  viewContext: MaskingContext["viewContext"] = "list",
): MaskingContext {
  return {
    userId,
    userRole,
    purpose,
    patientId,
    hasExplicitConsent: false, // Would be validated separately
    isEmergencyAccess: false,
    isHealthcareProfessional: ["doctor", "nurse", "specialist"].includes(
      userRole,
    ),
    viewContext,
    requestScope: patientId ? "patient" : "clinic",
  };
}

/**
 * Check if data field requires masking based on LGPD
 */
export function requiresLGPDMasking(
  fieldName: string,
  dataCategory: LGPDDataCategory,
  userRole: string,
  context: MaskingContext["viewContext"] = "list",
): boolean {
  const healthcareContext = createHealthcareMaskingContext("system", userRole, [
    "check",
  ]);
  const service = new DataMaskingService();
  const rules = service.getApplicableRules(healthcareContext);

  return rules.some((rule) => {
    const fieldNames = Array.isArray(rule.fieldName)
      ? rule.fieldName
      : [rule.fieldName];
    return (
      rule.dataCategory === dataCategory &&
      (rule.context === "all" || rule.context === context) &&
      fieldNames.some((name) =>
        fieldName.toLowerCase().includes(name.toLowerCase()),
      )
    );
  });
}

export default DataMaskingService;
