import {
  getHealthcarePrismaClient,
  type HealthcarePrismaClient,
} from "../clients/prisma";
import { type LGPDOperationResult } from "../types/lgpd.js";
import { createHealthcareError } from "./createHealthcareError.js";

// LGPD Consent Types
export const ConsentPurpose = z.enum([
  "TREATMENT",
  "BILLING",
  "RESEARCH",
  "MARKETING",
  "STATISTICS",
  "LEGAL_COMPLIANCE",
  "TELEMEDICINE",
  "AI_ANALYSIS",
  "THIRD_PARTY_SHARING",
]);

export const ConsentStatus = z.enum([
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
  "PENDING",
  "WITHDRAWN",
]);

export const ConsentChannel = z.enum([
  "WEB_PORTAL",
  "MOBILE_APP",
  "IN_PERSON",
  "PHONE",
  "EMAIL",
  "PAPER_FORM",
]);

export interface LGPDConsentRecord {
  id: string;
  patientId: string;
  purpose: z.infer<typeof ConsentPurpose>;
  status: z.infer<typeof ConsentStatus>;
  channel: z.infer<typeof ConsentChannel>;
  consentText: string;
  version: string;
  validFrom: Date;
  validUntil?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: string;
  language: string;
  withdrawalReason?: string;
  withdrawalDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentRequest {
  patientId: string;
  purpose: z.infer<typeof ConsentPurpose>;
  channel: z.infer<typeof ConsentChannel>;
  language: string;
  consentText?: string;
  validUntil?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  location?: string;
}

export interface ConsentWithdrawalRequest {
  patientId: string;
  consentId: string;
  reason?: string;
  channel: z.infer<typeof ConsentChannel>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * LGPD Consent Management Service
 * Manages patient data consent records in compliance with LGPD Art. 7-9
 */
export class LGPDConsentService {
  private prisma: HealthcarePrismaClient;

  constructor(prisma?: HealthcarePrismaClient) {
    this.prisma = prisma || getHealthcarePrismaClient();
  }

  /**
   * Records patient consent for data processing
   * Complies with LGPD Art. 8 (consent requirements)
   */
  async recordConsent(
    _request: ConsentRequest,
  ): Promise<LGPDOperationResult & { consentId?: string }> {
    try {
      // Validate patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: request.patientId },
      });

      if (!patient) {
        throw createHealthcareError(
          "PATIENT_NOT_FOUND",
          `Patient not found: ${request.patientId}`,
          { patientId: request.patientId },
        );
      }

      // Get or create consent template for the purpose
      const consentTemplate = await this.getOrCreateConsentTemplate(
        request.purpose,
        request.language,
      );

      // Check for existing active consent
      const existingConsent = await this.findActiveConsent(
        request.patientId,
        request.purpose,
      );

      if (existingConsent) {
        // Revoke existing consent before creating new one
        await this.revokeConsent(existingConsent.id, "CONSENT_RENEWED");
      }

      // Create new consent record
      const consentRecord = await this.prisma.auditTrail.create({
        data: {
          _userId: request.patientId,
          action: "CONSENT_GRANTED",
          entityType: "LGPD_CONSENT",
          entityId: this.generateConsentId(),
          metadata: {
            purpose: request.purpose,
            channel: request.channel,
            consentText: request.consentText || consentTemplate.text,
            version: consentTemplate.version,
            validFrom: new Date().toISOString(),
            validUntil: request.validUntil?.toISOString(),
            ipAddress: request.ipAddress,
            userAgent: request.userAgent,
            deviceId: request.deviceId,
            location: request.location,
            language: request.language,
            previousConsentId: existingConsent?.id,
          },
        },
      });

      // Create audit trail entry
      await this.prisma.auditTrail.create({
        data: {
          _userId: request.patientId,
          action: "LGPD_CONSENT_RECORD",
          entityType: "CONSENT_MANAGEMENT",
          entityId: consentRecord.id,
          metadata: {
            purpose: request.purpose,
            channel: request.channel,
            action: "GRANTED",
            timestamp: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `consent_${consentRecord.id}`,
        timestamp: new Date().toISOString(),
        consentId: consentRecord.id,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `consent_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Withdraws patient consent (right to withdraw under LGPD Art. 8, §5)
   */
  async withdrawConsent(
    _request: ConsentWithdrawalRequest,
  ): Promise<LGPDOperationResult> {
    try {
      const consent = await this.prisma.auditTrail.findFirst({
        where: {
          id: request.consentId,
          _userId: request.patientId,
          metadata: {
            path: ["status"],
            equals: "ACTIVE",
          },
        },
      });

      if (!consent) {
        throw createHealthcareError(
          "CONSENT_NOT_FOUND",
          `Active consent not found: ${request.consentId}`,
          { consentId: request.consentId, patientId: request.patientId },
        );
      }

      // Update consent status to WITHDRAWN
      await this.prisma.auditTrail.update({
        where: { id: consent.id },
        data: {
          metadata: {
            ...consent.metadata,
            status: "WITHDRAWN",
            withdrawalReason: request.reason,
            withdrawalDate: new Date().toISOString(),
            withdrawalChannel: request.channel,
            withdrawalIpAddress: request.ipAddress,
            withdrawalUserAgent: request.userAgent,
          },
        },
      });

      // Create audit trail entry for withdrawal
      await this.prisma.auditTrail.create({
        data: {
          _userId: request.patientId,
          action: "CONSENT_WITHDRAWN",
          entityType: "CONSENT_MANAGEMENT",
          entityId: consent.id,
          metadata: {
            originalPurpose: consent.metadata?.purpose,
            reason: request.reason,
            channel: request.channel,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Trigger data deletion/anonymization for affected data
      await this.handleConsentWithdrawal(
        request.patientId,
        consent.metadata?.purpose,
      );

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `withdrawal_${consent.id}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `withdrawal_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Retrieves all active consents for a patient
   */
  async getPatientConsents(patientId: string): Promise<LGPDConsentRecord[]> {
    const consents = await this.prisma.auditTrail.findMany({
      where: {
        _userId: patientId,
        action: "CONSENT_GRANTED",
        metadata: {
          path: ["status"],
          equals: "ACTIVE",
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return consents.map((consent) => this.mapToConsentRecord(consent));
  }

  /**
   * Checks if patient has active consent for a specific purpose
   */
  async hasActiveConsent(
    patientId: string,
    purpose: z.infer<typeof ConsentPurpose>,
  ): Promise<boolean> {
    const consent = await this.findActiveConsent(patientId, purpose);
    return !!consent;
  }

  /**
   * Validates consent for data processing operation
   * Throws error if consent is not valid
   */
  async validateConsent(
    patientId: string,
    purpose: z.infer<typeof ConsentPurpose>,
    operation: string,
  ): Promise<void> {
    const hasConsent = await this.hasActiveConsent(patientId, purpose);

    if (!hasConsent) {
      throw createHealthcareError(
        "CONSENT_REQUIRED",
        `Patient consent required for ${operation}`,
        { patientId, purpose, operation },
      );
    }

    // Additional validation for sensitive operations
    if (this.isSensitiveOperation(operation)) {
      await this.validateSensitiveOperationConsent(patientId, purpose);
    }
  }

  /**
   * Generates consent report for patient data access requests
   */
  async generateConsentReport(
    patientId: string,
  ): Promise<LGPDOperationResult & { report?: any }> {
    try {
      const consents = await this.getPatientConsents(patientId);
      const auditEntries = await this.prisma.auditTrail.findMany({
        where: {
          _userId: patientId,
          action: {
            in: ["CONSENT_GRANTED", "CONSENT_WITHDRAWN", "LGPD_CONSENT_RECORD"],
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const report = {
        patientId,
        generatedAt: new Date().toISOString(),
        activeConsents: consents,
        consentHistory: auditEntries.map((entry) => ({
          action: entry.action,
          timestamp: entry.createdAt,
          metadata: entry.metadata,
        })),
        summary: {
          totalConsents: consents.length,
          purposes: consents.map((c) => c.purpose),
          lastActivity: auditEntries[0]?.createdAt,
        },
      };

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `consent_report_${Date.now()}`,
        timestamp: new Date().toISOString(),
        report,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `consent_report_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  // Private helper methods
  private async findActiveConsent(
    patientId: string,
    purpose: z.infer<typeof ConsentPurpose>,
  ): Promise<any> {
    return this.prisma.auditTrail.findFirst({
      where: {
        _userId: patientId,
        action: "CONSENT_GRANTED",
        metadata: {
          path: ["purpose"],
          equals: purpose,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  private async revokeConsent(
    consentId: string,
    _reason: string,
  ): Promise<void> {
    await this.prisma.auditTrail.update({
      where: { id: consentId },
      data: {
        metadata: {
          path: ["status"],
          equals: "REVOKED",
        },
      },
    });
  }

  private async getOrCreateConsentTemplate(
    purpose: z.infer<typeof ConsentPurpose>,
    _language: string,
  ): Promise<{ text: string; version: string }> {
    // Default consent templates for different purposes
    const templates: Record<string, { text: string; version: string }> = {
      TREATMENT: {
        text: `Autorizo o processamento de meus dados pessoais para fins de tratamento médico, diagnóstico e terapia.`,
        version: "1.0",
      },
      BILLING: {
        text: `Autorizo o processamento de meus dados pessoais para fins de faturamento e cobrança de serviços médicos.`,
        version: "1.0",
      },
      RESEARCH: {
        text: `Autorizo o uso de meus dados para fins de pesquisa médica, garantindo o anonimato e confidencialidade.`,
        version: "1.0",
      },
      TELEMEDICINE: {
        text: `Autorizo o processamento de meus dados para realização de consultas médicas via telemedicina.`,
        version: "1.0",
      },
      AI_ANALYSIS: {
        text: `Autorizo o uso de meus dados para análise por IA auxiliar no diagnóstico e tratamento.`,
        version: "1.0",
      },
    };

    return (
      templates[purpose] || {
        text: `Autorizo o processamento de meus dados para ${purpose}.`,
        version: "1.0",
      }
    );
  }

  private mapToConsentRecord(audit: any): LGPDConsentRecord {
    const metadata = audit.metadata || {};
    return {
      id: audit.id,
      patientId: audit.userId,
      purpose: metadata.purpose,
      status: metadata.status || "ACTIVE",
      channel: metadata.channel,
      consentText: metadata.consentText,
      version: metadata.version,
      validFrom: new Date(metadata.validFrom),
      validUntil: metadata.validUntil
        ? new Date(metadata.validUntil)
        : undefined,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      deviceId: metadata.deviceId,
      location: metadata.location,
      language: metadata.language,
      withdrawalReason: metadata.withdrawalReason,
      withdrawalDate: metadata.withdrawalDate
        ? new Date(metadata.withdrawalDate)
        : undefined,
      metadata: metadata,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    };
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isSensitiveOperation(operation: string): boolean {
    const sensitiveOperations = [
      "GENETIC_ANALYSIS",
      "BIOMETRIC_DATA",
      "MENTAL_HEALTH",
      "SEXUAL_HEALTH",
      "RELIGIOUS_DATA",
      "POLITICAL_OPINIONS",
    ];
    return sensitiveOperations.includes(operation);
  }

  private async validateSensitiveOperationConsent(
    patientId: string,
    purpose: z.infer<typeof ConsentPurpose>,
  ): Promise<void> {
    // Additional validation for sensitive data processing
    // This could include special consent requirements or additional checks
    const specialConsent = await this.findActiveConsent(patientId, purpose);

    if (!specialConsent?.metadata?.specialDataConsent) {
      throw createHealthcareError(
        "SPECIAL_CONSENT_REQUIRED",
        "Special consent required for sensitive data processing",
        { patientId, purpose },
      );
    }
  }

  private async handleConsentWithdrawal(
    patientId: string,
    purpose: string,
  ): Promise<void> {
    // Handle data deletion/anonymization when consent is withdrawn
    // This would trigger appropriate data handling based on the purpose
    console.log(
      `Handling consent withdrawal for patient ${patientId}, purpose: ${purpose}`,
    );

    // In a real implementation, this would:
    // 1. Identify affected data
    // 2. Apply appropriate data handling (delete, anonymize, restrict)
    // 3. Create audit trail for data processing
    // 4. Notify relevant systems
  }
}

// Export singleton instance
export const lgpdConsentService = new LGPDConsentService();
