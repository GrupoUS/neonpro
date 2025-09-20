/**
 * API Contract models for healthcare applications
 * Defines the structure and validation rules for API contracts
 */

import { ErrorCategory } from '../../../services/createHealthcareError';
import { ErrorSeverity } from '../../../types/error-severity';

/**
 * Healthcare validation error interface
 */
export interface HealthcareValidationError {
  /** Unique error identifier */
  id: string;
  /** Human-readable error message */
  message: string;
  /** Field that caused the error */
  field: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Error category */
  category: ErrorCategory;
  /** Suggested fix */
  suggestion?: string;
  /** Timestamp when error occurred */
  timestamp: Date;
}

/**
 * API Contract interface for healthcare-specific validation
 */
export interface APIContract {
  /** Contract version */
  version: string;
  /** Data classification level */
  dataClassification: string;
  /** Compliance requirements */
  complianceRequirements: string[];
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** Required fields */
  requiredFields?: string[];
  /** Optional fields */
  optionalFields?: string[];
  /** Field constraints */
  fieldConstraints?: Record<string, FieldConstraint>;
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Fields this rule applies to */
  fields: string[];
  /** Validation function */
  validate: (value: any, context: ValidationContext) => boolean | HealthcareValidationError;
  /** Error message if validation fails */
  errorMessage: string;
  /** Severity level */
  severity: ErrorSeverity;
  /** Category */
  category: ErrorCategory;
}

/**
 * Field constraint interface
 */
export interface FieldConstraint {
  /** Data type */
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  /** Required flag */
  required?: boolean;
  /** Minimum length (for strings/arrays) */
  minLength?: number;
  /** Maximum length (for strings/arrays) */
  maxLength?: number;
  /** Minimum value (for numbers) */
  min?: number;
  /** Maximum value (for numbers) */
  max?: number;
  /** Pattern (regex) for strings */
  pattern?: string;
  /** Enum values */
  enum?: any[];
  /** Custom validation function */
  validate?: (value: any) => boolean | string;
}

/**
 * Validation context interface
 */
export interface ValidationContext {
  /** Request information */
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    userId?: string;
    clinicId?: string;
    requestId: string;
  };
  /** Contract information */
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
 * API Contract Validation Result interface
 */
export interface APIContractValidationResult {
  /** Overall validation status */
  isValid: boolean;
  /** Validation errors */
  errors: HealthcareValidationError[];
  /** Warnings */
  warnings: string[];
  /** Validation metrics */
  metrics: {
    validationTime: number;
    rulesChecked: number;
    rulesPassed: number;
    rulesFailed: number;
  };
  /** Validation context */
  context: ValidationContext;
}

/**
 * Default healthcare validation rules
 */
export const DEFAULT_HEALTHCARE_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'patient_id_format',
    name: 'Patient ID Format',
    description: 'Validates patient ID format',
    fields: ['patientId'],
    validate: (value: any) => {
      if (!value) return true; // Optional field
      return typeof value === 'string' && value.length > 0;
    },
    errorMessage: 'Patient ID must be a non-empty string',
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.VALIDATION,
  },
  {
    id: 'clinic_id_format',
    name: 'Clinic ID Format',
    description: 'Validates clinic ID format',
    fields: ['clinicId'],
    validate: (value: any) => {
      if (!value) return true; // Optional field
      return typeof value === 'string' && value.length > 0;
    },
    errorMessage: 'Clinic ID must be a non-empty string',
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.VALIDATION,
  },
  {
    id: 'lgpd_consent_check',
    name: 'LGPD Consent Check',
    description: 'Validates LGPD consent requirements',
    fields: ['consentRecords'],
    validate: (value: any, context: ValidationContext) => {
      // Only validate if personal data is present
      const hasPersonalData = context.request.headers['content-type']?.includes('personal')
        || false;
      if (!hasPersonalData) return true;

      return Array.isArray(value) && value.length > 0;
    },
    errorMessage: 'LGPD consent records are required when processing personal data',
    severity: ErrorSeverity.CRITICAL,
    category: ErrorCategory.COMPLIANCE,
  },
  {
    id: 'medical_data_classification',
    name: 'Medical Data Classification',
    description: 'Validates medical data classification',
    fields: ['dataClassification'],
    validate: (value: any) => {
      const validClassifications = ['public', 'restricted', 'confidential', 'highly_confidential'];
      return validClassifications.includes(value);
    },
    errorMessage: 'Invalid data classification',
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.SECURITY,
  },
];

/**
 * Default field constraints for healthcare data
 */
export const DEFAULT_HEALTHCARE_FIELD_CONSTRAINTS: Record<string, FieldConstraint> = {
  patientId: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 50,
  },
  clinicId: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 50,
  },
  appointmentDate: {
    type: 'date',
    required: true,
  },
  medicalRecord: {
    type: 'object',
    required: false,
  },
  consentRecords: {
    type: 'array',
    required: false,
  },
  dataClassification: {
    type: 'string',
    required: true,
    enum: ['public', 'restricted', 'confidential', 'highly_confidential'],
  },
};

/**
 * Creates a default API contract
 */
export function createDefaultAPIContract(): APIContract {
  return {
    version: '1.0.0',
    dataClassification: 'restricted',
    complianceRequirements: ['lgpd', 'hipaa'],
    validationRules: DEFAULT_HEALTHCARE_VALIDATION_RULES,
    fieldConstraints: DEFAULT_HEALTHCARE_FIELD_CONSTRAINTS,
  };
}

/**
 * Validates data against an API contract
 */
export function validateAPIContract(
  data: any,
  contract: APIContract,
  context: ValidationContext,
): APIContractValidationResult {
  const startTime = Date.now();
  const errors: HealthcareValidationError[] = [];
  const warnings: string[] = [];
  let rulesChecked = 0;
  let rulesPassed = 0;
  let rulesFailed = 0;

  // Validate field constraints
  if (contract.fieldConstraints) {
    Object.entries(contract.fieldConstraints).forEach(([field, constraint]) => {
      const value = data[field];

      // Check required fields
      if (constraint.required && (value === undefined || value === null)) {
        errors.push({
          id: 'missing_required_field',
          message: `Required field '${field}' is missing`,
          field,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.VALIDATION,
          timestamp: new Date(),
        });
        rulesFailed++;
        return;
      }

      // Skip further validation if field is not required and not present
      if (!constraint.required && (value === undefined || value === null)) {
        return;
      }

      // Type validation
      if (constraint.type === 'string' && typeof value !== 'string') {
        errors.push({
          id: 'invalid_type',
          message: `Field '${field}' must be a string`,
          field,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.VALIDATION,
          timestamp: new Date(),
        });
        rulesFailed++;
        return;
      }

      if (constraint.type === 'number' && typeof value !== 'number') {
        errors.push({
          id: 'invalid_type',
          message: `Field '${field}' must be a number`,
          field,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.VALIDATION,
          timestamp: new Date(),
        });
        rulesFailed++;
        return;
      }

      if (constraint.type === 'boolean' && typeof value !== 'boolean') {
        errors.push({
          id: 'invalid_type',
          message: `Field '${field}' must be a boolean`,
          field,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.VALIDATION,
          timestamp: new Date(),
        });
        rulesFailed++;
        return;
      }

      // Length validation
      if (constraint.type === 'string' || constraint.type === 'array') {
        if (constraint.minLength && (value as string | any[]).length < constraint.minLength) {
          errors.push({
            id: 'min_length_violation',
            message: `Field '${field}' must be at least ${constraint.minLength} characters long`,
            field,
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.VALIDATION,
            timestamp: new Date(),
          });
          rulesFailed++;
          return;
        }

        if (constraint.maxLength && (value as string | any[]).length > constraint.maxLength) {
          errors.push({
            id: 'max_length_violation',
            message:
              `Field '${field}' must be no more than ${constraint.maxLength} characters long`,
            field,
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.VALIDATION,
            timestamp: new Date(),
          });
          rulesFailed++;
          return;
        }
      }

      // Range validation for numbers
      if (constraint.type === 'number') {
        if (constraint.min !== undefined && value < constraint.min) {
          errors.push({
            id: 'min_value_violation',
            message: `Field '${field}' must be at least ${constraint.min}`,
            field,
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.VALIDATION,
            timestamp: new Date(),
          });
          rulesFailed++;
          return;
        }

        if (constraint.max !== undefined && value > constraint.max) {
          errors.push({
            id: 'max_value_violation',
            message: `Field '${field}' must be no more than ${constraint.max}`,
            field,
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.VALIDATION,
            timestamp: new Date(),
          });
          rulesFailed++;
          return;
        }
      }

      // Pattern validation for strings
      if (constraint.type === 'string' && constraint.pattern) {
        const pattern = new RegExp(constraint.pattern);
        if (!pattern.test(value)) {
          errors.push({
            id: 'pattern_violation',
            message: `Field '${field}' does not match required pattern`,
            field,
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.VALIDATION,
            timestamp: new Date(),
          });
          rulesFailed++;
          return;
        }
      }

      // Enum validation
      if (constraint.enum && !constraint.enum.includes(value)) {
        errors.push({
          id: 'enum_violation',
          message: `Field '${field}' must be one of: ${constraint.enum.join(', ')}`,
          field,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.VALIDATION,
          timestamp: new Date(),
        });
        rulesFailed++;
        return;
      }

      // Custom validation
      if (constraint.validate) {
        const customResult = constraint.validate(value);
        if (customResult !== true) {
          errors.push({
            id: 'custom_validation_failed',
            message: typeof customResult === 'string'
              ? customResult
              : `Field '${field}' failed custom validation`,
            field,
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.VALIDATION,
            timestamp: new Date(),
          });
          rulesFailed++;
          return;
        }
      }

      rulesPassed++;
    });
  }

  // Validate validation rules
  if (contract.validationRules) {
    contract.validationRules.forEach(rule => {
      rulesChecked++;

      rule.fields.forEach(field => {
        const value = data[field];
        const result = rule.validate(value, context);

        if (result !== true) {
          if (typeof result === 'object') {
            // It's already a HealthcareValidationError
            errors.push(result);
          } else {
            // Create a HealthcareValidationError from the rule
            errors.push({
              id: rule.id,
              message: rule.errorMessage,
              field,
              severity: rule.severity,
              category: rule.category,
              timestamp: new Date(),
            });
          }
          rulesFailed++;
        } else {
          rulesPassed++;
        }
      });
    });
  }

  const validationTime = Date.now() - startTime;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      validationTime,
      rulesChecked,
      rulesPassed,
      rulesFailed,
    },
    context,
  };
}
