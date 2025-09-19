import {
  APIContract,
  APIContractValidationResult,
  HealthcareValidationError,
} from '@neonpro/shared/models/api-contract';
import { Context, Next } from 'hono';
import { OpenAPIV3_1 } from 'openapi-types';
import * as v from 'valibot';
import {
  createHealthcareError,
  ErrorCategory as HealthcareErrorCategory,
  ErrorSeverity as HealthcareErrorSeverity,
} from '../services/error-tracking-bridge';
import { structuredLogger } from '../services/structured-logging';

/**
 * Configuration for contract validation middleware
 */
export interface ContractValidationConfig {
  /** OpenAPI specification for contract validation */
  openApiSpec: OpenAPIV3_1.Document;
  /** API contract for healthcare-specific validation */
  apiContract: APIContract;
  /** Enable detailed validation logging */
  enableLogging?: boolean;
  /** Enable performance monitoring */
  enableMonitoring?: boolean;
  /** Enable audit trail for contract violations */
  enableAuditTrail?: boolean;
  /** Custom validation rules */
  customRules?: HealthcareValidationRule[];
  /** Performance threshold in ms */
  performanceThreshold?: number;
  /** Cache validation results for performance */
  enableCaching?: boolean;
  /** Cache TTL in seconds */
  cacheTtl?: number;
}

/**
 * Healthcare-specific validation rule
 */
export interface HealthcareValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (data: any, context: ValidationContext) => HealthcareValidationError[];
  /** Severity level */
  severity: HealthcareErrorSeverity;
  /** Applicable data classifications */
  applicableClassifications: string[];
  /** Rule category */
  category: HealthcareErrorCategory;
}

// import { OpenAPIV3_1 } from 'openapi-types';
import { OpenAPIV3_1 } from '../../types/openapi';

/**
 * Validation context for healthcare rules
 */
export interface ValidationContext {
  /** Request context */
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    userId?: string;
    clinicId?: string;
    requestId: string;
  };
  /** API contract information */
  contract: {
    version: string;
    endpoint: string;
    dataClassification: string;
    complianceRequirements: string[];
  };
  /** Timestamp */
  timestamp: Date;
}

/**
 * Contract validation result with healthcare compliance
 */
export interface ContractValidationResult {
  /** Overall validation status */
  isValid: boolean;
  /** OpenAPI validation errors */
  openapiErrors: HealthcareValidationError[];
  /** Healthcare-specific validation errors */
  healthcareErrors: HealthcareValidationError[];
  /** Performance metrics */
  metrics: {
    validationTime: number;
    openapiValidationTime: number;
    healthcareValidationTime: number;
    cacheHits: number;
    cacheMisses: number;
  };
  /** Audit trail entries */
  auditTrail: AuditTrailEntry[];
}

/**
 * Audit trail entry for contract validation
 */
export interface AuditTrailEntry {
  /** Entry type */
  type: 'validation_start' | 'validation_success' | 'validation_failure' | 'performance_alert';
  /** Timestamp */
  timestamp: Date;
  /** Request identifier */
  requestId: string;
  /** User identifier */
  userId?: string;
  /** Clinic identifier */
  clinicId?: string;
  /** Validation details */
  details: Record<string, any>;
}

/**
 * Simple in-memory cache for validation results
 */
class ValidationCache {
  private cache = new Map<string, { result: any; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 300) { // 5 minutes default
    this.ttl = ttl * 1000;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  set(key: string, result: any): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Healthcare-specific validation rules
 */
const HEALTHCARE_VALIDATION_RULES: HealthcareValidationRule[] = [
  {
    id: 'lgpd_consent_check',
    name: 'LGPD Consent Verification',
    description: 'Verify proper consent for personal data processing',
    validate: (data, context) => {
      const errors: HealthcareValidationError[] = [];

      // Check if personal data is present without consent
      if (data.patient && !data.consentRecords) {
        errors.push({
          id: 'missing_consent',
          message: 'Dados pessoais encontrados sem registro de consentimento LGPD',
          field: 'patient',
          severity: HealthcareErrorSeverity.HIGH,
          category: HealthcareErrorCategory.COMPLIANCE,
          suggestion: 'Adicionar verificação de consentimento LGPD para dados pessoais',
          timestamp: new Date(),
        });
      }

      return errors;
    },
    severity: HealthcareErrorSeverity.HIGH,
    applicableClassifications: ['personal', 'medical'],
    category: HealthcareErrorCategory.COMPLIANCE,
  },
  {
    id: 'medical_data_validation',
    name: 'Medical Data Integrity',
    description: 'Validate medical data integrity and healthcare standards',
    validate: (data, context) => {
      const errors: HealthcareValidationError[] = [];

      // Validate medical record format
      if (data.medicalRecord && !data.medicalRecord.recordId) {
        errors.push({
          id: 'invalid_medical_record',
          message: 'Registro médico inválido - ID do registro ausente',
          field: 'medicalRecord.recordId',
          severity: HealthcareErrorSeverity.HIGH,
          category: HealthcareErrorCategory.VALIDATION,
          suggestion: 'Adicionar ID válido para registro médico',
          timestamp: new Date(),
        });
      }

      // Validate date formats for medical data
      if (data.appointmentDate && !isValidBrazilianDate(data.appointmentDate)) {
        errors.push({
          id: 'invalid_medical_date',
          message: 'Data médica inválida ou fora do padrão brasileiro',
          field: 'appointmentDate',
          severity: HealthcareErrorSeverity.MEDIUM,
          category: HealthcareErrorCategory.VALIDATION,
          suggestion: 'Usar formato de data brasileiro (DD/MM/YYYY)',
          timestamp: new Date(),
        });
      }

      return errors;
    },
    severity: HealthcareErrorSeverity.MEDIUM,
    applicableClassifications: ['medical', 'sensitive'],
    category: HealthcareErrorCategory.VALIDATION,
  },
  {
    id: 'healthcare_data_classification',
    name: 'Healthcare Data Classification',
    description: 'Verify proper data classification and handling',
    validate: (data, context) => {
      const errors: HealthcareValidationError[] = [];

      // Check for sensitive data without proper classification
      const sensitiveFields = ['cpf', 'cns', 'crm', 'medicalRecord'];
      const hasSensitiveData = sensitiveFields.some(field => data[field]);

      if (hasSensitiveData && !context.contract.dataClassification) {
        errors.push({
          id: 'missing_data_classification',
          message: 'Dados sensíveis encontrados sem classificação adequada',
          field: 'dataClassification',
          severity: HealthcareErrorSeverity.HIGH,
          category: HealthcareErrorCategory.SECURITY,
          suggestion: 'Classificar dados sensíveis conforme normas LGPD',
          timestamp: new Date(),
        });
      }

      return errors;
    },
    severity: HealthcareErrorSeverity.HIGH,
    applicableClassifications: ['personal', 'medical', 'sensitive'],
    category: HealthcareErrorCategory.SECURITY,
  },
];

/**
 * Utility function to validate Brazilian date format
 */
function isValidBrazilianDate(dateString: string): boolean {
  if (!dateString) return false;

  // Check DD/MM/YYYY format
  const brazilianDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!brazilianDateRegex.test(dateString)) return false;

  const [, day, month, year] = dateString.match(brazilianDateRegex)!;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  return date.getFullYear() === parseInt(year)
    && date.getMonth() === parseInt(month) - 1
    && date.getDate() === parseInt(day);
}

/**
 * Create contract validation middleware
 */
export function contractValidation(config: ContractValidationConfig) {
  const cache = config.enableCaching ? new ValidationCache(config.cacheTtl) : null;
  const customRules = config.customRules || [];
  const allRules = [...HEALTHCARE_VALIDATION_RULES, ...customRules];

  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = c.req.header('x-request-id') || crypto.randomUUID();

    try {
      // Create validation context
      const validationContext: ValidationContext = {
        request: {
          method: c.req.method,
          path: c.req.path,
          headers: c.req.header(),
          userId: c.req.header('x-user-id'),
          clinicId: c.req.header('x-clinic-id'),
          requestId,
        },
        contract: {
          version: config.apiContract.version,
          endpoint: `${c.req.method} ${c.req.path}`,
          dataClassification: config.apiContract.dataClassification,
          complianceRequirements: config.apiContract.complianceRequirements,
        },
        timestamp: new Date(),
      };

      // Log validation start
      if (config.enableAuditTrail) {
        logAuditTrail('validation_start', validationContext, {
          config: {
            enableLogging: config.enableLogging,
            enableMonitoring: config.enableMonitoring,
            rules: allRules.map(r => r.id),
          },
        });
      }

      // Get request data for validation
      const requestData = await getRequestData(c);

      // Check cache first
      const cacheKey = cache ? generateCacheKey(c.req.method, c.req.path, requestData) : null;
      let cachedResult: ContractValidationResult | null = null;

      if (cache && cacheKey) {
        cachedResult = cache.get(cacheKey);
        if (cachedResult) {
          if (config.enableLogging) {
            structuredLogger.info('Contract validation cache hit', {
              requestId,
              method: c.req.method,
              path: c.req.path,
              cacheKey,
            });
          }

          // Update metrics for cache hit
          cachedResult.metrics.cacheHits++;
          c.set('contractValidation', cachedResult);
          await next();
          return;
        }
      }

      // Initialize validation result
      const validationResult: ContractValidationResult = {
        isValid: true,
        openapiErrors: [],
        healthcareErrors: [],
        metrics: {
          validationTime: 0,
          openapiValidationTime: 0,
          healthcareValidationTime: 0,
          cacheHits: 0,
          cacheMisses: 0,
        },
        auditTrail: [],
      };

      // OpenAPI Specification Validation
      const openapiStartTime = Date.now();
      const openapiErrors = await validateOpenAPIContract(
        requestData,
        config.openApiSpec,
        c.req.method,
        c.req.path,
      );
      validationResult.openapiErrors = openapiErrors;
      validationResult.metrics.openapiValidationTime = Date.now() - openapiStartTime;

      // Healthcare-Specific Validation
      const healthcareStartTime = Date.now();
      const healthcareErrors = await validateHealthcareContract(
        requestData,
        config.apiContract,
        validationContext,
        allRules,
      );
      validationResult.healthcareErrors = healthcareErrors;
      validationResult.metrics.healthcareValidationTime = Date.now() - healthcareStartTime;

      // Determine overall validity
      validationResult.isValid = openapiErrors.length === 0 && healthcareErrors.length === 0;

      // Calculate total validation time
      validationResult.metrics.validationTime = Date.now() - startTime;

      // Update cache metrics
      if (cache && cacheKey) {
        validationResult.metrics.cacheMisses++;
        cache.set(cacheKey, validationResult);
      }

      // Performance monitoring
      if (config.enableMonitoring) {
        monitorValidationPerformance(validationResult, config.performanceThreshold);
      }

      // Log validation results
      if (config.enableLogging) {
        logValidationResults(validationResult, validationContext);
      }

      // Handle validation failures
      if (!validationResult.isValid) {
        handleValidationFailure(validationResult, validationContext);
      }

      // Store validation result in context
      c.set('contractValidation', validationResult);

      // Log success
      if (config.enableAuditTrail) {
        logAuditTrail('validation_success', validationContext, {
          validationResult: {
            isValid: validationResult.isValid,
            openapiErrorsCount: validationResult.openapiErrors.length,
            healthcareErrorsCount: validationResult.healthcareErrors.length,
            metrics: validationResult.metrics,
          },
        });
      }

      await next();
    } catch (error) {
      // Handle unexpected errors
      if (config.enableLogging) {
        structuredLogger.error('Contract validation error', {
          requestId,
          method: c.req.method,
          path: c.req.path,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      throw createHealthcareError(
        'Erro na validação do contrato da API',
        HealthcareErrorCategory.SYSTEM,
        HealthcareErrorSeverity.HIGH,
        500,
        {
          metadata: {
            requestId,
            method: c.req.method,
            path: c.req.path,
          },
        },
      );
    }
  };
}

/**
 * Extract request data for validation
 */
async function getRequestData(c: Context): Promise<any> {
  const data: any = {
    headers: c.req.header(),
    query: c.req.query(),
    params: c.req.param(),
  };

  try {
    const body = await c.req.json();
    data.body = body;
  } catch {
    // No JSON body or invalid JSON
  }

  return data;
}

/**
 * Generate cache key for validation results
 */
function generateCacheKey(method: string, path: string, data: any): string {
  const normalizedData = JSON.stringify({
    method,
    path,
    query: data.query,
    params: data.params,
  });

  return `contract_validation:${Buffer.from(normalizedData).toString('base64')}`;
}

/**
 * Validate OpenAPI contract compliance
 */
async function validateOpenAPIContract(
  data: any,
  openApiSpec: OpenAPIV3_1.Document,
  method: string,
  path: string,
): Promise<HealthcareValidationError[]> {
  const errors: HealthcareValidationError[] = [];

  try {
    // Find matching path in OpenAPI spec
    const pathItem = openApiSpec.paths[path];
    if (!pathItem) {
      errors.push({
        id: 'path_not_found',
        message: `Endpoint não encontrado na especificação OpenAPI: ${method} ${path}`,
        field: 'path',
        severity: HealthcareErrorSeverity.HIGH,
        category: HealthcareErrorCategory.VALIDATION,
        suggestion: 'Adicionar endpoint à especificação OpenAPI',
        timestamp: new Date(),
      });
      return errors;
    }

    // Find matching method
    const operation = pathItem[method.toLowerCase() as keyof typeof pathItem];
    if (!operation) {
      errors.push({
        id: 'method_not_allowed',
        message: `Método não permitido para o endpoint: ${method} ${path}`,
        field: 'method',
        severity: HealthcareErrorSeverity.HIGH,
        category: HealthcareErrorCategory.VALIDATION,
        suggestion: 'Adicionar método à especificação OpenAPI',
        timestamp: new Date(),
      });
      return errors;
    }

    // Validate request body if present
    if (data.body && operation.requestBody) {
      const contentType = operation.requestBody.content?.['application/json'];
      if (contentType && contentType.schema) {
        // Note: This is a simplified validation
        // In a real implementation, you would use a proper OpenAPI validator
        errors.push({
          id: 'schema_validation_pending',
          message: 'Validação de schema OpenAPI não implementada',
          field: 'body',
          severity: HealthcareErrorSeverity.LOW,
          category: HealthcareErrorCategory.VALIDATION,
          suggestion: 'Implementar validação completa de schema OpenAPI',
          timestamp: new Date(),
        });
      }
    }
  } catch (error) {
    errors.push({
      id: 'openapi_validation_error',
      message: `Erro na validação OpenAPI: ${
        error instanceof Error ? error.message : String(error)
      }`,
      field: 'openapi',
      severity: HealthcareErrorSeverity.HIGH,
      category: HealthcareErrorCategory.SYSTEM,
      suggestion: 'Verificar especificação OpenAPI',
      timestamp: new Date(),
    });
  }

  return errors;
}

/**
 * Validate healthcare-specific contract requirements
 */
async function validateHealthcareContract(
  data: any,
  apiContract: APIContract,
  context: ValidationContext,
  rules: HealthcareValidationRule[],
): Promise<HealthcareValidationError[]> {
  const errors: HealthcareValidationError[] = [];

  try {
    // Apply all applicable validation rules
    for (const rule of rules) {
      if (rule.applicableClassifications.includes(apiContract.dataClassification)) {
        const ruleErrors = rule.validate(data, context);
        errors.push(...ruleErrors);
      }
    }

    // Validate compliance requirements
    for (const requirement of apiContract.complianceRequirements) {
      const complianceErrors = validateComplianceRequirement(
        data,
        requirement,
        context,
      );
      errors.push(...complianceErrors);
    }
  } catch (error) {
    errors.push({
      id: 'healthcare_validation_error',
      message: `Erro na validação de requisitos de saúde: ${
        error instanceof Error ? error.message : String(error)
      }`,
      field: 'healthcare',
      severity: HealthcareErrorSeverity.HIGH,
      category: HealthcareErrorCategory.SYSTEM,
      suggestion: 'Verificar requisitos de conformidade de saúde',
      timestamp: new Date(),
    });
  }

  return errors;
}

/**
 * Validate specific compliance requirements
 */
function validateComplianceRequirement(
  data: any,
  requirement: string,
  context: ValidationContext,
): HealthcareValidationError[] {
  const errors: HealthcareValidationError[] = [];

  switch (requirement) {
    case 'lgpd':
      // Validate LGPD compliance
      if (data.personalData && !data.lgpdConsent) {
        errors.push({
          id: 'lgpd_consent_missing',
          message: 'Dados pessoais encontrados sem consentimento LGPD',
          field: 'lgpdConsent',
          severity: HealthcareErrorSeverity.HIGH,
          category: HealthcareErrorCategory.COMPLIANCE,
          suggestion: 'Adicionar verificação de consentimento LGPD',
          timestamp: new Date(),
        });
      }
      break;

    case 'anvisa':
      // Validate ANVISA compliance
      if (data.medicalDevice && !data.anvisaRegistration) {
        errors.push({
          id: 'anvisa_registration_missing',
          message: 'Dispositivo médico sem registro ANVISA',
          field: 'anvisaRegistration',
          severity: HealthcareErrorSeverity.HIGH,
          category: HealthcareErrorCategory.COMPLIANCE,
          suggestion: 'Adicionar registro ANVISA para dispositivo médico',
          timestamp: new Date(),
        });
      }
      break;

    case 'cfm':
      // Validate CFM compliance
      if (data.medicalProfessional && !data.crm) {
        errors.push({
          id: 'crm_missing',
          message: 'Profissional médico sem CRM válido',
          field: 'crm',
          severity: HealthcareErrorSeverity.HIGH,
          category: HealthcareErrorCategory.COMPLIANCE,
          suggestion: 'Adicionar validação de CRM para profissional médico',
          timestamp: new Date(),
        });
      }
      break;
  }

  return errors;
}

/**
 * Handle validation failure with appropriate error response
 */
function handleValidationFailure(
  validationResult: ContractValidationResult,
  context: ValidationContext,
): void {
  const allErrors = [...validationResult.openapiErrors, ...validationResult.healthcareErrors];

  // Sort errors by severity
  const sortedErrors = allErrors.sort((a, b) => {
    const severityOrder = {
      [HealthcareErrorSeverity.CRITICAL]: 4,
      [HealthcareErrorSeverity.HIGH]: 3,
      [HealthcareErrorSeverity.MEDIUM]: 2,
      [HealthcareErrorSeverity.LOW]: 1,
    };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  // Log validation failure
  structuredLogger.warn('Contract validation failed', {
    requestId: context.request.requestId,
    method: context.request.method,
    path: context.request.path,
    errors: sortedErrors.map(e => ({
      id: e.id,
      message: e.message,
      field: e.field,
      severity: e.severity,
      category: e.category,
    })),
    metrics: validationResult.metrics,
  });

  // Throw appropriate error
  const highestSeverityError = sortedErrors[0];
  const statusCode = getStatusCodeFromSeverity(highestSeverityError.severity);

  throw createHealthcareError(
    'Falha na validação do contrato da API',
    highestSeverityError.category,
    highestSeverityError.severity,
    statusCode,
    {
      metadata: {
        requestId: context.request.requestId,
        validationErrors: sortedErrors,
        metrics: validationResult.metrics,
      },
    },
  );
}

/**
 * Get HTTP status code from error severity
 */
function getStatusCodeFromSeverity(severity: HealthcareErrorSeverity): number {
  switch (severity) {
    case HealthcareErrorSeverity.CRITICAL:
      return 500;
    case HealthcareErrorSeverity.HIGH:
      return 400;
    case HealthcareErrorSeverity.MEDIUM:
      return 422;
    case HealthcareErrorSeverity.LOW:
      return 422;
    default:
      return 400;
  }
}

/**
 * Monitor validation performance
 */
function monitorValidationPerformance(
  result: ContractValidationResult,
  threshold?: number,
): void {
  if (threshold && result.metrics.validationTime > threshold) {
    structuredLogger.warn('Contract validation performance threshold exceeded', {
      validationTime: result.metrics.validationTime,
      threshold,
      method: 'unknown', // Would be passed from context
      path: 'unknown', // Would be passed from context
    });
  }
}

/**
 * Log validation results
 */
function logValidationResults(
  result: ContractValidationResult,
  context: ValidationContext,
): void {
  structuredLogger.info('Contract validation completed', {
    requestId: context.request.requestId,
    method: context.request.method,
    path: context.request.path,
    isValid: result.isValid,
    openapiErrorsCount: result.openapiErrors.length,
    healthcareErrorsCount: result.healthcareErrors.length,
    metrics: result.metrics,
  });
}

/**
 * Log audit trail entry
 */
function logAuditTrail(
  type: AuditTrailEntry['type'],
  context: ValidationContext,
  details: Record<string, any>,
): void {
  structuredLogger.info('Contract validation audit', {
    type,
    timestamp: context.timestamp,
    requestId: context.request.requestId,
    userId: context.request.userId,
    clinicId: context.request.clinicId,
    details,
  });
}

// Export types and utilities
export type {
  AuditTrailEntry,
  ContractValidationConfig,
  ContractValidationResult,
  HealthcareValidationRule,
  ValidationContext,
};

// Export validation result utilities
export * from '@neonpro/shared/models/api-contract';
