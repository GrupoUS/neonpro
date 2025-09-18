import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * T013: Performance Monitoring Integration Tests
 *
 * PERFORMANCE MONITORING FEATURES:
 * - Web Vitals monitoring with healthcare-specific thresholds
 * - Real user monitoring (RUM) for healthcare applications
 * - Performance metrics collection with LGPD compliance
 * - Healthcare performance validation (emergency response, patient data load)
 * - Performance alerting system for SLA violations
 * - Network performance monitoring for telemedicine
 * - Device performance optimization for mobile healthcare
 * - Custom healthcare metrics (patient safety, emergency workflow timing)
 *
 * TDD RED PHASE: These tests are designed to FAIL initially to drive implementation
 */

// Mock performance APIs
const mockPerformanceObserver = vi.fn();
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock Web Vitals
const mockOnCLS = vi.fn();
const mockOnFID = vi.fn();
const mockOnFCP = vi.fn();
const mockOnLCP = vi.fn();
const mockOnTTFB = vi.fn();
const mockOnINP = vi.fn();

vi.mock('web-vitals', () => ({
  onCLS: mockOnCLS,
  onFID: mockOnFID,
  onFCP: mockOnFCP,
  onLCP: mockOnLCP,
  onTTFB: mockOnTTFB,
  onINP: mockOnINP,
}));

// Mock components that will need to be implemented
const MockPerformanceDashboard = () => (
  <div data-testid='performance-dashboard'>Performance Dashboard</div>
);
const MockWebVitalsMonitor = () => (
  <div data-testid='web-vitals-monitor'>Web Vitals Monitor</div>
);
const MockPerformanceAlerts = () => (
  <div data-testid='performance-alerts'>Performance Alerts</div>
);
const MockHealthcareMetrics = () => (
  <div data-testid='healthcare-metrics'>Healthcare Metrics</div>
);

// Test query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('Integration: Performance Monitoring', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Reset performance mock values
    mockPerformance.now.mockReturnValue(Date.now());
    mockPerformance.getEntriesByType.mockReturnValue([]);
    mockPerformance.getEntriesByName.mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Web Vitals Monitoring Integration', () => {
    it('should initialize Web Vitals monitoring with healthcare thresholds', async () => {
      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockWebVitalsMonitor />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Verify Web Vitals callbacks are registered
      await waitFor(() => {
        expect(mockOnCLS).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            reportAllChanges: false,
          })
        );
        expect(mockOnLCP).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            reportAllChanges: false,
          })
        );
        expect(mockOnFID).toHaveBeenCalledWith(
          expect.any(Function),
          expect.objectContaining({
            reportAllChanges: false,
          })
        );
      });

      // Verify healthcare-specific thresholds are configured
      expect(mockOnCLS).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          healthcare: expect.objectContaining({
            patient_safety_threshold: 0.1,
            emergency_workflow_threshold: 0.05,
          }),
        })
      );

      unmount();
    });

    it('should collect and report Core Web Vitals metrics', async () => {
      const mockVitalHandler = vi.fn();
      
      // Setup Web Vitals monitoring
      mockOnCLS.mockImplementation((handler) => {
        mockVitalHandler({
          id: 'cls-1',
          name: 'CLS',
          value: 0.05,
          delta: 0.02,
          entries: [],
          navigationType: 'navigate',
        });
      });

      mockOnLCP.mockImplementation((handler) => {
        mockVitalHandler({
          id: 'lcp-1',
          name: 'LCP',
          value: 2500,
          delta: 100,
          entries: [],
          navigationType: 'navigate',
        });
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockWebVitalsMonitor />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Verify metrics are collected and reported
      await waitFor(() => {
        expect(mockVitalHandler).toHaveBeenCalledTimes(2);
        
        // Verify healthcare-specific validation
        const clsCall = mockVitalHandler.mock.calls.find(
          (call) => call[0].name === 'CLS'
        );
        expect(clsCall[0].value).toBeLessThanOrEqual(0.1); // Healthcare CLS threshold
        
        const lcpCall = mockVitalHandler.mock.calls.find(
          (call) => call[0].name === 'LCP'
        );
        expect(lcpCall[0].value).toBeLessThanOrEqual(4000); // Healthcare LCP threshold
      });

      unmount();
    });

    it('should handle emergency workflow performance monitoring', async () => {
      const emergencyVitalHandler = vi.fn();
      
      // Simulate emergency workflow scenario
      mockOnTTFB.mockImplementation((handler) => {
        emergencyVitalHandler({
          id: 'ttfb-emergency',
          name: 'TTFB',
          value: 800, // Critical for emergency workflows
          delta: 200,
          entries: [],
          navigationType: 'navigate',
        });
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockWebVitalsMonitor />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(emergencyVitalHandler).toHaveBeenCalled();
        
        // Verify emergency performance alerts
        const ttfbMetric = emergencyVitalHandler.mock.calls[0][0];
        expect(ttfbMetric.value).toBeGreaterThan(500); // Emergency threshold exceeded
        
        // Verify emergency escalation is triggered
        expect(screen.queryByTestId('emergency-performance-alert')).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Real User Monitoring (RUM) Integration', () => {
    it('should track user interactions with healthcare features', async () => {
      const interactionTracking = vi.fn();
      
      // Mock PerformanceObserver for user interaction tracking
      mockPerformanceObserver.mockImplementation((callback) => {
        // Simulate user interaction entries
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'patient-record-access',
              startTime: 100,
              duration: 250,
              detail: { feature: 'patient_records', userId: 'user-123' },
            },
            {
              entryType: 'measure',
              name: 'appointment-scheduling',
              startTime: 400,
              duration: 1800,
              detail: { feature: 'appointments', isEmergency: false },
            },
          ] as PerformanceEntryList);
        }, 100);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Simulate user interactions
      const patientRecordButton = screen.getByRole('button', { name: /patient record/i });
      await user.click(patientRecordButton);

      const appointmentButton = screen.getByRole('button', { name: /schedule appointment/i });
      await user.click(appointmentButton);

      // Verify interaction tracking
      await waitFor(() => {
        expect(interactionTracking).toHaveBeenCalledWith(
          expect.objectContaining({
            feature: 'patient_records',
            responseTime: expect.any(Number),
            healthcareContext: expect.objectContaining({
              patientDataAccess: true,
              lgpdCompliant: true,
            }),
          })
        );
      });

      unmount();
    });

    it('should monitor page load performance for healthcare workflows', async () => {
      // Mock page load performance entries
      mockPerformance.getEntriesByType.mockReturnValue([
        {
          entryType: 'navigation',
          startTime: 0,
          duration: 3500,
          domContentLoadedEventStart: 1200,
          domContentLoadedEventEnd: 1300,
          loadEventStart: 3200,
          loadEventEnd: 3500,
          responseEnd: 800,
        } as PerformanceNavigationTiming,
      ]);

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Verify page load metrics collection
      await waitFor(() => {
        expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('navigation');
        
        // Verify healthcare-specific load time validation
        const navigationEntry = mockPerformance.getEntriesByType('navigation')[0];
        expect(navigationEntry.duration).toBeLessThanOrEqual(5000); // Healthcare load threshold
        
        // Verify patient data protection during load
        expect(screen.queryByTestId('load-time-privacy-check')).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Healthcare Performance Validation', () => {
    it('should validate emergency response times', async () => {
      const emergencyResponseHandler = vi.fn();
      
      // Simulate emergency performance monitoring
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'emergency-patient-access',
              startTime: 0,
              duration: 1200, // Should be < 1000ms for emergency
              detail: { 
                isEmergency: true,
                patientId: 'emergency-patient-123',
                workflow: 'critical_care',
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockHealthcareMetrics />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify emergency performance violation detection
        expect(emergencyResponseHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            violation: true,
            metric: 'emergency_response_time',
            threshold: 1000,
            actual: 1200,
            severity: 'critical',
            patientSafetyImpact: true,
          })
        );

        // Verify emergency alert is triggered
        expect(screen.queryByTestId('emergency-performance-alert')).toBeInTheDocument();
        expect(screen.queryByText(/Emergency response time exceeded/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should monitor patient data load performance', async () => {
      // Simulate patient data loading performance
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'patient-record-load',
              startTime: 0,
              duration: 2800, // Large patient records
              detail: { 
                recordSize: '2.5MB',
                patientId: 'patient-456',
                dataTypes: ['demographics', 'medical_history', 'medications', 'allergies'],
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockHealthcareMetrics />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify patient data load monitoring
        expect(screen.queryByTestId('patient-data-load-metrics')).toBeInTheDocument();
        
        // Verify LGPD compliance during data loading
        expect(screen.queryByText(/LGPD compliant data processing/)).toBeInTheDocument();
        
        // Verify data size optimization recommendations
        expect(screen.queryByText(/Consider data compression/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should track telemedicine session performance', async () => {
      // Simulate telemedicine performance monitoring
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'video-consultation-setup',
              startTime: 0,
              duration: 3200,
              detail: { 
                sessionType: 'video_consultation',
                networkQuality: 'good',
                resolution: '720p',
                latency: 150,
              },
            },
            {
              entryType: 'measure',
              name: 'real-time-chat-latency',
              startTime: 3500,
              duration: 45,
              detail: { 
                messageType: 'text',
                deliverySuccess: true,
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockHealthcareMetrics />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify telemedicine performance tracking
        expect(screen.queryByTestId('telemedicine-performance')).toBeInTheDocument();
        
        // Verify network quality monitoring
        expect(screen.queryByText(/Network quality: good/)).toBeInTheDocument();
        
        // Verify video quality optimization
        expect(screen.queryByText(/Video resolution optimized/)).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Performance Alerting System', () => {
    it('should trigger alerts for performance threshold violations', async () => {
      const alertHandler = vi.fn();
      
      // Simulate performance threshold violations
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'api-response-time',
              startTime: 0,
              duration: 5800, // Exceeds healthcare threshold
              detail: { 
                endpoint: '/api/patients',
                threshold: 3000,
                severity: 'high',
                patientFacing: true,
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceAlerts />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify performance alert generation
        expect(alertHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'performance_threshold_violation',
            severity: 'high',
            metric: 'api_response_time',
            value: 5800,
            threshold: 3000,
            healthcareImpact: {
              patientExperience: true,
              workflowDisruption: true,
              potentialDataLoss: false,
            },
          })
        );

        // Verify alert display
        expect(screen.queryByTestId('performance-alert')).toBeInTheDocument();
        expect(screen.queryByText(/API response time exceeded threshold/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should escalate critical performance issues automatically', async () => {
      const escalationHandler = vi.fn();
      
      // Simulate critical performance issue
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'emergency-system-response',
              startTime: 0,
              duration: 9500, // Critical for emergency systems
              detail: { 
                system: 'emergency_triage',
                availability: 'degraded',
                patientSafetyRisk: true,
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceAlerts />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify automatic escalation
        expect(escalationHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            escalated: true,
            reason: 'critical_performance_issue',
            system: 'emergency_triage',
            responseTime: 9500,
            patientSafetyRisk: true,
            escalationLevel: 'critical',
            notifyRoles: ['system_administrator', 'healthcare_safety_officer'],
          })
        );

        // Verify critical alert display
        expect(screen.queryByTestId('critical-performance-alert')).toBeInTheDocument();
        expect(screen.queryByText(/Critical system performance issue/)).toBeInTheDocument();
        expect(screen.queryByText(/Patient safety risk detected/)).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Network Performance Monitoring', () => {
    it('should monitor network quality for telemedicine', async () => {
      // Mock Network Information API
      const mockNetworkInformation = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 150,
        saveData: false,
        onchange: null,
      };

      Object.defineProperty(navigator, 'connection', {
        value: mockNetworkInformation,
        writable: true,
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockHealthcareMetrics />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify network quality monitoring
        expect(screen.queryByTestId('network-quality-monitor')).toBeInTheDocument();
        
        // Verify telemedicine suitability assessment
        expect(screen.queryByText(/Network suitable for telemedicine/)).toBeInTheDocument();
        
        // Verify adaptive quality recommendations
        expect(screen.queryByText(/Video quality optimized for 4G/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should handle network degradation gracefully', async () => {
      // Simulate network degradation
      const mockNetworkInformation = {
        effectiveType: '2g',
        downlink: 0.3,
        rtt: 800,
        saveData: true,
        onchange: null,
      };

      Object.defineProperty(navigator, 'connection', {
        value: mockNetworkInformation,
        writable: true,
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockHealthcareMetrics />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify network degradation detection
        expect(screen.queryByTestId('network-degradation-alert')).toBeInTheDocument();
        
        // Verify fallback mechanisms activation
        expect(screen.queryByText(/Low bandwidth mode activated/)).toBeInTheDocument();
        
        // Verify patient communication preservation
        expect(screen.queryByText(/Emergency communication maintained/)).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Mobile Healthcare Performance', () => {
    it('should optimize performance for mobile devices', async () => {
      // Mock mobile device detection
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });

      // Mock device memory API
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 4,
        writable: true,
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify mobile optimization
        expect(screen.queryByTestId('mobile-optimization')).toBeInTheDocument();
        
        // Verify resource management
        expect(screen.queryByText(/Mobile device detected - optimizing resources/)).toBeInTheDocument();
        
        // Verify battery awareness
        expect(screen.queryByText(/Battery optimization active/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should monitor battery impact on healthcare features', async () => {
      // Mock Battery API
      const mockBattery = {
        level: 0.2,
        charging: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(navigator, 'getBattery', {
        value: vi.fn(() => Promise.resolve(mockBattery)),
        writable: true,
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify battery monitoring
        expect(screen.queryByTestId('battery-monitor')).toBeInTheDocument();
        
        // Verify low battery adaptation
        expect(screen.queryByText(/Low battery mode activated/)).toBeInTheDocument();
        
        // Verify critical features preservation
        expect(screen.queryByText(/Emergency features prioritized/)).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Healthcare Compliance Integration', () => {
    it('should ensure LGPD compliance during performance monitoring', async () => {
      const complianceHandler = vi.fn();
      
      // Simulate performance monitoring with LGPD considerations
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'patient-data-access',
              startTime: 0,
              duration: 450,
              detail: { 
                patientId: 'patient-789',
                dataType: 'sensitive_health_data',
                anonymized: true,
                dataRetention: '30_days',
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockHealthcareMetrics />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify LGPD compliance monitoring
        expect(complianceHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            lgpdCompliant: true,
            patientDataAnonymized: true,
            retentionPolicy: '30_days',
            dataProcessingPurpose: 'performance_optimization',
          })
        );

        // Verify compliance indicators
        expect(screen.queryByTestId('lgpd-compliance-indicator')).toBeInTheDocument();
        expect(screen.queryByText(/LGPD compliant performance monitoring/)).toBeInTheDocument();
      });

      unmount();
    });

    it('should maintain audit trail for performance metrics', async () => {
      const auditHandler = vi.fn();
      
      // Simulate performance metric audit logging
      mockPerformanceObserver.mockImplementation((callback) => {
        setTimeout(() => {
          callback.observe([
            {
              entryType: 'measure',
              name: 'system-performance-audit',
              startTime: 0,
              duration: 1200,
              detail: { 
                auditId: 'audit-123',
                metrics: ['response_time', 'throughput', 'error_rate'],
                compliance: 'lgpd_hipaa_anvisa',
                retentionPeriod: 365,
              },
            },
          ] as PerformanceEntryList);
        }, 50);
        
        return { observe: vi.fn(), disconnect: vi.fn() };
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <MockPerformanceDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Verify audit trail maintenance
        expect(auditHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            auditTrailCreated: true,
            complianceStandards: expect.arrayContaining(['lgpd', 'anvisa']),
            dataRetention: 365,
            accessibility: 'healthcare_admin',
          })
        );

        // Verify audit indicators
        expect(screen.queryByTestId('performance-audit-trail')).toBeInTheDocument();
        expect(screen.queryByText(/Performance audit logging active/)).toBeInTheDocument();
      });

      unmount();
    });
  });
});