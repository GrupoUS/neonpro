// TypeScript-aware jscpd configuration for duplication detection
// Optimized for healthcare compliance and Brazilian aesthetic clinics

export interface JscpdConfiguration {
  // Basic jscpd configuration
  minLines: number;
  maxLines: number;
  minTokens: number;
  threshold: number; // Similarity threshold (0-1)
  ignoreCase: boolean;
  encoding: string;
  
  // TypeScript-specific configuration
  typescript: {
    analyzeTypeAnnotations: boolean;
    analyzeGenerics: boolean;
    analyzeInterfaces: boolean;
    analyzeDecorators: boolean;
    analyzeEnums: boolean;
    treatTypesAsIdentifiers: boolean;
    ignoreTypeOnlyImports: boolean;
    analyzeMethodOverloads: boolean;
  };
  
  // Healthcare-specific configuration
  healthcare: {
    patientDataPatterns: string[];
    clinicalLogicPatterns: string[];
    validationLogicPatterns: string[];
    businessLogicPatterns: string[];
    treatPatientDataAsCritical: boolean;
    requireSeparationOfConcerns: boolean;
  };
  
  // Brazilian Portuguese patterns
  brazilian: {
    portugueseIdentifiers: string[];
    healthcareTerms: string[];
    clinicTerms: string[];
    medicalTerms: string[];
  };
  
  // Performance optimization
  performance: {
    maxFileSize: number;
    maxFilesPerBatch: number;
    parallelProcessing: boolean;
    memoryLimit: number;
    timeoutMs: number;
  };
  
  // Output configuration
  output: {
    format: 'json' | 'xml' | 'html' | 'markdown';
    includeMetrics: boolean;
    includeRefactoringSuggestions: boolean;
    includeHealthcareAnalysis: boolean;
  };
  
  // Path patterns
  patterns: {
    include: string[];
    exclude: string[];
    excludeTestFiles: boolean;
    excludeGeneratedFiles: boolean;
    excludeNodeModules: boolean;
  };
}

export interface JscpdAnalysisResult {
  summary: {
    totalFiles: number;
    totalLines: number;
    duplicateLines: number;
    duplicationPercentage: number;
    clusters: number;
    executionTime: number;
  };
  
  clusters: DuplicationCluster[];
  
  metrics: {
    tokenBased: TokenBasedMetrics;
    structural: StructuralMetrics;
    healthcare: HealthcareMetrics;
    performance: PerformanceMetrics;
  };
  
  refactoringSuggestions: RefactoringSuggestion[];
  
  healthcareAnalysis: {
    patientDataDuplications: PatientDataDuplication[];
    clinicalLogicDuplications: ClinicalLogicDuplication[];
    validationLogicDuplications: ValidationLogicDuplication[];
    complianceRisks: ComplianceRisk[];
  };
}

export interface DuplicationCluster {
  id: string;
  files: string[];
  lines: number;
  tokens: number;
  similarity: number;
  firstOccurrence: {
    file: string;
    startLine: number;
    endLine: number;
  };
  occurrences: Array<{
    file: string;
    startLine: number;
    endLine: number;
    similarity: number;
  }>;
  
  // TypeScript-specific analysis
  typescriptAnalysis: {
    hasTypeAnnotations: boolean;
    hasGenerics: boolean;
    hasInterfaces: boolean;
    hasDecorators: boolean;
    typeComplexity: number;
  };
  
  // Healthcare relevance
  healthcareRelevance: {
    patientDataInvolved: boolean;
    clinicalLogic: boolean;
    validationLogic: boolean;
    businessLogic: boolean;
    lgpdRelevant: boolean;
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface TokenBasedMetrics {
  totalTokens: number;
  duplicateTokens: number;
  uniqueTokens: number;
  identifierTokens: number;
  keywordTokens: number;
  operatorTokens: number;
  literalTokens: number;
  typeAnnotationTokens: number;
  genericTokens: number;
}

export interface StructuralMetrics {
  functionsDuplicated: number;
  classesDuplicated: number;
  interfacesDuplicated: number;
  methodsDuplicated: number;
  propertiesDuplicated: number;
  importsDuplicated: number;
  exportsDuplicated: number;
  complexityScore: number;
}

export interface HealthcareMetrics {
  patientDataPatterns: number;
  clinicalLogicPatterns: number;
  validationLogicPatterns: number;
  businessLogicPatterns: number;
  lgpdViolations: number;
  anvisaViolations: number;
  professionalCouncilViolations: number;
  complianceScore: number;
}

export interface PerformanceMetrics {
  filesProcessed: number;
  linesProcessed: number;
  tokensProcessed: number;
  processingTime: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface RefactoringSuggestion {
  clusterId: string;
  type: 'extract_function' | 'extract_class' | 'create_base_class' | 'use_composition';
  title: string;
  description: string;
  effort: 'trivial' | 'easy' | 'moderate' | 'complex';
  impact: {
    maintainability: number;
    readability: number;
    testability: number;
    performance: number;
  };
  healthcareImpact: {
    patientDataSafety: 'improved' | 'unchanged' | 'degraded';
    compliance: 'improved' | 'unchanged' | 'degraded';
    validation: 'improved' | 'unchanged' | 'degraded';
  };
  codeExample?: {
    before: string;
    after: string;
  };
}

export interface PatientDataDuplication {
  pattern: string;
  occurrences: Array<{
    file: string;
    line: number;
    context: string;
  }>;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface ClinicalLogicDuplication {
  pattern: string;
  occurrences: Array<{
    file: string;
    line: number;
    context: string;
  }>;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface ValidationLogicDuplication {
  pattern: string;
  occurrences: Array<{
    file: string;
    line: number;
    context: string;
  }>;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface ComplianceRisk {
  type: 'lgpd' | 'anvisa' | 'cfm' | 'coren' | 'cff' | 'cnep';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  files: string[];
  recommendation: string;
  requiresImmediateAction: boolean;
}

// Type guards
export function isDuplicationCluster(obj: any): obj is DuplicationCluster {
  return obj && 
    typeof obj.id === 'string' &&
    Array.isArray(obj.files) &&
    typeof obj.lines === 'number' &&
    typeof obj.tokens === 'number' &&
    typeof obj.similarity === 'number';
}

export function isRefactoringSuggestion(obj: any): obj is RefactoringSuggestion {
  return obj &&
    typeof obj.clusterId === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string';
}