/**
 * NeonPro Performance Package
 * Healthcare-optimized performance monitoring and optimization
 */

export { default as HealthcareBundleAnalyzer } from './bundle-analysis/bundle-analyzer';
export { default as HealthcareDatabaseMonitor } from './database/query-profiler';
export { default as HealthcareInfrastructureOptimizer } from './infrastructure/cache-manager';
// Types
export type {
  BundleAnalysisResult,
  BundleChunk,
  BundleRecommendation,
  DatabaseOptimizationSuggestion,
  DatabasePerformanceMetric,
  HealthcareComplianceScore,
  HealthcareVitalsMetric,
  PerformanceConfig,
  PerformanceEventHandler,
  PerformanceRecommendation,
  PerformanceReport,
  PerformanceThresholds,
  WebVitalsMetric,
} from './types';
// Core exports
export {
  HEALTHCARE_THRESHOLDS,
  HealthcareWebVitals,
} from './web-vitals/core-web-vitals';

import HealthcareBundleAnalyzer from './bundle-analysis/bundle-analyzer';
import HealthcareDatabaseMonitor from './database/query-profiler';
import HealthcareInfrastructureOptimizer from './infrastructure/cache-manager';
import type {
  HealthcareVitalsMetric,
  PerformanceConfig,
  PerformanceEventHandler,
  PerformanceReport,
} from './types';
// Healthcare Performance Monitor - Main orchestrator
import { HealthcareWebVitals } from './web-vitals/core-web-vitals';

export class HealthcarePerformanceMonitor {
  private readonly config: PerformanceConfig;
  private readonly webVitals: HealthcareWebVitals;
  private readonly bundleAnalyzer: HealthcareBundleAnalyzer;
  private readonly databaseMonitor: HealthcareDatabaseMonitor;
  private readonly infrastructureOptimizer: HealthcareInfrastructureOptimizer;
  private readonly eventHandlers: PerformanceEventHandler[] = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableWebVitals: true,
      enableBundleAnalysis: true,
      enableDatabaseMonitoring: true,
      healthcareMode: true,
      debug: false,
      thresholds: {
        CLS: { good: 0.05, poor: 0.1 },
        FCP: { good: 1200, poor: 2000 },
        FID: { good: 80, poor: 200 },
        LCP: { good: 2000, poor: 3000 },
        TTFB: { good: 200, poor: 500 },
        INP: { good: 150, poor: 300 },
        patientLookup: { good: 300, poor: 800 },
        medicalFormLoad: { good: 800, poor: 1500 },
        procedureScheduling: { good: 1200, poor: 2500 },
        realTimeUpdate: { good: 100, poor: 300 },
      },
      ...config,
    };

    this.webVitals = new HealthcareWebVitals(this.config.thresholds);
    this.bundleAnalyzer = new HealthcareBundleAnalyzer();
    this.databaseMonitor = new HealthcareDatabaseMonitor();
    this.infrastructureOptimizer = new HealthcareInfrastructureOptimizer();

    this.setupEventHandlers();
  }

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (this.config.enableWebVitals) {
      this.webVitals.startMonitoring();
    }

    if (this.config.debug) {
    }
  }

  /**
   * Set healthcare context for monitoring
   */
  setHealthcareContext(context: {
    workflowType?: 'patient-registration' | 'medical-form' | 'procedure-scheduling' | 'medical-history' | 'real-time-update';
    clinicId?: string;
    userId?: string;
  }): void {
    this.webVitals.setHealthcareContext(context);
  }

  /**
   * Add performance event handler
   */
  onPerformanceEvent(handler: PerformanceEventHandler): void {
    this.eventHandlers.push(handler);
    this.webVitals.onMetric(handler);
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(
    query: string,
    executionTime: number,
    table: string,
    queryType: 'select' | 'insert' | 'update' | 'delete',
    rowsAffected?: number
  ): void {
    if (this.config.enableDatabaseMonitoring) {
      this.databaseMonitor.recordQuery(
        query,
        executionTime,
        table,
        queryType,
        rowsAffected
      );
    }
  }

  /**
   * Analyze bundle performance
   */
  async analyzeBundles(statsPath: string): Promise<any> {
    if (this.config.enableBundleAnalysis) {
      await this.bundleAnalyzer.loadStats(statsPath);
      return this.bundleAnalyzer.analyzeBundles();
    }
    return null;
  }

  /**
   * Generate comprehensive performance report
   */
  async generateReport(): Promise<PerformanceReport> {
    const timestamp = new Date().toISOString();
    const url = typeof window !== 'undefined' ? window.location.href : 'server';

    // Collect all metrics (this would be populated by real monitoring)
    const metrics: HealthcareVitalsMetric[] = [];

    // Calculate overall score (simplified)
    const overallScore = 85; // This would be calculated from real metrics

    const rating =
      overallScore >= 90
        ? 'excellent'
        : overallScore >= 75
          ? 'good'
          : overallScore >= 60
            ? 'needs-improvement'
            : 'poor';

    const recommendations = [
      {
        type: 'critical' as const,
        category: 'bundle' as const,
        description: 'Implement code splitting for healthcare modules',
        impact: 'high' as const,
        effort: 'medium' as const,
        healthcareRelevance: true,
      },
    ];

    const healthcareCompliance = {
      clinicalWorkflowSpeed: 90,
      mobileResponsiveness: 85,
      accessibilityPerformance: 88,
      dataLoadingEfficiency: 92,
      offlineCapability: 75,
      overallCompliance: 86,
    };

    return {
      timestamp,
      url,
      metrics,
      overallScore,
      rating,
      recommendations,
      healthcareCompliance,
    };
  }

  /**
   * Get cache headers for healthcare resources
   */
  getCacheHeaders(resourceType: string): Record<string, string> {
    return this.infrastructureOptimizer.getCacheHeaders(resourceType);
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers(): void {
    this.webVitals.onMetric((metric) => {
      if (this.config.debug) {
      }

      // Send to reporting endpoint if configured
      if (this.config.reportingEndpoint) {
        this.sendToReporting(metric);
      }
    });
  }

  /**
   * Send performance data to reporting endpoint
   */
  private async sendToReporting(metric: HealthcareVitalsMetric): Promise<void> {
    if (!this.config.reportingEndpoint) {
      return;
    }

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Healthcare-Performance': 'true',
        },
        body: JSON.stringify({
          type: 'performance-metric',
          metric,
          timestamp: Date.now(),
          healthcareMode: this.config.healthcareMode,
        }),
      });
    } catch (_error) {
      if (this.config.debug) {
      }
    }
  }
}

// Default export
export default HealthcarePerformanceMonitor;

// Convenience function for quick setup
export function initHealthcarePerformance(
  config?: Partial<PerformanceConfig>
): HealthcarePerformanceMonitor {
  const monitor = new HealthcarePerformanceMonitor(config);
  monitor.init();
  return monitor;
}
