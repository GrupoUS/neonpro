import { z } from 'zod';
import { SeverityLevel } from './codebase-analysis';

// Package health metrics
export const PackageHealthMetricsSchema = z.object({
  maintainability: z.object({
    score: z.number().min(0).max(100),
    issues: z.number().nonnegative(),
    codeSmells: z.number().nonnegative(),
    technicalDebt: z.number().nonnegative(),
    duplications: z.number().nonnegative(),
  }),
  security: z.object({
    score: z.number().min(0).max(100),
    vulnerabilities: z.number().nonnegative(),
    criticalVulnerabilities: z.number().nonnegative(),
    outdatedDependencies: z.number().nonnegative(),
    licenseIssues: z.number().nonnegative(),
  }),
  performance: z.object({
    score: z.number().min(0).max(100),
    bundleSize: z.number().nonnegative(),
    loadTime: z.number().nonnegative(),
    memoryUsage: z.number().nonnegative(),
    cpuUsage: z.number().nonnegative(),
  }),
  testCoverage: z.object({
    score: z.number().min(0).max(100),
    lineCoverage: z.number().min(0).max(100),
    branchCoverage: z.number().min(0).max(100),
    functionCoverage: z.number().min(0).max(100),
    testCount: z.number().nonnegative(),
  }),
  healthcareCompliance: z.object({
    score: z.number().min(0).max(100),
    lgpdViolations: z.number().nonnegative(),
    anvisaViolations: z.number().nonnegative(),
    professionalCouncilViolations: z.number().nonnegative(),
    accessibilityIssues: z.number().nonnegative(),
  }),
});

// Dependency information
export const DependencySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  type: z.enum(['production', 'development', 'peer', 'optional']),
  range: z.string().min(1),
  resolvedVersion: z.string().min(1),
  license: z.string().optional(),
  author: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  fileCount: z.number().nonnegative().optional(),
  size: z.number().nonnegative().optional(),
  healthcareRelevant: z.boolean().default(false),
  brazilianHealthcarePackage: z.boolean().default(false),
  anvisaApproved: z.boolean().default(false),
});

// Dependency vulnerability information
export const VulnerabilitySchema = z.object({
  id: z.string().min(1),
  severity: SeverityLevel,
  title: z.string().min(1),
  description: z.string().min(1),
  packageName: z.string().min(1),
  affectedVersions: z.string().min(1),
  patchedVersions: z.string().min(1),
  cvssScore: z.number().min(0).max(10).optional(),
  cvssVector: z.string().optional(),
  cveId: z.string().optional(),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  references: z.array(z.string().url()),
  exploitAvailable: z.boolean().default(false),
  healthcareImpact: z.enum(['none', 'low', 'medium', 'high', 'critical']).default('none'),
});

// License information
export const LicenseSchema = z.object({
  name: z.string().min(1),
  spdxId: z.string().min(1),
  url: z.string().url().optional(),
  isCommercial: z.boolean().default(false),
  isCopyleft: z.boolean().default(false),
  isPermissive: z.boolean().default(false),
  healthcareCompatible: z.boolean().default(true),
  brazilianCompliant: z.boolean().default(true),
});

// Bundle analysis
export const BundleAnalysisSchema = z.object({
  totalSize: z.number().nonnegative(),
  gzipSize: z.number().nonnegative(),
  brotliSize: z.number().nonnegative(),
  chunkCount: z.number().nonnegative(),
  moduleCount: z.number().nonnegative(),
  assetCount: z.number().nonnegative(),
  largestAsset: z.object({
    name: z.string().min(1),
    size: z.number().nonnegative(),
    percentage: z.number().min(0).max(100),
  }),
  duplicates: z.array(z.object({
    module: z.string().min(1),
    size: z.number().nonnegative(),
    occurrences: z.number().positive(),
  })),
  treeshakingEfficiency: z.number().min(0).max(100),
});

// Update recommendations
export const UpdateRecommendationSchema = z.object({
  packageName: z.string().min(1),
  currentVersion: z.string().min(1),
  recommendedVersion: z.string().min(1),
  updateType: z.enum(['patch', 'minor', 'major']),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  reasons: z.array(z.string()),
  breakingChanges: z.array(z.string()),
  healthcareRelevance: z.boolean().default(false),
  estimatedEffort: z.enum(['trivial', 'easy', 'moderate', 'complex', 'major']),
  dependenciesToUpdate: z.array(z.string()),
});

// Healthcare-specific package analysis
export const HealthcarePackageAnalysisSchema = z.object({
  isHealthcarePackage: z.boolean().default(false),
  healthcareDomain: z.enum([
    'appointments',
    'patients',
    'professionals',
    'treatments',
    'billing',
    'inventory',
    'telemedicine',
    'diagnostics',
    'imaging',
    'pharmacy',
    'none',
  ]).default('none'),
  anvisaCompliance: z.object({
    compliant: z.boolean(),
    lastChecked: z.string().datetime(),
    certificateNumber: z.string().optional(),
    expirationDate: z.string().datetime().optional(),
    violations: z.array(z.string()),
  }),
  lgpdCompliance: z.object({
    dataProcessing: z.boolean(),
    consentManagement: z.boolean(),
    auditTrail: z.boolean(),
    dataEncryption: z.boolean(),
    rightToErasure: z.boolean(),
    lastValidated: z.string().datetime(),
  }),
  professionalCouncilCompliance: z.object({
    cfmCompliant: z.boolean(),
    corenCompliant: z.boolean(),
    cffCompliant: z.boolean(),
    cnepCompliant: z.boolean(),
    lastValidated: z.string().datetime(),
  }),
  brazilianPortugueseSupport: z.object({
    translations: z.boolean(),
    localeSupport: z.boolean(),
    culturalAdaptation: z.boolean(),
    lastUpdated: z.string().datetime(),
  }),
});

// Main PackageAnalysis entity
export const PackageAnalysisSchema = z.object({
  id: z.string().uuid(),
  analysisId: z.string().uuid(),
  packageName: z.string().min(1),
  packageVersion: z.string().min(1),
  packagePath: z.string().min(1),
  healthMetrics: PackageHealthMetricsSchema,
  dependencies: z.array(DependencySchema),
  vulnerabilities: z.array(VulnerabilitySchema),
  license: LicenseSchema.optional(),
  bundleAnalysis: BundleAnalysisSchema.optional(),
  updateRecommendations: z.array(UpdateRecommendationSchema),
  healthcareAnalysis: HealthcarePackageAnalysisSchema,
  
  // Additional metrics
  totalDependencies: z.number().nonnegative(),
  directDependencies: z.number().nonnegative(),
  devDependencies: z.number().nonnegative(),
  peerDependencies: z.number().nonnegative(),
  optionalDependencies: z.number().nonnegative(),
  circularDependencies: z.number().nonnegative(),
  orphanDependencies: z.number().nonnegative(),
  
  // Healthcare-specific metrics
  healthcareDependencies: z.number().nonnegative(),
  brazilianPackages: z.number().nonnegative(),
  anvisaApprovedPackages: z.number().nonnegative(),
  
  // Status and metadata
  overallHealthScore: z.number().min(0).max(100),
  securityScore: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100),
  healthcareComplianceScore: z.number().min(0).max(100),
  criticalIssues: z.number().nonnegative(),
  requiresImmediateAction: z.boolean().default(false),
  lastScanned: z.string().datetime(),
  scanDuration: z.number().positive(), // in milliseconds
  
  // Audit trail
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().positive().default(1),
});

// Validation schemas for operations
export const CreatePackageAnalysisSchema = PackageAnalysisSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  overallHealthScore: true,
  securityScore: true,
  performanceScore: true,
  healthcareComplianceScore: true,
  criticalIssues: true,
  requiresImmediateAction: true,
  lastScanned: true,
  scanDuration: true,
}).extend({
  // Additional validation for creation
  analysisId: z.string().uuid(),
  packageName: z.string().min(1),
  packageVersion: z.string().min(1),
  packagePath: z.string().min(1),
});

export const UpdatePackageAnalysisSchema = PackageAnalysisSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().positive(),
});

// Type exports
export type PackageAnalysis = z.infer<typeof PackageAnalysisSchema>;
export type CreatePackageAnalysis = z.infer<typeof CreatePackageAnalysisSchema>;
export type UpdatePackageAnalysis = z.infer<typeof UpdatePackageAnalysisSchema>;
export type PackageHealthMetrics = z.infer<typeof PackageHealthMetricsSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type Vulnerability = z.infer<typeof VulnerabilitySchema>;
export type License = z.infer<typeof LicenseSchema>;
export type BundleAnalysis = z.infer<typeof BundleAnalysisSchema>;
export type UpdateRecommendation = z.infer<typeof UpdateRecommendationSchema>;
export type HealthcarePackageAnalysis = z.infer<typeof HealthcarePackageAnalysisSchema>;