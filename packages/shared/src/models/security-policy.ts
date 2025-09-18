/**
 * Healthcare Security Policy Data Model
 * 
 * Comprehensive security policy framework with healthcare-specific configurations:
 * - LGPD (Lei Geral de Proteção de Dados) compliance
 * - ANVISA security requirements for medical devices
 * - Content Security Policy (CSP) configurations
 * - Row Level Security (RLS) policies
 * - Healthcare audit trail and compliance monitoring
 * - Brazilian healthcare regulatory security (CFM compliance)
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, CFM, ISO 27001, HIPAA
 */

import { z } from 'zod';

// ============================================================================
// CORE SECURITY POLICY TYPES
// ============================================================================

/**
 * Security policy levels for healthcare applications
 */
export const SecurityPolicyLevelSchema = z.enum([
  'public',
  'restricted',
  'confidential',
  'highly_confidential',
  'critical'
]).describe('Security policy levels based on data sensitivity');

/**
 * Data classification for healthcare information
 */
export const DataClassificationSchema = z.enum([
  'public',
  'internal',
  'confidential',
  'sensitive',
  'critical'
]).describe('Data classification levels for healthcare information');

/**
 * LGPD compliance categories
 */
export const LGPDComplianceCategorySchema = z.enum([
  'personal_data',
  'sensitive_personal_data',
  'health_data',
  'biometric_data',
  'genetic_data',
  'financial_data',
  'professional_data'
]).describe('LGPD compliance categories for data classification');

/**
 * ANVISA security requirements for medical devices
 */
export const AnvisaSecurityRequirementSchema = z.object({
  requirementId: z.string().describe('ANVISA requirement identifier'),
  title: z.string().describe('Requirement title'),
  description: z.string().describe('Requirement description'),
  category: z.enum(['functional', 'safety', 'security', 'performance']),
  isMandatory: z.boolean().default(true),
  verificationMethod: z.enum(['test', 'analysis', 'inspection', 'demonstration']),
  lastVerified: z.string().datetime().optional().describe('Last verification date'),
  nextReviewDate: z.string().datetime().optional().describe('Next review date'),
  complianceStatus: z.enum(['compliant', 'non_compliant', 'waiver', 'not_applicable']),
  evidence: z.string().optional().describe('Evidence of compliance')
}).describe('ANVISA security requirements for medical devices');

/**
 * Content Security Policy configuration
 */
export const CSPConfigurationSchema = z.object({
  defaultSrc: z.array(z.string()).describe('Default source directive'),
  scriptSrc: z.array(z.string()).describe('Script source directive'),
  styleSrc: z.array(z.string()).describe('Style source directive'),
  imgSrc: z.array(z.string()).describe('Image source directive'),
  fontSrc: z.array(z.string()).describe('Font source directive'),
  connectSrc: z.array(z.string()).describe('Connect source directive'),
  frameSrc: z.array(z.string()).describe('Frame source directive'),
  mediaSrc: z.array(z.string()).describe('Media source directive'),
  objectSrc: z.array(z.string()).describe('Object source directive'),
  prefetchSrc: z.array(z.string()).describe('Prefetch source directive'),
  workerSrc: z.array(z.string()).describe('Worker source directive'),
  childSrc: z.array(z.string()).describe('Child source directive'),
  formAction: z.array(z.string()).describe('Form action directive'),
  frameAncestors: z.array(z.string()).describe('Frame ancestors directive'),
  reportUri: z.string().url().optional().describe('CSP violation report URI'),
  reportOnly: z.boolean().default(false).describe('Report-only mode'),
  enforceStrict: z.boolean().default(true).describe('Strict enforcement mode')
}).describe('Content Security Policy configuration');

/**
 * Row Level Security (RLS) policy configuration
 */
export const RLSPolicySchema = z.object({
  policyId: z.string().describe('Unique policy identifier'),
  tableName: z.string().describe('Database table name'),
  policyName: z.string().describe('RLS policy name'),
  description: z.string().describe('Policy description'),
  usingExpression: z.string().describe('SQL USING expression'),
  checkExpression: z.string().optional().describe('SQL CHECK expression for row updates'),
  appliesTo: z.array(z.enum(['select', 'insert', 'update', 'delete', 'all'])).describe('Operations this policy applies to'),
  priority: z.number().min(1).max(100).default(10).describe('Policy priority (1=highest)'),
  isEnabled: z.boolean().default(true),
  lastModified: z.string().datetime().describe('Last modification timestamp'),
  modifiedBy: z.string().describe('Last modified by')
}).describe('Row Level Security policy configuration');

/**
 * Security audit trail entry
 */
export const SecurityAuditTrailSchema = z.object({
  auditId: z.string().describe('Unique audit identifier'),
  timestamp: z.string().datetime().describe('Audit event timestamp'),
  eventType: z.enum(['security_event', 'policy_violation', 'compliance_check', 'access_control', 'data_breach', 'system_change']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Event severity'),
  category: z.enum(['security', 'privacy', 'compliance', 'operational']),
  description: z.string().describe('Event description'),
  userId: z.string().optional().describe('User identifier'),
  userRole: z.string().optional().describe('User role'),
  patientId: z.string().optional().describe('Patient identifier if applicable'),
  resourceType: z.string().describe('Resource type affected'),
  resourceId: z.string().describe('Resource identifier affected'),
  action: z.string().describe('Action performed'),
  result: z.enum(['success', 'failure', 'blocked', 'warning', 'error']),
  ipAddress: z.string().ip().optional().describe('Client IP address'),
  userAgent: z.string().optional().describe('User agent string'),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional()
  }).optional(),
  policyReferences: z.array(z.string()).optional().describe('Referenced security policies'),
  additionalData: z.record(z.any()).optional().describe('Additional event data')
}).describe('Security audit trail entry');

/**
 * Security policy compliance validation
 */
export const SecurityPolicyComplianceSchema = z.object({
  policyId: z.string().describe('Security policy identifier'),
  complianceStatus: z.enum(['compliant', 'non_compliant', 'partial', 'exempt']),
  lastAssessmentDate: z.string().datetime().describe('Last assessment date'),
  nextAssessmentDate: z.string().datetime().describe('Next assessment date'),
  assessor: z.string().describe('Assessor identifier'),
  findings: z.array(z.object({
    findingId: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    recommendation: z.string(),
    status: z.enum(['open', 'in_progress', 'resolved', 'deferred']),
    dueDate: z.string().datetime().optional()
  })).describe('Compliance findings'),
  overallScore: z.number().min(0).max(100).describe('Overall compliance score'),
  evidence: z.array(z.string()).describe('Evidence of compliance'),
  remediationPlan: z.string().optional().describe('Remediation plan for non-compliance')
}).describe('Security policy compliance validation');

/**
 * Main Security Policy interface
 */
export const SecurityPolicySchema = z.object({
  id: z.string().describe('Unique security policy identifier'),
  name: z.string().describe('Security policy name'),
  description: z.string().describe('Security policy description'),
  version: z.string().describe('Policy version'),
  
  // Policy scope and classification
  scope: z.object({
    appliesTo: z.array(z.enum(['web_app', 'api', 'mobile_app', 'database', 'infrastructure', 'all'])),
    dataTypes: z.array(LGPDComplianceCategorySchema),
    userRoles: z.array(z.string()),
    geographicalScope: z.array(z.string()).describe('Geographical regions this policy applies to')
  }).describe('Policy scope'),
  
  // Security level and classification
  securityLevel: SecurityPolicyLevelSchema.describe('Security policy level'),
  dataClassification: DataClassificationSchema.describe('Data classification level'),
  
  // LGPD compliance requirements
  lgpdCompliance: z.object({
    dataProcessingBasis: z.enum(['consent', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests']),
    retentionPeriod: z.number().describe('Data retention period in days'),
    dataSubjectRights: z.array(z.enum(['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'])),
    dataBreachNotification: z.object({
      timeframe: z.number().describe('Notification timeframe in hours'),
      authorities: z.array(z.string()),
      dataSubjects: z.boolean().default(true)
    }),
    dataProtectionOfficer: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional()
    }).optional(),
    internationalTransfers: z.object({
      allowed: z.boolean(),
      mechanisms: z.array(z.enum(['adequacy_decision', 'sccs', 'bcrs', 'binding_corporate_rules']))
    }).optional()
  }).describe('LGPD compliance requirements'),
  
  // ANVISA compliance requirements
  anvisaCompliance: z.object({
    medicalDeviceClass: z.enum(['I', 'IIa', 'IIb', 'III']).optional(),
    requirements: z.array(AnvisaSecurityRequirementSchema),
    riskManagement: z.object({
      riskAnalysisDate: z.string().datetime().optional(),
      nextReviewDate: z.string().datetime(),
      riskAcceptanceCriteria: z.string().optional()
    }),
    postMarketSurveillance: z.object({
      enabled: z.boolean(),
      reportingProcedures: z.string().optional(),
      contactPoint: z.string().optional()
    })
  }).describe('ANVISA compliance requirements'),
  
  // Security configurations
  securityConfigurations: z.object({
    encryption: z.object({
      inTransit: z.object({
        enabled: z.boolean().default(true),
        protocols: z.array(z.string()),
        minimumVersion: z.string().optional()
      }),
      atRest: z.object({
        enabled: z.boolean().default(true),
        algorithm: z.string().default('AES-256'),
        keyManagement: z.string().default('kms')
      })
    }),
    accessControl: z.object({
      model: z.enum(['rbac', 'abac', 'mac']),
      mfaEnabled: z.boolean().default(true),
      sessionTimeout: z.number().default(3600),
      passwordPolicy: z.object({
        minLength: z.number().min(8).default(12),
        requireUppercase: z.boolean().default(true),
        requireLowercase: z.boolean().default(true),
        requireNumbers: z.boolean().default(true),
        requireSpecialChars: z.boolean().default(true),
        expirationDays: z.number().default(90),
        historyCount: z.number().default(5)
      })
    }),
    networkSecurity: z.object({
      firewallEnabled: z.boolean().default(true),
      intrusionDetection: z.boolean().default(true),
      ddosProtection: z.boolean().default(true),
      vpns: z.array(z.string()).optional()
    })
  }).describe('Security configurations'),
  
  // CSP configuration
  cspConfiguration: CSPConfigurationSchema.optional().describe('Content Security Policy configuration'),
  
  // RLS policies
  rlsPolicies: z.array(RLSPolicySchema).optional().describe('Row Level Security policies'),
  
  // Audit and monitoring
  auditConfiguration: z.object({
    enabled: z.boolean().default(true),
    retentionPeriod: z.number().describe('Audit log retention in days'),
    monitoringEnabled: z.boolean().default(true),
    alertsEnabled: z.boolean().default(true),
    alertThresholds: z.object({
      failedLoginAttempts: z.number().default(5),
      suspiciousActivity: z.number().default(3),
      policyViolations: z.number().default(1)
    }),
    sensitiveOperations: z.array(z.enum([
      'patient_data_access',
      'medical_record_modification',
      'consent_management',
      'user_privilege_changes',
      'system_configuration',
      'data_export'
    ]))
  }).describe('Audit and monitoring configuration'),
  
  // Incident response
  incidentResponse: z.object({
    responseTime: z.number().describe('Target response time in hours'),
    escalationProcedure: z.string().describe('Escalation procedure'),
    backupRestore: z.object({
      enabled: z.boolean().default(true),
      rpo: z.number().describe('Recovery Point Objective in hours'),
      rto: z.number().describe('Recovery Time Objective in hours')
    }),
    businessContinuity: z.boolean().default(true)
  }).describe('Incident response configuration'),
  
  // Metadata
  metadata: z.object({
    createdBy: z.string().describe('Policy creator'),
    createdAt: z.string().datetime().describe('Creation timestamp'),
    lastUpdatedBy: z.string().optional().describe('Last updater'),
    lastUpdatedAt: z.string().datetime().optional().describe('Last update timestamp'),
    reviewCycle: z.number().describe('Review cycle in days').default(365),
    approvedBy: z.string().optional().describe('Approver name'),
    approvalDate: z.string().datetime().optional().describe('Approval date'),
    tags: z.array(z.string()).optional(),
    documentationUrl: z.string().url().optional()
  }).describe('Policy metadata')
}).describe('Comprehensive security policy for healthcare applications');

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Core Security Policy types
 */
export type SecurityPolicyLevel = z.infer<typeof SecurityPolicyLevelSchema>;
export type DataClassification = z.infer<typeof DataClassificationSchema>;
export type LGPDComplianceCategory = z.infer<typeof LGPDComplianceCategorySchema>;
export type AnvisaSecurityRequirement = z.infer<typeof AnvisaSecurityRequirementSchema>;
export type CSPConfiguration = z.infer<typeof CSPConfigurationSchema>;
export type RLSPolicy = z.infer<typeof RLSPolicySchema>;
export type SecurityAuditTrail = z.infer<typeof SecurityAuditTrailSchema>;
export type SecurityPolicyCompliance = z.infer<typeof SecurityPolicyComplianceSchema>;
export type SecurityPolicy = z.infer<typeof SecurityPolicySchema>;

// ============================================================================
// DEFAULT SECURITY POLICIES
// ============================================================================

/**
 * Default CSP configuration for healthcare web applications
 */
export const DEFAULT_HEALTHCARE_CSP: CSPConfiguration = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:", "*.supabase.co"],
  fontSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "wss:", "https:", "*.supabase.co"],
  frameSrc: ["'none'"],
  mediaSrc: ["'self'", "data:", "https:"],
  objectSrc: ["'none'"],
  prefetchSrc: ["'self'", "data:", "https:"],
  workerSrc: ["'self'"],
  childSrc: ["'none'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  reportUri: undefined,
  reportOnly: false,
  enforceStrict: true
};

/**
 * Default security policy for patient data
 */
export const DEFAULT_PATIENT_DATA_SECURITY_POLICY: SecurityPolicy = {
  id: 'patient-data-security-v1',
  name: 'Patient Data Security Policy',
  description: 'Security policy for patient data protection and LGPD compliance',
  version: '1.0.0',
  scope: {
    appliesTo: ['web_app', 'api', 'database'],
    dataTypes: ['health_data', 'sensitive_personal_data'],
    userRoles: ['doctor', 'nurse', 'admin', 'staff'],
    geographicalScope: ['BR']
  },
  securityLevel: 'highly_confidential',
  dataClassification: 'sensitive',
  lgpdCompliance: {
    dataProcessingBasis: 'consent',
    retentionPeriod: 3650, // 10 years
    dataSubjectRights: ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'],
    dataBreachNotification: {
      timeframe: 72,
      authorities: ['ANPD'],
      dataSubjects: true
    },
    internationalTransfers: {
      allowed: false,
      mechanisms: []
    }
  },
  anvisaCompliance: {
    medicalDeviceClass: 'IIa',
    requirements: [],
    riskManagement: {
      riskAnalysisDate: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      riskAcceptanceCriteria: 'ISO 14971 compliance'
    },
    postMarketSurveillance: {
      enabled: true,
      reportingProcedures: 'Internal incident reporting system',
      contactPoint: 'security@neonpro.com'
    }
  },
  securityConfigurations: {
    encryption: {
      inTransit: {
        enabled: true,
        protocols: ['TLS 1.3', 'TLS 1.2'],
        minimumVersion: 'TLS 1.2'
      },
      atRest: {
        enabled: true,
        algorithm: 'AES-256',
        keyManagement: 'kms'
      }
    },
    accessControl: {
      model: 'rbac',
      mfaEnabled: true,
      sessionTimeout: 3600,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expirationDays: 90,
        historyCount: 5
      }
    },
    networkSecurity: {
      firewallEnabled: true,
      intrusionDetection: true,
      ddosProtection: true,
      vpns: []
    }
  },
  cspConfiguration: DEFAULT_HEALTHCARE_CSP,
  rlsPolicies: [],
  auditConfiguration: {
    enabled: true,
    retentionPeriod: 2555, // 7 years
    monitoringEnabled: true,
    alertsEnabled: true,
    alertThresholds: {
      failedLoginAttempts: 5,
      suspiciousActivity: 3,
      policyViolations: 1
    },
    sensitiveOperations: [
      'patient_data_access',
      'medical_record_modification',
      'consent_management',
      'user_privilege_changes',
      'system_configuration',
      'data_export'
    ]
  },
  incidentResponse: {
    responseTime: 4,
    escalationProcedure: 'Tiered escalation to security team and management',
    backupRestore: {
      enabled: true,
      rpo: 1,
      rto: 4
    },
    businessContinuity: true
  },
  metadata: {
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    reviewCycle: 365,
    tags: ['patient-data', 'lgpd', 'anvisa', 'security']
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Security Policy utility functions
 */
export const SecurityPolicyUtils = {
  /**
   * Validate a security policy against compliance requirements
   */
  validatePolicy: (policy: Partial<SecurityPolicy>): SecurityPolicyCompliance => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate LGPD compliance
    if (!policy.lgpdCompliance?.dataProcessingBasis) {
      errors.push('LGPD data processing basis is required');
    }
    
    // Validate security configurations
    if (!policy.securityConfigurations?.encryption?.inTransit?.enabled) {
      warnings.push('In-transit encryption should be enabled');
    }
    
    // Validate audit configuration
    if (!policy.auditConfiguration?.enabled) {
      errors.push('Audit configuration must be enabled for healthcare applications');
    }
    
    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));
    
    return {
      policyId: policy.id || 'unknown',
      complianceStatus: errors.length > 0 ? 'non_compliant' : warnings.length > 0 ? 'partial' : 'compliant',
      lastAssessmentDate: new Date().toISOString(),
      nextAssessmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assessor: 'system',
      findings: errors.concat(warnings).map((finding, index) => ({
        findingId: `finding-${index}`,
        severity: errors.includes(finding) ? 'high' : 'medium',
        description: finding,
        recommendation: finding,
        status: 'open' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })),
      overallScore: score,
      evidence: ['automated_validation'],
      remediationPlan: errors.length > 0 ? 'Address all high-priority findings' : 'Monitor warnings'
    };
  },
  
  /**
   * Generate CSP header string from configuration
   */
  generateCSPHeader: (config: CSPConfiguration): string => {
    const directives: string[] = [];
    
    if (config.defaultSrc.length > 0) directives.push(`default-src ${config.defaultSrc.join(' ')}`);
    if (config.scriptSrc.length > 0) directives.push(`script-src ${config.scriptSrc.join(' ')}`);
    if (config.styleSrc.length > 0) directives.push(`style-src ${config.styleSrc.join(' ')}`);
    if (config.imgSrc.length > 0) directives.push(`img-src ${config.imgSrc.join(' ')}`);
    if (config.fontSrc.length > 0) directives.push(`font-src ${config.fontSrc.join(' ')}`);
    if (config.connectSrc.length > 0) directives.push(`connect-src ${config.connectSrc.join(' ')}`);
    if (config.frameSrc.length > 0) directives.push(`frame-src ${config.frameSrc.join(' ')}`);
    if (config.mediaSrc.length > 0) directives.push(`media-src ${config.mediaSrc.join(' ')}`);
    if (config.objectSrc.length > 0) directives.push(`object-src ${config.objectSrc.join(' ')}`);
    if (config.prefetchSrc.length > 0) directives.push(`prefetch-src ${config.prefetchSrc.join(' ')}`);
    if (config.workerSrc.length > 0) directives.push(`worker-src ${config.workerSrc.join(' ')}`);
    if (config.childSrc.length > 0) directives.push(`child-src ${config.childSrc.join(' ')}`);
    if (config.formAction.length > 0) directives.push(`form-action ${config.formAction.join(' ')}`);
    if (config.frameAncestors.length > 0) directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`);
    if (config.reportUri) directives.push(`report-uri ${config.reportUri}`);
    
    directives.push('upgrade-insecure-requests');
    directives.push('block-all-mixed-content');
    
    return directives.join('; ');
  },
  
  /**
   * Create audit trail entry
   */
  createAuditEntry: (params: Partial<SecurityAuditTrail>): SecurityAuditTrail => ({
    auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    eventType: params.eventType || 'security_event',
    severity: params.severity || 'medium',
    category: params.category || 'security',
    description: params.description || '',
    userId: params.userId,
    userRole: params.userRole,
    patientId: params.patientId,
    resourceType: params.resourceType || '',
    resourceId: params.resourceId || '',
    action: params.action || '',
    result: params.result || 'success',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    location: params.location,
    policyReferences: params.policyReferences || [],
    additionalData: params.additionalData
  }),
  
  /**
   * Check if policy applies to specific context
   */
  policyAppliesTo: (policy: SecurityPolicy, context: {
    resourceType?: string;
    userRole?: string;
    dataType?: string;
    geographicalLocation?: string;
  }): boolean => {
    const { scope } = policy;
    
    if (context.resourceType && !scope.appliesTo.includes(context.resourceType as 'web_app' | 'api' | 'mobile_app' | 'database' | 'infrastructure' | 'all') && !scope.appliesTo.includes('all')) {
      return false;
    }
    
    if (context.userRole && !scope.userRoles.includes(context.userRole)) {
      return false;
    }
    
    if (context.dataType && !scope.dataTypes.includes(context.dataType as LGPDComplianceCategory)) {
      return false;
    }
    
    if (context.geographicalLocation && !scope.geographicalScope.includes(context.geographicalLocation)) {
      return false;
    }
    
    return true;
  }
};