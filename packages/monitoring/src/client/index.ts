/**
 * Client-side Performance Monitoring
 *
 * Web Vitals tracking, custom metrics, and real-time
 * performance monitoring for healthcare applications.
 */

'use client';

import {
  onCLS,
  onFCP,
  onFID,
  onINP,
  onLCP,
  onTTFB,
  type Metric,
} from 'web-vitals';
import type {
  CustomMetric,
  HealthcareContext,
  HealthcareMetricName,
  MonitoringConfig,
  MonitoringHooks,
} from '../types';

/**
 * Default monitoring configuration
 */
const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  thresholds: {
    webVitals: {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FCP: { good: 1800, needsImprovement: 3000 },
      FID: { good: 100, needsImprovement: 300 },
      INP: { good: 200, needsImprovement: 500 },
      LCP: { good: 2500, needsImprovement: 4000 },
      TTFB: { good: 800, needsImprovement: 1800 },
    },
    healthcare: {
      patient_search_time: { good: 500, needsImprovement: 1000 },
      form_submission_time: { good: 1000, needsImprovement: 2000 },
      data_encryption_time: { good: 200, needsImprovement: 500 },
      database_query_time: { good: 300, needsImprovement: 800 },
      image_upload_time: { good: 3000, needsImprovement: 8000 },
      report_generation_time: { good: 2000, needsImprovement: 5000 },
      auth_verification_time: { good: 800, needsImprovement: 1500 },
      compliance_check_time: { good: 400, needsImprovement: 1000 },
    },
  },
  sampling: {
    webVitals: 1.0,
    customMetrics: 1.0,
    errors: 1.0,
  },
  endpoints: {
    metrics: '/api/monitoring/metrics',
    errors: '/api/monitoring/errors',
    vitals: '/api/monitoring/vitals',
  },
  context: {
    includeUserInfo: true,
    includePatientInfo: false, // Privacy by default
    includeEnvironmentInfo: true,
  },
  privacy: {
    hashSensitiveData: true,
    excludeFields: ['cpf', 'password', 'medicalHistory'],
    retentionDays: 90,
  },
};

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private readonly config: MonitoringConfig;
  private readonly hooks: MonitoringHooks;
  private context: Partial<HealthcareContext> = {};
  private readonly sessionId: string;
  private isInitialized = false;

  constructor(
    config: Partial<MonitoringConfig> = {},
    hooks: MonitoringHooks = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.hooks = hooks;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }

    this.setupWebVitals();
    this.setupErrorTracking();
    this.setupPerformanceObserver();
    this.isInitialized = true;
  }

  /**
   * Set healthcare context for metrics
   */
  setContext(context: Partial<HealthcareContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Track custom healthcare metric
   */
  trackCustomMetric(
    name: HealthcareMetricName,
    value: number,
    context?: Record<string, any>
  ): void {
    if (!this.shouldSample('customMetrics')) {
      return;
    }

    const metric: CustomMetric = {
      name,
      value,
      rating: this.getRating(name, value),
      timestamp: Date.now(),
      id: this.generateMetricId(),
      context: {
        ...this.getBaseContext(),
        ...context,
      },
    };

    this.sendMetric(metric);
    this.hooks.onMetric?.(metric);
  }

  /**
   * Track form submission performance
   */
  trackFormSubmission(formType: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('form_submission_time', duration, { formType });
  }

  /**
   * Track patient search performance
   */
  trackPatientSearch(
    searchType: string,
    resultCount: number,
    startTime: number
  ): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('patient_search_time', duration, {
      searchType,
      resultCount,
    });
  }

  /**
   * Track file upload performance
   */
  trackFileUpload(fileType: string, fileSize: number, startTime: number): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('image_upload_time', duration, {
      fileType,
      fileSize,
    });
  }

  /**
   * Track authentication performance
   */
  trackAuth(authType: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('auth_verification_time', duration, { authType });
  }

  /**
   * Track compliance check performance
   */
  trackComplianceCheck(checkType: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('compliance_check_time', duration, { checkType });
  }

  /**
   * Track database operation performance
   */
  trackDatabaseOperation(operation: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('database_query_time', duration, { operation });
  }

  /**
   * Track report generation performance
   */
  trackReportGeneration(
    reportType: string,
    recordCount: number,
    startTime: number
  ): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('report_generation_time', duration, {
      reportType,
      recordCount,
    });
  }

  /**
   * Track encryption performance
   */
  trackEncryption(dataType: string, dataSize: number, startTime: number): void {
    const duration = performance.now() - startTime;
    this.trackCustomMetric('data_encryption_time', duration, {
      dataType,
      dataSize,
    });
  }

  /**
   * Start timing a custom operation
   */
  startTiming(label: string): number {
    const startTime = performance.now();
    performance.mark(`${label}-start`);
    return startTime;
  }

  /**
   * End timing and track metric
   */
  endTiming(
    label: string,
    metricName: HealthcareMetricName,
    startTime: number,
    context?: Record<string, any>
  ): void {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const duration = performance.now() - startTime;
    this.trackCustomMetric(metricName, duration, {
      operation: label,
      ...context,
    });
  }

  /**
   * Setup Web Vitals tracking
   */
  private setupWebVitals(): void {
    const sendToAnalytics = (metric: Metric) => {
      if (!this.shouldSample('webVitals')) {
        return;
      }

      this.sendVital(metric);
      this.hooks.onMetric?.(metric);
    };

    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        error: event.reason,
      });
    });
  }

  /**
   * Setup performance observer
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackNavigationTiming(entry as PerformanceNavigationTiming);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackResourceTiming(entry as PerformanceResourceTiming);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcp_connect: entry.connectEnd - entry.connectStart,
      ssl_handshake: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      dom_processing: entry.domContentLoadedEventEnd - entry.responseEnd,
      total_load_time: entry.loadEventEnd - (entry as any).navigationStart,
    };

    this.sendNavigationMetrics(metrics);
  }

  /**
   * Track resource timing
   */
  private trackResourceTiming(entry: PerformanceResourceTiming): void {
    // Track slow resources (>1s)
    if (entry.duration > 1000) {
      this.sendSlowResource({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
        type: this.getResourceType(entry.name),
      });
    }
  }

  /**
   * Track JavaScript errors
   */
  private trackError(errorInfo: any): void {
    if (!this.shouldSample('errors')) {
      return;
    }

    const errorEvent = {
      id: this.generateErrorId(),
      message: errorInfo.message,
      stack: errorInfo.error?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: this.getCompleteContext(),
      severity: 'error' as const,
      fingerprint: this.generateErrorFingerprint(errorInfo),
      tags: this.getErrorTags(),
    };

    this.sendError(errorEvent);
    this.hooks.onError?.(errorEvent);
  }

  /**
   * Send metric to endpoint
   */
  private async sendMetric(metric: CustomMetric): Promise<void> {
    try {
      const payload = this.hooks.beforeSend?.(metric) || metric;
      if (!payload) {
        return;
      }

      const response = await fetch(this.config.endpoints.metrics, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      this.hooks.afterSend?.(response);
    } catch (_error) {}
  }

  /**
   * Send Web Vital to endpoint
   */
  private async sendVital(vital: Metric): Promise<void> {
    try {
      const payload = {
        ...vital,
        sessionId: this.sessionId,
        context: this.getBaseContext(),
      };

      const finalPayload = this.hooks.beforeSend?.(payload) || payload;
      if (!finalPayload) {
        return;
      }

      const response = await fetch(this.config.endpoints.vitals, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      this.hooks.afterSend?.(response);
    } catch (_error) {}
  }

  /**
   * Send error to endpoint
   */
  private async sendError(error: any): Promise<void> {
    try {
      const payload = this.hooks.beforeSend?.(error) || error;
      if (!payload) {
        return;
      }

      const response = await fetch(this.config.endpoints.errors, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      this.hooks.afterSend?.(response);
    } catch (_error) {}
  }

  /**
   * Send navigation metrics
   */
  private async sendNavigationMetrics(
    metrics: Record<string, number>
  ): Promise<void> {
    try {
      await fetch(this.config.endpoints.metrics, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'navigation',
          metrics,
          sessionId: this.sessionId,
          context: this.getBaseContext(),
        }),
      });
    } catch (_error) {}
  }

  /**
   * Send slow resource data
   */
  private async sendSlowResource(resource: any): Promise<void> {
    try {
      await fetch(this.config.endpoints.metrics, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'slow_resource',
          resource,
          sessionId: this.sessionId,
          context: this.getBaseContext(),
        }),
      });
    } catch (_error) {}
  }

  /**
   * Get rating for custom metric
   */
  private getRating(
    name: HealthcareMetricName,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = this.config.thresholds.healthcare[name];
    if (value <= thresholds.good) {
      return 'good';
    }
    if (value <= thresholds.needsImprovement) {
      return 'needs-improvement';
    }
    return 'poor';
  }

  /**
   * Check if should sample this metric type
   */
  private shouldSample(type: keyof MonitoringConfig['sampling']): boolean {
    return Math.random() < this.config.sampling[type];
  }

  /**
   * Get base context for metrics
   */
  private getBaseContext(): Record<string, any> {
    const context: Record<string, any> = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      ...this.context,
    };

    if (this.config.context.includeUserInfo) {
      context.userAgent = navigator.userAgent;
      context.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    if (this.config.context.includeEnvironmentInfo) {
      context.environment = process.env.NODE_ENV;
      context.connection = (navigator as any).connection?.effectiveType;
    }

    return context;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Generate error fingerprint for grouping
   */
  private generateErrorFingerprint(errorInfo: any): string {
    const key = `${errorInfo.message}_${errorInfo.filename}_${errorInfo.lineno}`;
    return btoa(key).substring(0, 16);
  }

  /**
   * Get complete healthcare context with defaults
   */
  private getCompleteContext(): HealthcareContext {
    return {
      feature: this.context.feature || 'patient-management',
      sensitivity: this.context.sensitivity || 'medium',
      complianceLevel: this.context.complianceLevel || 'basic',
      userRole: this.context.userRole || 'patient',
    };
  }

  /**
   * Get error tags for categorization
   */
  private getErrorTags(): Record<string, string> {
    return {
      environment: process.env.NODE_ENV || 'unknown',
      feature: (this.context.feature as string) || 'unknown',
      userRole: (this.context.userRole as string) || 'unknown',
    };
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('/api/')) {
      return 'api';
    }
    if (url.match(/\.(js|ts)$/)) {
      return 'script';
    }
    if (url.match(/\.(css)$/)) {
      return 'stylesheet';
    }
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
      return 'image';
    }
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) {
      return 'font';
    }
    return 'other';
  }
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

/**
 * Initialize global performance monitoring
 */
export function initPerformanceMonitoring(
  config?: Partial<MonitoringConfig>,
  hooks?: MonitoringHooks
): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(config, hooks);
    globalMonitor.init();
  }
  return globalMonitor;
}

/**
 * Get global performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor | null {
  return globalMonitor;
}

/**
 * Performance monitoring React hook
 */
export function usePerformanceMonitoring() {
  const monitor = getPerformanceMonitor();

  return {
    trackCustomMetric: monitor?.trackCustomMetric.bind(monitor),
    trackFormSubmission: monitor?.trackFormSubmission.bind(monitor),
    trackPatientSearch: monitor?.trackPatientSearch.bind(monitor),
    trackFileUpload: monitor?.trackFileUpload.bind(monitor),
    trackAuth: monitor?.trackAuth.bind(monitor),
    trackComplianceCheck: monitor?.trackComplianceCheck.bind(monitor),
    trackDatabaseOperation: monitor?.trackDatabaseOperation.bind(monitor),
    trackReportGeneration: monitor?.trackReportGeneration.bind(monitor),
    trackEncryption: monitor?.trackEncryption.bind(monitor),
    startTiming: monitor?.startTiming.bind(monitor),
    endTiming: monitor?.endTiming.bind(monitor),
    setContext: monitor?.setContext.bind(monitor),
  };
}
