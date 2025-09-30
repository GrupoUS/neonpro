// Analysis domain schemas for monorepo architectural analysis
// Healthcare compliance focused for Brazilian aesthetic clinics

export * from './codebase-analysis';
export * from './finding';
export * from './package-analysis';
export * from './duplication-finding';

// Re-exports for backward compatibility
export {
  CodebaseAnalysisSchema,
  CreateCodebaseAnalysisSchema,
  UpdateCodebaseAnalysisSchema,
  type CodebaseAnalysis,
  type CreateCodebaseAnalysis,
  type UpdateCodebaseAnalysis,
} from './codebase-analysis';

export {
  FindingSchema,
  CreateFindingSchema,
  UpdateFindingSchema,
  AcknowledgeFindingSchema,
  ResolveFindingSchema,
  type Finding,
  type CreateFinding,
  type UpdateFinding,
  type AcknowledgeFinding,
  type ResolveFinding,
} from './finding';

export {
  PackageAnalysisSchema,
  CreatePackageAnalysisSchema,
  UpdatePackageAnalysisSchema,
  type PackageAnalysis,
  type CreatePackageAnalysis,
  type UpdatePackageAnalysis,
} from './package-analysis';

export {
  DuplicationFindingSchema,
  CreateDuplicationFindingSchema,
  UpdateDuplicationFindingSchema,
  ResolveDuplicationFindingSchema,
  type DuplicationFinding,
  type CreateDuplicationFinding,
  type UpdateDuplicationFinding,
  type ResolveDuplicationFinding,
} from './duplication-finding';