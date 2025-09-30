import { z } from 'zod';

// Healthcare compliance enums for Brazilian aesthetic clinics
export const HealthcareComplianceStandard = z.enum([
  'LGPD', // Lei Geral de Proteção de Dados
  'ANVISA', // Agência Nacional de Vigilância Sanitária
  'CFM', // Conselho Federal de Medicina
  'COREN', // Conselho Federal de Enfermagem
  'CFF', // Conselho Federal de Farmácia
  'CNEP', // Conselho Nacional de Estética Profissional
]);

export const AnalysisStatus = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

export const SeverityLevel = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);

export const AnalysisCategory = z.enum([
  'security',
  'performance',
  'architecture',
  'healthcare_compliance',
  'code_quality',
  'dependencies',
  'duplication',
  'accessibility',
  'lgpd_compliance',
]);

// Repository metadata for analysis context
export const RepositoryMetadataSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  branch: z.string().min(1),
  commit: z.string().min(1),
  commitMessage: z.string().optional(),
  author: z.string().optional(),
  timestamp: z.string().datetime(),
  languages: z.array(z.string()),
  totalFiles: z.number().nonnegative(),
  totalLines: z.number().nonnegative(),
});

// Analysis configuration with healthcare compliance focus
export const AnalysisConfigurationSchema = z.object({
  includePatterns: z.array(z.string()),
  excludePatterns: z.array(z.string()),
  maxFileSize: z.number().positive().default(1024 * 1024), // 1MB default
  maxDepth: z.number().positive().default(10),
  enableHealthcareCompliance: z.boolean().default(true),
  enableLGPDValidation: z.boolean().default(true),
  enableANVISAChecks: z.boolean().default(true),
  enableProfessionalCouncilValidation: z.boolean().default(true),
  language: z.enum(['pt-BR', 'en']).default('pt-BR'),
  healthcareDomains: z.array(z.string()).default([
    'appointments',
    'patients', 
    'professionals',
    'treatments',
    'billing',
    'inventory',
  ]),
  performanceThresholds: z.object({
    maxResponseTime: z.number().positive().default(500), // ms
    maxBundleSize: z.number().positive().default(1024 * 1024), // 1MB
    maxMemoryUsage: z.number().positive().default(512 * 1024 * 1024), // 512MB
    minTestCoverage: z.number().min(0).max(100).default(90),
  }),
});

// Healthcare compliance validation result
export const HealthcareComplianceResultSchema = z.object({
  standard: HealthcareComplianceStandard,
  status: z.enum(['compliant', 'non_compliant', 'partial', 'not_applicable']),
  score: z.number().min(0).max(100),
  findings: z.array(z.string()),
  recommendations: z.array(z.string()),
  lastValidated: z.string().datetime(),
  validatedBy: z.string().optional(),
  evidence: z.array(z.string()),
});

// Analysis metrics with healthcare focus
export const AnalysisMetricsSchema = z.object({
  totalFiles: z.number().nonnegative(),
  totalLines: z.number().nonnegative(),
  totalPackages: z.number().nonnegative(),
  totalDependencies: z.number().nonnegative(),
  duplicatesFound: z.number().nonnegative(),
  violationsFound: z.number().nonnegative(),
  securityIssues: z.number().nonnegative(),
  performanceIssues: z.number().nonnegative(),
  accessibilityIssues: z.number().nonnegative(),
  lgpdViolations: z.number().nonnegative(),
  healthcareComplianceScore: z.number().min(0).max(100),
  overallComplianceScore: z.number().min(0).max(100),
  testCoverage: z.number().min(0).max(100),
  bundleSizeTotal: z.number().nonnegative(),
  analysisDuration: z.number().positive(), // in milliseconds
  memoryUsage: z.number().nonnegative(), // in bytes
});

// Audit trail entry for healthcare compliance tracking
export const AuditTrailEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  action: z.string().min(1),
  actor: z.string().min(1),
  details: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  complianceImpact: z.enum(['positive', 'negative', 'neutral']).default('neutral'),
  lgpdRelevant: z.boolean().default(false),
  previousState: z.any().optional(),
  newState: z.any().optional(),
});

// Main CodebaseAnalysis entity
export const CodebaseAnalysisSchema = z.object({
  id: z.string().uuid(),
  repository: RepositoryMetadataSchema,
  configuration: AnalysisConfigurationSchema,
  status: AnalysisStatus,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
  metrics: AnalysisMetricsSchema.optional(),
  healthcareCompliance: z.array(HealthcareComplianceResultSchema),
  auditTrail: z.array(AuditTrailEntrySchema),
  findings: z.array(z.string()), // IDs of related findings
  packageAnalyses: z.array(z.string()), // IDs of related package analyses
  duplicationFindings: z.array(z.string()), // IDs of related duplication findings
  lgpdComplianceValidated: z.boolean().default(false),
  anvisaComplianceValidated: z.boolean().default(false),
  professionalCouncilComplianceValidated: z.boolean().default(false),
  version: z.number().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schemas for creating and updating analyses
export const CreateCodebaseAnalysisSchema = CodebaseAnalysisSchema.omit({
  id: true,
  status: true,
  startedAt: true,
  completedAt: true,
  error: true,
  metrics: true,
  healthcareCompliance: true,
  auditTrail: true,
  findings: true,
  packageAnalyses: true,
  duplicationFindings: true,
  lgpdComplianceValidated: true,
  anvisaComplianceValidated: true,
  professionalCouncilComplianceValidated: true,
  version: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Additional validation for creation
  repository: RepositoryMetadataSchema,
  configuration: AnalysisConfigurationSchema,
});

export const UpdateCodebaseAnalysisSchema = CodebaseAnalysisSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().positive(),
});

// Type exports
export type CodebaseAnalysis = z.infer<typeof CodebaseAnalysisSchema>;
export type CreateCodebaseAnalysis = z.infer<typeof CreateCodebaseAnalysisSchema>;
export type UpdateCodebaseAnalysis = z.infer<typeof UpdateCodebaseAnalysisSchema>;
export type RepositoryMetadata = z.infer<typeof RepositoryMetadataSchema>;
export type AnalysisConfiguration = z.infer<typeof AnalysisConfigurationSchema>;
export type HealthcareComplianceResult = z.infer<typeof HealthcareComplianceResultSchema>;
export type AnalysisMetrics = z.infer<typeof AnalysisMetricsSchema>;
export type AuditTrailEntry = z.infer<typeof AuditTrailEntrySchema>;