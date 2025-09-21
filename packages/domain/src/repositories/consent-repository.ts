import { 
  ConsentRecord, 
  ConsentRequest, 
  ConsentStatus, 
  ComplianceCheck,
  ComplianceViolation 
} from '../entities/consent.js';

/**
 * Consent Repository Interface
 * Abstract interface for consent data access
 */
export interface ConsentRepository {
  /**
   * Find a consent record by ID
   * @param id Consent ID
   * @returns Consent record or null if not found
   */
  findById(id: string): Promise<ConsentRecord | null>;

  /**
   * Find consent records by patient ID
   * @param patientId Patient ID
   * @param includeExpired Include expired consents
   * @returns Array of consent records
   */
  findByPatientId(patientId: string, includeExpired?: boolean): Promise<ConsentRecord[]>;

  /**
   * Find active consent records for a patient
   * @param patientId Patient ID
   * @returns Array of active consent records
   */
  findActiveByPatientId(patientId: string): Promise<ConsentRecord[]>;

  /**
   * Find consent records by type
   * @param consentType Consent type
   * @param patientId Optional patient ID
   * @returns Array of consent records
   */
  findByConsentType(consentType: string, patientId?: string): Promise<ConsentRecord[]>;

  /**
   * Find consent records by status
   * @param status Consent status
   * @param patientId Optional patient ID
   * @returns Array of consent records
   */
  findByStatus(status: ConsentStatus, patientId?: string): Promise<ConsentRecord[]>;

  /**
   * Find expired consent records
   * @param beforeDate Optional date to find consents expired before
   * @returns Array of expired consent records
   */
  findExpired(beforeDate?: string): Promise<ConsentRecord[]>;

  /**
   * Find consent records expiring soon
   * @param daysFromNow Number of days from now
   * @returns Array of consent records expiring soon
   */
  findExpiringSoon(daysFromNow: number): Promise<ConsentRecord[]>;

  /**
   * Create a new consent record
   * @param consent Consent data
   * @returns Created consent record
   */
  create(consent: Omit<ConsentRecord, 'id' | 'auditTrail'>): Promise<ConsentRecord>;

  /**
   * Update an existing consent record
   * @param id Consent ID
   * @param updates Partial consent data to update
   * @returns Updated consent record
   */
  update(id: string, updates: Partial<ConsentRecord>): Promise<ConsentRecord>;

  /**
   * Revoke a consent record
   * @param id Consent ID
   * @param revokedBy User who revoked the consent
   * @param reason Revocation reason
   * @returns Updated consent record
   */
  revoke(id: string, revokedBy: string, reason?: string): Promise<ConsentRecord>;

  /**
   * Delete a consent record
   * @param id Consent ID
   * @returns Success status
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if patient has active consent for specific data types
   * @param patientId Patient ID
   * @param consentType Consent type
   * @param dataTypes Required data types
   * @returns True if patient has valid consent
   */
  hasValidConsent(patientId: string, consentType: string, dataTypes: string[]): Promise<boolean>;

  /**
   * Count consent records by patient
   * @param patientId Patient ID
   * @returns Consent count
   */
  countByPatient(patientId: string): Promise<number>;

  /**
   * Get consent statistics
   * @param clinicId Clinic ID
   * @returns Consent statistics
   */
  getStatistics(clinicId: string): Promise<ConsentStatistics>;
}

/**
 * Consent Query Repository Interface
 * For complex queries and compliance reporting
 */
export interface ConsentQueryRepository {
  /**
   * Find consent records with filters
   * @param filters Filter criteria
   * @returns Array of matching consent records
   */
  findWithFilters(filters: ConsentFilters): Promise<ConsentRecord[]>;

  /**
   * Count consent records with filters
   * @param filters Filter criteria
   * @returns Consent count
   */
  countWithFilters(filters: ConsentFilters): Promise<number>;

  /**
   * Get consent audit trail
   * @param consentId Consent ID
   * @returns Audit trail events
   */
  getAuditTrail(consentId: string): Promise<any[]>;

  /**
   * Generate compliance report
   * @param clinicId Clinic ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Compliance report
   */
  generateComplianceReport(clinicId: string, startDate: string, endDate: string): Promise<ComplianceReport>;
}

/**
 * Consent filters interface
 */
export interface ConsentFilters {
  patientId?: string;
  consentType?: string;
  status?: ConsentStatus;
  patientIdHash?: string;
  createdFrom?: string;
  createdTo?: string;
  expiresFrom?: string;
  expiresTo?: string;
  legalBasis?: string;
  limit?: number;
  offset?: number;
  sortBy?: keyof ConsentRecord;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Consent statistics interface
 */
export interface ConsentStatistics {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  expiringSoon: number;
  byType: Record<string, number>;
  byLegalBasis: Record<string, number>;
  avgDaysUntilExpiration: number;
  complianceRate: number;
}

/**
 * Compliance report interface
 */
export interface ComplianceReport {
  clinicId: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalPatients: number;
    compliantPatients: number;
    nonCompliantPatients: number;
    partiallyCompliantPatients: number;
    complianceRate: number;
  };
  violations: ComplianceViolation[];
  recommendations: string[];
  generatedAt: string;
}