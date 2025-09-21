/**
 * Cryptographic Audit Utilities
 * Provides tamper-proof audit logging with hash chaining and digital signatures
 */

import { createHash, createHmac, randomBytes } from 'crypto';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  eventData: any;
  _userId?: string;
  clinicId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  sequenceNumber: number;
  previousHash?: string;
  dataHash: string;
  signature: string;
  complianceFlags: {
    lgpd_compliant: boolean;
    rls_enforced: boolean;
    consent_validated: boolean;
    emergency_access?: boolean;
  };
}

export interface AuditChainValidation {
  isValid: boolean;
  brokenAt?: number;
  totalEntries: number;
  validEntries: number;
  errors: string[];
}

export class CryptographicAuditLogger {
  private static instance: CryptographicAuditLogger;
  private secretKey: string;
  private lastHash: string | null = null;
  private sequenceCounter: number = 0;

  private constructor() {
    // In production, this should come from secure key management (e.g., AWS KMS, Azure Key Vault)
    this.secretKey = process.env.AUDIT_SECRET_KEY || this.generateSecretKey();
    this.initializeSequenceCounter();
  }

  static getInstance(): CryptographicAuditLogger {
    if (!CryptographicAuditLogger.instance) {
      CryptographicAuditLogger.instance = new CryptographicAuditLogger();
    }
    return CryptographicAuditLogger.instance;
  }

  /**
   * Create a cryptographically secure audit log entry
   */
  async createAuditEntry(
    eventType: string,
    eventData: any,
    _context: {
      _userId?: string;
      clinicId?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      complianceFlags?: any;
    } = {},
  ): Promise<AuditLogEntry> {
    try {
      const timestamp = new Date().toISOString();
      const id = this.generateAuditId();
      const sequenceNumber = await this.getNextSequenceNumber();

      // Create the core audit data
      const coreData = {
        id,
        timestamp,
        eventType,
        eventData: this.sanitizeEventData(eventData),
        _userId: context.userId,
        clinicId: context.clinicId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        sequenceNumber,
      };

      // Get the previous hash for chaining
      const previousHash = await this.getLastHash();

      // Calculate data hash
      const dataHash = this.calculateDataHash(coreData, previousHash);

      // Create digital signature
      const signature = this.createSignature(coreData, dataHash);

      const auditEntry: AuditLogEntry = {
        ...coreData,
        previousHash,
        dataHash,
        signature,
        complianceFlags: {
          lgpd_compliant: true,
          rls_enforced: true,
          consent_validated: false,
          ...context.complianceFlags,
        },
      };

      // Update internal state
      this.lastHash = dataHash;

      return auditEntry;
    } catch (_error) {
      console.error('Error creating audit entry:', error);
      throw new Error('Failed to create secure audit entry');
    }
  }

  /**
   * Validate the integrity of an audit log entry
   */
  validateAuditEntry(
    entry: AuditLogEntry,
    previousEntry?: AuditLogEntry,
  ): boolean {
    try {
      // Validate signature
      const expectedSignature = this.createSignature(
        {
          id: entry.id,
          timestamp: entry.timestamp,
          eventType: entry.eventType,
          eventData: entry.eventData,
          _userId: entry.userId,
          clinicId: entry.clinicId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          sessionId: entry.sessionId,
          sequenceNumber: entry.sequenceNumber,
        },
        entry.dataHash,
      );

      if (entry.signature !== expectedSignature) {
        return false;
      }

      // Validate data hash
      const expectedDataHash = this.calculateDataHash(
        {
          id: entry.id,
          timestamp: entry.timestamp,
          eventType: entry.eventType,
          eventData: entry.eventData,
          _userId: entry.userId,
          clinicId: entry.clinicId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          sessionId: entry.sessionId,
          sequenceNumber: entry.sequenceNumber,
        },
        entry.previousHash,
      );

      if (entry.dataHash !== expectedDataHash) {
        return false;
      }

      // Validate chain integrity
      if (previousEntry && entry.previousHash !== previousEntry.dataHash) {
        return false;
      }

      // Validate sequence number
      if (
        previousEntry
        && entry.sequenceNumber !== previousEntry.sequenceNumber + 1
      ) {
        return false;
      }

      return true;
    } catch (_error) {
      console.error('Error validating audit entry:', error);
      return false;
    }
  }

  /**
   * Validate the integrity of an entire audit chain
   */
  async validateAuditChain(
    entries: AuditLogEntry[],
  ): Promise<AuditChainValidation> {
    const result: AuditChainValidation = {
      isValid: true,
      totalEntries: entries.length,
      validEntries: 0,
      errors: [],
    };

    if (entries.length === 0) {
      return result;
    }

    // Sort entries by sequence number
    const sortedEntries = entries.sort(_(a,_b) => a.sequenceNumber - b.sequenceNumber,
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const currentEntry = sortedEntries[i];
      const previousEntry = i > 0 ? sortedEntries[i - 1] : undefined;

      const isValid = this.validateAuditEntry(currentEntry, previousEntry);

      if (isValid) {
        result.validEntries++;
      } else {
        result.isValid = false;
        if (result.brokenAt === undefined) {
          result.brokenAt = i;
        }
        result.errors.push(
          `Invalid entry at sequence ${currentEntry.sequenceNumber}: ${currentEntry.id}`,
        );
      }
    }

    return result;
  }

  /**
   * Generate a forensic audit report
   */
  generateForensicReport(
    entries: AuditLogEntry[],
    validation: AuditChainValidation,
  ): any {
    const report = {
      generatedAt: new Date().toISOString(),
      totalEntries: validation.totalEntries,
      validEntries: validation.validEntries,
      invalidEntries: validation.totalEntries - validation.validEntries,
      chainIntegrity: validation.isValid,
      firstBrokenEntry: validation.brokenAt,
      timeRange: {
        start: entries.length > 0 ? entries[0].timestamp : null,
        end: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
      },
      eventTypeDistribution: this.analyzeEventTypes(entries),
      complianceMetrics: this.analyzeCompliance(entries),
      anomalies: this.detectAnomalies(entries),
      errors: validation.errors,
      signature: this.signReport({
        totalEntries: validation.totalEntries,
        validEntries: validation.validEntries,
        chainIntegrity: validation.isValid,
      }),
    };

    return report;
  }

  /**
   * Create audit retention policy compliance report
   */
  generateRetentionReport(entries: AuditLogEntry[]): any {
    const _now = new Date();
    const retentionPeriods = {
      emergency_access: 365 * 10, // 10 years for emergency access
      patient_data: 365 * 20, // 20 years for patient data access
      consent_changes: 365 * 7, // 7 years for consent modifications
      financial: 365 * 5, // 5 years for financial operations
      administrative: 365 * 3, // 3 years for admin operations
      system: 365 * 1, // 1 year for system operations
    };

    const retentionAnalysis = {
      totalEntries: entries.length,
      categories: {} as Record<string, any>,
      expiredEntries: [],
      retainedEntries: [],
      complianceStatus: 'COMPLIANT',
    };

    for (const entry of entries) {
      const entryDate = new Date(entry.timestamp);
      const ageInDays = Math.floor(
        (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const category = this.categorizeAuditEvent(entry.eventType);
      const retentionDays = retentionPeriods[category as keyof typeof retentionPeriods]
        || retentionPeriods.system;

      if (!retentionAnalysis.categories[category]) {
        retentionAnalysis.categories[category] = {
          total: 0,
          expired: 0,
          retained: 0,
          retentionDays,
        };
      }

      retentionAnalysis.categories[category].total++;

      if (ageInDays > retentionDays) {
        retentionAnalysis.categories[category].expired++;
        retentionAnalysis.expiredEntries.push({
          id: entry.id,
          eventType: entry.eventType,
          timestamp: entry.timestamp,
          ageInDays,
          category,
          retentionDays,
        });
      } else {
        retentionAnalysis.categories[category].retained++;
        retentionAnalysis.retainedEntries.push(entry.id);
      }
    }

    return retentionAnalysis;
  }

  // Private helper methods

  private generateSecretKey(): string {
    return randomBytes(32).toString('hex');
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  private async initializeSequenceCounter(): Promise<void> {
    // In production, this would query the database for the last sequence number
    this.sequenceCounter = 0;
  }

  private async getNextSequenceNumber(): Promise<number> {
    return ++this.sequenceCounter;
  }

  private async getLastHash(): Promise<string | null> {
    return this.lastHash;
  }

  private calculateDataHash(data: any, previousHash?: string | null): string {
    const dataString = JSON.stringify(data) + (previousHash || '');
    return createHash('sha256').update(dataString).digest('hex');
  }

  private createSignature(data: any, dataHash: string): string {
    const payload = JSON.stringify(data) + dataHash;
    return createHmac('sha256', this.secretKey).update(_payload).digest('hex');
  }

  private signReport(reportData: any): string {
    return createHmac('sha256', this.secretKey)
      .update(JSON.stringify(reportData))
      .digest('hex');
  }

  private sanitizeEventData(eventData: any): any {
    // Remove sensitive information that shouldn't be logged
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'cpf',
    ];

    if (typeof eventData !== 'object' || eventData === null) {
      return eventData;
    }

    const sanitized = { ...eventData };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private analyzeEventTypes(entries: AuditLogEntry[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const entry of entries) {
      distribution[entry.eventType] = (distribution[entry.eventType] || 0) + 1;
    }

    return distribution;
  }

  private analyzeCompliance(entries: AuditLogEntry[]): any {
    const metrics = {
      lgpdCompliant: 0,
      rlsEnforced: 0,
      consentValidated: 0,
      emergencyAccess: 0,
      total: entries.length,
    };

    for (const entry of entries) {
      if (entry.complianceFlags.lgpd_compliant) metrics.lgpdCompliant++;
      if (entry.complianceFlags.rls_enforced) metrics.rlsEnforced++;
      if (entry.complianceFlags.consent_validated) metrics.consentValidated++;
      if (entry.complianceFlags.emergency_access) metrics.emergencyAccess++;
    }

    return {
      ...metrics,
      lgpdComplianceRate: metrics.total > 0 ? (metrics.lgpdCompliant / metrics.total) * 100 : 0,
      rlsEnforcementRate: metrics.total > 0 ? (metrics.rlsEnforced / metrics.total) * 100 : 0,
      consentValidationRate: metrics.total > 0
        ? (metrics.consentValidated / metrics.total) * 100
        : 0,
      emergencyAccessRate: metrics.total > 0 ? (metrics.emergencyAccess / metrics.total) * 100 : 0,
    };
  }

  private detectAnomalies(entries: AuditLogEntry[]): any[] {
    const anomalies = [];

    // Detect unusual access patterns
    const userAccess: Record<string, number> = {};
    const ipAccess: Record<string, number> = {};
    const emergencyAccess = [];

    for (const entry of entries) {
      if (entry._userId) {
        userAccess[entry.userId] = (userAccess[entry.userId] || 0) + 1;
      }

      if (entry.ipAddress) {
        ipAccess[entry.ipAddress] = (ipAccess[entry.ipAddress] || 0) + 1;
      }

      if (entry.complianceFlags.emergency_access) {
        emergencyAccess.push({
          timestamp: entry.timestamp,
          _userId: entry.userId,
          eventType: entry.eventType,
        });
      }
    }

    // Flag users with excessive access
    const averageUserAccess = Object.values(userAccess).reduce(_(a,_b) => a + b, 0)
      / Object.keys(userAccess).length;
    for (const [userId, count] of Object.entries(userAccess)) {
      if (count > averageUserAccess * 3) {
        anomalies.push({
          type: 'EXCESSIVE_USER_ACCESS',
          userId,
          accessCount: count,
          averageAccess: averageUserAccess,
        });
      }
    }

    // Flag IPs with excessive access
    const averageIpAccess = Object.values(ipAccess).reduce(_(a,_b) => a + b, 0)
      / Object.keys(ipAccess).length;
    for (const [ip, count] of Object.entries(ipAccess)) {
      if (count > averageIpAccess * 5) {
        anomalies.push({
          type: 'EXCESSIVE_IP_ACCESS',
          ipAddress: ip,
          accessCount: count,
          averageAccess: averageIpAccess,
        });
      }
    }

    // Flag excessive emergency access
    if (emergencyAccess.length > entries.length * 0.05) {
      anomalies.push({
        type: 'EXCESSIVE_EMERGENCY_ACCESS',
        emergencyAccessCount: emergencyAccess.length,
        totalAccess: entries.length,
        rate: (emergencyAccess.length / entries.length) * 100,
      });
    }

    return anomalies;
  }

  private categorizeAuditEvent(eventType: string): string {
    const categories: Record<string, string> = {
      EMERGENCY_ACCESS: 'emergency_access',
      PATIENT_DATA_ACCESS: 'patient_data',
      MEDICAL_RECORD_ACCESS: 'patient_data',
      CONSENT_CREATED: 'consent_changes',
      CONSENT_WITHDRAWN: 'consent_changes',
      BILLING_ACCESS: 'financial',
      PAYMENT_PROCESSED: 'financial',
      USER_LOGIN: 'administrative',
      USER_LOGOUT: 'administrative',
      SYSTEM_ERROR: 'system',
    };

    return categories[eventType] || 'system';
  }
}

// Export singleton instance
export const _cryptographicAuditLogger = CryptographicAuditLogger.getInstance();
