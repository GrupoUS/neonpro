/**
 * @file Enterprise monitoring service factory for healthcare applications
 * Provides enhanced monitoring capabilities with healthcare-specific analytics
 */

import { EnhancedServiceBase } from "@neonpro/core-services";
import type {
  HealthcareContext,
  HealthcareMetricName,
  MonitoringConfig,
  MonitoringHooks,
} from "../types";
import { getPerformanceMonitor, initPerformanceMonitoring, PerformanceMonitor } from "./client";

// Constants for healthcare monitoring
const CACHE_DURATION_HOUR = 3_600_000;
const ZERO_VALUE = 0;

/**
 * Enterprise monitoring service factory for healthcare applications.
 * Provides enhanced analytics, compliance tracking, and performance monitoring.
 */
export class MonitoringServiceFactory extends EnhancedServiceBase {
  private readonly performanceMonitor: PerformanceMonitor;

  constructor(config?: Partial<MonitoringConfig>, hooks?: MonitoringHooks) {
    super("monitoring-service-factory", {
      enableAnalytics: true,
      enableAudit: true,
      enableCache: true,
      enableSecurity: true,
      healthCheck: {
        enabled: true,
        interval: 30_000,
        timeout: 5000,
      },
    });

    this.performanceMonitor = new PerformanceMonitor(config, hooks);
    this.performanceMonitor.init();
  }

  /**
   * Enhanced metric tracking with enterprise analytics
   * @param {HealthcareMetricName} name Healthcare metric name
   * @param {number} value Metric value
   * @param {Record<string, string | number | boolean>} [context] Additional context data
   * @returns {Promise<void>} Promise that resolves when tracking is complete
   */
  async trackCustomMetricEnhanced(
    name: HealthcareMetricName,
    value: number,
    context?: Record<string, string | number | boolean>,
  ): Promise<void> {
    const startTime = this.startTiming("monitoring_track_metric");

    try {
      this.performanceMonitor.trackCustomMetric(name, value, context);
      await this.analytics.trackMetricWithInsights(name, value, {
        context,
        generateInsights: true,
        healthcareSpecific: true,
      });
      this.endTiming("monitoring_track_metric", name, startTime);
    } catch (error) {
      this.endTiming("monitoring_track_metric", name, startTime);
      await this.audit.logOperation("metric_tracking_error", {
        error: this._getErrorMessage(error),
        metricName: name,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Enhanced healthcare-specific metric tracking
   * @param {string} metricType Type of healthcare metric
   * @param {string} metricName Name of the metric
   * @param {number} value Metric value
   * @returns {Promise<void>} Promise that resolves when tracking is complete
   */
  async trackHealthcareMetricEnhanced(
    metricType:
      | "compliance"
      | "data_privacy"
      | "patient_safety"
      | "system_performance",
    metricName: string,
    value: number,
  ): Promise<void> {
    const startTime = this.startTiming("healthcare_metric_enhanced");

    try {
      await this.analytics.trackEvent("healthcare_metric", {
        complianceRelevant: true,
        name: metricName,
        timestamp: new Date(),
        type: metricType,
        value,
      });

      const insights = await this.analytics.generateHealthcareInsights({
        metricName,
        metricType,
        value,
      });

      if (insights.length > ZERO_VALUE) {
        await this.cache.set(
          `healthcare_insights_${metricType}`,
          insights,
          CACHE_DURATION_HOUR,
        );
      }

      this.endTiming(
        "healthcare_metric_enhanced",
        "healthcare_tracking",
        startTime,
      );
    } catch (error) {
      this.endTiming(
        "healthcare_metric_enhanced",
        "healthcare_tracking",
        startTime,
      );
      await this.audit.logOperation("healthcare_metric_error", {
        error: this._getErrorMessage(error),
        metricName,
        metricType,
        timestamp: new Date(),
      });
    }
  }

  // Delegate methods for backward compatibility
  init(): void {
    this.performanceMonitor.init();
  }

  setContext(context: HealthcareContext): void {
    this.performanceMonitor.setContext(context);
  }

  trackCustomMetric(
    name: HealthcareMetricName,
    value: number,
    context?: Record<string, string | number | boolean>,
  ): void {
    this.performanceMonitor.trackCustomMetric(name, value, context);
  }

  trackFormSubmission(formType: string, startTime: number): void {
    this.performanceMonitor.trackFormSubmission(formType, startTime);
  }

  trackPatientSearch(
    searchType: string,
    resultCount: number,
    startTime: number,
  ): void {
    this.performanceMonitor.trackPatientSearch(
      searchType,
      resultCount,
      startTime,
    );
  }

  trackFileUpload(fileType: string, fileSize: number, startTime: number): void {
    this.performanceMonitor.trackFileUpload(fileType, fileSize, startTime);
  }

  trackAuth(authType: string, startTime: number): void {
    this.performanceMonitor.trackAuth(authType, startTime);
  }

  trackComplianceCheck(checkType: string, startTime: number): void {
    this.performanceMonitor.trackComplianceCheck(checkType, startTime);
  }

  trackDatabaseOperation(operation: string, startTime: number): void {
    this.performanceMonitor.trackDatabaseOperation(operation, startTime);
  }

  trackReportGeneration(
    reportType: string,
    recordCount: number,
    startTime: number,
  ): void {
    this.performanceMonitor.trackReportGeneration(
      reportType,
      recordCount,
      startTime,
    );
  }

  trackEncryption(dataType: string, dataSize: number, startTime: number): void {
    this.performanceMonitor.trackEncryption(dataType, dataSize, startTime);
  }

  startTiming(label: string): number {
    return this.performanceMonitor.startTiming(label);
  }

  endTiming(
    label: string,
    metricName: HealthcareMetricName,
    startTime: number,
  ): void {
    this.performanceMonitor.endTiming(label, metricName, startTime);
  }

  // Private utility methods
  private _getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error";
  }
}

/**
 * Enhanced monitoring initialization for enterprise applications
 * @param {Partial<MonitoringConfig>} [config] Monitoring configuration
 * @param {MonitoringHooks} [hooks] Monitoring hooks
 * @returns {MonitoringServiceFactory} New monitoring service factory instance
 */
const initEnhancedPerformanceMonitoring = (
  config?: Partial<MonitoringConfig>,
  hooks?: MonitoringHooks,
): MonitoringServiceFactory => new MonitoringServiceFactory(config, hooks);

/**
 * Enhanced monitoring instance for enterprise applications
 */
const enhancedMonitoring = new MonitoringServiceFactory();

// Export all components together for better bundling
export {
  enhancedMonitoring,
  getPerformanceMonitor,
  initEnhancedPerformanceMonitoring,
  initPerformanceMonitoring,
  MonitoringServiceFactory,
  PerformanceMonitor,
};
