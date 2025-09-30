// Type definitions for Hono + tRPC v11 Edge-First Architecture Analysis
// Brazilian Healthcare Compliance Focused

export interface EdgePerformanceAnalysisResult {
  summary: {
    totalRoutes: number;
    edgeOptimizedRoutes: number;
    averageResponseTime: number;
    coldStartOccurrences: number;
    memoryUsage: number;
    bundleSize: number;
  };
  routes: RoutePerformanceData[];
  edgeOptimization: {
    enabled: boolean;
    provider: 'vercel' | 'cloudflare' | 'netlify';
    regions: string[];
    runtime: 'nodejs' | 'deno' | 'bun';
  };
  healthcare: {
    patientDataRoutes: number;
    clinicalLogicRoutes: number;
    lgpdCompliantRoutes: number;
    dataEncryptionEnabled: boolean;
  };
  recommendations: PerformanceRecommendation[];
}

export interface TrpcTypeSafetyAnalysisResult {
  summary: {
    totalProcedures: number;
    typeSafeProcedures: number;
    inputValidations: number;
    outputValidations: number;
    typeCoverage: number;
  };
  procedures: ProcedureTypeData[];
  validation: {
    inputSchemas: ValidationSchema[];
    outputSchemas: ValidationSchema[];
    typeInference: TypeInferenceData[];
  };
  healthcare: {
    patientDataTypeValidations: number;
    clinicalLogicValidations: number;
    complianceValidations: number;
    auditTrailValidations: number;
  };
  issues: TypeSafetyIssue[];
}

export interface ConcurrentRequestHandlingAnalysisResult {
  summary: {
    totalEndpoints: number;
    concurrentCapableEndpoints: number;
    rateLimitedEndpoints: number;
    queueEnabledEndpoints: number;
  };
  endpoints: ConcurrentRequestData[];
  performance: {
    peakConcurrentRequests: number;
    averageProcessingTime: number;
    queueDepth: number;
    timeoutOccurrences: number;
  };
  healthcare: {
    patientRequestConcurrency: number;
    clinicalRequestPriority: boolean;
    emergencyRequestBypass: boolean;
    complianceLogging: boolean;
  };
  recommendations: ConcurrencyRecommendation[];
}

export interface ErrorBoundaryPatternAnalysisResult {
  summary: {
    totalServices: number;
    servicesWithErrorBoundaries: number;
    errorRecoveryStrategies: number;
    patientDataErrorHandling: number;
  };
  services: ErrorBoundaryData[];
  patterns: {
    globalErrorHandlers: GlobalErrorHandler[];
    routeSpecificErrorHandlers: RouteErrorHandler[];
    patientDataErrorHandlers: PatientDataErrorHandler[];
  };
  healthcare: {
    patientDataErrorEncryption: boolean;
    clinicalErrorLogging: boolean;
    complianceErrorReporting: boolean;
    emergencyErrorProtocols: boolean;
  };
  recommendations: ErrorHandlingRecommendation[];
}

export interface MiddlewareIntegrationPatternAnalysisResult {
  summary: {
    totalMiddleware: number;
    securityMiddleware: number;
    healthcareMiddleware: number;
    performanceMiddleware: number;
    loggingMiddleware: number;
  };
  middleware: MiddlewareData[];
  patterns: {
    authentication: AuthenticationMiddleware[];
    authorization: AuthorizationMiddleware[];
    validation: ValidationMiddleware[];
    audit: AuditMiddleware[];
  };
  healthcare: {
    patientDataProtection: boolean;
    clinicalWorkflowValidation: boolean;
    lgpdComplianceChecks: boolean;
    professionalCouncilValidation: boolean;
  };
  recommendations: MiddlewareRecommendation[];
}

export interface RouteOptimizationAnalysisResult {
  summary: {
    totalRoutes: number;
    optimizedRoutes: number;
    cacheableRoutes: number;
    staticRoutes: number;
    dynamicRoutes: number;
  };
  routes: RouteOptimizationData[];
  performance: {
    averageResponseTime: number;
    cacheHitRate: number;
    compressionRatio: number;
    bundleSizeOptimized: boolean;
  };
  healthcare: {
    patientDataRoutesOptimized: number;
    clinicalRoutesOptimized: number;
    emergencyRoutesPrioritized: boolean;
    complianceRoutesCached: boolean;
  };
  recommendations: RouteOptimizationRecommendation[];
}

export interface TypePropagationAnalysisResult {
  summary: {
    totalTypes: number;
    propagatedTypes: number;
    clientServerSync: number;
    circularDependencies: number;
    typeComplexity: number;
  };
  types: TypePropagationData[];
  propagation: {
    frontendTypes: FrontendTypeData[];
    backendTypes: BackendTypeData[];
    sharedTypes: SharedTypeData[];
  };
  healthcare: {
    patientDataTypes: number;
    clinicalTypes: number;
    complianceTypes: number;
    auditTypes: number;
  };
  recommendations: TypePropagationRecommendation[];
}

export interface ServerClientTypeSynchronizationAnalysisResult {
  summary: {
    totalTypes: number;
    synchronizedTypes: number;
    mismatchedTypes: number;
    outdatedTypes: number;
  };
  synchronization: {
    serverTypes: ServerTypeData[];
    clientTypes: ClientTypeData[];
    syncStatus: SyncStatusData[];
  };
  healthcare: {
    patientDataSync: number;
    clinicalDataSync: number;
    complianceDataSync: number;
    auditDataSync: number;
  };
  issues: TypeSyncIssue[];
  recommendations: TypeSyncRecommendation[];
}

export interface PerformanceBenchmarkingResult {
  summary: {
    totalBenchmarks: number;
    passedBenchmarks: number;
    failedBenchmarks: number;
    averageScore: number;
  };
  benchmarks: BenchmarkData[];
  metrics: {
    responseTime: ResponseTimeMetric[];
    throughput: ThroughputMetric[];
    memoryUsage: MemoryUsageMetric[];
    errorRate: ErrorRateMetric[];
  };
  healthcare: {
    patientDataPerformance: number;
    clinicalSystemPerformance: number;
    complianceSystemPerformance: number;
    emergencySystemPerformance: number;
  };
  recommendations: PerformanceBenchmarkingRecommendation[];
}

export interface EdgeDeploymentPatternAnalysisResult {
  summary: {
    totalDeployments: number;
    edgeDeployments: number;
    hybridDeployments: number;
    traditionalDeployments: number;
  };
  deployments: EdgeDeploymentData[];
  patterns: {
    serverlessFunctions: ServerlessFunctionData[];
    edgeCompute: EdgeComputeData[];
    cdnIntegration: CDNIntegrationData[];
  };
  healthcare: {
    patientDataEdgeProcessing: boolean;
    clinicalLogicEdgeProcessing: boolean;
    complianceEdgeValidation: boolean;
    emergencyResponseEdgeOptimization: boolean;
  };
  recommendations: EdgeDeploymentRecommendation[];
}

export interface HonoTrpcAnalysisServiceResult {
  summary: {
    totalServices: number;
    analyzedServices: number;
    overallScore: number;
    executionTime: number;
  };
  results: {
    edgePerformance: EdgePerformanceAnalysisResult;
    trpcTypeSafety: TrpcTypeSafetyAnalysisResult;
    concurrentRequestHandling: ConcurrentRequestHandlingAnalysisResult;
    errorBoundaryPatterns: ErrorBoundaryPatternAnalysisResult;
    middlewareIntegration: MiddlewareIntegrationPatternAnalysisResult;
    routeOptimization: RouteOptimizationAnalysisResult;
    typePropagation: TypePropagationAnalysisResult;
    serverClientTypeSynchronization: ServerClientTypeSynchronizationAnalysisResult;
    performanceBenchmarking: PerformanceBenchmarkingResult;
    edgeDeploymentPatterns: EdgeDeploymentPatternAnalysisResult;
  };
  healthcare: {
    lgpdCompliance: number;
    patientDataProtection: number;
    clinicalSystemIntegrity: number;
    emergencySystemReliability: number;
  };
  recommendations: HonoTrpcAnalysisRecommendation[];
}

// Supporting interfaces
export interface RoutePerformanceData {
  path: string;
  method: string;
  responseTime: number;
  memoryUsage: number;
  edgeOptimized: boolean;
  healthcareRelevant: boolean;
}

export interface ProcedureTypeData {
  name: string;
  type: 'query' | 'mutation' | 'subscription';
  hasInputValidation: boolean;
  hasOutputValidation: boolean;
  healthcareRelevant: boolean;
}

export interface ValidationSchema {
  procedureName: string;
  schemaType: 'input' | 'output';
  patientDataFields: string[];
  validationComplexity: 'simple' | 'medium' | 'complex';
}

export interface TypeInferenceData {
  typeName: string;
  inferenceType: 'automatic' | 'explicit' | 'mixed';
  healthcareData: boolean;
  complexity: number;
}

export interface PerformanceRecommendation {
  category: 'response_time' | 'memory' | 'bundle_size' | 'caching' | 'edge_optimization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  healthcareRelevant: boolean;
}

export interface TypeSafetyIssue {
  procedureName: string;
  issueType: 'missing_validation' | 'type_mismatch' | 'circular_dependency' | 'complex_type';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  healthcareRelevant: boolean;
}

// Additional supporting interfaces for all analysis types
export interface ConcurrentRequestData {
  endpoint: string;
  maxConcurrentRequests: number;
  rateLimiting: boolean;
  queueSupport: boolean;
  healthcareRelevant: boolean;
}

export interface ConcurrencyRecommendation {
  endpoint: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareImpact: string;
}

export interface ErrorBoundaryData {
  serviceName: string;
  hasErrorBoundary: boolean;
  errorRecoveryStrategy: string;
  patientDataProtection: boolean;
}

export interface GlobalErrorHandler {
  route: string;
  errorType: string;
  handlingStrategy: string;
  healthcareCompliance: boolean;
}

export interface RouteErrorHandler {
  route: string;
  errorType: string;
  handlingStrategy: string;
  patientDataHandling: boolean;
}

export interface PatientDataErrorHandler {
  errorType: string;
  handlingStrategy: string;
  lgpdCompliant: boolean;
  auditLogging: boolean;
}

export interface ErrorHandlingRecommendation {
  service: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface MiddlewareData {
  name: string;
  type: 'authentication' | 'authorization' | 'validation' | 'audit' | 'logging' | 'performance';
  order: number;
  healthcareRelevant: boolean;
}

export interface AuthenticationMiddleware {
  name: string;
  strategy: string;
  patientDataAccess: boolean;
  professionalValidation: boolean;
}

export interface AuthorizationMiddleware {
  name: string;
  roles: string[];
  patientDataAccess: boolean;
  clinicalWorkflowAccess: boolean;
}

export interface ValidationMiddleware {
  name: string;
  validationType: string;
  patientDataValidation: boolean;
  clinicalDataValidation: boolean;
}

export interface AuditMiddleware {
  name: string;
  auditType: string;
  lgpdCompliance: boolean;
  professionalCouncilCompliance: boolean;
}

export interface MiddlewareRecommendation {
  middleware: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface RouteOptimizationData {
  path: string;
  method: string;
  optimized: boolean;
  cachingEnabled: boolean;
  compressionEnabled: boolean;
  healthcareRelevant: boolean;
}

export interface RouteOptimizationRecommendation {
  route: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareImpact: string;
}

export interface TypePropagationData {
  typeName: string;
  source: 'server' | 'client' | 'shared';
  destinations: string[];
  healthcareData: boolean;
  complexity: number;
}

export interface FrontendTypeData {
  typeName: string;
  usage: string[];
  healthcareRelevant: boolean;
}

export interface BackendTypeData {
  typeName: string;
  usage: string[];
  healthcareRelevant: boolean;
}

export interface SharedTypeData {
  typeName: string;
  frontendUsage: string[];
  backendUsage: string[];
  healthcareRelevant: boolean;
}

export interface TypePropagationRecommendation {
  typeName: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareImpact: string;
}

export interface ServerTypeData {
  typeName: string;
  definition: string;
  lastModified: Date;
  healthcareRelevant: boolean;
}

export interface ClientTypeData {
  typeName: string;
  definition: string;
  lastModified: Date;
  healthcareRelevant: boolean;
}

export interface SyncStatusData {
  typeName: string;
  status: 'synchronized' | 'mismatched' | 'outdated' | 'missing';
  discrepancy: string;
  healthcareRelevant: boolean;
}

export interface TypeSyncIssue {
  typeName: string;
  issueType: 'mismatch' | 'outdated' | 'missing' | 'circular';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  healthcareImpact: string;
}

export interface TypeSyncRecommendation {
  typeName: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface BenchmarkData {
  name: string;
  category: 'response_time' | 'throughput' | 'memory' | 'error_rate';
  target: number;
  actual: number;
  passed: boolean;
  healthcareRelevant: boolean;
}

export interface ResponseTimeMetric {
  endpoint: string;
  p50: number;
  p95: number;
  p99: number;
  target: number;
  healthcareRelevant: boolean;
}

export interface ThroughputMetric {
  endpoint: string;
  requestsPerSecond: number;
  target: number;
  healthcareRelevant: boolean;
}

export interface MemoryUsageMetric {
  service: string;
  memoryUsed: number;
  memoryLimit: number;
  percentage: number;
  healthcareRelevant: boolean;
}

export interface ErrorRateMetric {
  endpoint: string;
  errorCount: number;
  totalRequests: number;
  errorRate: number;
  target: number;
  healthcareRelevant: boolean;
}

export interface PerformanceBenchmarkingRecommendation {
  metric: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareImpact: string;
}

export interface EdgeDeploymentData {
  deploymentName: string;
  type: 'serverless' | 'edge' | 'hybrid' | 'traditional';
  provider: string;
  region: string;
  healthcareRelevant: boolean;
}

export interface ServerlessFunctionData {
  functionName: string;
  runtime: string;
  memory: number;
  timeout: number;
  healthcareRelevant: boolean;
}

export interface EdgeComputeData {
  functionName: string;
  edgeRegion: string;
  computeType: string;
  healthcareRelevant: boolean;
}

export interface CDNIntegrationData {
  resourceType: string;
  cdnProvider: string;
  cachingStrategy: string;
  healthcareRelevant: boolean;
}

export interface EdgeDeploymentRecommendation {
  deployment: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface HonoTrpcAnalysisRecommendation {
  category: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  healthcareRelevant: boolean;
  implementationComplexity: 'simple' | 'medium' | 'complex';
}