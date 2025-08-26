/**
 * Core Web Vitals Types and Interfaces
 * Healthcare-optimized performance monitoring
 */

export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType:
    | 'navigate'
    | 'reload'
    | 'back-forward'
    | 'back-forward-cache'
    | 'prerender'
    | 'restore';
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface HealthcareVitalsMetric extends WebVitalsMetric {
  // Healthcare-specific context
  workflowType?:
    | 'patient-registration'
    | 'medical-form'
    | 'procedure-scheduling'
    | 'medical-history'
    | 'real-time-update';
  clinicId?: string;
  userId?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  networkConnection?: 'fast' | 'slow' | 'offline';
  criticalPath?: boolean; // Is this a critical healthcare workflow?
}

export interface PerformanceThresholds {
  // Core Web Vitals thresholds (healthcare-optimized)
  CLS: { good: number; poor: number; };
  FCP: { good: number; poor: number; };
  FID: { good: number; poor: number; };
  LCP: { good: number; poor: number; };
  TTFB: { good: number; poor: number; };
  INP: { good: number; poor: number; };

  // Healthcare-specific thresholds
  patientLookup: { good: number; poor: number; };
  medicalFormLoad: { good: number; poor: number; };
  procedureScheduling: { good: number; poor: number; };
  realTimeUpdate: { good: number; poor: number; };
}

export interface PerformanceReport {
  timestamp: string;
  url: string;
  metrics: HealthcareVitalsMetric[];
  overallScore: number; // 0-100
  rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  recommendations: PerformanceRecommendation[];
  healthcareCompliance: HealthcareComplianceScore;
}

export interface PerformanceRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category:
    | 'bundle'
    | 'images'
    | 'fonts'
    | 'javascript'
    | 'css'
    | 'network'
    | 'caching';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  healthcareRelevance: boolean;
}

export interface HealthcareComplianceScore {
  clinicalWorkflowSpeed: number; // 0-100
  mobileResponsiveness: number; // 0-100
  accessibilityPerformance: number; // 0-100
  dataLoadingEfficiency: number; // 0-100
  offlineCapability: number; // 0-100
  overallCompliance: number; // 0-100
}

export interface BundleAnalysisResult {
  totalSize: number;
  gzippedSize: number;
  chunks: BundleChunk[];
  recommendations: BundleRecommendation[];
  healthcareOptimized: boolean;
}

export interface BundleChunk {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isAsync: boolean;
  isInitial: boolean;
  healthcareCritical: boolean;
}

export interface BundleRecommendation {
  type: 'size-reduction' | 'code-splitting' | 'lazy-loading' | 'tree-shaking';
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export interface DatabasePerformanceMetric {
  queryType: 'select' | 'insert' | 'update' | 'delete';
  table: string;
  executionTime: number;
  rowsAffected?: number;
  queryPlan: string;
  timestamp: number;
  isSlowQuery: boolean;
  healthcareDataType?:
    | 'patient'
    | 'medical-record'
    | 'appointment'
    | 'billing'
    | 'audit';
}

export interface DatabaseOptimizationSuggestion {
  table: string;
  type: 'index' | 'query-rewrite' | 'caching' | 'partitioning';
  description: string;
  expectedImprovement: number; // percentage
  healthcareImpact: 'critical' | 'important' | 'minor';
}

export type PerformanceEventHandler = (metric: HealthcareVitalsMetric) => void;

export interface PerformanceConfig {
  enableWebVitals: boolean;
  enableBundleAnalysis: boolean;
  enableDatabaseMonitoring: boolean;
  healthcareMode: boolean;
  reportingEndpoint?: string;
  thresholds: PerformanceThresholds;
  debug: boolean;
}
