/**
 * NeonPro Consolidated Performance Monitoring Package
 * ===================================================
 * 
 * Healthcare-optimized performance monitoring with Supabase real-time integration
 * Consolidates functionality from packages/performance + packages/performance-monitor
 * 
 * Features:
 * - Web Vitals monitoring with healthcare-specific thresholds
 * - Real-time metrics streaming via Supabase 
 * - Bundle analysis and optimization
 * - Database performance monitoring
 * - AI metrics collection
 * - Cache performance tracking
 * - System resource monitoring
 * - LGPD/ANVISA compliant audit trails
 */

// ============================================================================
// CORE EXPORTS - Main monitoring functionality
// ============================================================================

// Web Vitals monitoring with healthcare optimization
export { HealthcareWebVitals, HEALTHCARE_THRESHOLDS } from './web-vitals/core-web-vitals';

// Metric collectors for comprehensive monitoring
export { AIMetricsCollector } from './collectors/ai-metrics-collector';
export { CacheMetricsCollector } from './collectors/cache-collector';
export { SystemMetricsCollector } from './collectors/system-collector';

// Real-time Supabase integration
export { SupabaseMetricsStreamer } from './realtime/supabase-metrics-streamer';
export { RealTimePerformanceDashboard } from './realtime/dashboard';

// Enterprise monitoring features
export * from './enterprise';

// Client and server monitoring utilities
export * from './client';
export * from './server';

// Type definitions
export * from './types';
export * from './utils';

// ============================================================================
// CONSOLIDATED MONITORING CLASS - Main entry point
// ============================================================================

import { HealthcareWebVitals } from './web-vitals/core-web-vitals';
import { AIMetricsCollector } from './collectors/ai-metrics-collector';
import { CacheMetricsCollector } from './collectors/cache-collector';
import { SystemMetricsCollector } from './collectors/system-collector';
import { SupabaseMetricsStreamer } from './realtime/supabase-metrics-streamer';
import type { ConsolidatedMonitoringConfig, PerformanceMetric } from './types';

/**
 * Consolidated Performance Monitor
 * Main orchestrator for all healthcare performance monitoring
 */
export class HealthcarePerformanceMonitor {
  private readonly webVitals: HealthcareWebVitals;
  private readonly aiCollector: AIMetricsCollector;
  private readonly cacheCollector: CacheMetricsCollector;
  private readonly systemCollector: SystemMetricsCollector;
  private readonly supabaseStreamer: SupabaseMetricsStreamer;
  private readonly config: ConsolidatedMonitoringConfig;

  constructor(config: Partial<ConsolidatedMonitoringConfig> = {}) {
    this.config = {
      enabled: true,
      realtimeEnabled: true,
      healthcareCompliance: true,
      auditTrailEnabled: true,
      webVitalsEnabled: true,
      aiMetricsEnabled: true,
      cacheMetricsEnabled: true,
      systemMetricsEnabled: true,
      clinicId: null,
      supabaseProjectId: 'ownkoxryswokcdanrdgj',
      collectInterval: 5000, // 5 seconds
      ...config
    };

    // Initialize all monitoring components
    this.webVitals = new HealthcareWebVitals();
    this.aiCollector = new AIMetricsCollector();
    this.cacheCollector = new CacheMetricsCollector();
    this.systemCollector = new SystemMetricsCollector();
    this.supabaseStreamer = new SupabaseMetricsStreamer({
      projectId: this.config.supabaseProjectId,
      clinicId: this.config.clinicId
    });

    this.setupEventHandlers();
  }

  /**
   * Start comprehensive monitoring with real-time streaming
   */
  async startMonitoring(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Start Web Vitals monitoring
      if (this.config.webVitalsEnabled) {
        this.webVitals.startMonitoring();
        console.log('✅ Web Vitals monitoring started');
      }

      // Start metric collectors
      if (this.config.aiMetricsEnabled) {
        await this.aiCollector.start();
        console.log('✅ AI metrics collection started');
      }

      if (this.config.cacheMetricsEnabled) {
        await this.cacheCollector.start();
        console.log('✅ Cache metrics collection started');
      }

      if (this.config.systemMetricsEnabled) {
        await this.systemCollector.start();
        console.log('✅ System metrics collection started');
      }

      // Start real-time streaming
      if (this.config.realtimeEnabled) {
        await this.supabaseStreamer.connect();
        console.log('✅ Supabase real-time streaming connected');
      }

      console.log('🚀 Healthcare Performance Monitoring fully initialized');

    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      throw new Error(`Monitoring initialization failed: ${error}`);
    }
  }

  /**
   * Stop all monitoring activities
   */
  async stopMonitoring(): Promise<void> {
    await Promise.all([
      this.aiCollector.stop(),
      this.cacheCollector.stop(), 
      this.systemCollector.stop(),
      this.supabaseStreamer.disconnect()
    ]);

    console.log('🛑 Healthcare Performance Monitoring stopped');
  }

  /**
   * Get current performance metrics summary
   */
  async getMetricsSummary(): Promise<{
    webVitals: any;
    aiMetrics: any;
    cacheMetrics: any;
    systemMetrics: any;
    lastUpdated: string;
  }> {
    return {
      webVitals: await this.webVitals.getLatestMetrics?.(),
      aiMetrics: await this.aiCollector.getLatestMetrics(),
      cacheMetrics: await this.cacheCollector.getLatestMetrics(),
      systemMetrics: await this.systemCollector.getLatestMetrics(),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Set healthcare context for all monitoring components
   */
  setHealthcareContext(context: {
    clinicId?: string;
    userId?: string;
    workflowType?: string;
    patientId?: string;
  }): void {
    // Update context across all components
    this.webVitals.setHealthcareContext?.(context);
    this.aiCollector.setHealthcareContext?.(context);
    this.cacheCollector.setHealthcareContext?.(context);
    this.systemCollector.setHealthcareContext?.(context);
    this.supabaseStreamer.setHealthcareContext(context);
  }

  /**
   * Setup event handlers for metric collection and real-time streaming
   */
  private setupEventHandlers(): void {
    // Forward all metrics to Supabase real-time
    const streamMetric = (metric: PerformanceMetric) => {
      if (this.config.realtimeEnabled) {
        this.supabaseStreamer.streamMetric(metric);
      }

      // Healthcare compliance audit logging
      if (this.config.auditTrailEnabled && this.config.healthcareCompliance) {
        this.logHealthcareAudit(metric);
      }
    };

    // Setup metric streaming for each collector
    this.webVitals.onMetric?.(streamMetric);
    this.aiCollector.onMetric?.(streamMetric);
    this.cacheCollector.onMetric?.(streamMetric);
    this.systemCollector.onMetric?.(streamMetric);
  }

  /**
   * Log metrics for healthcare compliance (LGPD/ANVISA)
   */
  private logHealthcareAudit(metric: PerformanceMetric): void {
    // Implementation for healthcare audit logging
    console.log(`📊 [AUDIT] ${metric.name}: ${metric.value} (${metric.timestamp})`);
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Default instance for easy consumption
export const healthcareMonitor = new HealthcarePerformanceMonitor();

// Utility functions for quick setup
export const startHealthcareMonitoring = async (config?: Partial<ConsolidatedMonitoringConfig>) => {
  const monitor = new HealthcarePerformanceMonitor(config);
  await monitor.startMonitoring();
  return monitor;
};

export const getPerformanceInsights = async () => {
  return await healthcareMonitor.getMetricsSummary();
};