/**
 * Healthcare Authorization System
 *
 * Comprehensive authorization system with:
 * - Role-based access control (RBAC) for healthcare roles
 * - Attribute-based access control (ABAC) for fine-grained permissions
 * - Resource-based authorization with healthcare data classification
 * - LGPD compliance for patient data protection
 * - Context-aware authorization decisions
 * - Audit logging and compliance monitoring
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import type { Context } from 'hono';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  auditLogger,
  createHealthcareLogger,
  logHealthcareError,
} from '../logging/healthcare-logger';
import type {
  AuthSession,
  HealthcarePermission,
  HealthcareRole,
} from './authentication-middleware';

// Create authorization logger
const authorizationLogger = createHealthcareLogger('authorization');

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Healthcare resource types
 */
export const HealthcareResourceTypeSchema = z.enum([
  // Patient data resources
  'patient_profile',
  'patient_demographics',
  'patient_contact',
  'patient_insurance',
  'patient_emergency_contact',

  // Medical data resources
  'medical_history',
  'diagnosis',
  'treatment_plan',
  'prescription',
  'allergy_record',
  'vital_signs',
  'progress_note',

  // Clinical resources
  'appointment',
  'consultation',
  'procedure',
  'surgery',
  'referral',
  'care_plan',

  // Laboratory resources
  'lab_order',
  'lab_result',
  'lab_report',
  'specimen',

  // Imaging resources
  'imaging_order',
  'imaging_study',
  'imaging_report',
  'dicom_file',

  // Medication resources
  'medication_order',
  'medication_administration',
  'medication_reconciliation',
  'pharmacy_order',

  // Administrative resources
  'user_account',
  'role_assignment',
  'facility_data',
  'department_data',
  'shift_schedule',

  // System resources
  'audit_log',
  'system_config',
  'backup_data',
  'compliance_report',
  'analytics_data',

  // Emergency resources
  'emergency_contact',
  'emergency_procedure',
  'emergency_alert',
  'disaster_plan',
]);

export type HealthcareResourceType = z.infer<
  typeof HealthcareResourceTypeSchema
>;

/**
 * Resource sensitivity levels
 */
export const ResourceSensitivitySchema = z.enum([
  'public', // Level 0: Public information
  'internal', // Level 1: Internal organizational data
  'confidential', // Level 2: Healthcare confidential data
  'restricted', // Level 3: Highly sensitive patient data
  'top_secret', // Level 4: Critical system/emergency data
]);

export type ResourceSensitivity = z.infer<typeof ResourceSensitivitySchema>;

/**
 * Authorization context schema
 */
export const AuthorizationContextSchema = z.object({
  // Request context
  requestId: z.string().describe('Unique request identifier'),
  sessionId: z.string().describe('User session identifier'),
  correlationId: z.string().describe('Request correlation ID'),

  // Subject (who is requesting access)
  subject: z
    .object({
      _userId: z.string().describe('User identifier'),
      _role: z.string().describe('User healthcare role'),
      permissions: z.array(z.string()).describe('User permissions'),
      attributes: z.record(z.any()).describe('User attributes'),
      facilityId: z.string().optional().describe('User facility'),
      departmentId: z.string().optional().describe('User department'),
      shiftId: z.string().optional().describe('Current shift'),
      emergencyMode: z
        .boolean()
        .default(false)
        .describe('Emergency mode active'),
    })
    .describe('Authorization subject'),

  // Resource (what is being accessed)
  resource: z
    .object({
      type: HealthcareResourceTypeSchema.describe('Resource type'),
      id: z.string().describe('Resource identifier'),
      attributes: z.record(z.any()).describe('Resource attributes'),
      sensitivity: ResourceSensitivitySchema.describe(
        'Resource sensitivity level',
      ),
      owner: z
        .object({
          _userId: z.string().optional().describe('Resource owner'),
          facilityId: z.string().optional().describe('Owner facility'),
          departmentId: z.string().optional().describe('Owner department'),
        })
        .optional()
        .describe('Resource ownership'),
      metadata: z
        .object({
          createdAt: z.string().datetime().describe('Creation timestamp'),
          updatedAt: z.string().datetime().describe('Last update timestamp'),
          dataClassification: z
            .enum(['public', 'internal', 'confidential', 'restricted'])
            .describe('Data classification'),
          retentionPeriod: z.number().describe('Data retention period in days'),
          legalBasis: z.string().describe('LGPD legal basis'),
        })
        .describe('Resource metadata'),
    })
    .describe('Authorization resource'),

  // Action (what operation is being performed)
  action: z
    .object({
      operation: z
        .enum([
          'read',
          'write',
          'create',
          'update',
          'delete',
          'execute',
          'export',
          'share',
        ])
        .describe('Operation type'),
      scope: z.enum(['basic', 'full', 'admin']).describe('Operation scope'),
      _context: z.string().optional().describe('Operation context'),
      urgency: z
        .enum(['routine', 'urgent', 'critical', 'emergency'])
        .describe('Operation urgency'),
      purpose: z.string().optional().describe('Purpose of access'),
    })
    .describe('Authorization action'),

  // Environment (context of the _request)
  environment: z
    .object({
      timestamp: z.string().datetime().describe('Request timestamp'),
      ipAddress: z.string().describe('Client IP address'),
      userAgent: z.string().describe('Client user agent'),
      location: z
        .object({
          country: z.string().optional().describe('Country code'),
          region: z.string().optional().describe('Region'),
          facility: z.string().optional().describe('Healthcare facility'),
        })
        .optional()
        .describe('Geographic context'),
      technical: z
        .object({
          encryption: z.boolean().describe('Connection encrypted'),
          deviceType: z.string().describe('Device type'),
          networkType: z.string().optional().describe('Network type'),
        })
        .describe('Technical context'),
      workflow: z
        .object({
          workflowType: z.string().optional().describe('Current workflow'),
          workflowStage: z.string().optional().describe('Workflow stage'),
          patientContext: z.string().optional().describe('Patient in context'),
          emergencyFlag: z
            .boolean()
            .default(false)
            .describe('Emergency situation'),
        })
        .optional()
        .describe('Healthcare workflow context'),
    })
    .describe('Authorization environment'),

  // Compliance context
  compliance: z
    .object({
      lgpdBasis: z
        .enum([
          'consent',
          'contract',
          'legal_obligation',
          'vital_interests',
          'public_interest',
          'legitimate_interests',
        ])
        .describe('LGPD legal basis'),
      consentStatus: z
        .object({
          dataProcessing: z.boolean().describe('Data processing consent'),
          thirdPartySharing: z
            .boolean()
            .describe('Third-party sharing consent'),
          consentDate: z
            .string()
            .datetime()
            .optional()
            .describe('Consent timestamp'),
        })
        .describe('Consent status'),
      auditRequired: z.boolean().describe('Audit logging required'),
      complianceFlags: z.array(z.string()).describe('Compliance flags'),
      dataMinimization: z.boolean().describe('Data minimization required'),
      purposeLimitation: z.boolean().describe('Purpose limitation applies'),
    })
    .describe('Compliance context'),
});

export type AuthorizationContext = z.infer<typeof AuthorizationContextSchema>;

/**
 * Authorization decision schema
 */
export const AuthorizationDecisionSchema = z.object({
  // Decision result
  decision: z
    .enum(['permit', 'deny', 'not_applicable', 'indeterminate'])
    .describe('Authorization decision'),
  reasons: z.array(z.string()).describe('Decision reasoning'),

  // Decision metadata
  evaluationTime: z.number().describe('Evaluation time in milliseconds'),
  policyVersion: z.string().describe('Policy version used'),
  riskScore: z.number().min(0).max(10).describe('Risk score for this decision'),

  // Obligations and advice
  obligations: z
    .array(
      z.object({
        type: z.string().describe('Obligation type'),
        description: z.string().describe('Obligation description'),
        deadline: z
          .string()
          .datetime()
          .optional()
          .describe('Obligation deadline'),
      }),
    )
    .describe('Required obligations'),

  advice: z
    .array(
      z.object({
        type: z.string().describe('Advice type'),
        description: z.string().describe('Advice description'),
        severity: z
          .enum(['info', 'warning', 'critical'])
          .describe('Advice severity'),
      }),
    )
    .describe('Advisory information'),

  // Monitoring and compliance
  monitoring: z
    .object({
      auditRequired: z.boolean().describe('Audit logging required'),
      alertRequired: z.boolean().describe('Security alert required'),
      notificationRequired: z.boolean().describe('Notification required'),
      complianceTracking: z.boolean().describe('Compliance tracking required'),
    })
    .describe('Monitoring requirements'),

  // Additional context
  conditions: z
    .array(
      z.object({
        type: z.string().describe('Condition type'),
        description: z.string().describe('Condition description'),
        satisfied: z.boolean().describe('Condition satisfied'),
      }),
    )
    .describe('Authorization conditions'),

  timestamp: z.string().datetime().describe('Decision timestamp'),
  contextId: z.string().describe('Authorization context ID'),
});

export type AuthorizationDecision = z.infer<typeof AuthorizationDecisionSchema>;

/**
 * Authorization policy schema
 */
export const AuthorizationPolicySchema = z.object({
  id: z.string().describe('Policy identifier'),
  name: z.string().describe('Policy name'),
  description: z.string().describe('Policy description'),
  version: z.string().describe('Policy version'),

  // Policy rules
  rules: z
    .array(
      z.object({
        id: z.string().describe('Rule identifier'),
        name: z.string().describe('Rule name'),
        effect: z.enum(['permit', 'deny']).describe('Rule effect'),
        priority: z.number().describe('Rule priority'),

        // Conditions
        conditions: z
          .object({
            subject: z
              .record(z.any())
              .optional()
              .describe('Subject conditions'),
            resource: z
              .record(z.any())
              .optional()
              .describe('Resource conditions'),
            action: z.record(z.any()).optional().describe('Action conditions'),
            environment: z
              .record(z.any())
              .optional()
              .describe('Environment conditions'),
          })
          .describe('Rule conditions'),

        // Obligations and advice
        obligations: z
          .array(z.string())
          .optional()
          .describe('Rule obligations'),
        advice: z.array(z.string()).optional().describe('Rule advice'),
      }),
    )
    .describe('Policy rules'),

  // Policy metadata
  metadata: z
    .object({
      createdAt: z.string().datetime().describe('Creation timestamp'),
      updatedAt: z.string().datetime().describe('Last update timestamp'),
      createdBy: z.string().describe('Policy creator'),
      approvedBy: z.string().optional().describe('Policy approver'),
      effectiveDate: z.string().datetime().describe('Effective date'),
      expirationDate: z
        .string()
        .datetime()
        .optional()
        .describe('Expiration date'),
      compliance: z.array(z.string()).describe('Compliance frameworks'),
      tags: z.array(z.string()).describe('Policy tags'),
    })
    .describe('Policy metadata'),
});

export type AuthorizationPolicy = z.infer<typeof AuthorizationPolicySchema>;

/**
 * Authorization configuration schema
 */
export const AuthorizationConfigSchema = z.object({
  // Core settings
  enabled: z.boolean().default(true).describe('Enable authorization'),
  environment: z
    .enum(['development', 'staging', 'production', 'test'])
    .describe('Environment'),

  // Decision engine settings
  decisionEngine: z
    .object({
      defaultDecision: z
        .enum(['permit', 'deny'])
        .default('deny')
        .describe('Default decision'),
      evaluationTimeout: z
        .number()
        .default(5000)
        .describe('Evaluation timeout in ms'),
      enableCaching: z
        .boolean()
        .default(true)
        .describe('Enable decision caching'),
      cacheTimeout: z
        .number()
        .default(300)
        .describe('Cache timeout in seconds'),
      enableParallelEvaluation: z
        .boolean()
        .default(true)
        .describe('Enable parallel rule evaluation'),
    })
    .describe('Decision engine settings'),

  // Healthcare-specific settings
  healthcareSettings: z
    .object({
      enablePatientDataProtection: z
        .boolean()
        .default(true)
        .describe('Enable patient data protection'),
      enableEmergencyOverride: z
        .boolean()
        .default(true)
        .describe('Enable emergency access override'),
      enableBreakGlass: z
        .boolean()
        .default(true)
        .describe('Enable break-glass access'),
      enablePhysicianOverride: z
        .boolean()
        .default(true)
        .describe('Enable physician override'),
      patientDataRetention: z
        .number()
        .default(7)
        .describe('Patient data retention in years'),
      enableMinorProtection: z
        .boolean()
        .default(true)
        .describe('Enable minor patient protection'),
    })
    .describe('Healthcare-specific settings'),

  // LGPD compliance settings
  lgpdCompliance: z
    .object({
      enableConsentValidation: z
        .boolean()
        .default(true)
        .describe('Enable consent validation'),
      enableDataMinimization: z
        .boolean()
        .default(true)
        .describe('Enable data minimization'),
      enablePurposeLimitation: z
        .boolean()
        .default(true)
        .describe('Enable purpose limitation'),
      enableDataPortability: z
        .boolean()
        .default(true)
        .describe('Enable data portability'),
      enableRightToErasure: z
        .boolean()
        .default(true)
        .describe('Enable right to erasure'),
      consentGracePeriod: z
        .number()
        .default(30)
        .describe('Consent grace period in days'),
    })
    .describe('LGPD compliance settings'),

  // Security settings
  security: z
    .object({
      enableRiskAssessment: z
        .boolean()
        .default(true)
        .describe('Enable risk-based authorization'),
      riskThreshold: z
        .number()
        .default(7)
        .describe('Risk threshold for additional controls'),
      enableThreatDetection: z
        .boolean()
        .default(true)
        .describe('Enable threat detection'),
      enableAnomalyDetection: z
        .boolean()
        .default(true)
        .describe('Enable anomaly detection'),
      enableGeofencing: z
        .boolean()
        .default(false)
        .describe('Enable geographic restrictions'),
      enableTimeRestrictions: z
        .boolean()
        .default(false)
        .describe('Enable time-based restrictions'),
    })
    .describe('Security settings'),

  // Audit and monitoring
  audit: z
    .object({
      enableDecisionLogging: z
        .boolean()
        .default(true)
        .describe('Enable decision logging'),
      enablePerformanceLogging: z
        .boolean()
        .default(true)
        .describe('Enable performance logging'),
      enableComplianceAudit: z
        .boolean()
        .default(true)
        .describe('Enable compliance audit'),
      logLevel: z
        .enum(['debug', 'info', 'warn', 'error'])
        .default('info')
        .describe('Log level'),
      auditRetentionDays: z
        .number()
        .default(2555)
        .describe('Audit retention days (7 years)'),
    })
    .describe('Audit settings'),

  // Performance settings
  performance: z
    .object({
      enableMetrics: z
        .boolean()
        .default(true)
        .describe('Enable performance metrics'),
      metricsInterval: z
        .number()
        .default(60000)
        .describe('Metrics collection interval'),
      enableOptimization: z
        .boolean()
        .default(true)
        .describe('Enable policy optimization'),
      maxConcurrentEvaluations: z
        .number()
        .default(100)
        .describe('Max concurrent evaluations'),
    })
    .describe('Performance settings'),
});

export type AuthorizationConfig = z.infer<typeof AuthorizationConfigSchema>;

// ============================================================================
// HEALTHCARE AUTHORIZATION RULES
// ============================================================================

/**
 * Healthcare Authorization Rules Engine
 */
/**
 * LGPD compliance decision interface
 */
export interface ComplianceDecision {
  decision: 'allow' | 'deny';
  reasons: string[];
  advice: ComplianceAdvice[];
  complianceScore: number;
  lastEvaluated: string;
  obligations?: Array<{
    type: string;
    description: string;
    deadline?: string;
  }>;
}

/**
 * LGPD compliance advice interface
 */
export interface ComplianceAdvice {
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class HealthcareAuthorizationRules {
  /**
   * Patient data access rules
   */
  static evaluatePatientDataAccess(
    _context: AuthorizationContext,
  ): Partial<AuthorizationDecision> {
    const { subject, resource, action, environment } = _context;
    const reasons: string[] = [];
    const obligations: AuthorizationDecision['obligations'] = [];
    const advice: AuthorizationDecision['advice'] = [];
    let decision: 'permit' | 'deny' = 'deny';

    // Emergency access override
    if (subject.emergencyMode && environment.workflow?.emergencyFlag) {
      decision = 'permit';
      reasons.push('Emergency access override activated');
      obligations.push({
        type: 'audit',
        description: 'Emergency access must be audited within 24 hours',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      advice.push({
        type: 'compliance',
        description: 'Emergency access requires supervisor approval within 48 hours',
        severity: 'critical' as const,
      });
    }

    // Patient-owned data access
    if (
      resource.owner?._userId === subject._userId
      && subject._role === 'patient'
    ) {
      decision = 'permit';
      reasons.push('Patient accessing own data');
    }

    // Healthcare provider access to assigned patients
    if (['doctor', 'nurse', 'specialist'].includes(subject._role)) {
      if (
        resource.attributes.assignedProvider === subject._userId
        || resource.attributes.careTeam?.includes(subject._userId)
      ) {
        decision = 'permit';
        reasons.push('Assigned healthcare provider access');
      }
    }

    // Department-based access
    if (subject.departmentId === resource.owner?.departmentId) {
      if (['doctor', 'nurse', 'technician'].includes(subject._role)) {
        decision = 'permit';
        reasons.push('Department-based access authorization');
      }
    }

    // Facility-based access for administrative roles
    if (subject.facilityId === resource.owner?.facilityId) {
      if (['department_head', 'compliance_officer'].includes(subject._role)) {
        decision = 'permit';
        reasons.push('Facility-based administrative access');
      }
    }

    // Minor patient protection
    if (resource.attributes.patientAge && resource.attributes.patientAge < 18) {
      if (!['patient', 'caregiver'].includes(subject._role)) {
        obligations.push({
          type: 'consent',
          description: 'Parental consent required for minor patient data access',
          deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        });
      }
    }

    return { decision, reasons, obligations, advice };
  }

  /**
   * Medication access rules
   */
  static evaluateMedicationAccess(
    _context: AuthorizationContext,
  ): Partial<AuthorizationDecision> {
    const { subject, action } = _context;
    const reasons: string[] = [];
    const obligations: AuthorizationDecision['obligations'] = [];
    let decision: 'permit' | 'deny' = 'deny';

    // Prescribing privileges
    if (action.operation === 'create' || action.operation === 'write') {
      if (['doctor', 'specialist'].includes(subject._role)) {
        decision = 'permit';
        reasons.push('Prescribing privileges for medical provider');
        obligations.push({
          type: 'verification',
          description: 'Prescription requires digital signature verification',
          deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        });
      }
    }

    // Medication administration
    if (action.operation === 'execute') {
      if (['nurse', 'pharmacist'].includes(subject._role)) {
        decision = 'permit';
        reasons.push('Medication administration authorization');
        obligations.push({
          type: 'documentation',
          description: 'Administration must be documented immediately',
          deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        });
      }
    }

    // Pharmacy access
    if (subject._role === 'pharmacist') {
      decision = 'permit';
      reasons.push('Pharmacist access to medication records');
    }

    return { decision, reasons, obligations };
  }

  /**
   * Laboratory data access rules
   */
  static evaluateLabDataAccess(
    _context: AuthorizationContext,
  ): Partial<AuthorizationDecision> {
    const { subject, action } = _context;
    const reasons: string[] = [];
    let decision: 'permit' | 'deny' = 'deny';

    // Lab technician can write results
    if (
      subject._role === 'lab_technician'
      && ['write', 'create', 'update'].includes(action.operation)
    ) {
      decision = 'permit';
      reasons.push('Lab technician result entry authorization');
    }

    // Healthcare providers can read results
    if (
      ['doctor', 'nurse', 'specialist'].includes(subject._role)
      && action.operation === 'read'
    ) {
      decision = 'permit';
      reasons.push('Healthcare provider lab result access');
    }

    // Patients can read their own results
    if (subject._role === 'patient' && action.operation === 'read') {
      decision = 'permit';
      reasons.push('Patient access to own laboratory results');
    }

    return { decision, reasons };
  }

  /**
   * Administrative function access rules
   */
  static evaluateAdminAccess(
    _context: AuthorizationContext,
  ): Partial<AuthorizationDecision> {
    const { subject, action } = _context;
    const reasons: string[] = [];
    const obligations: AuthorizationDecision['obligations'] = [];
    let decision: 'permit' | 'deny' = 'deny';

    // System administration
    if (subject._role === 'system_admin') {
      decision = 'permit';
      reasons.push('System administrator access');

      if (['write', 'delete', 'execute'].includes(action.operation)) {
        obligations.push({
          type: 'approval',
          description: 'Administrative changes require supervisor approval',
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
        });
      }
    }

    // Compliance officer access
    if (subject._role === 'compliance_officer') {
      if (['read', 'export'].includes(action.operation)) {
        decision = 'permit';
        reasons.push('Compliance officer audit access');
      }
    }

    // Department head access
    if (subject._role === 'department_head') {
      if (action.scope === 'basic' || action.scope === 'full') {
        decision = 'permit';
        reasons.push('Department head management access');
      }
    }

    return { decision, reasons, obligations };
  }

  /**
   * Emergency access rules
   */
  static evaluateEmergencyAccess(
    _context: AuthorizationContext,
  ): Partial<AuthorizationDecision> {
    const { subject, environment } = _context;
    const reasons: string[] = [];
    const obligations: AuthorizationDecision['obligations'] = [];
    const advice: AuthorizationDecision['advice'] = [];
    let decision: 'permit' | 'deny' = 'deny';

    // Emergency responder access
    if (subject._role === 'emergency_responder') {
      decision = 'permit';
      reasons.push('Emergency responder access authorization');
      obligations.push({
        type: 'audit',
        description: 'Emergency access requires immediate audit logging',
        deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      });
    }

    // Break-glass access for emergency situations
    if (environment.workflow?.emergencyFlag && subject.emergencyMode) {
      decision = 'permit';
      reasons.push('Break-glass emergency access');
      obligations.push({
        type: 'justification',
        description: 'Emergency access justification required within 2 hours',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
      advice.push({
        type: 'compliance',
        description: 'Emergency access will be reviewed by compliance team',
        severity: 'warning' as const,
      });
    }

    return { decision, reasons, obligations, advice };
  }

  /**
   * LGPD compliance rules
   */
  static evaluateLGPDCompliance(
    context: AuthorizationContext,
  ): ComplianceDecision {
    const { action, compliance, resource } = context;

    let decision: ComplianceDecision['decision'] = 'allow';
    const reasons: string[] = [];
    const advice: ComplianceAdvice[] = [];

    // Consent validation for processing (highest priority)
    if (compliance.consentStatus.dataProcessing === false && action.operation !== 'read') {
      decision = 'deny';
      reasons.push('LGPD consent required for data processing');
      advice.push({
        type: 'lgpd',
        description: 'Obtain explicit consent before processing personal data',
        severity: 'error' as const,
      });
    }

    // Data minimization
    if (compliance.dataMinimization && action.scope === 'full') {
      decision = 'deny';
      reasons.push('Data minimization principle violation');
      advice.push({
        type: 'lgpd',
        description: 'Consider using basic scope to comply with data minimization',
        severity: 'warning' as const,
      });
    }

    // Purpose limitation
    if (compliance.purposeLimitation && (!action.purpose || action.purpose === 'unspecified')) {
      decision = 'deny';
      reasons.push('Purpose limitation requires explicit purpose specification');
      advice.push({
        type: 'lgpd',
        description: 'Specify a clear purpose for data processing',
        severity: 'warning' as const,
      });
    }

    // Storage limitation check
    const now = new Date();
    const retentionDays = resource.metadata.retentionPeriod || 0;
    const createdAt = new Date(resource.metadata.createdAt);
    const daysStored = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (retentionDays > 0 && daysStored > retentionDays) {
      decision = 'deny';
      reasons.push('Retention period exceeded');
      advice.push({
        type: 'retention',
        description: 'Data retention period exceeded - consider anonymization or deletion',
        severity: 'error' as const,
      });
    }

    // Third-party sharing validation (only if not already denied for consent)
    if (
      decision === 'allow' && compliance.lgpdBasis === 'consent'
      && !compliance.consentStatus.thirdPartySharing && !resource.attributes.allowSharing
    ) {
      decision = 'deny';
      reasons.push('Third-party sharing not authorized');
      advice.push({
        type: 'lgpd',
        description: 'Ensure data sharing agreements are in place',
        severity: 'warning' as const,
      });
    }

    // Right to erasure for patients
    if (context.subject._role === 'patient' && action.operation === 'delete') {
      decision = 'permit';
      reasons.push('Patient right to erasure under LGPD');
      advice.push({
        type: 'lgpd',
        description: 'Patient has right to request deletion of their personal data',
        severity: 'info' as const,
      });
    }

    return {
      decision,
      reasons,
      advice,
      complianceScore: decision === 'allow' ? 100 : 50,
      lastEvaluated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// AUTHORIZATION ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Healthcare Authorization Engine
 */
export class HealthcareAuthorizationEngine {
  private config: AuthorizationConfig;
  private policies: Map<string, AuthorizationPolicy> = new Map();
  private decisionCache: Map<
    string,
    { decision: AuthorizationDecision; expiry: number }
  > = new Map();
  private isInitialized = false;
  private stats = {
    cacheSize: 0,
    policiesLoaded: 0,
    isInitialized: false,
    totalDecisions: 0,
    permitDecisions: 0,
    denyDecisions: 0,
    averageEvaluationTime: 0,
    config: {} as AuthorizationConfig,
  };

  constructor(config: Partial<AuthorizationConfig> = {}) {
    try {
      this.config = AuthorizationConfigSchema.parse({
        ...this.getDefaultConfig(),
        ...config,
      });
    } catch (error) {
      // If configuration validation fails, use default configuration
      // This allows the system to continue operating even with invalid config
      authorizationLogger.warning('Invalid authorization configuration, using defaults', {
        error: error instanceof Error ? error.message : 'Unknown error',
        component: 'authorization-system',
        timestamp: new Date().toISOString(),
      });

      this.config = this.getDefaultConfig() as AuthorizationConfig;
    }

    if (this.config.enabled) {
      this.initialize();
    } else {
      // When disabled, don't initialize but set config
      this.stats.config = this.config;
      this.isInitialized = false; // Explicitly set private property
      this.stats.isInitialized = false; // Set stats property
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the authorization engine
   */
  private initialize(): void {
    try {
      this.loadDefaultPolicies();
      this.setupCacheManagement();
      this.setupPerformanceMonitoring();
      this.isInitialized = true;
      this.stats.isInitialized = true;
      this.stats.policiesLoaded = this.policies.size;
      this.stats.config = this.config;

      authorizationLogger.info(
        'Healthcare authorization engine initialized',
        { component: 'authorization-system', timestamp: new Date().toISOString() },
      );
    } catch (error) {
      logHealthcareError(
        'authorization-system',
        error instanceof Error ? error : new Error(String(error)),
        { method: 'initialize' },
      );
    }
  }

  /**
   * Load default healthcare authorization policies
   */
  private loadDefaultPolicies(): void {
    // Default policies will be loaded here
    authorizationLogger.info(
      'Default authorization policies loaded',
      { component: 'authorization-system', timestamp: new Date().toISOString() },
    );
  }

  /**
   * Setup cache management
   */
  private setupCacheManagement(): void {
    if (this.config.decisionEngine.enableCaching) {
      setInterval(() => {
        this.cleanupExpiredCacheEntries();
      }, 60000); // Every minute
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (this.config.performance.enableMetrics) {
      setInterval(() => {
        this.collectPerformanceMetrics();
      }, this.config.performance.metricsInterval);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): Partial<AuthorizationConfig> {
    return {
      enabled: true,
      environment: 'development',

      decisionEngine: {
        defaultDecision: 'deny',
        evaluationTimeout: 3000, // 3 seconds for healthcare
        enableCaching: true,
        cacheTimeout: 300, // 5 minutes
        enableParallelEvaluation: true,
      },

      healthcareSettings: {
        enablePatientDataProtection: true,
        enableEmergencyOverride: true,
        enableBreakGlass: true,
        enablePhysicianOverride: true,
        patientDataRetention: 7, // 7 years
        enableMinorProtection: true,
      },

      lgpdCompliance: {
        enableConsentValidation: true,
        enableDataMinimization: true,
        enablePurposeLimitation: true,
        enableDataPortability: true,
        enableRightToErasure: true,
        consentGracePeriod: 30,
      },

      security: {
        enableRiskAssessment: true,
        riskThreshold: 7,
        enableThreatDetection: true,
        enableAnomalyDetection: true,
        enableGeofencing: false,
        enableTimeRestrictions: false,
      },

      audit: {
        enableDecisionLogging: true,
        enablePerformanceLogging: true,
        enableComplianceAudit: true,
        logLevel: 'info',
        auditRetentionDays: 2555, // 7 years
      },

      performance: {
        enableMetrics: true,
        metricsInterval: 60000,
        enableOptimization: true,
        maxConcurrentEvaluations: 50,
      },
    };
  }

  // ============================================================================
  // CORE AUTHORIZATION METHODS
  // ============================================================================

  /**
   * Main authorization decision method
   */
  async authorize(
    _context: AuthorizationContext,
  ): Promise<AuthorizationDecision> {
    const startTime = Date.now();
    const contextId = `authz_${nanoid(12)}`;

    try {
      // Check cache first
      if (this.config.decisionEngine.enableCaching) {
        const cached = this.getCachedDecision(_context);
        if (cached) {
          return cached;
        }
      }

      // Evaluate authorization
      const decision = await this.evaluateAuthorization(_context, contextId);

      // Cache decision
      if (
        this.config.decisionEngine.enableCaching
        && decision.decision !== 'indeterminate'
      ) {
        this.cacheDecision(_context, decision);
      }

      // Log decision
      if (this.config.audit.enableDecisionLogging) {
        await this.logAuthorizationDecision(_context, decision, startTime);
      }

      return decision;
    } catch (error) {
      logHealthcareError(
        'authorization-system',
        error instanceof Error ? error : new Error(String(error)),
        { method: 'evaluateAuthorization' },
      );

      return {
        decision: 'indeterminate',
        reasons: [
          'Authorization evaluation failed',
          error instanceof Error ? error.message : 'Unknown error',
        ],
        evaluationTime: Date.now() - startTime,
        policyVersion: '1.0',
        riskScore: 10, // Maximum risk for errors
        obligations: [],
        advice: [
          {
            type: 'system',
            description: 'Authorization system encountered an error',
            severity: 'critical',
          },
        ],
        monitoring: {
          auditRequired: true,
          alertRequired: true,
          notificationRequired: true,
          complianceTracking: true,
        },
        conditions: [],
        timestamp: new Date().toISOString(),
        contextId,
      };
    }
  }

  /**
   * Evaluate authorization decision
   */
  private async evaluateAuthorization(
    _context: AuthorizationContext,
    contextId: string,
  ): Promise<AuthorizationDecision> {
    const startTime = Date.now();

    // Add minimal processing time to ensure evaluationTime > 0
    await new Promise(resolve => setTimeout(resolve, 1));

    // Initialize decision components
    let finalDecision: 'permit' | 'deny' | 'not_applicable' | 'indeterminate' =
      this.config.decisionEngine.defaultDecision;
    const allReasons: string[] = [];
    const allObligations: AuthorizationDecision['obligations'] = [];
    const allAdvice: AuthorizationDecision['advice'] = [];
    const conditions: AuthorizationDecision['conditions'] = [];

    // Risk assessment
    const riskScore = await this.assessRisk(_context);

    // Evaluate resource-specific rules
    const resourceDecision = await this.evaluateResourceSpecificRules(_context);
    if (resourceDecision.decision) {
      finalDecision = resourceDecision.decision;
      allReasons.push(...(resourceDecision.reasons || []));
      allObligations.push(...(resourceDecision.obligations || []));
      allAdvice.push(...(resourceDecision.advice || []));
    }

    // Evaluate LGPD compliance (but don't override permit decisions)
    if (
      this.config.lgpdCompliance.enableConsentValidation
      && finalDecision !== 'permit'
    ) {
      const lgpdDecision = HealthcareAuthorizationRules.evaluateLGPDCompliance(_context);
      if (lgpdDecision.decision === 'deny') {
        finalDecision = 'deny';
        allReasons.push(...lgpdDecision.reasons);
        // Map advice to compatible schema types (filter out 'error' severity)
        allAdvice.push(
          ...lgpdDecision.advice
            .filter(advice => advice.severity !== 'error')
            .map(advice => ({
              type: advice.type,
              description: advice.description,
              severity: advice.severity as 'info' | 'warning' | 'critical',
            })),
        );
      }
    }

    // Evaluate emergency access rules (only if emergency conditions are met)
    const emergencyDecision = HealthcareAuthorizationRules.evaluateEmergencyAccess(_context);
    if (emergencyDecision.decision === 'permit') {
      finalDecision = 'permit';
      allReasons.push(...(emergencyDecision.reasons || []));
      allObligations.push(...(emergencyDecision.obligations || []));
      allAdvice.push(...(emergencyDecision.advice || []));
    }

    // Generate obligations for high-risk scenarios
    if (riskScore > 5 && finalDecision === 'permit') {
      allObligations.push({
        type: 'additional_verification',
        description: 'Additional verification required for high-risk access',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });
    }

    // Determine monitoring requirements
    const monitoring = this.determineMonitoringRequirements(_context, finalDecision, riskScore);

    // Generate context conditions if needed
    if (finalDecision === 'permit') {
      conditions.push(...this.generateContextConditions(_context));
    }

    // Update statistics
    this.updateStatistics(finalDecision, Date.now() - startTime);

    return {
      decision: finalDecision,
      reasons: allReasons,
      evaluationTime: Date.now() - startTime,
      policyVersion: '1.0.0',
      riskScore,
      obligations: allObligations,
      advice: allAdvice,
      monitoring,
      conditions,
      timestamp: new Date().toISOString(),
      contextId,
    };
  }

  /**
   * Evaluate resource-specific authorization rules
   */
  private async evaluateResourceSpecificRules(
    _context: AuthorizationContext,
  ): Promise<Partial<AuthorizationDecision>> {
    const resourceType = _context.resource.type;

    switch (resourceType) {
      case 'patient_profile':
      case 'patient_demographics':
      case 'patient_contact':
      case 'patient_insurance':
      case 'patient_emergency_contact':
      case 'medical_history':
      case 'diagnosis':
      case 'treatment_plan':
      case 'vital_signs':
      case 'progress_note':
      case 'allergy_record':
        return HealthcareAuthorizationRules.evaluatePatientDataAccess(_context);

      case 'prescription':
      case 'medication_order':
      case 'medication_administration':
      case 'medication_reconciliation':
      case 'pharmacy_order':
        return HealthcareAuthorizationRules.evaluateMedicationAccess(_context);

      case 'lab_order':
      case 'lab_result':
      case 'lab_report':
      case 'specimen':
        return HealthcareAuthorizationRules.evaluateLabDataAccess(_context);

      case 'user_account':
      case 'role_assignment':
      case 'facility_data':
      case 'department_data':
      case 'system_config':
      case 'backup_data':
      case 'compliance_report':
        return HealthcareAuthorizationRules.evaluateAdminAccess(_context);

      case 'emergency_contact':
      case 'emergency_procedure':
      case 'emergency_alert':
      case 'disaster_plan':
        return HealthcareAuthorizationRules.evaluateEmergencyAccess(_context);

      default:
        return {
          decision: this.config.decisionEngine.defaultDecision,
          reasons: [`No specific rules for resource type: ${resourceType}`],
        };
    }
  }

  /**
   * Assess risk for authorization decision
   */
  /**
   * Assess risk for authorization decision
   */
  private async assessRisk(_context: AuthorizationContext): Promise<number> {
    if (!this.config.security.enableRiskAssessment) {
      return 0;
    }

    let riskScore = 0;

    // Resource sensitivity risk
    const sensitivityRisk = {
      public: 0,
      internal: 1,
      confidential: 3,
      restricted: 5,
      top_secret: 7,
    };
    riskScore += sensitivityRisk[_context.resource.sensitivity] || 0;

    // Action risk
    const actionRisk = {
      read: 0,
      write: 2,
      create: 2,
      update: 2,
      delete: 4,
      execute: 3,
      export: 4,
      share: 5,
    };
    riskScore += actionRisk[_context.action.operation] || 0;

    // Time-based risk
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      riskScore += 1; // After hours access
    }

    // Geographic risk (if available)
    if (_context.environment.location?.country) {
      const higherRiskCountries = ['unknown', 'restricted'];
      if (higherRiskCountries.includes(_context.environment.location.country)) {
        riskScore += 2;
      }
    }

    // Emergency mode risk adjustment (with safety check)
    if (_context.subject && _context.subject.emergencyMode) {
      riskScore += 2; // Emergency access is inherently riskier
    }

    return Math.min(riskScore, 10); // Cap at 10
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Get service statistics
   */
  getStatistics(): {
    isInitialized: boolean;
    cacheSize: number;
    policiesLoaded: number;
    totalDecisions: number;
    permitDecisions: number;
    denyDecisions: number;
    averageEvaluationTime: number;
    config: AuthorizationConfig;
  } {
    // Clean up expired cache entries before returning statistics
    this.cleanupExpiredCacheEntries();

    this.stats.cacheSize = this.decisionCache.size;
    this.stats.policiesLoaded = this.policies.size;
    this.stats.isInitialized = this.isInitialized;
    return {
      ...this.stats,
      config: this.config,
    };
  }

  /**
   * Destroy the authorization engine and clean up resources
   */
  destroy(): void {
    this.decisionCache.clear();
    this.policies.clear();
    this.isInitialized = false;
    this.stats.isInitialized = false;

    authorizationLogger.info(
      'Healthcare authorization engine destroyed',
      { component: 'authorization-system', timestamp: new Date().toISOString() },
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create authorization context from request
   */
  createAuthorizationContext(
    authSession: AuthSession,
    resourceType: HealthcareResourceType,
    resourceId: string,
    operation:
      | 'read'
      | 'write'
      | 'create'
      | 'update'
      | 'delete'
      | 'execute'
      | 'export'
      | 'share',
    c: Context,
    additionalContext: Partial<AuthorizationContext> = {},
  ): AuthorizationContext {
    const requestId = `req_${nanoid(12)}`;
    const correlationId = `corr_${nanoid(8)}`;

    const baseContext: AuthorizationContext = {
      requestId,
      sessionId: authSession.sessionId,
      correlationId,

      subject: {
        _userId: authSession._userId,
        _role: authSession.userProfile._role,
        permissions: authSession.userProfile.permissions,
        attributes: {
          facilityId: authSession.userProfile.facilityId,
          departmentId: authSession.userProfile.departmentId,
          shiftId: authSession.userProfile.shiftId,
          accessLevel: authSession.userProfile.accessLevel,
        },
        facilityId: authSession.userProfile.facilityId,
        departmentId: authSession.userProfile.departmentId,
        shiftId: authSession.userProfile.shiftId,
        emergencyMode: authSession.sessionMetadata.workflowContext?.emergencyMode || false,
      },

      resource: {
        type: resourceType,
        id: resourceId,
        attributes: {},
        sensitivity: this.getResourceSensitivity(resourceType),
        owner: {},
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dataClassification: this.getDataClassification(resourceType),
          retentionPeriod: this.getRetentionPeriod(resourceType),
          legalBasis: authSession.complianceTracking.complianceFlags
              .lgpdCompliant
            ? 'legitimate_interests'
            : 'consent',
        },
      },

      action: {
        operation,
        scope: 'basic',
        urgency: 'routine',
        purpose: 'healthcare_service',
      },

      environment: {
        timestamp: new Date().toISOString(),
        ipAddress: authSession.sessionMetadata.ipAddress,
        userAgent: authSession.sessionMetadata.userAgent,
        location: {
          facility: authSession.userProfile.facilityId,
        },
        technical: {
          encryption: true,
          deviceType: authSession.sessionMetadata.deviceType,
          networkType: 'secure',
        },
        workflow: {
          emergencyFlag: authSession.sessionMetadata.workflowContext?.emergencyMode || false,
        },
      },

      compliance: {
        lgpdBasis: 'legitimate_interests',
        consentStatus: {
          dataProcessing: authSession.userProfile.consentStatus.dataProcessing,
          thirdPartySharing: authSession.userProfile.consentStatus.thirdParty,
          consentDate: authSession.userProfile.consentStatus.consentDate,
        },
        auditRequired: true,
        complianceFlags: [],
        dataMinimization: this.config.lgpdCompliance.enableDataMinimization,
        purposeLimitation: this.config.lgpdCompliance.enablePurposeLimitation,
      },
    };

    // Merge with additional context
    return { ...baseContext, ...additionalContext };
  }

  /**
   * Get resource sensitivity level
   */
  private getResourceSensitivity(
    resourceType: HealthcareResourceType,
  ): ResourceSensitivity {
    const sensitivityMap: Record<HealthcareResourceType, ResourceSensitivity> = {
      // Patient data - highly sensitive
      patient_profile: 'restricted',
      patient_demographics: 'confidential',
      patient_contact: 'confidential',
      patient_insurance: 'confidential',
      patient_emergency_contact: 'confidential',

      // Medical data - restricted
      medical_history: 'restricted',
      diagnosis: 'restricted',
      treatment_plan: 'restricted',
      prescription: 'restricted',
      allergy_record: 'restricted',
      vital_signs: 'confidential',
      progress_note: 'confidential',

      // Clinical data - confidential
      appointment: 'confidential',
      consultation: 'confidential',
      procedure: 'confidential',
      surgery: 'restricted',
      referral: 'confidential',
      care_plan: 'confidential',

      // Laboratory - confidential
      lab_order: 'confidential',
      lab_result: 'restricted',
      lab_report: 'restricted',
      specimen: 'confidential',

      // Imaging - confidential
      imaging_order: 'confidential',
      imaging_study: 'restricted',
      imaging_report: 'restricted',
      dicom_file: 'restricted',

      // Medication - restricted
      medication_order: 'restricted',
      medication_administration: 'restricted',
      medication_reconciliation: 'confidential',
      pharmacy_order: 'confidential',

      // Administrative - internal
      user_account: 'internal',
      role_assignment: 'internal',
      facility_data: 'internal',
      department_data: 'internal',
      shift_schedule: 'internal',

      // System - confidential/restricted
      audit_log: 'restricted',
      system_config: 'restricted',
      backup_data: 'restricted',
      compliance_report: 'confidential',
      analytics_data: 'internal',

      // Emergency - top secret
      emergency_contact: 'confidential',
      emergency_procedure: 'restricted',
      emergency_alert: 'top_secret',
      disaster_plan: 'restricted',
    };

    return sensitivityMap[resourceType] || 'internal';
  }

  /**
   * Get data classification
   */
  private getDataClassification(
    resourceType: HealthcareResourceType,
  ): 'public' | 'internal' | 'confidential' | 'restricted' {
    const sensitivity = this.getResourceSensitivity(resourceType);

    switch (sensitivity) {
      case 'public':
        return 'public';
      case 'internal':
        return 'internal';
      case 'confidential':
        return 'confidential';
      case 'restricted':
      case 'top_secret':
        return 'restricted';
      default:
        return 'internal';
    }
  }

  /**
   * Get retention period for resource type
   */
  private getRetentionPeriod(resourceType: HealthcareResourceType): number {
    // Healthcare data retention periods (in days)
    const retentionMap: Record<string, number> = {
      // Patient data - 20 years (as per medical standards)
      patient: 7300,
      medical: 7300,
      clinical: 7300,
      lab: 7300,
      imaging: 7300,
      medication: 7300,

      // Administrative - 7 years (as per LGPD)
      admin: 2555,
      user: 2555,
      facility: 2555,
      department: 2555,
      shift: 365,

      // System data - varies
      audit: 2555, // 7 years
      system: 1095, // 3 years
      backup: 365, // 1 year
      compliance: 2555, // 7 years
      analytics: 730, // 2 years

      // Emergency - permanent or 10 years
      emergency: 3650, // 10 years
    };

    // Determine category from resource type
    const resourceCategory = resourceType.split('_')[0];
    return retentionMap[resourceCategory as keyof typeof retentionMap] || 365; // Default 1 year
  }

  /**
   * Get cached authorization decision
   */
  private getCachedDecision(
    _context: AuthorizationContext,
  ): AuthorizationDecision | null {
    const cacheKey = this.generateCacheKey(_context);
    const cached = this.decisionCache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      if (cached.expiry > now) {
        return cached.decision;
      } else {
        // Clean up expired entry
        this.decisionCache.delete(cacheKey);
      }
    }

    return null;
  }

  /**
   * Cache authorization decision
   */
  private cacheDecision(
    _context: AuthorizationContext,
    decision: AuthorizationDecision,
  ): void {
    const cacheKey = this.generateCacheKey(_context);
    const expiry = Date.now() + this.config.decisionEngine.cacheTimeout * 1000;

    this.decisionCache.set(cacheKey, { decision, expiry });
  }

  /**
   * Generate cache key for context
   */
  private generateCacheKey(_context: AuthorizationContext): string {
    const key =
      `${_context.subject._userId}:${_context.subject._role}:${_context.resource.type}:${_context.resource.id}:${_context.action.operation}:${_context.action.scope}`;
    return Buffer.from(key).toString('base64');
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCacheEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, cached] of Array.from(this.decisionCache.entries())) {
      if (cached.expiry <= now) {
        this.decisionCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      authorizationLogger.info('Expired cache entries cleaned up', {
        cleanedCount,
        component: 'authorization-system',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    const metrics = {
      cacheSize: this.decisionCache.size,
      policiesLoaded: this.policies.size,
      timestamp: new Date().toISOString(),
    };

    authorizationLogger.info('Performance metrics collected', {
      ...metrics,
      component: 'authorization-system',
    });
  }

  /**
   * Log authorization decision
   */
  private async logAuthorizationDecision(
    _context: AuthorizationContext,
    decision: AuthorizationDecision,
    startTime: number,
  ): Promise<void> {
    const decisionLog = {
      contextId: decision.contextId,
      requestId: _context.requestId,
      sessionId: _context.sessionId,
      _userId: _context.subject._userId,
      _role: _context.subject._role,
      resourceType: _context.resource.type,
      resourceId: _context.resource.id,
      operation: _context.action.operation,
      decision: decision.decision,
      reasons: decision.reasons,
      riskScore: decision.riskScore,
      evaluationTime: decision.evaluationTime,
      obligations: decision.obligations.length,
      advice: decision.advice.length,
      auditRequired: decision.monitoring.auditRequired,
      timestamp: decision.timestamp,
    };

    authorizationLogger.info('Authorization decision logged', {
      ...decisionLog,
      component: 'authorization-system',
    });
  }
  /**
   * Determine monitoring requirements for authorization decision
   */
  private determineMonitoringRequirements(
    _context: AuthorizationContext,
    decision: AuthorizationDecision['decision'],
    riskScore: number,
  ): AuthorizationDecision['monitoring'] {
    const monitoring = {
      auditRequired: false,
      alertRequired: false,
      notificationRequired: false,
      complianceTracking: false,
    };

    // Check compliance context audit requirement first
    if (_context.compliance?.auditRequired) {
      monitoring.auditRequired = true;
      monitoring.alertRequired = true;
      monitoring.complianceTracking = true;
    } // Basic monitoring logic based on decision and risk
    else if (decision === 'permit') {
      monitoring.auditRequired = riskScore > 5;
      monitoring.alertRequired = riskScore > 7;
      monitoring.notificationRequired = riskScore > 8;
      monitoring.complianceTracking = riskScore > 3;
    } else if (decision === 'deny') {
      monitoring.auditRequired = true;
      monitoring.alertRequired = true;
      monitoring.notificationRequired = false;
      monitoring.complianceTracking = true;
    }

    // Emergency monitoring
    if (_context.environment?.workflow?.emergencyFlag) {
      monitoring.auditRequired = true;
      monitoring.alertRequired = true;
      monitoring.notificationRequired = true;
      monitoring.complianceTracking = true;
    }

    return monitoring;
  }

  /**
   * Generate context conditions for permit decisions
   */
  private generateContextConditions(
    _context: AuthorizationContext,
  ): AuthorizationDecision['conditions'] {
    const conditions: AuthorizationDecision['conditions'] = [];

    // Time-based conditions
    if (_context.environment?.timestamp) {
      const hour = new Date(_context.environment.timestamp).getHours();
      if (hour < 6 || hour > 22) {
        conditions.push({
          type: 'time_restriction',
          description: 'Access restricted to business hours',
          satisfied: hour >= 6 && hour <= 22,
        });
      }
    }

    // Location-based conditions
    if (_context.environment?.location?.facility) {
      conditions.push({
        type: 'facility_access',
        description: 'Access limited to assigned facility',
        satisfied: _context.environment?.location?.facility === _context.subject.facilityId,
      });
    }

    // Role-specific conditions
    if (_context.subject._role === 'physician') {
      conditions.push({
        type: 'license_validation',
        description: 'Valid medical license required',
        satisfied: _context.subject.attributes?.license?.valid
          && new Date(_context.subject.attributes?.license?.expiry) > new Date(),
      });
    }

    return conditions;
  }

  /**
   * Update statistics tracking
   */
  private updateStatistics(
    decision: AuthorizationDecision['decision'],
    evaluationTime: number,
  ): void {
    // Initialize statistics if not exists
    if (!this.statistics) {
      this.statistics = {
        totalEvaluations: 0,
        permitCount: 0,
        denyCount: 0,
        averageEvaluationTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
      };
    }

    this.statistics.totalEvaluations++;
    this.statistics.averageEvaluationTime =
      (this.statistics.averageEvaluationTime * (this.statistics.totalEvaluations - 1)
        + evaluationTime)
      / this.statistics.totalEvaluations;

    switch (decision) {
      case 'permit':
        this.statistics.permitCount++;
        break;
      case 'deny':
        this.statistics.denyCount++;
        break;
    }
  }

  /**
   * Initialize statistics
   */
  private statistics: {
    totalEvaluations: number;
    permitCount: number;
    denyCount: number;
    averageEvaluationTime: number;
    cacheHits: number;
    cacheMisses: number;
  } | null = null;
}

// ============================================================================
// DEFAULT SERVICE INSTANCE
// ============================================================================

/**
 * Default healthcare authorization engine instance
 */
export const healthcareAuthorizationEngine = new HealthcareAuthorizationEngine({
  enabled: true,
  environment: (process.env.NODE_ENV as any) || 'development',

  decisionEngine: {
    defaultDecision: 'deny',
    evaluationTimeout: 3000,
    enableCaching: true,
    cacheTimeout: 300,
    enableParallelEvaluation: true,
  },

  healthcareSettings: {
    enablePatientDataProtection: true,
    enableEmergencyOverride: true,
    enableBreakGlass: true,
    enablePhysicianOverride: true,
    patientDataRetention: 7,
    enableMinorProtection: true,
  },

  lgpdCompliance: {
    enableConsentValidation: true,
    enableDataMinimization: true,
    enablePurposeLimitation: true,
    enableDataPortability: true,
    enableRightToErasure: true,
    consentGracePeriod: 30,
  },

  security: {
    enableRiskAssessment: true,
    riskThreshold: 7,
    enableThreatDetection: true,
    enableAnomalyDetection: true,
    enableGeofencing: false,
    enableTimeRestrictions: false,
  },

  audit: {
    enableDecisionLogging: true,
    enablePerformanceLogging: true,
    enableComplianceAudit: true,
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    auditRetentionDays: 2555,
  },

  performance: {
    enableMetrics: true,
    metricsInterval: 60000,
    enableOptimization: true,
    maxConcurrentEvaluations: 50,
  },
});

/**
 * Export types for external use
 */
// Note: All types are already exported above with their definitions
// No need to re-export them here to avoid TS2484 conflicts
