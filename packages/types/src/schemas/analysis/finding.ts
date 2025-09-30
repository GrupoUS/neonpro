import { z } from 'zod';
import { SeverityLevel, AnalysisCategory } from './codebase-analysis';

// Healthcare-specific impact assessment
export const HealthcareImpactSchema = z.object({
  patientDataRisk: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  regulatoryViolation: z.enum(['none', 'lgpd', 'anvisa', 'cfm', 'coren', 'cff', 'cnep', 'multiple']),
  operationalImpact: z.enum(['none', 'minor', 'moderate', 'major', 'critical']),
  financialRisk: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  reputationalRisk: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  complianceDeadline: z.string().datetime().optional(),
  finesPotential: z.number().nonnegative().optional(),
  patientImpactCount: z.number().nonnegative().default(0),
});

// Location information for findings
export const LocationSchema = z.object({
  filePath: z.string().min(1),
  lineNumber: z.number().positive().optional(),
  columnNumber: z.number().positive().optional(),
  endLineNumber: z.number().positive().optional(),
  endColumnNumber: z.number().positive().optional(),
  function: z.string().optional(),
  class: z.string().optional(),
  component: z.string().optional(),
  package: z.string().optional(),
  module: z.string().optional(),
});

// Pattern detection information
export const PatternDetectionSchema = z.object({
  patternType: z.string().min(1),
  pattern: z.string().min(1),
  confidence: z.number().min(0).max(1),
  detector: z.string().min(1),
  detectedAt: z.string().datetime(),
  context: z.string().optional(),
  matches: z.array(z.string()),
});

// Remedy suggestion with healthcare context
export const RemedySuggestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['immediate', 'urgent', 'high', 'medium', 'low']),
  effort: z.enum(['trivial', 'easy', 'moderate', 'complex', 'major']),
  automatedFix: z.boolean().default(false),
  fixScript: z.string().optional(),
  codeExample: z.string().optional(),
  healthcareConsiderations: z.array(z.string()).optional(),
  complianceReferences: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  estimatedTime: z.number().positive().optional(), // in minutes
});

// Healthcare compliance reference
export const ComplianceReferenceSchema = z.object({
  standard: z.enum(['LGPD', 'ANVISA', 'CFM', 'COREN', 'CFF', 'CNEP']),
  article: z.string().optional(),
  section: z.string().optional(),
  requirement: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional(),
  lastUpdated: z.string().datetime(),
});

// Risk assessment for healthcare context
export const RiskAssessmentSchema = z.object({
  overallRisk: z.enum(['minimal', 'low', 'medium', 'high', 'critical']),
  probability: z.enum(['rare', 'unlikely', 'possible', 'likely', 'certain']),
  impact: z.enum(['negligible', 'minor', 'moderate', 'major', 'severe']),
  riskScore: z.number().min(0).max(100),
  mitigationStrategies: z.array(z.string()),
  monitoringRequired: z.boolean().default(false),
  escalationRequired: z.boolean().default(false),
  reportingRequired: z.boolean().default(false),
});

// Main Finding entity
export const FindingSchema = z.object({
  id: z.string().uuid(),
  analysisId: z.string().uuid(),
  category: AnalysisCategory,
  severity: SeverityLevel,
  title: z.string().min(1),
  description: z.string().min(1),
  location: LocationSchema,
  healthcareImpact: HealthcareImpactSchema,
  patternDetection: PatternDetectionSchema,
  remedySuggestions: z.array(RemedySuggestionSchema),
  complianceReferences: z.array(ComplianceReferenceSchema),
  riskAssessment: RiskAssessmentSchema,
  
  // Healthcare-specific fields
  patientDataInvolved: z.boolean().default(false),
  lgpdViolation: z.boolean().default(false),
  anvisaViolation: z.boolean().default(false),
  professionalCouncilViolation: z.boolean().default(false),
  requiresImmediateAction: z.boolean().default(false),
  reportingDeadline: z.string().datetime().optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  falsePositive: z.boolean().default(false),
  falsePositiveReason: z.string().optional(),
  acknowledged: z.boolean().default(false),
  acknowledgedBy: z.string().optional(),
  acknowledgedAt: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'false_positive', 'deferred']).default('open'),
  resolvedAt: z.string().datetime().optional(),
  resolvedBy: z.string().optional(),
  resolutionNotes: z.string().optional(),
  
  // Audit trail
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().positive().default(1),
});

// Validation schemas for operations
export const CreateFindingSchema = FindingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  acknowledged: true,
  acknowledgedBy: true,
  acknowledgedAt: true,
  falsePositive: true,
  falsePositiveReason: true,
  status: true,
  resolvedAt: true,
  resolvedBy: true,
  resolutionNotes: true,
}).extend({
  // Additional validation for creation
  analysisId: z.string().uuid(),
});

export const UpdateFindingSchema = FindingSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().positive(),
});

export const AcknowledgeFindingSchema = z.object({
  id: z.string().uuid(),
  acknowledged: z.boolean(),
  acknowledgedBy: z.string().min(1),
  notes: z.string().optional(),
});

export const ResolveFindingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['resolved', 'false_positive', 'deferred']),
  resolvedBy: z.string().min(1),
  resolutionNotes: z.string().min(1),
  falsePositiveReason: z.string().optional(),
});

// Type exports
export type Finding = z.infer<typeof FindingSchema>;
export type CreateFinding = z.infer<typeof CreateFindingSchema>;
export type UpdateFinding = z.infer<typeof UpdateFindingSchema>;
export type AcknowledgeFinding = z.infer<typeof AcknowledgeFindingSchema>;
export type ResolveFinding = z.infer<typeof ResolveFindingSchema>;
export type HealthcareImpact = z.infer<typeof HealthcareImpactSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type PatternDetection = z.infer<typeof PatternDetectionSchema>;
export type RemedySuggestion = z.infer<typeof RemedySuggestionSchema>;
export type ComplianceReference = z.infer<typeof ComplianceReferenceSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;