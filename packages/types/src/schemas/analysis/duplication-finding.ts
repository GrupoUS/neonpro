import { z } from 'zod';
import { SeverityLevel } from './codebase-analysis';

// Duplication detection algorithm types
export const DuplicationAlgorithm = z.enum([
  'jscpd', // JavaScript/TypeScript copy-paste detector
  'jscpd-typescript', // TypeScript-aware jscpd
  'simian', // Similarity analyzer
  'cpd', // PMD copy-paste detector
  'drdup', // Duplicate code detector
  'custom', // Custom algorithm
]);

// Similarity metrics
export const SimilarityMetricsSchema = z.object({
  similarityScore: z.number().min(0).max(1),
  tokenSimilarity: z.number().min(0).max(1),
  structuralSimilarity: z.number().min(0).max(1),
  semanticSimilarity: z.number().min(0).max(1),
  editDistance: z.number().nonnegative(),
  longestCommonSubsequence: z.number().nonnegative(),
  jaccardIndex: z.number().min(0).max(1),
  cosineSimilarity: z.number().min(0).max(1),
});

// Token-based analysis for TypeScript
export const TokenAnalysisSchema = z.object({
  totalTokens: z.number().nonnegative(),
  duplicateTokens: z.number().nonnegative(),
  uniqueTokens: z.number().nonnegative(),
  identifiers: z.array(z.string()),
  literals: z.array(z.string()),
  keywords: z.array(z.string()),
  operators: z.array(z.string()),
  typescriptSpecific: z.object({
    typeAnnotations: z.array(z.string()),
    interfaces: z.array(z.string()),
    generics: z.array(z.string()),
    decorators: z.array(z.string()),
    enums: z.array(z.string()),
  }),
});

// Structural analysis for code patterns
export const StructuralAnalysisSchema = z.object({
  functions: z.array(z.object({
    name: z.string(),
    parameters: z.number(),
    lines: z.number(),
    complexity: z.number(),
    nesting: z.number(),
  })),
  classes: z.array(z.object({
    name: z.string(),
    methods: z.number(),
    properties: z.number(),
    inheritance: z.number(),
    interfaces: z.array(z.string()),
  })),
  interfaces: z.array(z.object({
    name: z.string(),
    methods: z.number(),
    properties: z.number(),
    generics: z.number(),
  })),
  imports: z.array(z.object({
    module: z.string(),
    isExternal: z.boolean(),
    isTypeOnly: z.boolean(),
  })),
});

// Location of duplicated code fragment
export const DuplicationLocationSchema = z.object({
  filePath: z.string().min(1),
  startLine: z.number().positive(),
  endLine: z.number().positive(),
  startColumn: z.number().positive().default(1),
  endColumn: z.number().positive().default(1),
  functionName: z.string().optional(),
  className: z.string().optional(),
  componentName: z.string().optional(),
  package: z.string().optional(),
  module: z.string().optional(),
  lines: z.array(z.string()),
  formattedLines: z.array(z.string()).optional(),
});

// Duplication cluster containing multiple instances
export const DuplicationClusterSchema = z.object({
  id: z.string().uuid(),
  locations: z.array(DuplicationLocationSchema).min(2),
  similarityMetrics: SimilarityMetricsSchema,
  tokenAnalysis: TokenAnalysisSchema,
  structuralAnalysis: StructuralAnalysisSchema,
  algorithm: DuplicationAlgorithm,
  detectedAt: z.string().datetime(),
  
  // Healthcare-specific duplication analysis
  healthcareRelevance: z.enum(['none', 'low', 'medium', 'high', 'critical']).default('none'),
  patientDataInvolved: z.boolean().default(false),
  lgpdImplications: z.boolean().default(false),
  clinicalLogic: z.boolean().default(false),
  businessLogic: z.boolean().default(false),
  validationLogic: z.boolean().default(false),
  
  // Duplication characteristics
  duplicateLines: z.number().nonnegative(),
  totalLines: z.number().nonnegative(),
  duplicationPercentage: z.number().min(0).max(100),
  codeMass: z.number().nonnegative(), // in bytes
  estimatedRemovalSize: z.number().nonnegative(), // in bytes
  
  // Quality impact
  maintainabilityImpact: z.enum(['none', 'minor', 'moderate', 'major', 'severe']),
  readabilityImpact: z.enum(['none', 'minor', 'moderate', 'major', 'severe']),
  testabilityImpact: z.enum(['none', 'minor', 'moderate', 'major', 'severe']),
  documentationRequired: z.boolean().default(false),
  
  // Metadata
  patternType: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  falsePositive: z.boolean().default(false),
  falsePositiveReason: z.string().optional(),
});

// Refactoring suggestion for duplicated code
export const RefactoringSuggestionSchema = z.object({
  id: z.string().uuid(),
  clusterId: z.string().uuid(),
  suggestionType: z.enum([
    'extract_function',
    'extract_method',
    'extract_class',
    'extract_module',
    'create_base_class',
    'use_composition',
    'create_template',
    'use_generics',
    'create_utility',
    'custom',
  ]),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['immediate', 'urgent', 'high', 'medium', 'low']),
  effort: z.enum(['trivial', 'easy', 'moderate', 'complex', 'major']),
  
  // Code examples
  beforeCode: z.array(z.string()).optional(),
  afterCode: z.array(z.string()).optional(),
  extractionName: z.string().optional(),
  parameterCount: z.number().nonnegative().optional(),
  
  // Impact assessment
  maintainabilityImprovement: z.number().min(0).max(100),
  codeReduction: z.number().min(0).max(100),
  testSimplification: z.number().min(0).max(100),
  
  // Healthcare-specific considerations
  healthcareImpact: z.enum(['none', 'positive', 'negative', 'neutral']).default('neutral'),
  patientDataSafety: z.enum(['improved', 'unchanged', 'degraded']).default('unchanged'),
  complianceImpact: z.enum(['improved', 'unchanged', 'degraded']).default('unchanged'),
  validationImpact: z.enum(['improved', 'unchanged', 'degraded']).default('unchanged'),
  
  // Implementation details
  dependencies: z.array(z.string()),
  risks: z.array(z.string()),
  benefits: z.array(z.string()),
  estimatedTime: z.number().positive().optional(), // in minutes
  requiresTesting: z.boolean().default(true),
  requiresDocumentation: z.boolean().default(true),
  
  // Metadata
  createdAt: z.string().datetime(),
  automated: z.boolean().default(false),
  confidence: z.number().min(0).max(1),
});

// Main DuplicationFinding entity
export const DuplicationFindingSchema = z.object({
  id: z.string().uuid(),
  analysisId: z.string().uuid(),
  cluster: DuplicationClusterSchema,
  refactoringSuggestions: z.array(RefactoringSuggestionSchema),
  
  // Severity and impact
  severity: SeverityLevel,
  impactScore: z.number().min(0).max(100),
  healthcareImpactScore: z.number().min(0).max(100),
  
  // Metrics
  totalDuplicates: z.number().nonnegative(),
  totalLines: z.number().nonnegative(),
  duplicateLines: z.number().nonnegative(),
  duplicationPercentage: z.number().min(0).max(100),
  estimatedSavings: z.number().nonnegative(), // in bytes
  
  // Detection information
  algorithm: DuplicationAlgorithm,
  detectionConfig: z.record(z.any()).optional(),
  detectedAt: z.string().datetime(),
  scanDuration: z.number().positive(), // in milliseconds
  
  // Healthcare-specific analysis
  healthcareDomains: z.array(z.string()),
  patientDataClusters: z.array(z.string()),
  lgpdRelevantClusters: z.array(z.string()),
  clinicalLogicClusters: z.array(z.string()),
  validationLogicClusters: z.array(z.string()),
  
  // Status and workflow
  status: z.enum(['detected', 'analyzing', 'planned', 'in_progress', 'resolved', 'false_positive']).default('detected'),
  assignedTo: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionMethod: z.enum(['refactored', 'accepted', 'false_positive', 'deferred']).optional(),
  resolutionNotes: z.string().optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  falsePositive: z.boolean().default(false),
  falsePositiveReason: z.string().optional(),
  requiresImmediateAction: z.boolean().default(false),
  estimatedBusinessValue: z.number().nonnegative().optional(),
  estimatedTechnicalDebt: z.number().nonnegative().optional(),
  
  // Audit trail
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().positive().default(1),
});

// Validation schemas for operations
export const CreateDuplicationFindingSchema = DuplicationFindingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  status: true,
  assignedTo: true,
  reviewedBy: true,
  reviewedAt: true,
  resolvedAt: true,
  resolutionMethod: true,
  resolutionNotes: true,
  falsePositive: true,
  falsePositiveReason: true,
}).extend({
  // Additional validation for creation
  analysisId: z.string().uuid(),
  cluster: DuplicationClusterSchema,
});

export const UpdateDuplicationFindingSchema = DuplicationFindingSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().positive(),
});

export const ResolveDuplicationFindingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['resolved', 'false_positive', 'deferred']),
  resolutionMethod: z.enum(['refactored', 'accepted', 'false_positive', 'deferred']),
  resolvedBy: z.string().min(1),
  resolutionNotes: z.string().min(1),
  falsePositiveReason: z.string().optional(),
  refactoringImplemented: z.array(z.string()).optional(),
});

// Type exports
export type DuplicationFinding = z.infer<typeof DuplicationFindingSchema>;
export type CreateDuplicationFinding = z.infer<typeof CreateDuplicationFindingSchema>;
export type UpdateDuplicationFinding = z.infer<typeof UpdateDuplicationFindingSchema>;
export type ResolveDuplicationFinding = z.infer<typeof ResolveDuplicationFindingSchema>;
export type DuplicationCluster = z.infer<typeof DuplicationClusterSchema>;
export type RefactoringSuggestion = z.infer<typeof RefactoringSuggestionSchema>;
export type SimilarityMetrics = z.infer<typeof SimilarityMetricsSchema>;
export type TokenAnalysis = z.infer<typeof TokenAnalysisSchema>;
export type StructuralAnalysis = z.infer<typeof StructuralAnalysisSchema>;
export type DuplicationLocation = z.infer<typeof DuplicationLocationSchema>;