/**
 * Performance Metrics Collection Service
 * 
 * Collects Web Vitals and healthcare-specific performance metrics
 * with LGPD compliance and real-time monitoring capabilities.
 * 
 * Based on: /specs/002-platform-architecture-improvements/data-model.md
 * Task: T017 - Implement performance metrics collection service
 */

import { 
  PerformanceMetrics,
  PerformanceMetricsSchema,
  WebVitals,
  HealthcareMetrics,
  ResourceUtilization,
  EnvironmentContext,
  createDefaultLGPDMetadata,
  sanitizeTelemetryEvent,
  type LGPDDataClassification,
  type HealthcareContext
} from '@neonpro/shared';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PerformanceMetricsConfig {
  enabled: boolean;
  sampleRate: number; // 0.0 to 1.0
  reportingInterval: number; // milliseconds
  maxBatchSize: number;
  endpoint: string;
  healthcareCompliance: boolean;
  emergencyThresholds: {
    emergencyActionResponseTime: number; // ms
    patientDataLoadTime: number; // ms
    criticalWorkflowLatency: number; // ms
  };
}

export interface MetricsCollectionOptions {
  includeWebVitals: boolean;
  includeHealthcareMetrics: boolean;
  includeResourceMetrics: boolean;
  dataClassification: LGPDDataClassification;
  healthcareContext?: Partial<HealthcareContext>;
  sessionId?: string;
  userId?: string;
}

export interface PerformanceAlert {
  type: 'threshold_exceeded' | 'sla_violation' | 'critical_latency';
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  healthcareImpact: boolean;
  timestamp: string;
}

// ============================================================================
// Performance Metrics Collection Service
// ============================================================================

export class PerformanceMetricsService {
  private config: PerformanceMetricsConfig;
  private metricsQueue: PerformanceMetrics[] = [];
  private observer?: PerformanceObserver;
  private webVitalsCallbacks: Map<string, Function> = new Map();
  private lastReportTime = 0;
  private sessionId: string;
  private isEnabled = false;

  constructor(config: Partial<PerformanceMetricsConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      reportingInterval: 30000, // 30 seconds
      maxBatchSize: 50,
      endpoint: '/api/v1/observability/telemetry/performance',
      healthcareCompliance: true,
      emergencyThresholds: {
        emergencyActionResponseTime: 200, // Must be <200ms for patient safety
        patientDataLoadTime: 2000, // <2s for patient data
        criticalWorkflowLatency: 500, // <500ms for critical operations
      },
      ...config
    };

    this.sessionId = this.generateSessionId();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  // ============================================================================
  // Initialization & Lifecycle
  // ============================================================================

  private initialize(): void {
    try {
      this.setupPerformanceObserver();
      this.setupWebVitalsCollection();
      this.setupResourceMonitoring();
      this.setupReportingInterval();
      this.isEnabled = true;
      
      console.log('[PerformanceMetrics] Service initialized with healthcare compliance');
    } catch (error) {
      console.error('[PerformanceMetrics] Failed to initialize:', error);
    }
  }

  public start(): void {
    if (!this.isEnabled) {
      this.initialize();
    }
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.isEnabled = false;
  }

  // ============================================================================
  // Web Vitals Collection
  // ============================================================================

  private setupWebVitalsCollection(): void {
    // Core Web Vitals implementation using web-vitals library pattern
    this.observeMetric('FCP', this.handleFirstContentfulPaint.bind(this));
    this.observeMetric('LCP', this.handleLargestContentfulPaint.bind(this));
    this.observeMetric('CLS', this.handleCumulativeLayoutShift.bind(this));
    this.observeMetric('FID', this.handleFirstInputDelay.bind(this));
    this.observeMetric('TTFB', this.handleTimeToFirstByte.bind(this));
    
    // Enhanced metrics for healthcare
    this.observeMetric('TTI', this.handleTimeToInteractive.bind(this));
    this.observeMetric('INP', this.handleInteractionToNextPaint.bind(this));
  }

  private observeMetric(name: string, callback: (value: number, entry?: PerformanceEntry) => void): void {
    const wrappedCallback = (value: number, entry?: PerformanceEntry) => {
      if (Math.random() <= this.config.sampleRate) {
        callback(value, entry);
      }
    };
    
    this.webVitalsCallbacks.set(name, wrappedCallback);
    
    // Use appropriate PerformanceObserver for each metric
    switch (name) {
      case 'FCP':
      case 'LCP':
        this.observePaintTiming(name, wrappedCallback);
        break;
      case 'CLS':
        this.observeLayoutShift(wrappedCallback);
        break;
      case 'FID':
      case 'INP':
        this.observeEventTiming(name, wrappedCallback);
        break;
      case 'TTFB':
        this.observeNavigationTiming(wrappedCallback);
        break;
      case 'TTI':
        this.observeTimeToInteractive(wrappedCallback);
        break;
    }
  }

  private observePaintTiming(metricName: string, callback: Function): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint' && metricName === 'FCP') {
            callback(entry.startTime, entry);
          } else if (entry.entryType === 'largest-contentful-paint' && metricName === 'LCP') {
            callback(entry.startTime, entry);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      } catch (e) {
        // Fallback for older browsers
        console.warn(`[PerformanceMetrics] ${metricName} observation not supported`);
      }
    }
  }

  private observeLayoutShift(callback: Function): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceLayoutShift[];
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        callback(clsValue);
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('[PerformanceMetrics] CLS observation not supported');
      }
    }
  }

  private observeEventTiming(metricName: string, callback: Function): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (metricName === 'FID' && entry.name === 'first-input') {
            callback(entry.processingStart - entry.startTime, entry);
          } else if (metricName === 'INP') {
            const duration = entry.processingEnd - entry.startTime;
            callback(duration, entry);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['event'] });
      } catch (e) {
        console.warn(`[PerformanceMetrics] ${metricName} observation not supported`);
      }
    }
  }

  private observeNavigationTiming(callback: Function): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            callback(ttfb, entry);
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('[PerformanceMetrics] TTFB observation not supported');
      }
    }
  }

  private observeTimeToInteractive(callback: Function): void {
    // TTI calculation based on long tasks and network quiet periods
    if ('PerformanceObserver' in window) {
      let longTaskCount = 0;
      const observer = new PerformanceObserver((list) => {
        longTaskCount += list.getEntries().length;
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
        
        // Simplified TTI estimation
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const tti = navigationEntry ? navigationEntry.loadEventEnd : performance.now();
            callback(tti);
          }, 1000);
        });
      } catch (e) {
        console.warn('[PerformanceMetrics] TTI observation not supported');
      }
    }
  }

  // ============================================================================
  // Healthcare-Specific Metrics
  // ============================================================================

  public collectHealthcareMetrics(options: Partial<MetricsCollectionOptions> = {}): HealthcareMetrics {
    const startTime = performance.now();
    
    const metrics: HealthcareMetrics = {
      patientDataLoadTime: this.measurePatientDataLoadTime(),
      medicalRecordRenderTime: this.measureMedicalRecordRenderTime(),
      appointmentSchedulingLatency: this.measureAppointmentSchedulingLatency(),
      aiResponseTime: this.measureAIResponseTime(),
      emergencyActionResponseTime: this.measureEmergencyActionResponseTime(),
      prescriptionValidationTime: this.measurePrescriptionValidationTime(),
      auditTrailGenerationTime: this.measureAuditTrailGenerationTime(),
    };

    // Check emergency thresholds
    this.checkEmergencyThresholds(metrics, options.healthcareContext);
    
    const collectionTime = performance.now() - startTime;
    console.log(`[PerformanceMetrics] Healthcare metrics collected in ${collectionTime.toFixed(2)}ms`);
    
    return metrics;
  }

  private measurePatientDataLoadTime(): number {
    // Measure time for patient data to load and render
    const patientDataElements = document.querySelectorAll('[data-testid*="patient"], [data-patient-id]');
    if (patientDataElements.length === 0) return 0;
    
    // Use Resource Timing API to measure data fetch time
    const entries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/patients/') || entry.name.includes('/patient-data/'))
      .sort((a, b) => b.startTime - a.startTime);
    
    return entries.length > 0 ? entries[0].duration : 0;
  }

  private measureMedicalRecordRenderTime(): number {
    const recordElements = document.querySelectorAll('[data-testid*="medical-record"], .medical-record');
    if (recordElements.length === 0) return 0;
    
    // Measure rendering time using paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint');
    
    return lcp ? lcp.startTime : 0;
  }

  private measureAppointmentSchedulingLatency(): number {
    // Measure API response time for appointment operations
    const appointmentEntries = performance.getEntriesByType('resource')
      .filter(entry => 
        entry.name.includes('/appointments/') || 
        entry.name.includes('/scheduling/')
      );
    
    if (appointmentEntries.length === 0) return 0;
    
    const latestEntry = appointmentEntries.sort((a, b) => b.startTime - a.startTime)[0];
    return latestEntry.duration;
  }

  private measureAIResponseTime(): number | undefined {
    const aiEntries = performance.getEntriesByType('resource')
      .filter(entry => 
        entry.name.includes('/ai/') || 
        entry.name.includes('/chat/') ||
        entry.name.includes('openai.com') ||
        entry.name.includes('anthropic.com')
      );
    
    if (aiEntries.length === 0) return undefined;
    
    const latestEntry = aiEntries.sort((a, b) => b.startTime - a.startTime)[0];
    return latestEntry.duration;
  }

  private measureEmergencyActionResponseTime(): number | undefined {
    // Measure critical emergency actions (alerts, emergency buttons)
    const emergencyElements = document.querySelectorAll('[data-emergency], .emergency-action, .critical-alert');
    if (emergencyElements.length === 0) return undefined;
    
    // Check for emergency-related network requests
    const emergencyEntries = performance.getEntriesByType('resource')
      .filter(entry => 
        entry.name.includes('/emergency/') || 
        entry.name.includes('/alert/') ||
        entry.name.includes('/critical/')
      );
    
    if (emergencyEntries.length === 0) return undefined;
    
    const latestEntry = emergencyEntries.sort((a, b) => b.startTime - a.startTime)[0];
    return latestEntry.duration;
  }

  private measurePrescriptionValidationTime(): number | undefined {
    const prescriptionEntries = performance.getEntriesByType('resource')
      .filter(entry => 
        entry.name.includes('/prescription/') || 
        entry.name.includes('/medication/')
      );
    
    if (prescriptionEntries.length === 0) return undefined;
    
    const latestEntry = prescriptionEntries.sort((a, b) => b.startTime - a.startTime)[0];
    return latestEntry.duration;
  }

  private measureAuditTrailGenerationTime(): number | undefined {
    const auditEntries = performance.getEntriesByType('resource')
      .filter(entry => 
        entry.name.includes('/audit/') || 
        entry.name.includes('/compliance/')
      );
    
    if (auditEntries.length === 0) return undefined;
    
    const latestEntry = auditEntries.sort((a, b) => b.startTime - a.startTime)[0];
    return latestEntry.duration;
  }

  // ============================================================================
  // Resource Utilization Monitoring
  // ============================================================================

  public collectResourceMetrics(): ResourceUtilization {
    const memory = this.getMemoryUsage();
    const networkLatency = this.getNetworkLatency();
    const bundleSize = this.getBundleSize();
    
    return {
      memoryUsage: memory,
      cpuUsage: 0, // CPU usage not directly available in browser
      networkLatency,
      bundleSize,
      databaseQueryTime: this.getDatabaseQueryTime(),
      cacheHitRatio: this.getCacheHitRatio(),
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  private getNetworkLatency(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      return navigationEntry.responseStart - navigationEntry.requestStart;
    }
    return 0;
  }

  private getBundleSize(): number {
    const scriptEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.endsWith('.js') || entry.name.endsWith('.css'));
    
    const totalSize = scriptEntries.reduce((sum, entry) => {
      return sum + (entry.transferSize || 0);
    }, 0);
    
    return Math.round(totalSize / 1024); // KB
  }

  private getDatabaseQueryTime(): number | undefined {
    const dbEntries = performance.getEntriesByType('resource')
      .filter(entry => 
        entry.name.includes('/api/') && 
        (entry as PerformanceResourceTiming).responseEnd - (entry as PerformanceResourceTiming).responseStart > 0
      );
    
    if (dbEntries.length === 0) return undefined;
    
    const avgQueryTime = dbEntries.reduce((sum, entry) => sum + entry.duration, 0) / dbEntries.length;
    return avgQueryTime;
  }

  private getCacheHitRatio(): number | undefined {
    const cacheableEntries = performance.getEntriesByType('resource')
      .filter(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        return resourceEntry.transferSize !== undefined;
      });
    
    if (cacheableEntries.length === 0) return undefined;
    
    const cachedEntries = cacheableEntries.filter(entry => {
      const resourceEntry = entry as PerformanceResourceTiming;
      return resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0;
    });
    
    return cachedEntries.length / cacheableEntries.length;
  }

  // ============================================================================
  // Environment Context Collection
  // ============================================================================

  public collectEnvironmentContext(): EnvironmentContext {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connectionType: this.getConnectionType(),
      deviceType: this.getDeviceType(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
    };
  }

  private getConnectionType(): 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // ============================================================================
  // Metrics Collection & Reporting
  // ============================================================================

  public async collectMetrics(options: MetricsCollectionOptions = {
    includeWebVitals: true,
    includeHealthcareMetrics: true,
    includeResourceMetrics: true,
    dataClassification: 'internal'
  }): Promise<PerformanceMetrics> {
    
    const metrics: PerformanceMetrics = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: options.sessionId || this.sessionId,
      userId: options.userId,
      webVitals: options.includeWebVitals ? this.collectWebVitals() : this.getDefaultWebVitals(),
      healthcareMetrics: options.includeHealthcareMetrics ? this.collectHealthcareMetrics(options) : this.getDefaultHealthcareMetrics(),
      resources: options.includeResourceMetrics ? this.collectResourceMetrics() : this.getDefaultResourceMetrics(),
      environment: this.collectEnvironmentContext(),
      lgpdMetadata: createDefaultLGPDMetadata(options.dataClassification),
      healthcareContext: options.healthcareContext,
    };

    // Validate the metrics
    const validationResult = PerformanceMetricsSchema.safeParse(metrics);
    if (!validationResult.success) {
      console.error('[PerformanceMetrics] Validation failed:', validationResult.error);
      throw new Error('Invalid performance metrics');
    }

    // Add to queue for batch reporting
    this.metricsQueue.push(metrics);
    
    // Check if we should report immediately
    if (this.shouldReportImmediately(metrics)) {
      await this.reportMetrics();
    }

    return metrics;
  }

  private collectWebVitals(): WebVitals {
    // Collect current Web Vitals values
    return {
      firstContentfulPaint: this.getCurrentMetricValue('FCP'),
      largestContentfulPaint: this.getCurrentMetricValue('LCP'),
      cumulativeLayoutShift: this.getCurrentMetricValue('CLS'),
      firstInputDelay: this.getCurrentMetricValue('FID'),
      timeToInteractive: this.getCurrentMetricValue('TTI'),
      timeToFirstByte: this.getCurrentMetricValue('TTFB'),
      interactionToNextPaint: this.getCurrentMetricValue('INP'),
    };
  }

  private getCurrentMetricValue(metric: string): number {
    // This would be populated by the observer callbacks
    // For now, return navigation timing fallbacks
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return 0;

    switch (metric) {
      case 'FCP':
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        return fcpEntry ? fcpEntry.startTime : 0;
      case 'LCP':
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
      case 'TTFB':
        return navigation.responseStart - navigation.requestStart;
      case 'TTI':
        return navigation.loadEventEnd;
      case 'CLS':
      case 'FID':
      case 'INP':
        return 0; // These require observers to track accurately
      default:
        return 0;
    }
  }

  // ============================================================================
  // Threshold Monitoring & Alerts
  // ============================================================================

  private checkEmergencyThresholds(metrics: HealthcareMetrics, context?: Partial<HealthcareContext>): void {
    const alerts: PerformanceAlert[] = [];

    // Check emergency action response time (critical for patient safety)
    if (metrics.emergencyActionResponseTime && 
        metrics.emergencyActionResponseTime > this.config.emergencyThresholds.emergencyActionResponseTime) {
      alerts.push({
        type: 'critical_latency',
        metric: 'emergencyActionResponseTime',
        value: metrics.emergencyActionResponseTime,
        threshold: this.config.emergencyThresholds.emergencyActionResponseTime,
        severity: 'critical',
        healthcareImpact: true,
        timestamp: new Date().toISOString()
      });
    }

    // Check patient data load time
    if (metrics.patientDataLoadTime > this.config.emergencyThresholds.patientDataLoadTime) {
      alerts.push({
        type: 'threshold_exceeded',
        metric: 'patientDataLoadTime', 
        value: metrics.patientDataLoadTime,
        threshold: this.config.emergencyThresholds.patientDataLoadTime,
        severity: context?.emergencyLevel === 'critical' ? 'critical' : 'high',
        healthcareImpact: true,
        timestamp: new Date().toISOString()
      });
    }

    // Process alerts
    if (alerts.length > 0) {
      this.processPerformanceAlerts(alerts);
    }
  }

  private processPerformanceAlerts(alerts: PerformanceAlert[]): void {
    for (const alert of alerts) {
      console.warn('[PerformanceMetrics] Healthcare performance alert:', alert);
      
      // Send immediate alert for critical healthcare issues
      if (alert.severity === 'critical' && alert.healthcareImpact) {
        this.sendCriticalAlert(alert);
      }
    }
  }

  private async sendCriticalAlert(alert: PerformanceAlert): Promise<void> {
    try {
      await fetch('/api/v1/alerts/critical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('[PerformanceMetrics] Failed to send critical alert:', error);
    }
  }

  // ============================================================================
  // Reporting & Data Transmission
  // ============================================================================

  private shouldReportImmediately(metrics: PerformanceMetrics): boolean {
    // Report immediately for critical healthcare metrics
    if (metrics.healthcareContext?.emergencyLevel === 'critical') {
      return true;
    }

    // Check if any healthcare metrics exceed thresholds
    const emergencyResponse = metrics.healthcareMetrics.emergencyActionResponseTime;
    if (emergencyResponse && emergencyResponse > this.config.emergencyThresholds.emergencyActionResponseTime) {
      return true;
    }

    // Standard batching conditions
    const timeSinceLastReport = Date.now() - this.lastReportTime;
    return this.metricsQueue.length >= this.config.maxBatchSize || 
           timeSinceLastReport >= this.config.reportingInterval;
  }

  private async reportMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;

    const batch = [...this.metricsQueue];
    this.metricsQueue = [];
    this.lastReportTime = Date.now();

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: batch,
          timestamp: new Date().toISOString(),
          healthcareCompliance: this.config.healthcareCompliance
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to report metrics: ${response.status}`);
      }

      console.log(`[PerformanceMetrics] Reported ${batch.length} metrics successfully`);
    } catch (error) {
      console.error('[PerformanceMetrics] Failed to report metrics:', error);
      // Re-queue failed metrics
      this.metricsQueue.unshift(...batch);
    }
  }

  private setupReportingInterval(): void {
    setInterval(() => {
      if (this.metricsQueue.length > 0) {
        this.reportMetrics();
      }
    }, this.config.reportingInterval);
  }

  // ============================================================================
  // Event Handlers for Web Vitals
  // ============================================================================

  private handleFirstContentfulPaint(value: number, entry?: PerformanceEntry): void {
    console.log('[PerformanceMetrics] FCP:', value.toFixed(2), 'ms');
  }

  private handleLargestContentfulPaint(value: number, entry?: PerformanceEntry): void {
    console.log('[PerformanceMetrics] LCP:', value.toFixed(2), 'ms');
    
    // Check if LCP exceeds healthcare threshold
    if (value > 2500) {
      console.warn('[PerformanceMetrics] LCP exceeds healthcare performance threshold');
    }
  }

  private handleCumulativeLayoutShift(value: number): void {
    console.log('[PerformanceMetrics] CLS:', value.toFixed(3));
    
    // Check if CLS affects healthcare interface stability
    if (value > 0.1) {
      console.warn('[PerformanceMetrics] CLS may impact healthcare interface usability');
    }
  }

  private handleFirstInputDelay(value: number, entry?: PerformanceEntry): void {
    console.log('[PerformanceMetrics] FID:', value.toFixed(2), 'ms');
  }

  private handleTimeToFirstByte(value: number, entry?: PerformanceEntry): void {
    console.log('[PerformanceMetrics] TTFB:', value.toFixed(2), 'ms');
  }

  private handleTimeToInteractive(value: number): void {
    console.log('[PerformanceMetrics] TTI:', value.toFixed(2), 'ms');
  }

  private handleInteractionToNextPaint(value: number, entry?: PerformanceEntry): void {
    console.log('[PerformanceMetrics] INP:', value.toFixed(2), 'ms');
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateSessionId(): string {
    return `sess_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultWebVitals(): WebVitals {
    return {
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
    };
  }

  private getDefaultHealthcareMetrics(): HealthcareMetrics {
    return {
      patientDataLoadTime: 0,
      medicalRecordRenderTime: 0,
      appointmentSchedulingLatency: 0,
    };
  }

  private getDefaultResourceMetrics(): ResourceUtilization {
    return {
      memoryUsage: 0,
      cpuUsage: 0,
      networkLatency: 0,
      bundleSize: 0,
    };
  }

  private setupPerformanceObserver(): void {
    // Additional performance observations can be set up here
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        // Handle additional performance entries as needed
      });
    }
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  public getConfig(): PerformanceMetricsConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<PerformanceMetricsConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (!this.config.enabled && this.isEnabled) {
      this.stop();
    } else if (this.config.enabled && !this.isEnabled) {
      this.start();
    }
  }

  public getQueueSize(): number {
    return this.metricsQueue.length;
  }

  public async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length > 0) {
      await this.reportMetrics();
    }
  }

  public isRunning(): boolean {
    return this.isEnabled;
  }
}

// ============================================================================
// Singleton Instance & Factory
// ============================================================================

let performanceMetricsInstance: PerformanceMetricsService | null = null;

export function createPerformanceMetricsService(config?: Partial<PerformanceMetricsConfig>): PerformanceMetricsService {
  if (!performanceMetricsInstance) {
    performanceMetricsInstance = new PerformanceMetricsService(config);
  }
  return performanceMetricsInstance;
}

export function getPerformanceMetricsService(): PerformanceMetricsService | null {
  return performanceMetricsInstance;
}

// Export default instance
export const performanceMetrics = createPerformanceMetricsService();

// Type definitions for external use
declare global {
  interface PerformanceLayoutShift extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }
}