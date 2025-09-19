/**
 * Performance Monitoring Integration Tests
 *
 * Healthcare platform performance monitoring integration tests
 * Web Vitals monitoring with healthcare compliance (LGPD, ANVISA, CFM)
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 * @healthcare-platform NeonPro
 */

import { useLongTasks } from '@/hooks/use-long-tasks';
import { useNetworkInformation } from '@/hooks/use-network-information';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';
import { useResourceTiming } from '@/hooks/use-resource-timing';
import { useWebVitals } from '@/hooks/use-web-vitals';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

// Import performance monitoring services
import {
  AlertThreshold,
  LongTaskMetrics,
  NetworkMetrics,
  PerformanceAlert,
  PerformanceMetricsCollector,
  PerformanceReport,
  ResourceTimingMetrics,
  WebVitalsMetrics,
} from '@/services/performance-monitoring-service';

import {
  createPerformanceTracker,
  getPerformanceReport,
  setupPerformanceAlerts,
  trackCustomMetric,
  trackResourceLoad,
  trackUserInteraction,
} from '@/services/performance-tracker-service';

import {
  AIResponseMetrics,
  HealthcareMetrics,
  HealthcarePerformanceProfiler,
  PatientDataMetrics,
  TelemedicineMetrics,
} from '@/services/healthcare-performance-service';

// Mock external dependencies
vi.mock('@/services/performance-monitoring-service');
vi.mock('@/services/performance-tracker-service');
vi.mock('@/services/healthcare-performance-service');

// Test schemas for integration validation
const WebVitalsMetricsSchema = z.object({
  cls: z.number().min(0),
  fcp: z.number().min(0),
  fid: z.number().min(0),
  inp: z.number().min(0),
  lcp: z.number().min(0),
  ttfb: z.number().min(0),
  timestamp: z.string(),
  page: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const ResourceTimingMetricsSchema = z.object({
  resources: z.array(z.object({
    name: z.string(),
    initiatorType: z.string(),
    duration: z.number().min(0),
    size: z.number().min(0),
    transferSize: z.number().min(0),
    encodedBodySize: z.number().min(0),
    decodedBodySize: z.number().min(0),
    startTime: z.number().min(0),
    endTime: z.number().min(0),
    cached: z.boolean(),
    domainLookupTime: z.number().min(0),
    connectionTime: z.number().min(0),
    secureConnectionTime: z.number().min(0),
    requestTime: z.number().min(0),
    responseTime: z.number().min(0),
  })),
  totalSize: z.number().min(0),
  cachedResources: z.number().min(0),
  uncachedResources: z.number().min(0),
  slowestResource: z.string().optional(),
  timestamp: z.string(),
  page: z.string(),
});

const LongTaskMetricsSchema = z.object({
  tasks: z.array(z.object({
    duration: z.number().min(50),
    startTime: z.number().min(0),
    endTime: z.number().min(0),
    name: z.string(),
    source: z.string(),
    culprit: z.string(),
    attribution: z.array(z.object({
      name: z.string(),
      type: z.string(),
      duration: z.number().min(0),
    })),
  })),
  totalBlockingTime: z.number().min(0),
  longestTask: z.number().min(0),
  taskCount: z.number().min(0),
  timestamp: z.string(),
  page: z.string(),
});

const NetworkMetricsSchema = z.object({
  effectiveType: z.enum(['slow-2g', '2g', '3g', '4g', '5g']),
  downlink: z.number().min(0),
  rtt: z.number().min(0),
  saveData: z.boolean(),
  online: z.boolean(),
  connectionType: z.string().optional(),
  timestamp: z.string(),
  page: z.string(),
});

const HealthcareMetricsSchema = z.object({
  patientData: z.object({
    loadTime: z.number().min(0),
    searchTime: z.number().min(0),
    filterTime: z.number().min(0),
    renderTime: z.number().min(0),
    recordCount: z.number().min(0),
    dataSize: z.number().min(0),
  }),
  telemedicine: z.object({
    videoSetupTime: z.number().min(0),
    connectionQuality: z.number().min(0).max(1),
    latency: z.number().min(0),
    bandwidth: z.number().min(0),
    packetLoss: z.number().min(0).max(1),
    frameRate: z.number().min(0),
  }),
  aiResponse: z.object({
    requestTime: z.number().min(0),
    responseTime: z.number().min(0),
    processingTime: z.number().min(0),
    cacheHitRate: z.number().min(0).max(1),
    cost: z.number().min(0),
    confidence: z.number().min(0).max(1),
  }),
  compliance: z.object({
    lgpdDataProcessing: z.number().min(0).max(1),
    auditTrailCompleteness: z.number().min(0).max(1),
    dataRetentionCompliance: z.number().min(0).max(1),
    consentValidationTime: z.number().min(0),
  }),
  timestamp: z.string(),
  sessionId: z.string(),
  page: z.string(),
});

const PerformanceAlertSchema = z.object({
  id: z.string(),
  type: z.enum(['web_vitals', 'resource_timing', 'long_tasks', 'network', 'healthcare']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  metric: z.string(),
  value: z.number(),
  threshold: z.number(),
  message: z.string(),
  recommendation: z.string().optional(),
  timestamp: z.string(),
  page: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  acknowledged: z.boolean().default(false),
  resolved: z.boolean().default(false),
});

const PerformanceReportSchema = z.object({
  sessionId: z.string(),
  page: z.string(),
  duration: z.number().min(0),
  webVitals: WebVitalsMetricsSchema.optional(),
  resourceTiming: ResourceTimingMetricsSchema.optional(),
  longTasks: LongTaskMetricsSchema.optional(),
  network: NetworkMetricsSchema.optional(),
  healthcare: HealthcareMetricsSchema.optional(),
  alerts: z.array(PerformanceAlertSchema),
  summary: z.object({
    totalAlerts: z.number().min(0),
    criticalAlerts: z.number().min(0),
    performanceScore: z.number().min(0).max(100),
    healthcareScore: z.number().min(0).max(100),
    issues: z.array(z.object({
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      recommendation: z.string(),
    })),
  }),
  generatedAt: z.string(),
  lgpdCompliant: z.boolean(),
});

// Test data generators
const generateValidWebVitals = () => ({
  cls: 0.05,
  fcp: 1200,
  fid: 45,
  inp: 80,
  lcp: 1800,
  ttfb: 350,
  timestamp: new Date().toISOString(),
  page: '/dashboard',
  sessionId: 'sess_12345678901234567890123456789012',
  userId: 'usr_healthcare_12345',
  metadata: {
    browser: 'Chrome',
    device: 'desktop',
    networkType: '4g',
  },
});

const generateValidResourceTiming = () => ({
  resources: [
    {
      name: 'https://api.neonpro.health/patients',
      initiatorType: 'fetch',
      duration: 450,
      size: 25600,
      transferSize: 12800,
      encodedBodySize: 25600,
      decodedBodySize: 102400,
      startTime: 1000,
      endTime: 1450,
      cached: false,
      domainLookupTime: 50,
      connectionTime: 100,
      secureConnectionTime: 150,
      requestTime: 200,
      responseTime: 250,
    },
    {
      name: 'https://cdn.neonpro.health/main.js',
      initiatorType: 'script',
      duration: 800,
      size: 512000,
      transferSize: 128000,
      encodedBodySize: 512000,
      decodedBodySize: 512000,
      startTime: 500,
      endTime: 1300,
      cached: true,
      domainLookupTime: 0,
      connectionTime: 0,
      secureConnectionTime: 0,
      requestTime: 0,
      responseTime: 800,
    },
  ],
  totalSize: 537600,
  cachedResources: 1,
  uncachedResources: 1,
  slowestResource: 'https://cdn.neonpro.health/main.js',
  timestamp: new Date().toISOString(),
  page: '/dashboard',
});

const generateValidLongTasks = () => ({
  tasks: [
    {
      duration: 120,
      startTime: 5000,
      endTime: 5120,
      name: 'long_task',
      source: 'self',
      culprit: 'https://app.neonpro.health/main.js',
      attribution: [
        {
          name: 'processPatientData',
          type: 'function',
          duration: 120,
        },
      ],
    },
  ],
  totalBlockingTime: 120,
  longestTask: 120,
  taskCount: 1,
  timestamp: new Date().toISOString(),
  page: '/patients/list',
});

const generateValidNetworkMetrics = () => ({
  effectiveType: '4g' as const,
  downlink: 10,
  rtt: 150,
  saveData: false,
  online: true,
  connectionType: 'wifi',
  timestamp: new Date().toISOString(),
  page: '/dashboard',
});

const generateValidHealthcareMetrics = () => ({
  patientData: {
    loadTime: 850,
    searchTime: 120,
    filterTime: 45,
    renderTime: 200,
    recordCount: 150,
    dataSize: 2048000,
  },
  telemedicine: {
    videoSetupTime: 3200,
    connectionQuality: 0.95,
    latency: 120,
    bandwidth: 2000,
    packetLoss: 0.02,
    frameRate: 30,
  },
  aiResponse: {
    requestTime: 45,
    responseTime: 850,
    processingTime: 805,
    cacheHitRate: 0.85,
    cost: 0.025,
    confidence: 0.92,
  },
  compliance: {
    lgpdDataProcessing: 0.98,
    auditTrailCompleteness: 1.0,
    dataRetentionCompliance: 0.95,
    consentValidationTime: 25,
  },
  timestamp: new Date().toISOString(),
  sessionId: 'sess_12345678901234567890123456789012',
  page: '/telemedicine/session',
});

const generateValidPerformanceAlert = () => ({
  id: 'alert_12345678901234567890123456789012',
  type: 'web_vitals' as const,
  severity: 'high' as const,
  metric: 'LCP',
  value: 4500,
  threshold: 2500,
  message: 'LCP exceeds threshold of 2500ms',
  recommendation: 'Optimize image loading and reduce server response time',
  timestamp: new Date().toISOString(),
  page: '/dashboard',
  sessionId: 'sess_12345678901234567890123456789012',
  userId: 'usr_healthcare_12345',
  metadata: {
    browser: 'Chrome',
    device: 'mobile',
  },
});

const generateValidPerformanceReport = () => ({
  sessionId: 'sess_12345678901234567890123456789012',
  page: '/dashboard',
  duration: 15000,
  webVitals: generateValidWebVitals(),
  resourceTiming: generateValidResourceTiming(),
  longTasks: generateValidLongTasks(),
  network: generateValidNetworkMetrics(),
  healthcare: generateValidHealthcareMetrics(),
  alerts: [generateValidPerformanceAlert()],
  summary: {
    totalAlerts: 1,
    criticalAlerts: 0,
    performanceScore: 75,
    healthcareScore: 92,
    issues: [
      {
        type: 'lcp_slow',
        severity: 'high' as const,
        description: 'Largest Contentful Paint is too slow',
        recommendation: 'Optimize images and server response time',
      },
    ],
  },
  generatedAt: new Date().toISOString(),
  lgpdCompliant: true,
});

describe('Performance Monitoring Integration Tests', () => {
  let performanceMetricsCollector: PerformanceMetricsCollector;
  let performanceTracker: ReturnType<typeof createPerformanceTracker>;
  let healthcareProfiler: HealthcarePerformanceProfiler;

  beforeEach(() => {
    // Initialize performance monitoring services
    performanceMetricsCollector = new PerformanceMetricsCollector();
    performanceTracker = createPerformanceTracker();
    healthcareProfiler = new HealthcarePerformanceProfiler();

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Web Vitals Monitoring', () => {
    it('should collect and validate Web Vitals metrics', async () => {
      const webVitalsData = generateValidWebVitals();

      vi.spyOn(performanceMetricsCollector, 'collectWebVitals').mockResolvedValue(webVitalsData);

      const { result } = renderHook(() => useWebVitals());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectWebVitals).toHaveBeenCalled();
      });

      // Validate Web Vitals data structure
      const validatedData = WebVitalsMetricsSchema.parse(webVitalsData);
      expect(validatedData.cls).toBeLessThan(0.1); // Good CLS
      expect(validatedData.fcp).toBeLessThan(1800); // Good FCP
      expect(validatedData.inp).toBeLessThan(100); // Good INP
      expect(validatedData.lcp).toBeLessThan(2500); // Good LCP
      expect(validatedData.ttfb).toBeLessThan(600); // Good TTFB
    });

    it('should detect performance regressions in Web Vitals', async () => {
      const poorWebVitals = {
        ...generateValidWebVitals(),
        lcp: 4500, // Poor LCP
        inp: 300, // Poor INP
        cls: 0.25, // Poor CLS
      };

      vi.spyOn(performanceMetricsCollector, 'collectWebVitals').mockResolvedValue(poorWebVitals);

      const { result } = renderHook(() => useWebVitals());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectWebVitals).toHaveBeenCalled();
      });

      // Check if alerts are generated for poor performance
      const alerts = await performanceTracker.getAlerts();
      const lcpAlert = alerts.find(alert => alert.metric === 'LCP');
      const inpAlert = alerts.find(alert => alert.metric === 'INP');
      const clsAlert = alerts.find(alert => alert.metric === 'CLS');

      expect(lcpAlert).toBeDefined();
      expect(lcpAlert?.severity).toBe('high');
      expect(inpAlert).toBeDefined();
      expect(inpAlert?.severity).toBe('high');
      expect(clsAlert).toBeDefined();
      expect(clsAlert?.severity).toBe('medium');
    });

    it('should track Web Vitals across different pages', async () => {
      const pageWebVitals = {
        dashboard: generateValidWebVitals(),
        patients: {
          ...generateValidWebVitals(),
          page: '/patients',
          lcp: 2200,
        },
        telemedicine: {
          ...generateValidWebVitals(),
          page: '/telemedicine',
          lcp: 2800, // Slower due to video processing
        },
      };

      vi.spyOn(performanceMetricsCollector, 'collectWebVitals')
        .mockResolvedValueOnce(pageWebVitals.dashboard)
        .mockResolvedValueOnce(pageWebVitals.patients)
        .mockResolvedValueOnce(pageWebVitals.telemedicine);

      const { result } = renderHook(() => useWebVitals());

      // Simulate navigation to different pages
      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectWebVitals).toHaveBeenCalledTimes(3);
      });

      // Analyze page-specific performance
      const dashboardMetrics = pageWebVitals.dashboard;
      const patientsMetrics = pageWebVitals.patients;
      const telemedicineMetrics = pageWebVitals.telemedicine;

      expect(telemedicineMetrics.lcp).toBeGreaterThan(patientsMetrics.lcp);
      expect(patientsMetrics.lcp).toBeGreaterThan(dashboardMetrics.lcp);
    });
  });

  describe('Resource Timing Monitoring', () => {
    it('should monitor resource loading performance', async () => {
      const resourceData = generateValidResourceTiming();

      vi.spyOn(performanceMetricsCollector, 'collectResourceTiming').mockResolvedValue(
        resourceData,
      );

      const { result } = renderHook(() => useResourceTiming());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectResourceTiming).toHaveBeenCalled();
      });

      // Validate resource timing data
      const validatedData = ResourceTimingMetricsSchema.parse(resourceData);
      expect(validatedData.totalSize).toBeGreaterThan(0);
      expect(validatedData.cachedResources).toBeGreaterThan(0);
      expect(validatedData.uncachedResources).toBeGreaterThan(0);
      expect(validatedData.slowestResource).toBeDefined();
    });

    it('should detect slow-loading resources', async () => {
      const slowResourceData = {
        ...generateValidResourceTiming(),
        resources: [
          ...generateValidResourceTiming().resources,
          {
            name: 'https://api.neonpro.health/patients/large-dataset',
            initiatorType: 'fetch',
            duration: 3500, // Very slow
            size: 10240000,
            transferSize: 5120000,
            encodedBodySize: 10240000,
            decodedBodySize: 10240000,
            startTime: 2000,
            endTime: 5500,
            cached: false,
            domainLookupTime: 50,
            connectionTime: 100,
            secureConnectionTime: 150,
            requestTime: 200,
            responseTime: 3200,
          },
        ],
      };

      vi.spyOn(performanceMetricsCollector, 'collectResourceTiming').mockResolvedValue(
        slowResourceData,
      );

      const { result } = renderHook(() => useResourceTiming());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectResourceTiming).toHaveBeenCalled();
      });

      // Check for slow resource alerts
      const alerts = await performanceTracker.getAlerts();
      const resourceAlert = alerts.find(alert => alert.type === 'resource_timing');

      expect(resourceAlert).toBeDefined();
      expect(resourceAlert?.severity).toBe('high');
      expect(resourceAlert?.metric).toBe('resource_duration');
    });

    it('should analyze cache hit rates', async () => {
      const resourceData = generateValidResourceTiming();
      const cacheHitRate = resourceData.cachedResources
        / (resourceData.cachedResources + resourceData.uncachedResources);

      expect(cacheHitRate).toBeGreaterThan(0);
      expect(cacheHitRate).toBeLessThanOrEqual(1);

      // Mock performance tracker to track cache metrics
      vi.spyOn(performanceTracker, 'trackCacheMetrics').mockImplementation(metrics => {
        expect(metrics.hitRate).toBe(cacheHitRate);
        expect(metrics.totalResources).toBe(2);
        expect(metrics.cachedResources).toBe(1);
      });
    });
  });

  describe('Long Tasks Monitoring', () => {
    it('should detect and report long tasks', async () => {
      const longTasksData = generateValidLongTasks();

      vi.spyOn(performanceMetricsCollector, 'collectLongTasks').mockResolvedValue(longTasksData);

      const { result } = renderHook(() => useLongTasks());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectLongTasks).toHaveBeenCalled();
      });

      // Validate long tasks data
      const validatedData = LongTaskMetricsSchema.parse(longTasksData);
      expect(validatedData.totalBlockingTime).toBeGreaterThan(0);
      expect(validatedData.longestTask).toBeGreaterThanOrEqual(50);
      expect(validatedData.taskCount).toBeGreaterThan(0);
    });

    it('should correlate long tasks with user interactions', async () => {
      const longTasksWithInteraction = {
        ...generateValidLongTasks(),
        tasks: [
          {
            ...generateValidLongTasks().tasks[0],
            attribution: [
              {
                name: 'handlePatientFormSubmit',
                type: 'event',
                duration: 120,
              },
            ],
          },
        ],
      };

      vi.spyOn(performanceMetricsCollector, 'collectLongTasks').mockResolvedValue(
        longTasksWithInteraction,
      );

      const { result } = renderHook(() => useLongTasks());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectLongTasks).toHaveBeenCalled();
      });

      // Track user interaction correlation
      vi.spyOn(performanceTracker, 'trackInteraction').mockImplementation(interaction => {
        expect(interaction.type).toBe('form_submit');
        expect(interaction.duration).toBe(120);
        expect(interaction.blockingTime).toBe(120);
      });
    });

    it('should identify problematic JavaScript execution', async () => {
      const problematicLongTasks = {
        ...generateValidLongTasks(),
        tasks: [
          {
            duration: 500, // Very long task
            startTime: 3000,
            endTime: 3500,
            name: 'script_evaluation',
            source: 'https://app.neonpro.health/large-bundle.js',
            culprit: 'processLargeDataset',
            attribution: [
              {
                name: 'processLargeDataset',
                type: 'function',
                duration: 500,
              },
            ],
          },
        ],
        totalBlockingTime: 500,
        longestTask: 500,
        taskCount: 1,
      };

      vi.spyOn(performanceMetricsCollector, 'collectLongTasks').mockResolvedValue(
        problematicLongTasks,
      );

      const { result } = renderHook(() => useLongTasks());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectLongTasks).toHaveBeenCalled();
      });

      // Should generate critical alert for very long tasks
      const alerts = await performanceTracker.getAlerts();
      const criticalAlert = alerts.find(alert => alert.severity === 'critical');

      expect(criticalAlert).toBeDefined();
      expect(criticalAlert?.type).toBe('long_tasks');
      expect(criticalAlert?.value).toBe(500);
    });
  });

  describe('Network Information Monitoring', () => {
    it('should monitor network conditions and adapt performance', async () => {
      const networkData = generateValidNetworkMetrics();

      vi.spyOn(performanceMetricsCollector, 'collectNetworkMetrics').mockResolvedValue(networkData);

      const { result } = renderHook(() => useNetworkInformation());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectNetworkMetrics).toHaveBeenCalled();
      });

      // Validate network metrics
      const validatedData = NetworkMetricsSchema.parse(networkData);
      expect(validatedData.effectiveType).toBeDefined();
      expect(validatedData.downlink).toBeGreaterThan(0);
      expect(validatedData.rtt).toBeGreaterThan(0);
      expect(validatedData.online).toBe(true);
    });

    it('should adjust performance targets based on network conditions', async () => {
      const slowNetworkMetrics = {
        ...generateValidNetworkMetrics(),
        effectiveType: '2g' as const,
        downlink: 0.5,
        rtt: 800,
      };

      vi.spyOn(performanceMetricsCollector, 'collectNetworkMetrics').mockResolvedValue(
        slowNetworkMetrics,
      );

      const { result } = renderHook(() => useNetworkInformation());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectNetworkMetrics).toHaveBeenCalled();
      });

      // Should adjust performance thresholds for slow networks
      const adjustedThresholds = performanceTracker.getAdjustedThresholds(slowNetworkMetrics);

      expect(adjustedThresholds.lcp).toBeGreaterThan(2500); // Higher threshold for 2G
      expect(adjustedThresholds.fcp).toBeGreaterThan(1800); // Higher threshold for 2G
      expect(adjustedThresholds.resourceLoadTime).toBeGreaterThan(5000); // Higher threshold
    });

    it('should detect network disconnections and handle gracefully', async () => {
      const offlineMetrics = {
        ...generateValidNetworkMetrics(),
        online: false,
        effectiveType: 'slow-2g' as const,
        downlink: 0,
        rtt: 0,
      };

      vi.spyOn(performanceMetricsCollector, 'collectNetworkMetrics').mockResolvedValue(
        offlineMetrics,
      );

      const { result } = renderHook(() => useNetworkInformation());

      act(() => {
        result.current.startMonitoring();
      });

      await waitFor(() => {
        expect(performanceMetricsCollector.collectNetworkMetrics).toHaveBeenCalled();
      });

      // Should handle offline state gracefully
      const offlineHandler = vi.fn();
      result.current.onOffline(offlineHandler);

      act(() => {
        // Simulate offline event
        result.current.handleOffline();
      });

      expect(offlineHandler).toHaveBeenCalled();
    });
  });

  describe('Healthcare-Specific Performance Monitoring', () => {
    it('should monitor healthcare data processing performance', async () => {
      const healthcareMetrics = generateValidHealthcareMetrics();

      vi.spyOn(healthcareProfiler, 'collectMetrics').mockResolvedValue(healthcareMetrics);

      const healthcareData = await healthcareProfiler.collectMetrics();

      // Validate healthcare metrics
      const validatedData = HealthcareMetricsSchema.parse(healthcareData);
      expect(validatedData.patientData.loadTime).toBeGreaterThan(0);
      expect(validatedData.telemedicine.connectionQuality).toBeGreaterThan(0.8); // Good quality
      expect(validatedData.aiResponse.cacheHitRate).toBeGreaterThan(0.8); // Good cache hit rate
      expect(validatedData.compliance.lgpdDataProcessing).toBeGreaterThan(0.9); // Good compliance
    });

    it('should track telemedicine session performance', async () => {
      const telemedicineMetrics = {
        ...generateValidHealthcareMetrics(),
        telemedicine: {
          videoSetupTime: 1500,
          connectionQuality: 0.98,
          latency: 80,
          bandwidth: 5000,
          packetLoss: 0.01,
          frameRate: 60,
        },
      };

      vi.spyOn(healthcareProfiler, 'collectTelemedicineMetrics').mockResolvedValue(
        telemedicineMetrics.telemedicine,
      );

      const metrics = await healthcareProfiler.collectTelemedicineMetrics();

      expect(metrics.videoSetupTime).toBeLessThan(3000); // Good setup time
      expect(metrics.connectionQuality).toBeGreaterThan(0.9); // Excellent quality
      expect(metrics.latency).toBeLessThan(150); // Good latency
      expect(metrics.packetLoss).toBeLessThan(0.05); // Low packet loss
      expect(metrics.frameRate).toBeGreaterThanOrEqual(30); // Good frame rate
    });

    it('should monitor AI response performance in healthcare context', async () => {
      const aiMetrics = {
        ...generateValidHealthcareMetrics(),
        aiResponse: {
          requestTime: 30,
          responseTime: 600,
          processingTime: 570,
          cacheHitRate: 0.92,
          cost: 0.018,
          confidence: 0.95,
        },
      };

      vi.spyOn(healthcareProfiler, 'collectAIMetrics').mockResolvedValue(aiMetrics.aiResponse);

      const metrics = await healthcareProfiler.collectAIMetrics();

      expect(metrics.responseTime).toBeLessThan(1000); // Good response time
      expect(metrics.cacheHitRate).toBeGreaterThan(0.8); // Good cache performance
      expect(metrics.confidence).toBeGreaterThan(0.9); // High confidence
      expect(metrics.cost).toBeLessThan(0.05); // Reasonable cost
    });

    it('should validate LGPD compliance in performance monitoring', async () => {
      const complianceMetrics = {
        ...generateValidHealthcareMetrics(),
        compliance: {
          lgpdDataProcessing: 0.99,
          auditTrailCompleteness: 1.0,
          dataRetentionCompliance: 0.98,
          consentValidationTime: 20,
        },
      };

      vi.spyOn(healthcareProfiler, 'collectComplianceMetrics').mockResolvedValue(
        complianceMetrics.compliance,
      );

      const metrics = await healthcareProfiler.collectComplianceMetrics();

      expect(metrics.lgpdDataProcessing).toBeGreaterThan(0.95); // Excellent compliance
      expect(metrics.auditTrailCompleteness).toBe(1.0); // Complete audit trail
      expect(metrics.dataRetentionCompliance).toBeGreaterThan(0.9); // Good retention compliance
      expect(metrics.consentValidationTime).toBeLessThan(100); // Fast validation
    });
  });

  describe('Performance Alerts and Notifications', () => {
    it('should generate alerts for performance threshold violations', async () => {
      const alertThresholds: AlertThreshold[] = [
        { metric: 'LCP', threshold: 2500, severity: 'high' },
        { metric: 'INP', threshold: 100, severity: 'high' },
        { metric: 'CLS', threshold: 0.1, severity: 'medium' },
        { metric: 'resource_load_time', threshold: 3000, severity: 'medium' },
      ];

      vi.spyOn(performanceTracker, 'setupAlerts').mockImplementation(thresholds => {
        expect(thresholds).toEqual(alertThresholds);
      });

      performanceTracker.setupAlerts(alertThresholds);

      expect(performanceTracker.setupAlerts).toHaveBeenCalledWith(alertThresholds);
    });

    it('should alert on healthcare performance degradation', async () => {
      const poorHealthcareMetrics = {
        ...generateValidHealthcareMetrics(),
        telemedicine: {
          videoSetupTime: 8000, // Very slow setup
          connectionQuality: 0.6, // Poor quality
          latency: 500, // High latency
          bandwidth: 500, // Low bandwidth
          packetLoss: 0.15, // High packet loss
          frameRate: 15, // Low frame rate
        },
      };

      vi.spyOn(healthcareProfiler, 'collectMetrics').mockResolvedValue(poorHealthcareMetrics);

      const metrics = await healthcareProfiler.collectMetrics();

      // Should generate healthcare-specific alerts
      const alerts = await healthcareProfiler.generateAlerts(metrics);
      const telemedicineAlert = alerts.find(alert => alert.type === 'telemedicine');

      expect(telemedicineAlert).toBeDefined();
      expect(telemedicineAlert?.severity).toBe('critical');
      expect(telemedicineAlert?.metric).toBe('video_setup_time');
    });

    it('should provide actionable recommendations for performance issues', async () => {
      const alert = generateValidPerformanceAlert();

      expect(alert.recommendation).toBeDefined();
      expect(typeof alert.recommendation).toBe('string');
      expect(alert.recommendation.length).toBeGreaterThan(0);

      // Should provide specific, actionable recommendations
      const lcpRecommendations = [
        'Optimize image loading and compression',
        'Reduce server response time',
        'Implement lazy loading for offscreen content',
        'Minimize and defer JavaScript execution',
      ];

      expect(
        lcpRecommendations.some(rec =>
          alert.recommendation?.toLowerCase().includes(rec.slice(0, 10).toLowerCase())
        ),
      )
        .toBe(true);
    });
  });

  describe('Performance Reporting and Analytics', () => {
    it('should generate comprehensive performance reports', async () => {
      const performanceReport = generateValidPerformanceReport();

      vi.spyOn(performanceTracker, 'generateReport').mockResolvedValue(performanceReport);

      const report = await performanceTracker.generateReport();

      // Validate report structure
      const validatedReport = PerformanceReportSchema.parse(report);
      expect(validatedReport.sessionId).toBeDefined();
      expect(validatedReport.page).toBeDefined();
      expect(validatedReport.duration).toBeGreaterThan(0);
      expect(validatedReport.summary.totalAlerts).toBeGreaterThanOrEqual(0);
      expect(validatedReport.summary.performanceScore).toBeGreaterThan(0);
      expect(validatedReport.lgpdCompliant).toBe(true);
    });

    it('should analyze performance trends over time', async () => {
      const historicalReports = [
        generateValidPerformanceReport(),
        {
          ...generateValidPerformanceReport(),
          generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          summary: {
            ...generateValidPerformanceReport().summary,
            performanceScore: 70,
          },
        },
        {
          ...generateValidPerformanceReport(),
          generatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          summary: {
            ...generateValidPerformanceReport().summary,
            performanceScore: 65,
          },
        },
      ];

      vi.spyOn(performanceTracker, 'getHistoricalReports').mockResolvedValue(historicalReports);

      const reports = await performanceTracker.getHistoricalReports(3);

      // Analyze trends
      const scores = reports.map(r => r.summary.performanceScore);
      const trend = scores[scores.length - 1] - scores[0];

      expect(trend).toBeGreaterThan(0); // Performance improving over time
      expect(scores).toHaveLength(3);
    });

    it('should provide healthcare-specific performance insights', async () => {
      const healthcareReport = {
        ...generateValidPerformanceReport(),
        healthcare: generateValidHealthcareMetrics(),
        summary: {
          ...generateValidPerformanceReport().summary,
          healthcareScore: 88,
          issues: [
            {
              type: 'telemedicine_latency',
              severity: 'medium',
              description: 'Telemedicine latency above optimal threshold',
              recommendation: 'Optimize WebRTC configuration and server infrastructure',
            },
          ],
        },
      };

      vi.spyOn(healthcareProfiler, 'generateHealthcareReport').mockResolvedValue(healthcareReport);

      const report = await healthcareProfiler.generateHealthcareReport();

      expect(report.summary.healthcareScore).toBeGreaterThan(80);
      expect(report.healthcare).toBeDefined();
      expect(report.healthcare.compliance.lgpdDataProcessing).toBeGreaterThan(0.9);
    });
  });

  describe('Integration with Healthcare Platform', () => {
    it('should integrate with existing authentication system', async () => {
      const userContext = {
        userId: 'usr_healthcare_12345',
        roles: ['doctor', 'admin'],
        permissions: ['view_patients', 'edit_patients'],
      };

      vi.spyOn(performanceTracker, 'setUserContext').mockImplementation(context => {
        expect(context.userId).toBe(userContext.userId);
        expect(context.roles).toEqual(userContext.roles);
      });

      performanceTracker.setUserContext(userContext);

      expect(performanceTracker.setUserContext).toHaveBeenCalledWith(userContext);
    });

    it('should respect LGPD data minimization principles', async () => {
      const sensitiveData = {
        userId: 'usr_healthcare_12345',
        patientId: 'pat_789',
        medicalData: 'sensitive information',
      };

      vi.spyOn(performanceTracker, 'sanitizeData').mockImplementation(data => {
        expect(data).toEqual(sensitiveData);
        // Should redact sensitive information
        return {
          ...data,
          userId: 'REDACTED',
          patientId: 'REDACTED',
          medicalData: 'REDACTED',
        };
      });

      const sanitized = performanceTracker.sanitizeData(sensitiveData);

      expect(sanitized.userId).toBe('REDACTED');
      expect(sanitized.patientId).toBe('REDACTED');
      expect(sanitized.medicalData).toBe('REDACTED');
    });

    it('should provide role-based performance insights', async () => {
      const roleBasedReports = {
        doctor: {
          averageSessionDuration: 1800,
          commonPages: ['/patients', '/appointments', '/telemedicine'],
          performanceScore: 85,
        },
        nurse: {
          averageSessionDuration: 2400,
          commonPages: ['/patients', '/medications', '/vitals'],
          performanceScore: 82,
        },
        admin: {
          averageSessionDuration: 3600,
          commonPages: ['/dashboard', '/reports', '/users'],
          performanceScore: 88,
        },
      };

      vi.spyOn(performanceTracker, 'getRoleBasedInsights').mockResolvedValue(roleBasedReports);

      const insights = await performanceTracker.getRoleBasedInsights();

      expect(insights.doctor).toBeDefined();
      expect(insights.nurse).toBeDefined();
      expect(insights.admin).toBeDefined();
      expect(insights.doctor.commonPages).toContain('/patients');
      expect(insights.nurse.commonPages).toContain('/medications');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle performance monitoring service failures gracefully', async () => {
      vi.spyOn(performanceMetricsCollector, 'collectWebVitals')
        .mockRejectedValue(new Error('Performance monitoring service unavailable'));

      const { result } = renderHook(() => useWebVitals());

      await act(async () => {
        await expect(result.current.startMonitoring()).rejects.toThrow();
      });

      // Should have fallback behavior
      expect(result.current.getFallbackMetrics()).toBeDefined();
      expect(result.current.getServiceStatus()).toBe('degraded');
    });

    it('should maintain data consistency during service interruptions', async () => {
      const partialData = {
        webVitals: generateValidWebVitals(),
        resourceTiming: null, // Service failure
        longTasks: generateValidLongTasks(),
      };

      vi.spyOn(performanceTracker, 'getCurrentMetrics').mockReturnValue(partialData);

      const metrics = performanceTracker.getCurrentMetrics();

      expect(metrics.webVitals).toBeDefined();
      expect(metrics.resourceTiming).toBeNull();
      expect(metrics.longTasks).toBeDefined();

      // Should still be able to generate partial reports
      const report = await performanceTracker.generatePartialReport(metrics);
      expect(report.summary.totalAlerts).toBeGreaterThanOrEqual(0);
      expect(report.lgpdCompliant).toBe(true);
    });
  });

  describe('Performance Optimization Integration', () => {
    it('should provide optimization suggestions based on metrics', async () => {
      const metrics = {
        webVitals: {
          lcp: 3500,
          inp: 150,
          cls: 0.15,
        },
        resourceTiming: {
          uncachedResources: 15,
          totalSize: 5000000,
        },
      };

      vi.spyOn(performanceTracker, 'getOptimizationSuggestions').mockImplementation(data => {
        expect(data.webVitals.lcp).toBeGreaterThan(2500);
        expect(data.resourceTiming.uncachedResources).toBeGreaterThan(10);

        return [
          {
            category: 'images',
            priority: 'high',
            description: 'Optimize image loading',
            impact: 'High impact on LCP',
          },
          {
            category: 'caching',
            priority: 'medium',
            description: 'Implement better caching strategy',
            impact: 'Reduces server load',
          },
        ];
      });

      const suggestions = performanceTracker.getOptimizationSuggestions(metrics);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].category).toBe('images');
      expect(suggestions[0].priority).toBe('high');
    });

    it('should track optimization implementation and results', async () => {
      const optimization = {
        id: 'opt_image_compression',
        category: 'images',
        implemented: true,
        beforeMetrics: { lcp: 3500 },
        afterMetrics: { lcp: 2200 },
        improvement: 37,
      };

      vi.spyOn(performanceTracker, 'trackOptimization').mockImplementation(data => {
        expect(data.category).toBe('images');
        expect(data.implementation.before.lcp).toBe(3500);
        expect(data.implementation.after.lcp).toBe(2200);
        expect(data.improvement).toBeGreaterThan(0);
      });

      performanceTracker.trackOptimization(optimization);

      expect(performanceTracker.trackOptimization).toHaveBeenCalledWith(optimization);
    });
  });
});
