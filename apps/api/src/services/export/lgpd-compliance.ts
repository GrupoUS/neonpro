import { brazilianComplianceService } from '../brazilian-compliance';
import { LGPDComplianceOptions, PatientExportField } from './types';

export class ExportLGPDCompliance {
  private static readonly SENSITIVE_FIELDS = [
    'name',
    'email',
    'phone',
    'cpf',
    'dateOfBirth',
    'gender',
    'allergies',
    'medications',
    'emergencyContact',
    'medicalHistory',
    'diagnosis',
    'treatment',
  ];

  private static readonly RESTRICTED_FIELDS = [
    'medicalRecord',
    'diagnosis',
    'treatment',
    'prescriptions',
    'insuranceDetails',
  ];

  static async validateExportRequest(
    userId: string,
    options: LGPDComplianceOptions,
    patientCount: number,
  ): Promise<{ valid: boolean; error?: string }> {
    if (!userId) {
      return { valid: false, error: 'ID do usuário é obrigatório' };
    }

    if (patientCount > 10000) {
      return {
        valid: false,
        error: 'Exportação limitada a 10.000 registros por solicitação',
      };
    }

    if (options.consentRequired) {
      const hasConsent = await this.checkUserConsent(userId, options.purpose);
      if (!hasConsent) {
        return {
          valid: false,
          error: 'Consentimento do paciente não encontrado',
        };
      }
    }

    return { valid: true };
  }

  static async checkUserConsent(
    userId: string,
    purpose: string,
  ): Promise<boolean> {
    try {
      return await brazilianComplianceService.hasDataProcessingConsent(
        userId,
        purpose,
      );
    } catch (error) {
      console.error('Erro ao verificar consentimento LGPD:', error);
      return false;
    }
  }

  static anonymizeData(
    data: any[],
    fields: PatientExportField[],
    options: LGPDComplianceOptions,
  ): any[] {
    return data.map(record => {
      const anonymizedRecord = { ...record };

      fields.forEach(field => {
        if (field.sensitive && options.anonymizeSensitiveFields) {
          anonymizedRecord[field.field] = this.anonymizeField(
            anonymizedRecord[field.field],
            field.type,
          );
        }

        if (
          options.excludeRestrictedFields
          && this.isRestrictedField(field.field)
        ) {
          delete anonymizedRecord[field.field];
        }
      });

      return anonymizedRecord;
    });
  }

  private static anonymizeField(value: any, type: string): any {
    if (value === null || value === undefined) {
      return value;
    }

    switch (type) {
      case 'string':
        return this.anonymizeString(value);
      case 'date':
        return this.anonymizeDate(value);
      case 'number':
        return this.anonymizeNumber(value);
      case 'array':
        return Array.isArray(value) ? value.map(() => '[REDACTED]') : value;
      default:
        return '[REDACTED]';
    }
  }

  private static anonymizeString(value: string): string {
    if (typeof value !== 'string') return '[REDACTED]';

    if (value.includes('@')) {
      return value.split('@')[0] + '@***.***';
    }

    if (value.length <= 2) return '**';

    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
  }

  private static anonymizeDate(date: Date | string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-**-**`;
  }

  private static anonymizeNumber(value: number): string {
    return value.toString().replace(/\d(?=\d{2})/g, '*');
  }

  private static isRestrictedField(field: string): boolean {
    return this.RESTRICTED_FIELDS.includes(field);
  }

  static generateAuditTrail(
    userId: string,
    exportId: string,
    recordCount: number,
    purpose: string,
  ) {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      exportId,
      action: 'DATA_EXPORT',
      recordCount,
      purpose,
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
      dataCategory: 'PATIENT_DATA',
      retentionDays: 30,
    };
  }

  static getFieldComplianceInfo(field: PatientExportField) {
    return {
      field: field.field,
      sensitive: field.sensitive,
      restricted: this.isRestrictedField(field.field),
      requiresConsent: field.sensitive,
      legalBasis: field.sensitive ? 'CONSENT' : 'LEGITIMATE_INTEREST',
      retentionPeriod: field.sensitive ? '365_days' : '1825_days',
    };
  }

  static async logDataAccess(
    userId: string,
    exportId: string,
    fields: PatientExportField[],
    recordCount: number,
  ): Promise<void> {
    const _auditLog = this.generateAuditTrail(
      userId,
      exportId,
      recordCount,
      'DATA_EXPORT',
    );

    try {
      await brazilianComplianceService.logDataAccess({
        userId,
        action: 'EXPORT',
        resourceId: exportId,
        resourceType: 'PATIENT_DATA_EXPORT',
        fieldsAccessed: fields.map(f => f.field),
        recordCount,
        purpose: 'DATA_EXPORT',
        legalBasis: 'CONSENT',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Erro ao registrar acesso de dados LGPD:', error);
    }
  }
}
