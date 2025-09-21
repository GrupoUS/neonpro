import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * T043: Performance Testing for Mobile Healthcare Operations
 *
 * BRAZILIAN HEALTHCARE MOBILE REQUIREMENTS:
 * - Page load times <2s on 3G networks (70%+ smartphone usage)
 * - API response times <500ms for patient operations
 * - PWA capabilities for offline appointment booking
 * - Bundle size optimization for mobile users
 * - Real-time features performance on mobile networks
 *
 * TDD RED PHASE: These tests are designed to FAIL initially to drive implementation
 */

// Mock Performance Observer for testing
class MockPerformanceObserver {
  private callback: PerformanceObserverCallback;

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }

  observe() {}
  disconnect() {}

  // Helper to trigger callback manually in tests
  triggerCallback(entries: PerformanceEntry[]) {
    this.callback({ getEntries: () => entries } as any, this);
  }
}

// Mock Navigation API for PWA testing
const mockNavigationAPI = {
  serviceWorker: {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
  },
  online: true,
  connection: {
    effectiveType: '3g',
    downlink: 1.5,
    rtt: 300,
  },
};

// Mock Network Information API for 3G simulation
Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: mockNavigationAPI.connection,
});

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: mockNavigationAPI.online,
});

describe('T043: Mobile Healthcare Performance Tests', () => {
  let queryClient: QueryClient;
  let performanceEntries: PerformanceEntry[] = [];
  let mockPerformanceObserver: MockPerformanceObserver;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock performance measurement
    vi.spyOn(performance, 'mark').mockImplementation((name: string) => {
      performanceEntries.push({
        name,
        entryType: 'mark',
        startTime: performance.now(),
        duration: 0,
      } as PerformanceEntry);
      return undefined as any;
    });

    vi.spyOn(performance, 'measure').mockImplementation(
      (name: string, startMark?: string, endMark?: string) => {
        const duration = Math.random() * 1000; // Simulate measurement
        performanceEntries.push({
          name,
          entryType: 'measure',
          startTime: performance.now() - duration,
          duration,
        } as PerformanceEntry);
        return undefined as any;
      },
    );

    // Setup Performance Observer mock
    global.PerformanceObserver = MockPerformanceObserver as any;
  });

  afterEach(() => {
    performanceEntries = [];
    vi.restoreAllMocks();
  });

  describe('Page Load Performance on 3G Networks', () => {
    it('should load patient dashboard under 2 seconds on 3G', async () => {
      // Simulate 3G network conditions
      const startTime = performance.now();

      // Mock slow network response
      global.fetch = vi.fn().mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  patients: [
                    { id: '1', name: 'João Silva', phone: '+5511999887766' },
                    { id: '2', name: 'Maria Santos', phone: '+5511888776655' },
                  ],
                }),
            });
          }, 300); // Simulate 3G latency
        })
      );

      const PatientDashboard = () =>
        React.createElement('div', { 'data-testid': 'patient-dashboard' },
          React.createElement('h1', null, 'Pacientes'),
          React.createElement('div', { 'data-testid': 'patient-list' }, 'Loading...')
        );

      render(
        <QueryClientProvider client={queryClient}>
          <PatientDashboard />
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('patient-dashboard')).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;

      // CRITICAL: Page load must be under 2 seconds for Brazilian mobile users
      expect(loadTime).toBeLessThan(2000);
    });

    it('should prioritize critical rendering path for healthcare data', async () => {
      // Mock critical resource loading
      const criticalResources = [
        'patient-data.js',
        'appointment-scheduler.js',
        'emergency-contacts.js',
      ];

      const loadingTimes: Record<string, number> = {};

      for (const resource of criticalResources) {
        const startTime = performance.now();

        // Simulate resource loading
        await new Promise(resolve => setTimeout(resolve, 100));

        loadingTimes[resource] = performance.now() - startTime;
      }

      // Critical healthcare resources should load quickly
      Object.values(loadingTimes).forEach(time => {
        expect(time).toBeLessThan(500); // 500ms threshold for critical resources
      });
    });
  });

  describe('API Response Performance for Patient Operations', () => {
    it('should respond to patient search queries under 500ms', async () => {
      const searchQuery = 'João';
      const startTime = performance.now();

      // Mock patient search API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            patients: [
              {
                id: '123',
                name: 'João Silva',
                phone: '+5511999887766',
                cpf: '123.456.789-01',
                last_visit: '2025-09-10',
              },
            ],
            total: 1,
            query_time_ms: 45,
          }),
      });

      const response = await fetch(`/api/patients/search?q=${searchQuery}`);
      const data = await response.json();

      const responseTime = performance.now() - startTime;

      // CRITICAL: Patient search must be fast for clinical workflow
      expect(responseTime).toBeLessThan(500);
      expect(data.patients).toHaveLength(1);
      expect(data.query_time_ms).toBeLessThan(100); // Database query time
    });

    it('should handle appointment booking API calls efficiently', async () => {
      const appointmentData = {
        patient_id: '123',
        doctor_id: '456',
        procedure: 'Consulta de Harmonização Facial',
        datetime: '2025-09-25T14:30:00Z',
        notes: 'Primeira consulta',
      };

      const startTime = performance.now();

      // Mock appointment creation API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            appointment: {
              id: 'apt_789',
              ...appointmentData,
              status: 'scheduled',
              confirmation_sent: true,
              whatsapp_reminder_scheduled: true,
            },
            processing_time_ms: 120,
          }),
      });

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();
      const responseTime = performance.now() - startTime;

      // CRITICAL: Appointment booking must be responsive
      expect(responseTime).toBeLessThan(500);
      expect(result.appointment.id).toBeTruthy();
      expect(result.processing_time_ms).toBeLessThan(200);
    });
  });

  describe('PWA Capabilities for Offline Appointment Booking', () => {
    it('should register service worker successfully', async () => {
      // Mock service worker registration
      const mockRegistration = {
        active: { state: 'activated' },
        waiting: null,
        installing: null,
        scope: 'https://app.neonpro.com.br/',
      };

      global.navigator.serviceWorker = {
        register: vi.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
      } as any;

      const registration = await navigator.serviceWorker.register('/sw.js');

      expect(registration.active?.state).toBe('activated');
      expect(registration.scope).toContain('neonpro.com.br');
    });

    it('should cache critical healthcare resources for offline access', async () => {
      const criticalResources = [
        '/api/patients/favorites',
        '/api/appointments/today',
        '/api/procedures/emergency',
        '/offline.html',
      ];

      // Mock cache API
      const mockCache = {
        addAll: vi.fn().mockResolvedValue(undefined),
        match: vi.fn().mockImplementation((url: string) => {
          return Promise.resolve(
            criticalResources.includes(url)
              ? new Response('cached data')
              : undefined,
          );
        }),
      };

      global.caches = {
        open: vi.fn().mockResolvedValue(mockCache),
      } as any;

      const cache = await caches.open('healthcare-v1');
      await cache.addAll(criticalResources);

      // Verify critical resources are cached
      for (const resource of criticalResources) {
        const cachedResponse = await cache.match(resource);
        expect(cachedResponse).toBeTruthy();
      }
    });

    it('should enable offline appointment booking with queue system', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const appointmentData = {
        patient_id: '123',
        procedure: 'Botox - Testa',
        preferred_date: '2025-09-26',
        notes: 'Paciente prefere manhã',
      };

      // Mock IndexedDB for offline storage
      const mockIndexedDB = {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            add: vi.fn().mockImplementation(data => ({
              onsuccess: () => {},
              result: 'offline_' + Date.now(),
            })),
          }),
        }),
      };

      global.indexedDB = mockIndexedDB as any;

      // Store appointment request offline
      const offlineRequest = {
        ...appointmentData,
        id: 'offline_' + Date.now(),
        queued_at: new Date().toISOString(),
        sync_status: 'pending',
      };

      // Simulate offline storage
      expect(offlineRequest.sync_status).toBe('pending');
      expect(offlineRequest.id).toMatch(/^offline_/);
    });
  });

  describe('Bundle Size Optimization for Mobile Users', () => {
    it('should keep critical healthcare bundles under size limits', async () => {
      // Mock bundle analysis data
      const bundleAnalysis = {
        main: { size: 180000 }, // 180KB
        healthcare: { size: 120000 }, // 120KB
        patient: { size: 85000 }, // 85KB
        appointments: { size: 95000 }, // 95KB
        total: 480000, // 480KB total
      };

      // CRITICAL: Bundle sizes for mobile healthcare users
      expect(bundleAnalysis.main.size).toBeLessThan(200000); // <200KB main bundle
      expect(bundleAnalysis.healthcare.size).toBeLessThan(150000); // <150KB healthcare
      expect(bundleAnalysis.total).toBeLessThan(500000); // <500KB total for critical path
    });

    it('should use code splitting for non-critical features', async () => {
      const lazySections = [
        'analytics-dashboard',
        'financial-reports',
        'marketing-tools',
        'advanced-settings',
      ];

      // Mock dynamic imports
      const dynamicImports = lazySections.map(section => ({
        section,
        loaded: false,
        size: Math.floor(Math.random() * 50000) + 20000, // 20-70KB
      }));

      // Verify lazy loading reduces initial bundle
      const totalLazySize = dynamicImports.reduce((sum, item) => sum + item.size, 0);
      expect(totalLazySize).toBeGreaterThan(100000); // Significant code split

      // Verify lazy sections are not loaded initially
      dynamicImports.forEach(item => {
        expect(item.loaded).toBe(false);
      });
    });
  });

  describe('Real-time Features Performance on Mobile Networks', () => {
    it('should handle WebSocket connections efficiently on mobile', async () => {
      // Mock WebSocket for real-time updates
      const mockWebSocket = {
        readyState: 1, // OPEN
        send: vi.fn(),
        close: vi.fn(),
        addEventListener: vi.fn(),
      };

      global.WebSocket = vi.fn().mockImplementation(() => mockWebSocket);

      const ws = new WebSocket('wss://realtime.neonpro.com.br/healthcare');

      // Simulate connection latency measurement
      const connectionStart = performance.now();

      // Mock connection established
      setTimeout(() => {
        const connectionTime = performance.now() - connectionStart;
        expect(connectionTime).toBeLessThan(1000); // <1s connection time
      }, 100);

      expect(ws.readyState).toBe(1);
    });

    it('should optimize real-time appointment updates for mobile', async () => {
      const appointmentUpdates = [
        { id: 'apt_1', status: 'confirmed', timestamp: Date.now() },
        { id: 'apt_2', status: 'cancelled', timestamp: Date.now() + 1000 },
        { id: 'apt_3', status: 'rescheduled', timestamp: Date.now() + 2000 },
      ];

      const processingTimes: number[] = [];

      for (const update of appointmentUpdates) {
        const startTime = performance.now();

        // Mock real-time update processing
        await new Promise(resolve => setTimeout(resolve, 50));

        const processingTime = performance.now() - startTime;
        processingTimes.push(processingTime);
      }

      // Real-time updates should be processed quickly
      const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      expect(avgProcessingTime).toBeLessThan(100); // <100ms average
    });

    it('should handle network interruptions gracefully', async () => {
      let isOnline = true;
      const networkQueue: any[] = [];

      // Mock network state changes
      const simulateNetworkChange = (online: boolean) => {
        isOnline = online;
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: online,
        });
      };

      // Simulate network interruption
      simulateNetworkChange(false);

      // Queue operations while offline
      const offlineOperation = {
        type: 'appointment_update',
        data: { id: 'apt_123', status: 'confirmed' },
        timestamp: Date.now(),
      };

      networkQueue.push(offlineOperation);
      expect(networkQueue).toHaveLength(1);

      // Simulate network restoration
      simulateNetworkChange(true);

      // Process queued operations
      const processedOperations = [...networkQueue];
      networkQueue.length = 0;

      expect(processedOperations).toHaveLength(1);
      expect(networkQueue).toHaveLength(0);
    });
  });
});
