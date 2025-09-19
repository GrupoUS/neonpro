import { type Context } from 'hono';
import { createHealthcareError } from '../services/createHealthcareError.js';
import { lgpdConsentService } from '../services/lgpd-consent-service.js';
import { lgpdAuditService } from '../services/lgpd-audit-service.js';
import { lgpdDataSubjectService } from '../services/lgpd-data-subject-service.js';
import { ConsentPurpose, DataCategory, AuditAction } from '../types/lgpd.js';

/**
 * LGPD Compliance Middleware
 * Enforces LGPD compliance requirements for all API endpoints
 * Implements consent validation, audit logging, and data subject rights
 */
export class LGPDComplianceMiddleware {
  /**
   * Validates consent for data processing operations
   * Implements LGPD Art. 7 (legal basis for processing)
   */
  static async requireConsent(
    c: Context,
    purpose: typeof ConsentPurpose.Enum,
    operation: string
  ): Promise<void> {
    const patientId = c.req.param('patientId') || c.get('patientId');
    
    if (!patientId) {
      throw createHealthcareError(
        'PATIENT_ID_REQUIRED',
        'Patient ID is required for consent validation',
        { operation, purpose }
      );
    }

    try {
      await lgpdConsentService.validateConsent(patientId, purpose, operation);
    } catch (error) {
      // Create audit entry for consent violation
      await lgpdAuditService.recordAudit({
        patientId,
        action: 'CONSENT_VIOLATION',
        entityType: 'COMPLIANCE_CHECK',
        entityId: `consent_check_${Date.now()}`,
        dataCategory: 'PERSONAL',
        severity: 'HIGH',
        description: `Consent validation failed for ${operation}`,
        metadata: {
          purpose,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  /**
   * Creates comprehensive audit trail for all data operations
   * Implements LGPD Art. 37 (record keeping requirement)
   */
  static async auditDataOperation(
    c: Context,
    options: {
      action: typeof AuditAction.Enum;
      entityType: string;
      entityId: string;
      dataCategory: typeof DataCategory.Enum;
      description: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const patientId = c.req.param('patientId') || c.get('patientId');
    const user = c.get('user');

    await lgpdAuditService.recordAudit({
      userId: user?.id,
      patientId,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      dataCategory: options.dataCategory,
      severity: options.severity || 'MEDIUM',
      description: options.description,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
      sessionId: c.get('sessionId'),
      metadata: {
        ...options.metadata,
        endpoint: c.req.path,
        method: c.req.method,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Validates data minimization principles
   * Implements LGPD Art. 6 (purpose limitation and data minimization)
   */
  static validateDataMinimization(
    requestedFields: string[],
    requiredFields: string[],
    purpose: string
  ): void {
    const unnecessaryFields = requestedFields.filter(field => !requiredFields.includes(field));
    
    if (unnecessaryFields.length > 0) {
      throw createHealthcareError(
        'DATA_MINIMIZATION_VIOLATION',
        `Requesting unnecessary data fields for ${purpose}`,
        { 
          requestedFields, 
          requiredFields, 
          unnecessaryFields,
          purpose 
        }
      );
    }
  }

  /**
   * Enforces data retention policies
   * Implements LGPD Art. 15 (storage limitation)
   */
  static async validateDataRetention(
    c: Context,
    dataType: string,
    accessPurpose: string
  ): Promise<void> {
    const patientId = c.req.param('patientId');
    
    if (!patientId) return;

    // In a real implementation, this would check data retention policies
    // and block access to data that should have been deleted
    const retentionValid = await this.checkDataRetentionValidity(patientId, dataType);
    
    if (!retentionValid.valid) {
      throw createHealthcareError(
        'RETENTION_POLICY_VIOLATION',
        `Data retention period expired for ${dataType}`,
        { 
          patientId, 
          dataType, 
          accessPurpose,
          expiryDate: retentionValid.expiryDate 
        }
      );
    }
  }

  /**
   * Handles sensitive data processing requirements
   * Implements LGPD Art. 11 (processing of sensitive personal data)
   */
  static async validateSensitiveDataProcessing(
    c: Context,
    sensitiveDataTypes: string[],
    purpose: string
  ): Promise<void> {
    const patientId = c.req.param('patientId') || c.get('patientId');
    
    if (!patientId) return;

    // Check for special consent requirements for sensitive data
    const sensitiveCategories = ['HEALTH', 'GENETIC', 'BIOMETRIC'];
    const hasSensitiveData = sensitiveDataTypes.some(type => 
      sensitiveCategories.includes(type.toUpperCase())
    );

    if (hasSensitiveData) {
      // Validate explicit consent for sensitive data processing
      try {
        await lgpdConsentService.validateConsent(
          patientId, 
          ConsentPurpose.Enum.TREATMENT, 
          `SENSITIVE_DATA_${purpose}`
        );

        // Create audit entry for sensitive data access
        await lgpdAuditService.recordAudit({
          patientId,
          action: 'SENSITIVE_DATA_ACCESS',
          entityType: 'SENSITIVE_DATA_PROCESSING',
          entityId: `sensitive_${Date.now()}`,
          dataCategory: DataCategory.Enum.SENSITIVE,
          severity: 'HIGH',
          description: `Sensitive data processed for ${purpose}`,
          metadata: {
            sensitiveDataTypes,
            purpose,
            validationMethod: 'EXPLICIT_CONSENT'
          }
        });
      } catch (error) {
        console.error('Failed to validate sensitive data consent:', error);
        throw createHealthcareError(
          'SENSITIVE_DATA_CONSENT_REQUIRED',
          'Explicit consent required for sensitive data processing',
          { patientId, purpose, sensitiveDataTypes, originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    }
  }

  /**
   * Implements data subject rights interception
   * Catches and routes data subject requests to appropriate handlers
   */
  static async handleDataSubjectRequest(
    c: Context,
    requestType: 'ACCESS' | 'DELETION' | 'CORRECTION' | 'PORTABILITY' | 'OBJECTION'
  ): Promise<Response> {
    const user = c.get('user');
    const patientId = c.req.param('patientId') || user?.id;
    const body = await c.req.json();

    if (!patientId) {
      throw createHealthcareError(
        'PATIENT_ID_REQUIRED',
        'Patient ID is required for data subject requests',
        { requestType }
      );
    }

    // Create the data subject request
    const result = await lgpdDataSubjectService.createRequest(
      patientId,
      requestType,
      body.description || `${requestType} request`,
      {
        priority: body.priority,
        requestData: body.requestData
      }
    );

    if (!result.success) {
      throw createHealthcareError(
        'REQUEST_CREATION_FAILED',
        'Failed to create data subject request',
        { errors: result.errors }
      );
    }

    return c.json({
      success: true,
      requestId: result.requestId,
      message: `${requestType} request created successfully`,
      estimatedCompletion: result.estimatedCompletion
    });
  }

  /**
   * Validates international data transfer compliance
   * Implements LGPD Art. 33 (international transfer)
   */
  static validateInternationalTransfer(
    destinationCountry: string,
    dataCategories: string[]
  ): void {
    // List of countries with adequate data protection (simplified)
    const adequateCountries = [
      'BR', 'AR', 'UY', 'CL', 'CO', // South American countries
      'US', 'CA', // North American countries with specific frameworks
      'GB', 'FR', 'DE', 'ES', 'IT', // EU countries with GDPR
      'CH', 'NO', 'IS' // Other European countries
    ];

    if (!adequateCountries.includes(destinationCountry.toUpperCase())) {
      // Check for specific safeguards
      const hasSafeguards = this.checkTransferSafeguards(destinationCountry, dataCategories);
      
      if (!hasSafeguards) {
        throw createHealthcareError(
          'INTERNATIONAL_TRANSFER_VIOLATION',
          `International data transfer to ${destinationCountry} requires adequate safeguards`,
          { 
            destinationCountry, 
            dataCategories,
            requiredSafeguards: [
              'Standard Contractual Clauses',
              'Binding Corporate Rules',
              'Adequacy Decision',
              'Explicit Consent'
            ]
          }
        );
      }
    }
  }

  /**
   * Implements data breach detection and reporting
   * Helps implement LGPD Art. 48 (security incident notification)
   */
  static async detectAndReportDataBreach(
    c: Context,
    incident: {
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      affectedRecords: number;
      description: string;
      affectedPatients: string[];
    }
  ): Promise<void> {
    // Create data breach notification
    const breachResult = await lgpdAuditService.recordDataBreach({
      breachId: `breach_${Date.now()}`,
      severity: incident.severity,
      affectedRecords: incident.affectedRecords,
      dataCategories: ['PERSONAL', 'HEALTH'], // Default categories
      description: incident.description,
      impactAssessment: this.assessBreachImpact(incident),
      mitigationActions: this.generateMitigationActions(incident),
      affectedPatients: incident.affectedPatients,
      discoveryDate: new Date(),
      status: 'DETECTED'
    });

    if (!breachResult.success) {
      console.error('Failed to record data breach:', breachResult.errors);
    }

    // Trigger immediate security protocols
    await this.triggerSecurityProtocols(incident);
  }

  /**
   * Creates LGPD compliance middleware for Hono routes
   */
  static middleware(options: {
    requireConsent?: boolean;
    consentPurpose?: typeof ConsentPurpose.Enum;
    auditOperation?: boolean;
    dataCategory?: typeof DataCategory.Enum;
    validateMinimization?: boolean;
    requiredFields?: string[];
  } = {}) {
    return async (c: Context, next: () => Promise<void>) => {
      const startTime = Date.now();
      
      try {
        // Validate consent if required
        if (options.requireConsent && options.consentPurpose) {
          await this.requireConsent(c, options.consentPurpose, c.req.path);
        }

        // Validate data minimization if required
        if (options.validateMinimization && options.requiredFields) {
          const requestedFields = c.req.query().fields?.split(',') || [];
          this.validateDataMinimization(
            requestedFields, 
            options.requiredFields, 
            c.req.path
          );
        }

        // Validate data retention
        if (options.dataCategory) {
          await this.validateDataRetention(c, options.dataCategory, c.req.path);
        }

        // Proceed with the request
        await next();

        // Audit successful operation if requested
        if (options.auditOperation) {
          await this.auditDataOperation(c, {
            action: AuditAction.Enum.DATA_ACCESS,
            entityType: 'API_ENDPOINT',
            entityId: `${c.req.method}_${c.req.path}`,
            dataCategory: options.dataCategory || DataCategory.Enum.PERSONAL,
            description: `Successful ${c.req.method} request to ${c.req.path}`,
            severity: 'LOW',
            metadata: {
              responseTime: Date.now() - startTime,
              statusCode: c.res.status
            }
          });
        }
      } catch (error) {
        // Audit failed operation
        await this.auditDataOperation(c, {
          action: AuditAction.Enum.DATA_ACCESS,
          entityType: 'API_ENDPOINT',
          entityId: `${c.req.method}_${c.req.path}`,
          dataCategory: options.dataCategory || DataCategory.Enum.PERSONAL,
          severity: 'MEDIUM',
          description: `Failed ${c.req.method} request to ${c.req.path}`,
          metadata: {
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });

        throw error;
      }
    };
  }

  /**
   * Creates specialized middleware for healthcare data processing
   */
  static healthcareDataMiddleware(options: {
    operation: string;
    sensitiveDataTypes?: string[];
  }) {
    return async (c: Context, next: () => Promise<void>) => {
      try {
        // Validate sensitive data processing
        if (options.sensitiveDataTypes && options.sensitiveDataTypes.length > 0) {
          await this.validateSensitiveDataProcessing(
            c,
            options.sensitiveDataTypes,
            options.operation
          );
        }

        // Apply standard healthcare compliance checks
        await this.middleware({
          requireConsent: true,
          consentPurpose: ConsentPurpose.Enum.TREATMENT,
          auditOperation: true,
          dataCategory: DataCategory.Enum.HEALTH,
          validateMinimization: true,
          requiredFields: ['id', 'patientId'] // Basic required fields
        })(c, next);
      } catch (error) {
        throw error;
      }
    };
  }

  // Private helper methods
  private static async checkDataRetentionValidity(
    patientId: string,
    dataType: string
  ): Promise<{ valid: boolean; expiryDate?: Date }> {
    // In a real implementation, this would check actual retention policies
    // For now, assume data is valid
    return { valid: true };
  }

  private static checkTransferSafeguards(
    destinationCountry: string,
    dataCategories: string[]
  ): boolean {
    // Check if appropriate safeguards are in place
    // This would integrate with actual transfer validation logic
    return false; // Default to requiring explicit safeguards
  }

  private static assessBreachImpact(incident: any): string {
    const impactLevels = {
      LOW: 'Minimal impact on data subjects',
      MEDIUM: 'Moderate impact requiring monitoring',
      HIGH: 'Significant impact requiring notification',
      CRITICAL: 'Severe impact requiring immediate action'
    };

    return impactLevels[incident.severity] || 'Unknown impact';
  }

  private static generateMitigationActions(incident: any): string[] {
    const actions = [
      'Immediate containment of affected systems',
      'Investigation of root cause',
      'Notification of affected individuals',
      'Review and enhancement of security measures',
      'Documentation of lessons learned'
    ];

    if (incident.severity === 'CRITICAL') {
      actions.unshift('Immediate shutdown of affected systems');
      actions.push('Notification of regulatory authorities');
    }

    return actions;
  }

  private static async triggerSecurityProtocols(incident: any): Promise<void> {
    // Trigger immediate security response
    console.log(`Security protocols triggered for ${incident.type} incident`);
    
    // In a real implementation, this would:
    // 1. Alert security team
    // 2. Isolate affected systems
    // 3. Begin forensic investigation
    // 4. Initiate breach notification process
  }
}

// Export middleware utilities
export const requireLGPDConsent = (purpose: typeof ConsentPurpose.Enum) => 
  LGPDComplianceMiddleware.middleware({ requireConsent: true, consentPurpose: purpose });

export const auditLGPDOperation = (dataCategory: typeof DataCategory.Enum = DataCategory.Enum.PERSONAL) =>
  LGPDComplianceMiddleware.middleware({ auditOperation: true, dataCategory });

export const healthcareDataCompliance = (operation: string, sensitiveDataTypes: string[] = []) =>
  LGPDComplianceMiddleware.healthcareDataMiddleware({ operation, sensitiveDataTypes });