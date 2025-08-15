/**
 * Data Anonymization and Pseudonymization System
 * Implements LGPD Article 12 requirements for data protection
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

export interface AnonymizationConfig {
  strategy: 'anonymization' | 'pseudonymization';
  fields: string[];
  retention_period_days?: number;
  reversible: boolean;
  key_storage: 'secure_vault' | 'database' | 'file';
}

export interface PseudonymizationResult {
  original_id: string;
  pseudonym: string;
  created_at: Date;
  expires_at?: Date;
  reversible: boolean;
  key_reference?: string;
}

export class DataAnonymizer {
  private readonly SALT_LENGTH = 32;
  private readonly IV_LENGTH = 16;
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly masterKey: Buffer;

  constructor() {
    // In production, load from secure vault
    this.masterKey = Buffer.from(
      process.env.DATA_ANONYMIZATION_KEY || this.generateSecureKey(),
      'hex'
    );
  }

  // Generate secure random key
  private generateSecureKey(): string {
    return randomBytes(32).toString('hex');
  }

  // Anonymize data (irreversible)
  anonymizeData(
    data: Record<string, any>,
    config: AnonymizationConfig
  ): Record<string, any> {
    const anonymizedData = { ...data };

    config.fields.forEach((field) => {
      if (data[field] !== undefined && data[field] !== null) {
        anonymizedData[field] = this.anonymizeField(
          data[field],
          field,
          config.strategy
        );
      }
    });

    // Add anonymization metadata
    anonymizedData._anonymization_metadata = {
      anonymized_at: new Date(),
      strategy: config.strategy,
      fields_anonymized: config.fields,
      reversible: config.reversible,
    };

    return anonymizedData;
  }

  // Anonymize individual field
  private anonymizeField(
    value: any,
    fieldName: string,
    strategy: 'anonymization' | 'pseudonymization'
  ): any {
    const stringValue = String(value);

    switch (strategy) {
      case 'anonymization':
        return this.createAnonymizedValue(stringValue, fieldName);
      case 'pseudonymization':
        return this.createPseudonym(stringValue, fieldName);
      default:
        throw new Error(`Unknown anonymization strategy: ${strategy}`);
    }
  }

  // Create irreversible anonymized value
  private createAnonymizedValue(value: string, fieldName: string): string {
    // Different anonymization strategies based on field type
    if (fieldName.toLowerCase().includes('email')) {
      return this.anonymizeEmail(value);
    }

    if (fieldName.toLowerCase().includes('phone')) {
      return this.anonymizePhone(value);
    }

    if (fieldName.toLowerCase().includes('cpf')) {
      return this.anonymizeCPF(value);
    }

    if (fieldName.toLowerCase().includes('name')) {
      return this.anonymizeName(value);
    }

    // Generic anonymization
    return this.createHash(value + fieldName);
  }

  // Create reversible pseudonym
  private createPseudonym(value: string, fieldName: string): string {
    const salt = randomBytes(this.SALT_LENGTH);
    const iv = randomBytes(this.IV_LENGTH);

    const cipher = createCipheriv(this.ALGORITHM, this.masterKey, iv);

    let encrypted = cipher.update(`${value}|${fieldName}`, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine salt, iv, authTag, and encrypted data
    const pseudonym = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]).toString('base64');

    return pseudonym;
  }

  // Reverse pseudonymization (if reversible)
  reversePseudonym(pseudonym: string, _fieldName: string): string | null {
    try {
      const combined = Buffer.from(pseudonym, 'base64');

      const _salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(
        this.SALT_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH
      );
      const authTag = combined.slice(
        this.SALT_LENGTH + this.IV_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH + 16
      );
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH + 16);

      const decipher = createDecipheriv(this.ALGORITHM, this.masterKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');

      // Remove field name suffix
      const originalValue = decrypted.split('|')[0];

      return originalValue;
    } catch (error) {
      console.error('Failed to reverse pseudonym:', error);
      return null;
    }
  }

  // Email anonymization
  private anonymizeEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!domain) {
      return this.createHash(email);
    }

    const anonymizedLocal = this.createHash(localPart).substring(0, 8);
    const domainParts = domain.split('.');
    const anonymizedDomain =
      domainParts.length > 1
        ? `${this.createHash(domainParts[0]).substring(0, 6)}.${domainParts.at(-1)}`
        : this.createHash(domain).substring(0, 8);

    return `${anonymizedLocal}@${anonymizedDomain}`;
  }

  // Phone anonymization
  private anonymizePhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 4) {
      return '****';
    }

    const lastFour = cleanPhone.slice(-4);
    const prefix =
      cleanPhone.length > 4 ? '*'.repeat(cleanPhone.length - 4) : '';

    return prefix + lastFour;
  }

  // CPF anonymization (Brazilian tax ID)
  private anonymizeCPF(cpf: string): string {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      return '***.***.***-**';
    }

    return `***.***.***-${cleanCPF.slice(-2)}`;
  }

  // Name anonymization
  private anonymizeName(name: string): string {
    const parts = name.trim().split(' ');
    return parts
      .map((part, index) => {
        if (index === 0) {
          // Keep first letter of first name
          return part.charAt(0) + '*'.repeat(Math.max(part.length - 1, 2));
        }
        // Fully anonymize other names
        return '*'.repeat(Math.max(part.length, 2));
      })
      .join(' ');
  }

  // Create hash
  private createHash(input: string): string {
    return createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  // Bulk anonymization for database records
  async anonymizeBulkRecords(
    records: Record<string, any>[],
    config: AnonymizationConfig
  ): Promise<{
    anonymized_records: Record<string, any>[];
    pseudonym_mapping?: PseudonymizationResult[];
    statistics: {
      total_records: number;
      fields_processed: number;
      anonymization_strategy: string;
    };
  }> {
    const anonymizedRecords: Record<string, any>[] = [];
    const pseudonymMapping: PseudonymizationResult[] = [];

    for (const record of records) {
      const anonymizedRecord = this.anonymizeData(record, config);
      anonymizedRecords.push(anonymizedRecord);

      // If pseudonymization, store mapping
      if (config.strategy === 'pseudonymization' && config.reversible) {
        config.fields.forEach((field) => {
          if (record[field] !== undefined && record[field] !== null) {
            pseudonymMapping.push({
              original_id: record.id || `${record[field]}_${Date.now()}`,
              pseudonym: anonymizedRecord[field],
              created_at: new Date(),
              expires_at: config.retention_period_days
                ? new Date(
                    Date.now() +
                      config.retention_period_days * 24 * 60 * 60 * 1000
                  )
                : undefined,
              reversible: config.reversible,
              key_reference: field,
            });
          }
        });
      }
    }

    return {
      anonymized_records: anonymizedRecords,
      pseudonym_mapping:
        pseudonymMapping.length > 0 ? pseudonymMapping : undefined,
      statistics: {
        total_records: records.length,
        fields_processed: config.fields.length * records.length,
        anonymization_strategy: config.strategy,
      },
    };
  }

  // Check if data can be safely deleted (LGPD Article 16)
  canDeleteData(
    _dataSubjectId: string,
    _processingPurpose: string,
    legalBasis: string,
    retentionPeriod: number
  ): {
    can_delete: boolean;
    reason: string;
    retention_expires: Date | null;
  } {
    const createdDate = new Date(); // Would normally get from database
    const retentionExpires = new Date(
      createdDate.getTime() + retentionPeriod * 24 * 60 * 60 * 1000
    );
    const now = new Date();

    // Check legal bases that prevent deletion
    const permanentRetentionBases = [
      'legal_obligation',
      'vital_interests',
      'public_interest',
    ];

    if (permanentRetentionBases.includes(legalBasis)) {
      return {
        can_delete: false,
        reason: `Legal basis '${legalBasis}' requires permanent retention`,
        retention_expires: null,
      };
    }

    // Check if retention period has expired
    if (now >= retentionExpires) {
      return {
        can_delete: true,
        reason: 'Retention period has expired',
        retention_expires: retentionExpires,
      };
    }

    return {
      can_delete: false,
      reason: 'Retention period has not yet expired',
      retention_expires: retentionExpires,
    };
  }

  // Generate anonymization report for compliance
  generateAnonymizationReport(
    config: AnonymizationConfig,
    results: any
  ): {
    report: {
      anonymization_summary: any;
      compliance_status: string;
      recommendations: string[];
      risk_assessment: string;
    };
  } {
    const summary = {
      strategy_used: config.strategy,
      fields_anonymized: config.fields,
      total_records_processed: results.statistics?.total_records || 0,
      reversible: config.reversible,
      retention_period: config.retention_period_days || 'indefinite',
    };

    const complianceStatus = this.assessComplianceStatus(config);
    const recommendations = this.generateRecommendations(config, results);
    const riskAssessment = this.assessAnonymizationRisk(config);

    return {
      report: {
        anonymization_summary: summary,
        compliance_status: complianceStatus,
        recommendations,
        risk_assessment: riskAssessment,
      },
    };
  }

  private assessComplianceStatus(config: AnonymizationConfig): string {
    if (config.strategy === 'anonymization' && !config.reversible) {
      return 'LGPD Compliant - Irreversible anonymization';
    }

    if (config.strategy === 'pseudonymization' && config.reversible) {
      return 'LGPD Compliant - Reversible pseudonymization with proper controls';
    }

    return 'Requires review - Ensure compliance with LGPD Article 12';
  }

  private generateRecommendations(
    config: AnonymizationConfig,
    _results: any
  ): string[] {
    const recommendations = [];

    if (config.strategy === 'pseudonymization' && config.reversible) {
      recommendations.push(
        'Implement strict access controls for pseudonym reversal'
      );
      recommendations.push(
        'Regular audit of pseudonym usage and reversal requests'
      );
    }

    if (!config.retention_period_days) {
      recommendations.push(
        'Define clear retention periods for anonymized data'
      );
    }

    if (config.key_storage === 'database') {
      recommendations.push(
        'Consider migrating encryption keys to secure vault'
      );
    }

    recommendations.push(
      'Implement regular anonymization effectiveness reviews'
    );
    recommendations.push(
      'Document anonymization procedures for compliance audits'
    );

    return recommendations;
  }

  private assessAnonymizationRisk(config: AnonymizationConfig): string {
    let riskScore = 0;

    // Higher risk factors
    if (config.reversible) {
      riskScore += 3;
    }
    if (config.key_storage === 'database') {
      riskScore += 2;
    }
    if (config.strategy === 'pseudonymization') {
      riskScore += 2;
    }

    // Lower risk factors
    if (config.strategy === 'anonymization') {
      riskScore -= 2;
    }
    if (config.retention_period_days && config.retention_period_days < 365) {
      riskScore -= 1;
    }

    if (riskScore <= 0) {
      return 'Low Risk - Strong anonymization practices';
    }
    if (riskScore <= 3) {
      return 'Medium Risk - Review security measures';
    }
    return 'High Risk - Immediate security review required';
  }
}
