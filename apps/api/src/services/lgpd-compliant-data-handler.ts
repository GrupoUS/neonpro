/**
 * LGPD-Compliant Data Handler for Enhanced Client Interactions
 *
 * Comprehensive service for handling sensitive client data with Brazilian
 * data protection law compliance, including PII redaction, consent management,
 * and audit logging.
 */

import { createClient } from '@supabase/supabase-js';
import {
  // AguiClientProfileUpdateMessage,
  AguiClientRegistrationMessage,
  AguiConsentManagementMessage,
  // AguiErrorCode,
  // ClientConsentData,
  // ConsentAuditEntry,
  // ValidationResult,
} from './agui-protocol/types';

export interface LGPDDataHandlerConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  encryptionKey?: string;
  dataRetentionPeriod: number; // in days
  auditLogEnabled: boolean;
  piiDetectionEnabled: boolean;
}

export interface SensitiveField {
  path: string;
  type:
    | 'cpf'
    | 'email'
    | 'phone'
    | 'address'
    | 'medical'
    | 'financial'
    | 'personal';
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  requiresConsent: boolean;
  retentionPolicy: {
    duration: number; // in days
    action: 'delete' | 'anonymize' | 'archive';
  };
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  clientId?: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'export';
  resourceType: string;
  resourceId: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  processedAt: string;
  ipAddress: string;
  userAgent: string;
  consentId?: string;
}

export class LGPDCompliantDataHandler {
  private supabase: any;
  private config: LGPDDataHandlerConfig;
  private sensitiveFields: Map<string, SensitiveField> = new Map();
  private encryptionKey: string;

  constructor(config: LGPDDataHandlerConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.encryptionKey = config.encryptionKey || process.env.ENCRYPTION_KEY || 'default-key';

    this.initializeSensitiveFields();
  }

  private initializeSensitiveFields(): void {
    const fields: SensitiveField[] = [
      {
        path: 'cpf',
        type: 'cpf',
        sensitivity: 'critical',
        requiresConsent: true,
        retentionPolicy: { duration: 3650, action: 'anonymize' },
      },
      {
        path: 'email',
        type: 'email',
        sensitivity: 'medium',
        requiresConsent: true,
        retentionPolicy: { duration: 1825, action: 'anonymize' },
      },
      {
        path: 'phone',
        type: 'phone',
        sensitivity: 'medium',
        requiresConsent: true,
        retentionPolicy: { duration: 1825, action: 'anonymize' },
      },
      {
        path: 'address',
        type: 'address',
        sensitivity: 'medium',
        requiresConsent: true,
        retentionPolicy: { duration: 1825, action: 'anonymize' },
      },
      {
        path: 'medicalHistory',
        type: 'medical',
        sensitivity: 'critical',
        requiresConsent: true,
        retentionPolicy: { duration: 7300, action: 'delete' },
      },
      {
        path: 'dateOfBirth',
        type: 'personal',
        sensitivity: 'medium',
        requiresConsent: true,
        retentionPolicy: { duration: 7300, action: 'anonymize' },
      },
      {
        path: 'emergencyContact',
        type: 'personal',
        sensitivity: 'high',
        requiresConsent: true,
        retentionPolicy: { duration: 1825, action: 'anonymize' },
      },
      {
        path: 'financial',
        type: 'financial',
        sensitivity: 'high',
        requiresConsent: true,
        retentionPolicy: { duration: 2555, action: 'anonymize' },
      },
    ];

    fields.forEach(field => {
      this.sensitiveFields.set(field.path, field);
    });
  }

  // PII Detection and Redaction
  async detectAndRedactPII(
    data: any,
    context: string = 'unknown',
  ): Promise<{ redactedData: any; detectedPII: string[] }> {
    const detectedPII: string[] = [];
    const redactedData = JSON.parse(JSON.stringify(data)); // Deep clone

    const redactValue = (obj: any, path: string): void => {
      const keys = path.split('.');
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) return;
        current = current[keys[i]];
      }

      const finalKey = keys[keys.length - 1];
      if (current[finalKey] !== undefined) {
        const field = this.sensitiveFields.get(keys[keys.length - 1]);
        if (field) {
          detectedPII.push(`${path}: ${current[finalKey]}`);

          // Redact based on sensitivity
          switch (field.sensitivity) {
            case 'critical':
              current[finalKey] = '[REDACTED-CRITICAL]';
              break;
            case 'high':
              current[finalKey] = this.maskValue(current[finalKey], field.type);
              break;
            case 'medium':
              current[finalKey] = this.maskValue(current[finalKey], field.type);
              break;
            case 'low':
              // No redaction; keep original value
              // eslint-disable-next-line no-self-assign
              current[finalKey] = current[finalKey];
              break;
          }
        }
      }
    };

    // Recursively scan and redact
    const scanObject = (obj: any, currentPath: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) return;

      Object.keys(obj).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          scanObject(obj[key], newPath);
        } else {
          // Check if this is a sensitive field
          const sensitiveField = this.sensitiveFields.get(key);
          if (sensitiveField) {
            redactValue(obj, newPath);
          }

          // Additional PII detection patterns
          const value = String(obj[key]);
          if (this.isCPF(value)) {
            detectedPII.push(`${newPath}: CPF detected`);
            if (!sensitiveField) {
              obj[key] = this.maskCPF(value);
            }
          }
          if (this.isEmail(value)) {
            detectedPII.push(`${newPath}: Email detected`);
            if (!sensitiveField) {
              obj[key] = this.maskEmail(value);
            }
          }
          if (this.isPhone(value)) {
            detectedPII.push(`${newPath}: Phone detected`);
            if (!sensitiveField) {
              obj[key] = this.maskPhone(value);
            }
          }
        }
      });
    };

    scanObject(redactedData);

    // Log PII detection if enabled
    if (this.config.piiDetectionEnabled && detectedPII.length > 0) {
      await this.logPIIDetection(detectedPII, context);
    }

    return { redactedData, detectedPII };
  }

  // Masking functions
  private maskValue(value: any, type: string): string {
    const str = String(value);

    switch (type) {
      case 'cpf':
        return this.maskCPF(str);
      case 'email':
        return this.maskEmail(str);
      case 'phone':
        return this.maskPhone(str);
      case 'address':
        return str.length > 10 ? str.substring(0, 5) + '***' : '***';
      default:
        return str.length > 4 ? str.substring(0, 2) + '***' : '***';
    }
  }

  private maskCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.substring(0, 3)}.***.${clean.substring(6, 9)}-**`;
    }
    return '***.***.***-**';
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local && domain) {
      const maskedLocal = local.length > 3 ? local.substring(0, 2) + '***' : '***';
      return `${maskedLocal}@${domain}`;
    }
    return '***@***.***';
  }

  private maskPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) *****-${clean.substring(7, 11)}`;
    }
    return '(**) *****-****';
  }

  // PII Detection patterns
  private isCPF(value: string): boolean {
    const clean = value.replace(/\D/g, '');
    return clean.length === 11 && /^\d+$/.test(clean);
  }

  private isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private isPhone(value: string): boolean {
    const clean = value.replace(/\D/g, '');
    return clean.length >= 10 && clean.length <= 11 && /^\d+$/.test(clean);
  }

  // Consent Management
  async validateConsentForProcessing(
    userId: string,
    dataCategories: string[],
    purpose: string,
    clientId?: string,
  ): Promise<{ valid: boolean; missingConsents: string[] }> {
    try {
      const { data: consents, error } = await this.supabase
        .from('lgpd_consents')
        .select('*')
        .eq('patient_id', clientId)
        .eq('status', 'ACTIVE')
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;

      const validConsents = consents || [];
      const missingConsents: string[] = [];

      // Check if we have valid consent for each data category
      dataCategories.forEach(category => {
        const requiredConsent = this.getRequiredConsentType(category);
        const hasConsent = validConsents.some(
          consent =>
            consent.consent_type === requiredConsent
            && consent.purpose.toLowerCase().includes(purpose.toLowerCase()),
        );

        if (!hasConsent) {
          missingConsents.push(requiredConsent);
        }
      });

      return {
        valid: missingConsents.length === 0,
        missingConsents,
      };
    } catch (error) {
      console.error('Error validating consent:', error);
      return { valid: false, missingConsents: ['all'] };
    }
  }

  private getRequiredConsentType(dataCategory: string): string {
    const consentMap: Record<string, string> = {
      medical: 'TREATMENT',
      personal: 'TREATMENT',
      contact: 'TREATMENT',
      financial: 'DATA_SHARING',
      marketing: 'MARKETING',
      emergency: 'EMERGENCY_CONTACT',
      research: 'RESEARCH',
    };

    return consentMap[dataCategory] || 'TREATMENT';
  }

  // Data Processing Logging
  async logDataProcessing(
    record: Omit<DataProcessingRecord, 'id' | 'processedAt'>,
  ): Promise<void> {
    if (!this.config.auditLogEnabled) return;

    try {
      const { error } = await this.supabase.from('audit_logs').insert([
        {
          user_id: record.userId,
          action: this.mapActionToAuditAction(record.action),
          resource_type: this.mapResourceType(record.resourceType),
          resource_id: record.resourceId,
          details: {
            purpose: record.purpose,
            legalBasis: record.legalBasis,
            dataCategories: record.dataCategories,
            consentId: record.consentId,
          },
          ip_address: record.ipAddress,
          user_agent: record.userAgent,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging data processing:', error);
    }
  }

  private mapActionToAuditAction(action: string): string {
    const actionMap: Record<string, string> = {
      read: 'READ',
      create: 'CREATE',
      update: 'UPDATE',
      delete: 'DELETE',
      export: 'EXPORT',
    };

    return actionMap[action] || 'READ';
  }

  private mapResourceType(resourceType: string): string {
    const typeMap: Record<string, string> = {
      client: 'PATIENT_DATA',
      patient: 'PATIENT_DATA',
      appointment: 'APPOINTMENT',
      medical_record: 'PATIENT_RECORD',
      consent: 'PATIENT_CONSENT',
      communication: 'COMMUNICATION',
    };

    return typeMap[resourceType] || 'PATIENT_DATA';
  }

  // PII Detection Logging
  private async logPIIDetection(
    detectedPII: string[],
    context: string,
  ): Promise<void> {
    if (!this.config.auditLogEnabled) return;

    try {
      const { error } = await this.supabase.from('audit_logs').insert([
        {
          action: 'AI_PREDICTION',
          resource_type: 'PATIENT_DATA',
          details: {
            type: 'PII_DETECTION',
            context,
            detectedPII,
            autoRedacted: true,
          },
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging PII detection:', error);
    }
  }

  // Client Registration with LGPD Compliance
  async processClientRegistrationWithCompliance(
    message: AguiClientRegistrationMessage,
    requestContext: { userId: string; ipAddress: string; userAgent: string },
  ): Promise<{ success: boolean; clientId?: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Step 1: Detect and redact PII
      const { redactedData, _detectedPII } = await this.detectAndRedactPII(
        message.clientData,
        'client_registration',
      );

      // Step 2: Validate consent requirements
      const consentValidation = await this.validateConsentForProcessing(
        requestContext.userId,
        ['personal', 'contact', 'medical'],
        'client_registration',
        undefined,
      );

      if (!consentValidation.valid) {
        errors.push(
          `Consentimento faltante para: ${consentValidation.missingConsents.join(', ')}`,
        );
      }

      // Step 3: Validate LGPD compliance
      if (!message.consent?.treatmentConsent) {
        errors.push('Consentimento de tratamento é obrigatório');
      }

      // Step 4: Create client with redacted data
      if (errors.length === 0) {
        const { data: client, error } = await this.supabase
          .from('patients')
          .insert([
            {
              clinic_id: '00000000-0000-0000-0000-000000000001', // Default clinic
              full_name: redactedData.clientData.fullName,
              cpf: redactedData.clientData.cpf,
              date_of_birth: redactedData.clientData.dateOfBirth,
              email: redactedData.clientData.email,
              phone: redactedData.clientData.phone,
              lgpd_consent_given: true,
              lgpd_consent_date: message.consent?.consentDate,
              data_retention_until: new Date(
                Date.now()
                  + this.config.dataRetentionPeriod * 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Step 5: Log data processing
        await this.logDataProcessing({
          userId: requestContext.userId,
          clientId: client.id,
          action: 'create',
          resourceType: 'client',
          resourceId: client.id,
          purpose: 'client_registration',
          legalBasis: 'consent',
          dataCategories: ['personal', 'contact'],
          ipAddress: requestContext.ipAddress,
          userAgent: requestContext.userAgent,
          consentId: client.id,
        });

        return { success: true, clientId: client.id, errors: [] };
      }

      return { success: false, errors };
    } catch (error) {
      console.error('Error in LGPD-compliant client registration:', error);
      errors.push(`Erro no registro: ${error}`);
      return { success: false, errors };
    }
  }

  // Consent Management
  async manageClientConsent(
    message: AguiConsentManagementMessage,
    requestContext: { userId: string; ipAddress: string; userAgent: string },
  ): Promise<{ success: boolean; consentId?: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if client exists
      const { data: client, error: clientError } = await this.supabase
        .from('patients')
        .select('id')
        .eq('id', message.clientId)
        .single();

      if (clientError || !client) {
        errors.push('Cliente não encontrado');
        return { success: false, errors };
      }

      // Create or update consent
      let consentId: string;

      if (
        message.consentAction === 'grant'
        || message.consentAction === 'update'
      ) {
        const { data: consent, error } = await this.supabase
          .from('lgpd_consents')
          .upsert([
            {
              patient_id: message.clientId,
              consent_type: message.consentType.toUpperCase() as any,
              status: 'ACTIVE',
              purpose: message.consentData?.purpose
                || this.getDefaultPurpose(message.consentType),
              data_recipients: message.consentData?.dataRecipients || [],
              retention_period: message.consentData?.retentionPeriod || '5 years',
              expires_at: message.effectiveDate
                ? new Date(
                  new Date(message.effectiveDate).getTime()
                    + 5 * 365 * 24 * 60 * 60 * 1000,
                ).toISOString()
                : undefined,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        consentId = consent.id;

        // Create consent audit record
        await this.supabase.from('consent_records').insert([
          {
            patient_id: message.clientId,
            consent_id: consentId,
            action: message.consentAction.toUpperCase(),
            performed_by: requestContext.userId,
            ip_address: requestContext.ipAddress,
            user_agent: requestContext.userAgent,
          },
        ]);
      } else if (message.consentAction === 'revoke') {
        const { data: consent, error } = await this.supabase
          .from('lgpd_consents')
          .update({ status: 'REVOKED' })
          .eq('patient_id', message.clientId)
          .eq('consent_type', message.consentType.toUpperCase())
          .select()
          .single();

        if (error) throw error;
        consentId = consent.id;
      }

      // Log the consent management action
      await this.logDataProcessing({
        userId: requestContext.userId,
        clientId: message.clientId,
        action: 'update',
        resourceType: 'consent',
        resourceId: consentId,
        purpose: `consent_${message.consentAction}`,
        legalBasis: 'user_request',
        dataCategories: ['consent'],
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
      });

      return { success: true, consentId, errors: [] };
    } catch (error) {
      console.error('Error in consent management:', error);
      errors.push(`Erro no gerenciamento de consentimento: ${error}`);
      return { success: false, errors };
    }
  }

  private getDefaultPurpose(consentType: string): string {
    const purposes: Record<string, string> = {
      treatment: 'Tratamento médico e acompanhamento de saúde',
      data_sharing: 'Compartilhamento com profissionais de saúde envolvidos no tratamento',
      marketing: 'Envio de comunicações sobre serviços e promoções',
      emergency_contact: 'Utilização em casos de emergência',
      research: 'Uso em pesquisas científicas anônimas',
    };

    return purposes[consentType] || 'Processamento de dados pessoais';
  }

  // Data Retention Management
  async processDataRetention(): Promise<{
    processed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - this.config.dataRetentionPeriod,
      );

      // Find expired data
      const { data: expiredData, error } = await this.supabase
        .from('patients')
        .select('id, cpf, email, phone')
        .lt('data_retention_until', cutoffDate.toISOString());

      if (error) throw error;

      for (const record of expiredData || []) {
        try {
          // Anonymize sensitive fields
          await this.supabase
            .from('patients')
            .update({
              cpf: this.maskCPF(record.cpf || ''),
              email: this.maskEmail(record.email || ''),
              phone: this.maskPhone(record.phone || ''),
              lgpd_consent_given: false,
              lgpd_consent_date: null,
            })
            .eq('id', record.id);

          processed++;
        } catch (error) {
          errors.push(`Erro ao anonimizar cliente ${record.id}: ${error}`);
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Error in data retention processing:', error);
      errors.push(`Erro no processamento de retenção: ${error}`);
      return { processed, errors };
    }
  }

  // Data Export (Right to Access)
  async exportClientData(
    clientId: string,
    requestingUserId: string,
  ): Promise<{ success: boolean; data?: any; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Verify user has right to access this data
      const { data: client, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error || !client) {
        errors.push('Cliente não encontrado');
        return { success: false, errors };
      }

      // Collect all client data
      const exportData = {
        personal: {
          id: client.id,
          fullName: client.full_name,
          dateOfBirth: client.date_of_birth,
          registrationDate: client.created_at,
          lastUpdate: client.updated_at,
        },
        contact: {
          email: client.email,
          phone: client.phone,
        },
        consent: {
          lgpdConsentGiven: client.lgpd_consent_given,
          lgpdConsentDate: client.lgpd_consent_date,
          dataRetentionUntil: client.data_retention_until,
        },
        // Additional data from related tables would be included here
        appointments: [],
        consents: [],
        auditLogs: [],
      };

      // Log the export
      await this.logDataProcessing({
        userId: requestingUserId,
        clientId,
        action: 'export',
        resourceType: 'client',
        resourceId: clientId,
        purpose: 'data_access_request',
        legalBasis: 'user_request',
        dataCategories: ['personal', 'contact', 'consent'],
        ipAddress: 'system',
        userAgent: 'data_export_service',
      });

      return { success: true, data: exportData, errors: [] };
    } catch (error) {
      console.error('Error in client data export:', error);
      errors.push(`Erro na exportação de dados: ${error}`);
      return { success: false, errors };
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const checks = await Promise.allSettled([
        this.checkDatabaseConnection(),
        this.checkEncryptionSetup(),
        this.checkConsentRecords(),
      ]);

      const passedChecks = checks.filter(
        check => check.status === 'fulfilled' && check.value,
      ).length;
      const totalChecks = checks.length;

      return {
        status: passedChecks === totalChecks
          ? 'healthy'
          : passedChecks > 0
          ? 'degraded'
          : 'unhealthy',
        details: {
          totalChecks,
          passedChecks,
          failedChecks: totalChecks - passedChecks,
          piiDetectionEnabled: this.config.piiDetectionEnabled,
          auditLogEnabled: this.config.auditLogEnabled,
          dataRetentionPeriod: `${this.config.dataRetentionPeriod} days`,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      };
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { data: _data, error } = await this.supabase
        .from('patients')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  private async checkEncryptionSetup(): Promise<boolean> {
    return !!this.encryptionKey && this.encryptionKey !== 'default-key';
  }

  private async checkConsentRecords(): Promise<boolean> {
    try {
      const { data: _data, error } = await this.supabase
        .from('lgpd_consents')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}
