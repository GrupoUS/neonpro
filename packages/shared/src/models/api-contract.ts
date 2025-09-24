/**
 * Healthcare API Contract Data Model
 *
 * Comprehensive API contract framework with healthcare-specific extensions:
 * - ANVISA SaMD (Software as a Medical Device) compliance
 * - LGPD-compliant API structure definitions
 * - OpenAPI 3.1 healthcare schema specifications
 * - API versioning and compatibility management
 * - Brazilian healthcare regulatory compliance (CFM, ANVISA)
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, CFM, OpenAPI 3.1
 */

import { z } from 'zod';

// ============================================================================
// CORE API CONTRACT TYPES
// ============================================================================

/**
 * API version information with healthcare compliance metadata
 */
export const APIVersionSchema = z.object({
  version: z.string().describe('API version following semantic versioning'),
  status: z
    .enum(['active', 'deprecated', 'retired', 'beta'])
    .describe('API version status'),
  releaseDate: z.string().datetime().describe('Version release date'),
  deprecationDate: z
    .string()
    .datetime()
    .optional()
    .describe('Deprecation date if applicable'),
  sunsetDate: z
    .string()
    .datetime()
    .optional()
    .describe('Date when API will be retired'),
  complianceFrameworks: z
    .array(z.string())
    .describe('Compliance frameworks this version adheres to'),
  healthcareRegulatoryStatus: z
    .enum(['compliant', 'partial', 'pending', 'non_compliant'])
    .describe('Healthcare regulatory compliance status'),
  requiresAuthentication: z
    .boolean()
    .describe('Whether this version requires authentication'),
  supportedEnvironments: z
    .array(z.enum(['development', 'staging', 'production']))
    .describe('Supported deployment environments'),
});

export type APIVersion = z.infer<typeof APIVersionSchema>;

/**
 * API endpoint configuration with healthcare-specific metadata
 */
export const APIEndpointSchema = z.object({
  path: z.string().describe('API endpoint path'),
  method: z
    .enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
    .describe('HTTP method'),
  operationId: z.string().describe('Unique operation identifier'),
  summary: z.string().describe('Brief endpoint description'),
  description: z.string().describe('Detailed endpoint description'),
  tags: z.array(z.string()).describe('Endpoint tags for organization'),

  // Healthcare-specific properties
  healthcareContext: z
    .object({
      isMedicalDeviceAPI: z
        .boolean()
        .describe('Whether this is a medical device API'),
      anvisaClassification: z
        .enum(['I', 'II', 'III', 'IV'])
        .optional()
        .describe('ANVISA risk classification if applicable'),
      involvesPatientData: z
        .boolean()
        .describe('Whether endpoint processes patient data'),
      dataSensitivity: z
        .enum(['low', 'medium', 'high', 'critical'])
        .describe('Data sensitivity level'),
      auditRequired: z.boolean().describe('Whether audit logging is required'),
      emergencyWorkflow: z
        .boolean()
        .describe('Whether part of emergency workflows'),
      lgpdProcessingBasis: z
        .enum([
          'consent',
          'contract',
          'legal_obligation',
          'vital_interests',
          'public_interest',
          'legitimate_interests',
        ])
        .describe('LGPD legal basis for data processing'),
    })
    .describe('Healthcare-specific endpoint metadata'),

  // Request/response schemas
  requestSchema: z
    .any()
    .optional()
    .describe('Zod schema for request validation'),
  responseSchema: z.any().optional().describe('Zod schema for response'),

  // Rate limiting and security
  rateLimit: z
    .object({
      requestsPerMinute: z
        .number()
        .optional()
        .describe('Rate limit per minute'),
      burstLimit: z.number().optional().describe('Burst rate limit'),
      requiresAuthorization: z.boolean().default(true),
      requiredPermissions: z.array(z.string()).optional(),
    })
    .optional()
    .describe('Rate limiting and security configuration'),

  // Monitoring and observability
  monitoring: z
    .object({
      enableMetrics: z.boolean().default(true),
      enableTracing: z.boolean().default(true),
      sliThresholds: z
        .object({
          latency: z.object({
            p50: z.number().optional(),
            p95: z.number().optional(),
            p99: z.number().optional(),
          }),
          errorRate: z.number().max(1).optional(),
          availability: z.number().min(0).max(1).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type APIEndpoint = z.infer<typeof APIEndpointSchema>;

/**
 * API contract definition
 */
export const APIContractSchema = z.object({
  id: z.string().describe('Unique contract identifier'),
  name: z.string().describe('Human-readable contract name'),
  description: z.string().describe('Contract description'),
  version: z.string().describe('Contract version'),

  // API information
  apiInfo: z
    .object({
      title: z.string().describe('API title'),
      description: z.string().describe('API description'),
      version: z.string().describe('API version'),
      contact: z
        .object({
          name: z.string().describe('Contact name'),
          email: z.string().email().describe('Contact email'),
          url: z.string().url().optional().describe('Contact URL'),
        })
        .optional(),
      license: z
        .object({
          name: z.string().describe('License name'),
          url: z.string().url().optional().describe('License URL'),
        })
        .optional(),
    })
    .describe('API information'),

  // Healthcare compliance information
  healthcareCompliance: z
    .object({
      anvisaRegistration: z
        .string()
        .optional()
        .describe('ANVISA registration number'),
      cfmCompliance: z.boolean().describe('CFM compliance status'),
      lgpdCompliant: z
        .boolean()
        .default(true)
        .describe('LGPD compliance status'),
      hipaaCompliant: z
        .boolean()
        .optional()
        .describe('HIPAA compliance if applicable'),
      iso13485Compliant: z
        .boolean()
        .optional()
        .describe('ISO 13485 compliance'),
      dataProcessingAgreement: z.string().url().optional().describe('DPA URL'),
      impactAssessment: z
        .string()
        .optional()
        .describe('Data protection impact assessment'),
      securityMeasures: z
        .array(z.string())
        .describe('Implemented security measures'),
      auditRequirements: z
        .object({
          enabled: z.boolean().default(true),
          retentionPeriodDays: z.number().default(365),
          logSensitiveOperations: z.boolean().default(true),
        })
        .optional()
        .describe('Audit logging requirements'),
    })
    .describe('Healthcare regulatory compliance information'),

  // Endpoints
  endpoints: z
    .array(APIEndpointSchema)
    .describe('API endpoints in this contract'),

  // Common schemas
  schemas: z.record(z.string(), z.any()).describe('Reusable schemas'),

  // Security requirements
  security: z
    .object({
      authentication: z.array(z.enum(['bearer', 'apiKey', 'oauth2', 'basic'])),
      authorization: z
        .object({
          model: z.enum(['rbac', 'abac', 'custom']),
          roles: z.array(z.string()).optional(),
        })
        .optional(),
      encryption: z.object({
        inTransit: z.boolean().default(true),
        atRest: z.boolean().default(true),
        algorithm: z.string().optional(),
      }),
    })
    .describe('Security requirements'),

  // Metadata
  metadata: z
    .object({
      createdBy: z.string().describe('Contract creator'),
      createdAt: z.string().datetime().describe('Creation timestamp'),
      lastUpdatedBy: z.string().optional().describe('Last updater'),
      lastUpdatedAt: z
        .string()
        .datetime()
        .optional()
        .describe('Last update timestamp'),
      tags: z.array(z.string()).optional(),
      documentationUrl: z.string().url().optional(),
    })
    .describe('Contract metadata'),
});

export type APIContract = z.infer<typeof APIContractSchema>;

// ============================================================================
// OPENAPI HEALTHCARE EXTENSIONS
// ============================================================================

/**
 * OpenAPI specification with healthcare extensions
 */
export const OpenAPISpecSchema = z.object({
  openapi: z.string().describe('OpenAPI specification version'),
  info: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string().optional(),
    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        url: z.string().url().optional(),
      })
      .optional(),
    license: z
      .object({
        name: z.string(),
        url: z.string().url().optional(),
      })
      .optional(),
  }),

  // Healthcare-specific extensions
  'x-healthcare': z
    .object({
      regulatoryFramework: z.array(
        z.enum(['LGPD', 'ANVISA', 'CFM', 'HIPAA', 'ISO13485']),
      ),
      dataClassification: z.enum([
        'public',
        'internal',
        'confidential',
        'restricted',
      ]),
      patientDataProcessing: z.boolean(),
      emergencyService: z.boolean().optional(),
      medicalDeviceClassification: z.enum(['I', 'II', 'III', 'IV']).optional(),
      complianceCertifications: z.array(z.string()).optional(),
      auditRequirements: z.object({
        enabled: z.boolean(),
        retentionPeriodDays: z.number(),
        logSensitiveOperations: z.boolean(),
      }),
      dataProtection: z.object({
        encryptionInTransit: z.boolean(),
        encryptionAtRest: z.boolean(),
        pseudonymization: z.boolean(),
        dataMinimization: z.boolean(),
      }),
    })
    .describe('Healthcare-specific OpenAPI extensions'),

  servers: z.array(
    z.object({
      url: z.string(),
      description: z.string().optional(),
      variables: z.record(z.string(), z.any()).optional(),
    }),
  ),

  paths: z.record(z.string(), z.any()),
  components: z
    .object({
      schemas: z.record(z.string(), z.any()).optional(),
      securitySchemes: z.record(z.string(), z.any()).optional(),
    })
    .optional(),

  security: z.array(z.record(z.string(), z.array(z.string()))).optional(),
  tags: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        externalDocs: z
          .object({
            url: z.string(),
            description: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

export type OpenAPISpec = z.infer<typeof OpenAPISpecSchema>;

// ============================================================================
// HEALTHCARE-SPECIFIC API CONTRACTS
// ============================================================================

/**
 * Patient data API contract with LGPD compliance
 */
export const PatientAPIContractSchema = APIContractSchema.extend({
  healthcareCompliance: z.object({
    anvisaRegistration: z.string().optional(),
    cfmCompliance: z.boolean().default(true),
    lgpdCompliant: z.boolean().default(true),
    hipaaCompliant: z.boolean().optional(),
    iso13485Compliant: z.boolean().optional(),
    dataProcessingAgreement: z.string().url().optional(),
    impactAssessment: z.string().optional(),
    securityMeasures: z.array(z.string()),
    specialCategories: z
      .array(
        z.enum([
          'health_data',
          'genetic_data',
          'biometric_data',
          'sexual_health',
        ]),
      )
      .describe('Special category data processing'),
    retentionPolicies: z.object({
      routine: z.number().describe('Retention period for routine data in days'),
      emergency: z
        .number()
        .describe('Retention period for emergency data in days'),
      legalHold: z
        .boolean()
        .describe('Whether legal hold can extend retention'),
    }),
    dataSubjectRights: z
      .array(
        z.enum([
          'access',
          'rectification',
          'erasure',
          'restriction',
          'portability',
          'objection',
        ]),
      )
      .describe('Supported data subject rights'),
  }),
  endpoints: z
    .array(APIEndpointSchema)
    .min(1)
    .describe('Patient-related endpoints'),
});

export type PatientAPIContract = z.infer<typeof PatientAPIContractSchema>;

/**
 * Medical device API contract for ANVISA compliance
 */
export const MedicalDeviceAPIContractSchema = APIContractSchema.extend({
  healthcareCompliance: z.object({
    anvisaRegistration: z.string().describe('ANVISA registration number'),
    anvisaClassification: z
      .enum(['I', 'II', 'III', 'IV'])
      .describe('Risk classification'),
    cfmCompliance: z.boolean(),
    lgpdCompliant: z.boolean().default(true),
    iso13485Compliant: z.boolean().default(true),
    qualityManagementSystem: z.string().describe('QMS reference'),
    riskManagementFile: z.string().describe('Risk management file reference'),
    clinicalEvaluationReport: z.string().url().optional(),
    postMarketSurveillance: z.boolean().default(true),
    vigilanceReporting: z.object({
      enabled: z.boolean(),
      procedures: z.array(z.string()),
      reportingTimeline: z.number().describe('Reporting timeline in hours'),
    }),
    deviceIdentification: z.object({
      udi: z.string().optional().describe('Unique Device Identifier'),
      modelNumber: z.string(),
      serialNumberFormat: z.string().optional(),
      manufacturer: z.string(),
      manufacturingDate: z.string().optional(),
    }),
  }),
  endpoints: z.array(APIEndpointSchema).describe('Medical device endpoints'),
});

export type MedicalDeviceAPIContract = z.infer<
  typeof MedicalDeviceAPIContractSchema
>;

/**
 * Telemedicine API contract with CFM compliance
 */
export const TelemedicineAPIContractSchema = APIContractSchema.extend({
  healthcareCompliance: z.object({
    cfmCompliance: z.boolean().default(true),
    cfmResolution: z.string().describe('CFM resolution number'),
    lgpdCompliant: z.boolean().default(true),
    videoRecordingConsent: z
      .boolean()
      .describe('Video recording consent requirement'),
    emergencyProtocol: z.boolean().describe('Emergency protocol integration'),
    geographicRestrictions: z.object({
      brazilOnly: z.boolean(),
      licensedStates: z.array(z.string()).optional(),
    }),
    professionalRequirements: z.object({
      activeLicense: z.boolean(),
      specializationVerification: z.boolean(),
      continuingEducation: z.boolean(),
    }),
    patientRights: z.object({
      informedConsent: z.boolean(),
      privacyAssurance: z.boolean(),
      dataAccess: z.boolean(),
      rightToWithdraw: z.boolean(),
    }),
    technicalRequirements: z.object({
      minimumBandwidth: z.number().describe('Minimum bandwidth in Mbps'),
      videoQuality: z.string().describe('Video quality requirements'),
      backupSystems: z.boolean(),
      uptimeRequirement: z.number().min(0).max(1),
    }),
  }),
  endpoints: z.array(APIEndpointSchema).describe('Telemedicine endpoints'),
});

export type TelemedicineAPIContract = z.infer<
  typeof TelemedicineAPIContractSchema
>;

// ============================================================================
// API VERSIONING AND COMPATIBILITY
// ============================================================================

/**
 * API compatibility matrix
 */
export const APICompatibilityMatrixSchema = z.object({
  currentVersion: z.string().describe('Current API version'),
  supportedVersions: z
    .array(z.string())
    .describe('Currently supported versions'),
  deprecatedVersions: z
    .array(
      z.object({
        version: z.string(),
        deprecationDate: z.string().datetime(),
        sunsetDate: z.string().datetime(),
        migrationPath: z.string().describe('Migration guide URL'),
      }),
    )
    .describe('Deprecated versions'),
  compatibilityRules: z
    .array(
      z.object({
        fromVersion: z.string(),
        toVersion: z.string(),
        compatibility: z.enum(['full', 'partial', 'breaking']),
        requiredChanges: z.array(z.string()).optional(),
        automatedMigration: z.boolean().default(false),
      }),
    )
    .describe('Version compatibility rules'),
});

export type APICompatibilityMatrix = z.infer<
  typeof APICompatibilityMatrixSchema
>;

/**
 * API migration plan
 */
export const APIMigrationPlanSchema = z.object({
  sourceVersion: z.string(),
  targetVersion: z.string(),
  migrationDate: z.string().datetime(),
  steps: z.array(
    z.object({
      step: z.number(),
      description: z.string(),
      breakingChange: z.boolean(),
      automated: z.boolean(),
      scriptUrl: z.string().url().optional(),
      manualInstructions: z.string().optional(),
      estimatedDowntime: z
        .number()
        .optional()
        .describe('Estimated downtime in minutes'),
    }),
  ),
  testingRequirements: z.object({
    regressionTests: z.array(z.string()),
    integrationTests: z.array(z.string()),
    performanceTests: z.array(z.string()),
    complianceTests: z.array(z.string()),
  }),
  rollbackPlan: z.object({
    enabled: z.boolean(),
    procedure: z.string(),
    maximumRollbackTime: z
      .number()
      .describe('Maximum rollback time in minutes'),
  }),
});

export type APIMigrationPlan = z.infer<typeof APIMigrationPlanSchema>;

// ============================================================================
// API CONTRACT VALIDATION
// ============================================================================

/**
 * API contract validation result
 */
export const APIContractValidationResultSchema = z.object({
  contractId: z.string(),
  isValid: z.boolean(),
  timestamp: z.string().datetime(),
  validator: z.string(),
  errors: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      path: z.string(),
      severity: z.enum(['error', 'warning', 'info']),
    }),
  ),
  warnings: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      path: z.string(),
    }),
  ),
  complianceScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Compliance score percentage'),
  recommendations: z.array(z.string()).optional(),
});

export type APIContractValidationResult = z.infer<
  typeof APIContractValidationResultSchema
>;

/**
 * API contract validator interface
 */
export interface APIContractValidator {
  validateContract(contract: APIContract): Promise<APIContractValidationResult>;
  validateOpenAPISpec(spec: OpenAPISpec): Promise<APIContractValidationResult>;
  validateHealthcareCompliance(
    contract: APIContract,
  ): Promise<APIContractValidationResult>;
}

// ============================================================================
// DEFAULT CONTRACTS AND EXPORTS
// ============================================================================

/**
 * Default healthcare API contract template
 */
export const DEFAULT_HEALTHCARE_API_CONTRACT: Partial<APIContract> = {
  version: '1.0.0',
  apiInfo: {
    title: 'NeonPro Healthcare API',
    description: 'Comprehensive healthcare platform API with LGPD, ANVISA, and CFM compliance',
    version: '1.0.0',
    contact: {
      name: 'NeonPro Development Team',
      email: 'dev@neonpro.com.br',
    },
  },
  healthcareCompliance: {
    lgpdCompliant: true,
    cfmCompliance: true,
    securityMeasures: [
      'encryption_in_transit',
      'encryption_at_rest',
      'access_controls',
      'audit_logging',
      'data_minimization',
      'pseudonymization',
    ],
  },
  security: {
    authentication: ['bearer', 'apiKey'],
    authorization: {
      model: 'rbac',
      roles: ['admin', 'professional', 'receptionist'],
    },
    encryption: {
      inTransit: true,
      atRest: true,
      algorithm: 'AES-256',
    },
  },
};

/**
 * Healthcare-specific OpenAPI extensions
 */
export const HEALTHCARE_OPENAPI_EXTENSIONS = {
  'x-healthcare': {
    regulatoryFramework: ['LGPD', 'ANVISA', 'CFM'],
    dataClassification: 'confidential',
    patientDataProcessing: true,
    auditRequirements: {
      enabled: true,
      retentionPeriodDays: 365,
      logSensitiveOperations: true,
    },
    dataProtection: {
      encryptionInTransit: true,
      encryptionAtRest: true,
      pseudonymization: true,
      dataMinimization: true,
    },
  },
};

/**
 * Export utility functions
 */
export class APIContractUtils {
  /**
   * Generate API version from semantic version
   */
  static generateVersion(
    version: string,
    metadata: Partial<APIVersion> = {},
  ): APIVersion {
    return APIVersionSchema.parse({
      version,
      status: 'active',
      releaseDate: new Date().toISOString(),
      complianceFrameworks: ['LGPD', 'ANVISA'],
      healthcareRegulatoryStatus: 'compliant',
      requiresAuthentication: true,
      supportedEnvironments: ['development', 'staging', 'production'],
      ...metadata,
    });
  }

  /**
   * Validate API contract against healthcare requirements
   */
  static validateHealthcareCompliance(contract: APIContract): string[] {
    const issues: string[] = [];

    // Check LGPD compliance
    if (!contract.healthcareCompliance.lgpdCompliant) {
      issues.push('LGPD compliance is required for healthcare APIs');
    }

    // Check healthcare compliance requirements
    if (!contract.healthcareCompliance.securityMeasures.length) {
      issues.push('Security measures must be defined for healthcare APIs');
    }

    // Validate patient data endpoints
    const patientDataEndpoints = contract.endpoints.filter(
      e => e.healthcareContext.involvesPatientData,
    );
    if (
      patientDataEndpoints.length > 0
      && !contract.healthcareCompliance.auditRequirements
    ) {
      issues.push('Audit logging is required for APIs processing patient data');
    }

    return issues;
  }

  /**
   * Generate OpenAPI specification from API contract
   */
  static generateOpenAPISpec(contract: APIContract): OpenAPISpec {
    return OpenAPISpecSchema.parse({
      openapi: '3.1.0',
      info: contract.apiInfo,
      ...HEALTHCARE_OPENAPI_EXTENSIONS,
      servers: [
        {
          url: 'https://api.neonpro.com.br/v1',
          description: 'Production environment',
        },
      ],
      paths: {},
      components: {
        schemas: contract.schemas || {},
      },
      tags: [
        {
          name: 'healthcare',
          description: 'Healthcare API endpoints',
        },
      ],
    });
  }
}
