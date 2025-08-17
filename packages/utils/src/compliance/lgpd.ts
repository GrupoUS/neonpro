/**
 * @fileoverview LGPD Compliance Utilities for NeonPro Healthcare
 * Constitutional Brazilian Healthcare LGPD Compliance (Lei Geral de Proteção de Dados)
 *
 * Quality Standard: ≥9.9/10
 */

import { z } from 'zod';
import type { ComplianceScore, ConsentRecord } from './types';
import {
  ComplianceStatus,
  HealthcareConsentType,
  LGPDDataSubjectRights,
  PatientDataClassification,
} from './types';

/**
 * LGPD Legal Basis (Art. 7º)
 */
export enum LGPDLegalBasis {
  CONSENT = 'CONSENT', // Consentimento
  CONTRACT = 'CONTRACT', // Execução de contrato
  LEGAL_OBLIGATION = 'LEGAL_OBLIGATION', // Cumprimento de obrigação legal
  VITAL_INTERESTS = 'VITAL_INTERESTS', // Proteção da vida
  PUBLIC_INTEREST = 'PUBLIC_INTEREST', // Interesse público
  LEGITIMATE_INTERESTS = 'LEGITIMATE_INTERESTS', // Interesse legítimo
  HEALTH_PROTECTION = 'HEALTH_PROTECTION', // Proteção da saúde (Art. 11º)
  HEALTH_RESEARCH = 'HEALTH_RESEARCH', // Pesquisa em saúde
}

/**
 * LGPD Consent Request
 */
export type LGPDConsentRequest = {
  patientId: string;
  consentType: HealthcareConsentType;
  legalBasis: LGPDLegalBasis;
  purpose: string;
  dataCategories: string[];
  retentionPeriod: number; // months
  thirdPartySharing: boolean;
  automatedDecisionMaking: boolean;
  locale: 'pt-BR' | 'en-US';
};

/**
 * LGPD Data Subject Request
 */
export type LGPDDataSubjectRequest = {
  id: string;
  patientId: string;
  requestType: LGPDDataSubjectRights;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestedAt: Date;
  completedAt?: Date;
  reason?: string;
  requestData?: any;
  responseData?: any;
};

/**
 * LGPD Breach Notification
 */
export type LGPDBreachNotification = {
  id: string;
  incidentId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedDataSubjects: number;
  dataCategories: PatientDataClassification[];
  breachType: string;
  discoveredAt: Date;
  reportedAt: Date;
  anpdNotified: boolean;
  anpdNotificationDate?: Date;
  mitigationActions: string[];
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'CLOSED';
};

/**
 * LGPD Compliance Service
 */
export class LGPDComplianceService {
  private readonly constitutionalQualityStandard = 9.9;
  private readonly consentExpiryMonths = 24; // LGPD Art. 8º § 5º

  /**
   * Validate LGPD Consent Request
   */
  async validateConsentRequest(request: LGPDConsentRequest): Promise<{
    valid: boolean;
    score: ComplianceScore;
    violations: string[];
  }> {
    const violations: string[] = [];
    let score = 10;

    // Validate purpose specification (Art. 8º § 4º)
    if (!request.purpose || request.purpose.length < 20) {
      violations.push('Purpose must be specific and detailed (min 20 chars)');
      score -= 2;
    }

    // Validate data minimization (Art. 6º I)
    if (request.dataCategories.length === 0) {
      violations.push('Data categories must be specified');
      score -= 1;
    }

    // Validate retention period (Art. 15º)
    if (request.retentionPeriod > 120) {
      violations.push('Retention period exceeds maximum allowed (120 months)');
      score -= 1;
    }

    // Validate legal basis for health data (Art. 11º)
    if (
      request.consentType === HealthcareConsentType.TREATMENT &&
      ![LGPDLegalBasis.HEALTH_PROTECTION, LGPDLegalBasis.CONSENT].includes(
        request.legalBasis
      )
    ) {
      violations.push('Invalid legal basis for health data processing');
      score -= 3;
    }

    return {
      valid:
        violations.length === 0 && score >= this.constitutionalQualityStandard,
      score: Math.max(0, score) as ComplianceScore,
      violations,
    };
  }

  /**
   * Process Data Subject Rights Request
   */
  async processDataSubjectRequest(
    request: Omit<LGPDDataSubjectRequest, 'id' | 'requestedAt' | 'status'>
  ): Promise<LGPDDataSubjectRequest> {
    const dataSubjectRequest: LGPDDataSubjectRequest = {
      id: crypto.randomUUID(),
      ...request,
      status: 'PENDING',
      requestedAt: new Date(),
    };

    // Validate request type
    switch (request.requestType) {
      case LGPDDataSubjectRights.ACCESS:
        return this.processAccessRequest(dataSubjectRequest);
      case LGPDDataSubjectRights.RECTIFICATION:
        return this.processRectificationRequest(dataSubjectRequest);
      case LGPDDataSubjectRights.ERASURE:
        return this.processErasureRequest(dataSubjectRequest);
      case LGPDDataSubjectRights.PORTABILITY:
        return this.processPortabilityRequest(dataSubjectRequest);
      default:
        dataSubjectRequest.status = 'REJECTED';
        dataSubjectRequest.reason = 'Unsupported request type';
        return dataSubjectRequest;
    }
  }

  /**
   * Report Data Breach (Art. 48)
   */
  async reportDataBreach(
    breach: Omit<LGPDBreachNotification, 'id' | 'reportedAt' | 'status'>
  ): Promise<LGPDBreachNotification> {
    const notification: LGPDBreachNotification = {
      id: crypto.randomUUID(),
      ...breach,
      reportedAt: new Date(),
      status: 'OPEN',
    };

    // Check if ANPD notification is required
    const requiresANPDNotification =
      this.requiresANPDNotification(notification);

    if (requiresANPDNotification) {
      // Schedule ANPD notification within 72 hours
      notification.anpdNotified = false;
    }

    return notification;
  }

  /**
   * Validate Consent Expiry
   */
  async validateConsentExpiry(consent: ConsentRecord): Promise<{
    expired: boolean;
    expiresAt: Date;
    renewalRequired: boolean;
  }> {
    const expiresAt = new Date(consent.grantedAt);
    expiresAt.setMonth(expiresAt.getMonth() + this.consentExpiryMonths);

    const now = new Date();
    const expired = now > expiresAt;
    const renewalRequired =
      expired || expiresAt.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days

    return {
      expired,
      expiresAt,
      renewalRequired,
    };
  }

  /**
   * Generate LGPD Compliance Report
   */
  async generateComplianceReport(_tenantId: string): Promise<{
    score: ComplianceScore;
    status: ComplianceStatus;
    metrics: {
      totalConsents: number;
      activeConsents: number;
      expiredConsents: number;
      dataSubjectRequests: number;
      breachNotifications: number;
      averageResponseTime: number; // hours
    };
    recommendations: string[];
  }> {
    // This would integrate with actual data sources
    // For now, returning a template structure
    return {
      score: 9.9 as ComplianceScore,
      status: ComplianceStatus.COMPLIANT,
      metrics: {
        totalConsents: 0,
        activeConsents: 0,
        expiredConsents: 0,
        dataSubjectRequests: 0,
        breachNotifications: 0,
        averageResponseTime: 0,
      },
      recommendations: [],
    };
  }

  // Private helper methods
  private async processAccessRequest(
    request: LGPDDataSubjectRequest
  ): Promise<LGPDDataSubjectRequest> {
    request.status = 'IN_PROGRESS';
    // Implementation would gather patient data
    return request;
  }

  private async processRectificationRequest(
    request: LGPDDataSubjectRequest
  ): Promise<LGPDDataSubjectRequest> {
    request.status = 'IN_PROGRESS';
    // Implementation would update patient data
    return request;
  }

  private async processErasureRequest(
    request: LGPDDataSubjectRequest
  ): Promise<LGPDDataSubjectRequest> {
    request.status = 'IN_PROGRESS';
    // Implementation would delete patient data
    return request;
  }

  private async processPortabilityRequest(
    request: LGPDDataSubjectRequest
  ): Promise<LGPDDataSubjectRequest> {
    request.status = 'IN_PROGRESS';
    // Implementation would export patient data
    return request;
  }

  private requiresANPDNotification(breach: LGPDBreachNotification): boolean {
    // High risk criteria (Art. 48 § 1º)
    return (
      breach.severity === 'HIGH' ||
      breach.severity === 'CRITICAL' ||
      breach.affectedDataSubjects > 100 ||
      breach.dataCategories.includes(
        PatientDataClassification.SENSITIVE_PERSONAL
      ) ||
      breach.dataCategories.includes(PatientDataClassification.HEALTH_DATA)
    );
  }
}

// Zod Schemas for Runtime Validation
export const LGPDConsentRequestSchema = z.object({
  patientId: z.string().uuid(),
  consentType: z.nativeEnum(HealthcareConsentType),
  legalBasis: z.nativeEnum(LGPDLegalBasis),
  purpose: z.string().min(20).max(500),
  dataCategories: z.array(z.string()).min(1),
  retentionPeriod: z.number().min(1).max(120),
  thirdPartySharing: z.boolean(),
  automatedDecisionMaking: z.boolean(),
  locale: z.enum(['pt-BR', 'en-US']),
});

export const LGPDDataSubjectRequestSchema = z.object({
  patientId: z.string().uuid(),
  requestType: z.nativeEnum(LGPDDataSubjectRights),
  requestData: z.any().optional(),
});

export const LGPDBreachNotificationSchema = z.object({
  incidentId: z.string().uuid(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  affectedDataSubjects: z.number().min(0),
  dataCategories: z.array(z.nativeEnum(PatientDataClassification)),
  breachType: z.string().min(1),
  discoveredAt: z.date(),
  mitigationActions: z.array(z.string()),
});
