import type { 
  ConsentRecord, 
  ConsentRequest,
  ComplianceCheck,
  ComplianceViolation,
} from '../entities/consent.js';
import { 
  ConsentAction,
  ConsentStatus,
  ConsentValidator, 
  ConsentFactory 
} from '../entities/consent.js';
import type { ConsentRepository, ConsentQueryRepository } from '../repositories/consent-repository.js';

/**
 * Domain Service for Consent Management
 * Handles business logic for LGPD compliance and consent management
 * 
 * This service contains the business logic that was previously in the database layer
 */
export class ConsentDomainService {
  private repository: ConsentRepository;
  private queryRepository: ConsentQueryRepository;

  constructor(
    repository: ConsentRepository,
    queryRepository: ConsentQueryRepository
  ) {
    this.repository = repository;
    this.queryRepository = queryRepository;
  }

  /**
   * Create a new patient consent record
   * @param request Consent creation request
   * @param grantedBy User who granted the consent
   * @returns Created consent record
   */
  async createConsent(request: ConsentRequest, grantedBy: string): Promise<ConsentRecord> {
    // Validate request
    const validationErrors = ConsentValidator.validateRequest(request);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid consent request: ${validationErrors.join(', ')}`);
    }

    // Create consent record
    const consent = ConsentFactory.createFromRequest(request, grantedBy);

    // Add grant audit event
    const grantEvent = ConsentFactory.createAuditEvent(
      ConsentAction.GRANTED,
      request.patientId,
      grantedBy,
      {
        consentType: request.consentType,
        purpose: request.purpose,
        dataTypesCount: request.dataTypes.length,
      }
    );
    consent.auditTrail.push(grantEvent);

    // Persist to repository
    return await this.repository.create(consent);
  }

  /**
   * Retrieve consent records for a patient
   * @param patientId Patient identifier
   * @param includeExpired Include expired consents
   * @returns Array of consent records
   */
  async getConsent(patientId: string, includeExpired = false): Promise<ConsentRecord[]> {
    const consents = await this.repository.findByPatientId(patientId, includeExpired);
    
    // TODO: Add audit event to repository when we implement audit logging

    return consents;
  }

  /**
   * Revoke a patient consent
   * @param consentId Consent identifier
   * @param revokedBy User who revoked the consent
   * @param reason Revocation reason
   * @returns Updated consent record
   */
  async revokeConsent(consentId: string, revokedBy: string, reason?: string): Promise<ConsentRecord> {
    // Get existing consent
    const existingConsent = await this.repository.findById(consentId);
    if (!existingConsent) {
      throw new Error(`Consent with ID ${consentId} not found`);
    }

    // Check if consent is already revoked
    if (existingConsent.status === ConsentStatus.REVOKED) {
      throw new Error(`Consent ${consentId} is already revoked`);
    }

    // Revoke the consent
    const revokedConsent = await this.repository.revoke(consentId, revokedBy, reason);

    // TODO: Add audit event to repository
    // revokedConsent.auditTrail.push(auditEvent);
    // await this.repository.update(consentId, { auditTrail: revokedConsent.auditTrail });

    return revokedConsent;
  }

  /**
   * Check if patient has valid consent for specific data types
   * @param patientId Patient identifier
   * @param consentType Consent type
   * @param dataTypes Required data types
   * @returns True if patient has valid consent
   */
  async hasValidConsent(patientId: string, consentType: string, dataTypes: string[]): Promise<boolean> {
    return await this.repository.hasValidConsent(patientId, consentType, dataTypes);
  }

  /**
   * Check LGPD compliance for a patient
   * @param patientId Patient identifier
   * @returns Compliance check result
   */
  async checkCompliance(patientId: string): Promise<ComplianceCheck> {
    // Get all consents for patient
    const consents = await this.repository.findByPatientId(patientId, true);
    
    const violations: ComplianceViolation[] = [];
    const now = new Date();
    let isCompliant = true;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    // Check for expired consents that should be renewed
    for (const consent of consents) {
      if (consent.expiresAt && new Date(consent.expiresAt) < now) {
        if (consent.status !== ConsentStatus.EXPIRED) {
          violations.push({
            id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'EXPIRED_CONSENT_NOT_MARKED',
            severity: 'MEDIUM',
            description: `Consent ${consent.id} has expired but is not marked as expired`,
            affectedConsentId: consent.id,
            recommendation: 'Mark consent as expired or renew consent',
            resolved: false
          });
          riskLevel = 'MEDIUM';
        }
      }
    }

    // Check for consents expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = consents.filter(consent => 
      consent.expiresAt && 
      new Date(consent.expiresAt) < thirtyDaysFromNow &&
      consent.status === ConsentStatus.ACTIVE
    );

    if (expiringSoon.length > 0) {
      violations.push({
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'CONSENT_EXPIRING_SOON',
        severity: 'LOW',
        description: `${expiringSoon.length} consent(s) expiring within 30 days`,
        recommendation: 'Renew expiring consents',
        resolved: false
      });
    }

    // Check for missing essential consents (data processing)
    const hasDataProcessingConsent = consents.some(consent => 
      consent.consentType === 'data_processing' && 
      consent.status === ConsentStatus.ACTIVE
    );

    if (!hasDataProcessingConsent) {
      violations.push({
        id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'MISSING_DATA_PROCESSING_CONSENT',
        severity: 'HIGH',
        description: 'Patient does not have active data processing consent',
        recommendation: 'Obtain data processing consent immediately',
        resolved: false
      });
      riskLevel = 'HIGH';
      isCompliant = false;
    }

    // Determine overall compliance status
    let status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' = 'COMPLIANT';
    if (violations.some(v => v.severity === 'HIGH' || v.severity === 'CRITICAL')) {
      status = 'NON_COMPLIANT';
      isCompliant = false;
    } else if (violations.length > 0) {
      status = 'PARTIALLY_COMPLIANT';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (expiringSoon.length > 0) {
      recommendations.push(`Renew ${expiringSoon.length} expiring consent(s)`);
    }
    if (!hasDataProcessingConsent) {
      recommendations.push('Obtain data processing consent');
    }
    recommendations.push('Regular review of consent status');
    recommendations.push('Update consent documentation');

    return {
      patientId,
      status,
      riskLevel,
      risk_level: riskLevel, // Legacy support
      violations,
      isCompliant,
      lastChecked: now.toISOString(),
      recommendations
    };
  }

  /**
   * Get consent statistics
   * @param clinicId Clinic ID
   * @returns Consent statistics
   */
  async getConsentStatistics(clinicId: string) {
    return await this.repository.getStatistics(clinicId);
  }

  /**
   * Generate compliance report
   * @param clinicId Clinic ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Compliance report
   */
  async generateComplianceReport(clinicId: string, startDate: string, endDate: string) {
    return await this.queryRepository.generateComplianceReport(clinicId, startDate, endDate);
  }

  /**
   * Renew an expiring consent
   * @param consentId Consent ID
   * @param newExpiration New expiration date
   * @param renewedBy User who renewed the consent
   * @returns Updated consent record
   */
  async renewConsent(consentId: string, newExpiration: string, _renewedBy: string): Promise<ConsentRecord> {
    const existingConsent = await this.repository.findById(consentId);
    if (!existingConsent) {
      throw new Error(`Consent with ID ${consentId} not found`);
    }

    // Validate new expiration date
    if (new Date(newExpiration) <= new Date()) {
      throw new Error('New expiration date must be in the future');
    }

    // Update consent
    const updatedConsent = await this.repository.update(consentId, {
      expiresAt: newExpiration,
      status: ConsentStatus.ACTIVE
    });

    // TODO: Add audit event to repository
    // updatedConsent.auditTrail.push(renewalEvent);

    return updatedConsent;
  }
}