import { HEALTHCARE_DATA_RETENTION_DAYS } from "@neonpro/types/constants/healthcare-constants";
import { addDays } from "date-fns";
import { z } from "zod";
/**
 * LGPD (Lei Geral de Proteção de Dados) Compliance Service
 * Implements automated compliance workflows for Brazilian data protection law
 *
 * Features:
 * - Consent management with granular tracking
 * - Data subject rights automation (access, rectification, erasure, portability)
 * - Privacy impact assessments
 * - Breach notification automation
 * - Data retention policy enforcement
 */
/**
 * LGPD lawful basis for data processing
 */
export let LgpdLawfulBasis;
((LgpdLawfulBasis) => {
  LgpdLawfulBasis.CONSENT = "consent";
  LgpdLawfulBasis.CONTRACT = "contract";
  LgpdLawfulBasis.LEGAL_OBLIGATION = "legal_obligation";
  LgpdLawfulBasis.VITAL_INTERESTS = "vital_interests";
  LgpdLawfulBasis.PUBLIC_TASK = "public_task";
  LgpdLawfulBasis.LEGITIMATE_INTERESTS = "legitimate_interests";
})(LgpdLawfulBasis || (LgpdLawfulBasis = {}));
/**
 * Data processing purposes
 */
export let DataProcessingPurpose;
((DataProcessingPurpose) => {
  DataProcessingPurpose.MEDICAL_TREATMENT = "medical_treatment";
  DataProcessingPurpose.APPOINTMENT_SCHEDULING = "appointment_scheduling";
  DataProcessingPurpose.BILLING = "billing";
  DataProcessingPurpose.MARKETING = "marketing";
  DataProcessingPurpose.RESEARCH = "research";
  DataProcessingPurpose.LEGAL_COMPLIANCE = "legal_compliance";
  DataProcessingPurpose.SECURITY = "security";
})(DataProcessingPurpose || (DataProcessingPurpose = {}));
/**
 * Data categories for processing
 */
export let DataCategory;
((DataCategory) => {
  DataCategory.PERSONAL = "personal";
  DataCategory.HEALTH = "health";
  DataCategory.FINANCIAL = "financial";
  DataCategory.BEHAVIORAL = "behavioral";
  DataCategory.SENSITIVE = "sensitive";
  DataCategory.BIOMETRIC = "biometric";
})(DataCategory || (DataCategory = {}));
/**
 * Data subject rights under LGPD
 */
export let DataSubjectRight;
((DataSubjectRight) => {
  DataSubjectRight.ACCESS = "access";
  DataSubjectRight.RECTIFICATION = "rectification";
  DataSubjectRight.ERASURE = "erasure";
  DataSubjectRight.PORTABILITY = "portability";
  DataSubjectRight.OBJECTION = "objection";
  DataSubjectRight.RESTRICTION = "restriction";
  DataSubjectRight.INFORMATION = "information";
})(DataSubjectRight || (DataSubjectRight = {}));
/**
 * Consent record schema
 */
export const consentSchema = z.object({
  userId: z.string().uuid("User ID deve ser um UUID válido"),
  purpose: z.nativeEnum(DataProcessingPurpose),
  lawfulBasis: z.nativeEnum(LgpdLawfulBasis),
  dataCategories: z.array(z.nativeEnum(DataCategory)),
  consentText: z.string().min(10).max(5000),
  version: z.string().default("1.0"),
  language: z.string().length(2).default("pt"),
  retentionPeriod: z.number().min(1).max(3650), // Days
  canWithdraw: z.boolean().default(true),
  granularConsent: z.record(z.boolean()).optional(),
  thirdPartySharing: z.boolean().default(false),
  internationalTransfer: z.boolean().default(false),
  automatedDecisionMaking: z.boolean().default(false),
});
/**
 * Data subject request schema
 */
export const dataSubjectRequestSchema = z.object({
  userId: z.string().uuid(),
  requestType: z.nativeEnum(DataSubjectRight),
  description: z.string().min(10).max(1000),
  preferredFormat: z.enum(["json", "pdf", "csv"]).default("json"),
  deliveryMethod: z.enum(["email", "download", "postal"]).default("email"),
  specificData: z.array(z.string()).optional(),
  verificationMethod: z.enum(["email", "sms", "in_person"]).default("email"),
});
/**
 * LGPD Service Implementation
 */
export class LgpdService {
  /**
   * Record user consent for data processing
   */
  static async recordConsent(consentData, ipAddress, userAgent) {
    // Validate consent data
    const validated = consentSchema.parse(consentData);
    const consent = {
      ...validated,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ipAddress,
      userAgent,
      isActive: true,
      auditTrail: [],
    };
    // Create initial audit entry
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action: "given",
      userId: consent.userId,
      ipAddress,
      details: {
        purpose: consent.purpose,
        lawfulBasis: consent.lawfulBasis,
        dataCategories: consent.dataCategories,
      },
    };
    consent.auditTrail.push(auditEntry);
    // Store in database (implementation depends on storage backend)
    await LgpdService.storeConsent(consent);
    return consent;
  }
  /**
   * Withdraw user consent and trigger data processing stops
   */
  static async withdrawConsent(consentId, userId, reason, ipAddress) {
    try {
      // Retrieve existing consent
      const consent = await LgpdService.getConsentById(consentId);
      if (!consent || consent.userId !== userId) {
        return {
          success: false,
          message: "Consentimento não encontrado ou não autorizado",
        };
      }
      if (!consent.isActive) {
        return {
          success: false,
          message: "Consentimento já foi retirado anteriormente",
        };
      }
      // Check if consent can be withdrawn
      if (!consent.canWithdraw) {
        return {
          success: false,
          message:
            "Este consentimento não pode ser retirado devido a obrigações legais",
        };
      }
      // Update consent record
      consent.isActive = false;
      consent.withdrawnAt = new Date();
      consent.withdrawalReason = reason;
      // Add audit entry
      const auditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: "withdrawn",
        userId,
        ipAddress,
        details: { reason },
      };
      consent.auditTrail.push(auditEntry);
      // Update in database
      await LgpdService.updateConsent(consent);
      // Trigger data processing stops
      await LgpdService.stopDataProcessing(userId, consent.purpose);
      // Determine data retention requirements
      const retentionInfo = await LgpdService.getDataRetentionInfo(consent);
      return {
        success: true,
        message: "Consentimento retirado com sucesso",
        dataRetention: retentionInfo,
      };
    } catch {
      return {
        success: false,
        message: "Erro interno ao retirar consentimento",
      };
    }
  }
  /**
   * Process data subject rights request
   */
  static async processDataSubjectRequest(requestData, _ipAddress) {
    // Validate request data
    const validated = dataSubjectRequestSchema.parse(requestData);
    const request = {
      ...validated,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      verificationStatus: "pending",
      processingNotes: [],
    };
    // Store request
    await LgpdService.storeDataSubjectRequest(request);
    // Start verification process
    await LgpdService.initiateVerification(request);
    // Schedule automatic processing
    await LgpdService.scheduleRequestProcessing(request.id);
    return request;
  }
  /**
   * Process data access request (LGPD Art. 18, I)
   */
  static async processAccessRequest(requestId) {
    const request = await LgpdService.getDataSubjectRequest(requestId);
    if (!request || request.requestType !== DataSubjectRight.ACCESS) {
      throw new Error("Invalid access request");
    }
    // Gather all user data
    const userData = await LgpdService.gatherUserData(request.userId);
    // Format data according to preferred format
    const formattedData = await LgpdService.formatUserData(
      userData,
      request.preferredFormat,
    );
    // Create response
    const response = {
      requestId: request.id,
      data: formattedData,
      format: request.preferredFormat,
      deliveredAt: new Date(),
      expiresAt: addDays(new Date(), 30), // 30 days access
      downloadCount: 0,
      maxDownloads: 5,
    };
    // Update request status
    await LgpdService.updateRequestStatus(requestId, "completed", response);
    return response;
  }
  /**
   * Process data deletion request (LGPD Art. 18, II)
   */
  static async processErasureRequest(requestId) {
    const request = await LgpdService.getDataSubjectRequest(requestId);
    if (!request || request.requestType !== DataSubjectRight.ERASURE) {
      throw new Error("Invalid erasure request");
    }
    const result = {
      deleted: [],
      retained: [],
      reasons: {},
    };
    // Check legal basis for each data category
    const userConsents = await LgpdService.getUserConsents(request.userId);
    const legalObligations = await LgpdService.getLegalRetentionRequirements(
      request.userId,
    );
    for (const consent of userConsents) {
      for (const category of consent.dataCategories) {
        if (legalObligations.includes(category)) {
          // Cannot delete due to legal obligation
          result.retained.push(category);
          result.reasons[category] =
            "Legal obligation (healthcare records retention)";
        } else if (
          consent.lawfulBasis === LgpdLawfulBasis.CONSENT &&
          !consent.isActive
        ) {
          // Can delete - consent withdrawn and no legal basis
          await LgpdService.deleteUserDataByCategory(request.userId, category);
          result.deleted.push(category);
        } else {
          // Evaluate other lawful bases
          const canDelete = await LgpdService.evaluateErasureEligibility(
            request.userId,
            category,
          );
          if (canDelete) {
            await LgpdService.deleteUserDataByCategory(
              request.userId,
              category,
            );
            result.deleted.push(category);
          } else {
            result.retained.push(category);
            result.reasons[category] =
              "Legitimate interests or contract performance";
          }
        }
      }
    }
    // Update request status
    await LgpdService.updateRequestStatus(requestId, "completed");
    return result;
  }
  /**
   * Generate privacy impact assessment
   */
  static async generatePrivacyImpactAssessment(processingActivity) {
    let riskScore = 0;
    const riskFactors = [];
    const mitigationMeasures = [];
    // Assess risk factors
    if (processingActivity.dataCategories.includes(DataCategory.HEALTH)) {
      riskScore += 3;
      riskFactors.push("Processing of health data (special category)");
      mitigationMeasures.push("Implement encryption at rest and in transit");
      mitigationMeasures.push("Strict access controls and audit logging");
    }
    if (processingActivity.dataCategories.includes(DataCategory.BIOMETRIC)) {
      riskScore += 3;
      riskFactors.push("Processing of biometric data (special category)");
      mitigationMeasures.push("Biometric template protection");
    }
    if (processingActivity.automatedDecisionMaking) {
      riskScore += 2;
      riskFactors.push("Automated decision-making");
      mitigationMeasures.push("Human oversight and review mechanisms");
      mitigationMeasures.push("Transparency about decision logic");
    }
    if (processingActivity.internationalTransfer) {
      riskScore += 2;
      riskFactors.push("International data transfer");
      mitigationMeasures.push("Adequacy decision or appropriate safeguards");
    }
    if (processingActivity.retentionPeriod > HEALTHCARE_DATA_RETENTION_DAYS) {
      // > 7 years
      riskScore += 1;
      riskFactors.push("Long retention period");
      mitigationMeasures.push("Regular review of retention necessity");
    }
    // Determine risk level
    let riskLevel;
    if (riskScore <= 2) {
      riskLevel = "low";
    } else if (riskScore <= 4) {
      riskLevel = "medium";
    } else if (riskScore <= 6) {
      riskLevel = "high";
    } else {
      riskLevel = "very_high";
    }
    // Generate recommendation
    let recommendation;
    switch (riskLevel) {
      case "low": {
        recommendation = "Standard data protection measures are sufficient.";
        break;
      }
      case "medium": {
        recommendation =
          "Additional safeguards recommended. Regular monitoring required.";
        break;
      }
      case "high": {
        recommendation =
          "Enhanced security measures mandatory. DPO consultation required.";
        break;
      }
      case "very_high": {
        recommendation =
          "Prior consultation with ANPD required. Comprehensive DPIA mandatory.";
        break;
      }
    }
    return {
      riskLevel,
      riskFactors,
      mitigationMeasures,
      recommendation,
    };
  }
  /**
   * Automated breach notification system
   */
  static async handleDataBreach(incident) {
    const { affectedUsers, dataCategories, severity } = incident;
    // Assess breach severity and impact
    const isHighRisk = LgpdService.assessBreachRisk(
      dataCategories,
      affectedUsers.length,
      severity,
    );
    // ANPD notification requirements (LGPD Art. 48)
    const anpdNotificationRequired = isHighRisk || severity === "critical";
    // User notification requirements
    const userNotificationRequired =
      isHighRisk &&
      (dataCategories.includes(DataCategory.HEALTH) ||
        dataCategories.includes(DataCategory.SENSITIVE) ||
        dataCategories.includes(DataCategory.BIOMETRIC));
    // Calculate notification deadline (72 hours from discovery)
    const notificationDeadline = anpdNotificationRequired
      ? addDays(incident.discoveredAt, 3)
      : undefined;
    // Risk assessment
    const riskAssessment = LgpdService.generateBreachRiskAssessment(incident);
    // Auto-schedule notifications if required
    if (anpdNotificationRequired) {
      await LgpdService.scheduleAnpdNotification(
        incident,
        notificationDeadline,
      );
    }
    if (userNotificationRequired) {
      await LgpdService.scheduleUserNotifications(
        incident.affectedUsers,
        incident,
      );
    }
    return {
      anpdNotificationRequired,
      userNotificationRequired,
      notificationDeadline,
      riskAssessment,
    };
  }
  // Private helper methods (implementation depends on storage backend)
  static async storeConsent(_consent) {}
  static async getConsentById(_id) {
    // Implementation depends on database
    return;
  }
  static async updateConsent(_consent) {}
  static async storeDataSubjectRequest(_request) {}
  static async getDataSubjectRequest(_id) {
    // Implementation depends on database
    return;
  }
  static async stopDataProcessing(_userId, _purpose) {}
  static async getDataRetentionInfo(_consent) {
    // Return retention information based on legal requirements
    return "Dados serão retidos conforme obrigações legais (7 anos para registros médicos)";
  }
  static async initiateVerification(_request) {}
  static async scheduleRequestProcessing(_requestId) {}
  static async gatherUserData(userId) {
    // Gather all user data from various sources
    return { userId, message: "Mock user data" };
  }
  static async formatUserData(data, _format) {
    // Format data according to requested format
    return data;
  }
  static async updateRequestStatus(_requestId, _status, _response) {}
  static async getUserConsents(_userId) {
    // Get all user consents
    return [];
  }
  static async getLegalRetentionRequirements(_userId) {
    // Return data categories that must be retained due to legal obligations
    return [DataCategory.HEALTH]; // Medical records must be retained
  }
  static async evaluateErasureEligibility(_userId, _category) {
    // Evaluate if data can be erased based on lawful basis
    return false;
  }
  static async deleteUserDataByCategory(_userId, _category) {}
  static assessBreachRisk(dataCategories, affectedCount, severity) {
    return (
      dataCategories.includes(DataCategory.HEALTH) ||
      affectedCount > 100 ||
      severity === "critical"
    );
  }
  static generateBreachRiskAssessment(incident) {
    return `Risk assessment for breach affecting ${incident.affectedUsers.length} users`;
  }
  static async scheduleAnpdNotification(_incident, _deadline) {}
  static async scheduleUserNotifications(_userIds, _incident) {}
}
