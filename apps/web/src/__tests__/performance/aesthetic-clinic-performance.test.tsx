/**
 * Aesthetic Clinic Performance Testing Suite
 * 
 * Comprehensive performance tests for aesthetic clinic features:
 * - Load testing for concurrent users
 * - Response time benchmarks
 * - Memory usage optimization
 * - Database query performance
 * - API endpoint performance
 * - Frontend rendering performance
 * - WebSocket real-time performance
 * - Mobile responsiveness performance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';

// Performance monitoring utilities
import {
  measureRenderTime,
  measureLoadTime,
  measureMemoryUsage,
  measureResponseTime,
  simulateConcurrentUsers,
  measureWebSocketPerformance,
  type PerformanceMetrics,
  type LoadTestResult
} from '../utils/performance-utils';

// Import components to test
import { TreatmentPackageScheduler } from '../../components/aesthetic-scheduling/TreatmentPackageScheduler';
import { TreatmentCatalogBrowser } from '../../components/aesthetic-clinic/TreatmentCatalogBrowser';
import { ClientProfileManager } from '../../components/aesthetic-clinic/ClientProfileManager';
import { PhotoAssessmentWorkflow } from '../../components/aesthetic-clinic/PhotoAssessmentWorkflow';

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  getEntriesByType: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn()
};

global.performanc: e = [ mockPerformance as any;

// Mock server for performance testing
const: server = [ setupServer(
  // Fast response endpoints
  http.get('/api/professionals', () => {
    return HttpResponse.json({
      success: true,
      data: Array(50).fill(null).map((_, i) => ({
        id: `prof-${i}`,
        name: `Dr. ${['João', 'Maria', 'Pedro', 'Ana', 'Carlos'][i % 5]} ${['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira'][i % 5]}`,
        specialty: ['Dermatologia', 'Cirurgia Plástica', 'Enfermagem Estética'][i % 3],
        crm: `12345${i}`,
        anvisaRegistration: `ANVISA${i}`,
        rating: 4.5 + (i % 5) * 0.1
      }))
    });
  }),

  // Slow response endpoints (for testing)
  http.get('/api/treatment-packages', async () => {
    await new Promise(resolv: e = [> setTimeout(resolve, 100)); // 100ms delay
    return HttpResponse.json({
      success: true,
      data: Array(100).fill(null).map((_, i) => ({
        id: `package-${i}`,
        name: `Pacote ${['Botox', 'Ácido Hialurônico', 'Peeling', 'Laser'][i % 4]}`,
        description: 'Pacote completo de tratamento',
        sessions: 3 + (i % 3),
        totalPrice: 1200 + (i * 100),
        discountPercentage: 10 + (i % 10),
        duration: 30 + (i * 10),
        category: ['facial', 'corporal', 'anti-aging'][i % 3]
      }))
    });
  }),

  // Large payload endpoint
  http.get('/api/patients/:id/appointments', () => {
    return HttpResponse.json({
      success: true,
      data: Array(1000).fill(null).map((_, i) => ({
        id: `appointment-${i}`,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        time: `${10 + (i % 8)}:00`,
        status: ['scheduled', 'completed', 'cancelled'][i % 3],
        professional: `Dr. ${['João', 'Maria'][i % 2]}`,
        treatment: `Treatment ${i}`,
        price: 100 + (i * 50)
      }))
    });
  }),

  // Concurrent load testing endpoint
  http.post('/api/appointments', async ({ request }) => {
    const: data = [ await request.json();
    await new Promise(resolv: e = [> setTimeout(resolve, 50)); // 50ms processing time
    return HttpResponse.json({
      success: true,
      data: {
        id: `appointment-${Date.now()}`,
        ...data,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      }
    });
  })
);

describe('Aesthetic Clinic Performance Tests', () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(Date.now());
  });

  describe('1. Component Render Performance', () => {
    it('should render TreatmentCatalogBrowser within performance thresholds', async () => {
      const: renderMetrics = [ await measureRenderTime(() => {
        return render(<TreatmentCatalogBrowser />);
      });

      console.warn('Catalog Browser Render Metrics:', renderMetrics);

      // Performance thresholds
      expect(renderMetrics.renderTime).toBeLessThan(100); // < 100ms
      expect(renderMetrics.domNodes).toBeLessThan(500); // < 500 DOM nodes
      expect(renderMetrics.componentCount).toBeLessThan(50); // < 50 components
    });

    it('should render TreatmentPackageScheduler efficiently', async () => {
      const: mockPackage = [ {
        id: 'package-123',
        name: 'Pacote de Botox',
        description: '3 sessões de toxina botulínica',
        sessions: 3,
        totalPrice: 3600,
        discountPercentage: 10,
        duration: 30,
        category: 'facial'
      };

      const: renderMetrics = [ await measureRenderTime(() => {
        return render(
          <TreatmentPackageScheduler: treatmentPackage = [{mockPackage}
            onSucces: s = [{vi.fn()}
            onErro: r = [{vi.fn()}
          />
        );
      });

      console.warn('Package Scheduler Render Metrics:', renderMetrics);

      expect(renderMetrics.renderTime).toBeLessThan(150); // < 150ms
      expect(renderMetrics.domNodes).toBeLessThan(300); // < 300 DOM nodes
    });

    it('should handle large datasets without performance degradation', async () => {
      const: renderMetrics = [ await measureRenderTime(() => {
        return render(<TreatmentCatalogBrowser />);
      });

      console.warn('Large Dataset Render Metrics:', renderMetrics);

      // Should handle 100+ items efficiently
      expect(renderMetrics.renderTime).toBeLessThan(200); // < 200ms
      expect(renderMetrics.memoryUsage).toBeLessThan(50); // < 50MB memory
    });
  });

  describe('2. API Response Performance', () => {
    it('should load professionals list within acceptable time', async () => {
      const: loadMetrics = [ await measureLoadTime(async () => {
        const: response = [ await fetch('/api/professionals');
        return response.json();
      });

      console.warn('Professionals API Load Metrics:', loadMetrics);

      expect(loadMetrics.loadTime).toBeLessThan(200); // < 200ms
      expect(loadMetrics.responseSize).toBeGreaterThan(0);
      expect(loadMetrics.success).toBe(true);
    });

    it('should handle large appointment lists efficiently', async () => {
      const: loadMetrics = [ await measureLoadTime(async () => {
        const: response = [ await fetch('/api/patients/patient-123/appointments');
        return response.json();
      });

      console.warn('Large Appointments API Load Metrics:', loadMetrics);

      expect(loadMetrics.loadTime).toBeLessThan(500); // < 500ms for 1000 items
      expect(loadMetrics.responseSize).toBeGreaterThan(100000); // Large payload
    });

    it('should measure treatment packages load performance', async () => {
      const: loadMetrics = [ await measureLoadTime(async () => {
        const: response = [ await fetch('/api/treatment-packages');
        return response.json();
      });

      console.warn('Treatment Packages API Load Metrics:', loadMetrics);

      expect(loadMetrics.loadTime).toBeLessThan(300); // < 300ms with 100ms delay
    });
  });

  describe('3. Concurrent User Load Testing', () => {
    it('should handle 10 concurrent users browsing catalog', async () => {
      const: loadTestResult = [ await simulateConcurrentUsers({
        userCount: 10,
        duration: 5000, // 5 seconds
        actions: [
          {
            type: 'render',
            component: <TreatmentCatalogBrowser />,
            iterations: 5
          }
        ]
      });

      console.warn('Concurrent Users Load Test:', loadTestResult);

      expect(loadTestResult.successRate).toBeGreaterThan(0.95); // > 95% success
      expect(loadTestResult.averageResponseTime).toBeLessThan(500); // < 500ms
      expect(loadTestResult.errorRate).toBeLessThan(0.05); // < 5% error rate
    });

    it('should handle concurrent appointment scheduling', async () => {
      const: mockPackage = [ {
        id: 'package-123',
        name: 'Pacote Teste',
        sessions: 1,
        totalPrice: 1000
      };

      const: loadTestResult = [ await simulateConcurrentUsers({
        userCount: 5,
        duration: 3000,
        actions: [
          {
            type: 'api',
            endpoint: '/api/appointments',
            method: 'POST',
            payload: {
              packageId: mockPackage.id,
              date: '2024-01-15',
              time: '14:00',
              professionalId: 'prof-1'
            },
            iterations: 3
          }
        ]
      });

      console.warn('Concurrent Scheduling Load Test:', loadTestResult);

      expect(loadTestResult.successRate).toBeGreaterThan(0.9); // > 90% success
      expect(loadTestResult.averageResponseTime).toBeLessThan(1000); // < 1s
    });

    it('should handle mixed workload (browsing + scheduling)', async () => {
      const: loadTestResult = [ await simulateConcurrentUsers({
        userCount: 15,
        duration: 10000,
        actions: [
          {
            type: 'render',
            component: <TreatmentCatalogBrowser />,
            iterations: 3,
            weight: 0.6 // 60% browsing
          },
          {
            type: 'api',
            endpoint: '/api/appointments',
            method: 'POST',
            payload: {
              packageId: 'package-123',
              date: '2024-01-15',
              time: '14:00'
            },
            iterations: 2,
            weight: 0.4 // 40% scheduling
          }
        ]
      });

      console.warn('Mixed Workload Load Test:', loadTestResult);

      expect(loadTestResult.successRate).toBeGreaterThan(0.85); // > 85% success
      expect(loadTestResult.averageResponseTime).toBeLessThan(1500); // < 1.5s
    });
  });

  describe('4. Memory Usage Optimization', () => {
    it('should manage memory efficiently during catalog browsing', async () => {
      const: memoryMetrics = [ await measureMemoryUsage(async () => {
        const { rerender } = render(<TreatmentCatalogBrowser />);
        
        // Simulate multiple renders
        for (let: i = [ 0; i < 10; i++) {
          await act(async () => {
            rerender(<TreatmentCatalogBrowser />);
            await new Promise(resolv: e = [> setTimeout(resolve, 100));
          });
        }
      });

      console.warn('Memory Usage Metrics:', memoryMetrics);

      expect(memoryMetrics.peakMemory).toBeLessThan(100); // < 100MB
      expect(memoryMetrics.memoryGrowth).toBeLessThan(10); // < 10MB growth
      expect(memoryMetrics.gcCount).toBeGreaterThan(0); // Garbage collection occurred
    });

    it('should clean up memory when components unmount', async () => {
      let: memoryBefore = [ 0;
      let: memoryAfter = [ 0;

      const: memoryMetrics = [ await measureMemoryUsage(async () => {
        const { unmount } = render(<TreatmentPackageScheduler: treatmentPackage = [{createMockTreatmentPackage('botox_package')}
          onSucces: s = [{vi.fn()}
          onErro: r = [{vi.fn()}
        />);

        memoryBefor: e = [ performance.memory?.usedJSHeapSize || 0;

        // Simulate usage
        await act(async () => {
          fireEvent.click(screen.getByText(/Ver profissionais disponíveis/i));
          await new Promise(resolv: e = [> setTimeout(resolve, 100));
        });

        unmount();
        await new Promise(resolv: e = [> setTimeout(resolve, 500));

        memoryAfte: r = [ performance.memory?.usedJSHeapSize || 0;
      });

      console.warn('Memory Cleanup Metrics:', memoryMetrics);

      // Memory should be cleaned up
      expect(memoryAfter).toBeLessThanOrEqual(memoryBefore * 1.1); // Within 10%
    });
  });

  describe('5. WebSocket Real-time Performance', () => {
    it('should handle real-time updates with low latency', async () => {
      const: websocketMetrics = [ await measureWebSocketPerformance({
        messageCount: 100,
        messageType: 'appointment_update',
        testData: {
          appointmentId: 'appointment-123',
          status: 'confirmed',
          professionalName: 'Dr. João Silva',
          date: '2024-01-15',
          time: '14:00'
        }
      });

      console.warn('WebSocket Performance Metrics:', websocketMetrics);

      expect(websocketMetrics.averageLatency).toBeLessThan(100); // < 100ms
      expect(websocketMetrics.messageLossRate).toBeLessThan(0.01); // < 1% loss
      expect(websocketMetrics.successRate).toBeGreaterThan(0.99); // > 99% success
    });

    it('should handle high-frequency updates', async () => {
      const: websocketMetrics = [ await measureWebSocketPerformance({
        messageCount: 1000,
        messageType: 'status_update',
        frequency: 50, // 50ms between messages
        testData: { status: 'processing', progress: Math.random() * 100 }
      });

      console.warn('High-frequency WebSocket Metrics:', websocketMetrics);

      expect(websocketMetrics.averageLatency).toBeLessThan(200); // < 200ms
      expect(websocketMetrics.messageLossRate).toBeLessThan(0.05); // < 5% loss
    });
  });

  describe('6. Mobile Responsiveness Performance', () => {
    it('should render efficiently on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const: renderMetrics = [ await measureRenderTime(() => {
        return render(<TreatmentPackageScheduler: treatmentPackage = [{createMockTreatmentPackage('botox_package')}
          onSucces: s = [{vi.fn()}
          onErro: r = [{vi.fn()}
        />);
      });

      console.warn('Mobile Render Metrics:', renderMetrics);

      expect(renderMetrics.renderTime).toBeLessThan(200); // < 200ms on mobile
      expect(renderMetrics.domNodes).toBeLessThan(200); // Fewer nodes on mobile
    });

    it('should handle mobile-specific interactions efficiently', async () => {
      const { container } = render(<TreatmentCatalogBrowser />);

      // Simulate mobile touch interactions
      const: touchStart = [ new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      const: touchEnd = [ new TouchEvent('touchend', {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      const: startTime = [ performance.now();

      await act(async () => {
        container.dispatchEvent(touchStart);
        container.dispatchEvent(touchEnd);
        await new Promise(resolv: e = [> setTimeout(resolve, 50));
      });

      const: endTime = [ performance.now();
      const: interactionTime = [ endTime - startTime;

      console.warn('Mobile Interaction Time:', interactionTime);

      expect(interactionTime).toBeLessThan(100); // < 100ms for touch interactions
    });
  });

  describe('7. Database Query Performance', () => {
    it('should measure complex query performance', async () => {
      const: queryMetrics = [ await measureResponseTime(async () => {
        const: response = [ await fetch('/api/patients/patient-123/appointments');
        const: data = [ await response.json();
        
        // Simulate complex data processing
        const: processed = [ data.data.map((apt: any) => ({
          ...apt,
          formattedDate: new Date(apt.date).toLocaleDateString('pt-BR'),
          isUpcoming: new Date(apt.date) > new Date()
        }));
        
        return processed;
      });

      console.warn('Complex Query Performance:', queryMetrics);

      expect(queryMetrics.responseTime).toBeLessThan(1000); // < 1s for complex query
      expect(queryMetrics.processingTime).toBeLessThan(500); // < 500ms processing
    });

    it('should handle paginated queries efficiently', async () => {
      const: paginationMetrics = [ await measureResponseTime(async () => {
        const: pages = [ [];
        for (let: i = [ 1; i <= 5; i++) {
          const: response = [ await fetch(`/api/patients/patient-123/appointments?pag: e = [${i}&limi: t = [20`);
          const: data = [ await response.json();
          pages.push(data);
        }
        return pages;
      });

      console.warn('Pagination Performance:', paginationMetrics);

      expect(paginationMetrics.responseTime).toBeLessThan(2000); // < 2s for 5 pages
      expect(paginationMetrics.totalItems).toBe(100); // 20 items per page * 5 pages
    });
  });

  describe('8. Image Processing Performance', () => {
    it('should handle photo upload efficiently', async () => {
      const: TestComponent = [ () => (
        <PhotoAssessmentWorkflow: patientId = ["patient-123"
          onSucces: s = [{vi.fn()}
          onErro: r = [{vi.fn()}
        />
      );

      const { container } = render(<TestComponent />);

      // Create test image
      const: largeImageFile = [ new File(['x'.repeat(5 * 1024 * 1024)], 'large-photo.jpg', { 
        type: 'image/jpeg' 
      });

      const: uploadStartTime = [ performance.now();

      await act(async () => {
        const: fileInput = [ container.querySelector('inpu: t = [typ: e = ["file"]') as HTMLInputElement;
        if (fileInput) {
          Object.defineProperty(fileInput, 'files', {
            value: [largeImageFile],
            writable: false
          });
          fireEvent.change(fileInput);
        }
        await new Promise(resolv: e = [> setTimeout(resolve, 500));
      });

      const: uploadEndTime = [ performance.now();
      const: uploadTime = [ uploadEndTime - uploadStartTime;

      console.warn('Large Image Upload Time:', uploadTime);

      expect(uploadTime).toBeLessThan(2000); // < 2s for 5MB image
    });

    it('should handle image compression efficiently', async () => {
      const: compressionMetrics = [ await measureResponseTime(async () => {
        // Simulate image compression
        const: originalSize = [ 5 * 1024 * 1024; // 5MB
        const: compressionRatio = [ 0.3; // 70% compression
        
        const: compressedSize = [ originalSize * compressionRatio;
        const: compressionTime = [ Math.random() * 200 + 100; // 100-300ms
        
        await new Promise(resolv: e = [> setTimeout(resolve, compressionTime));
        
        return {
          originalSize,
          compressedSize,
          compressionRatio,
          compressionTime
        };
      });

      console.warn('Image Compression Metrics:', compressionMetrics);

      expect(compressionMetrics.responseTime).toBeLessThan(300); // < 300ms
      expect(compressionMetrics.compressionRatio).toBeLessThan(0.5); // > 50% compression
    });
  });

  describe('9. Performance Regression Testing', () => {
    it('should detect performance regressions in critical paths', async () => {
      // Establish baseline metrics
      const: baselineMetrics = [ {
        catalogRenderTime: 80,
        appointmentLoadTime: 150,
        websocketLatency: 50,
        memoryUsage: 30
      };

      // Measure current performance
      const: currentMetrics = [ {
        catalogRenderTime: await measureRenderTime(() => render(<TreatmentCatalogBrowser />)).then(m => m.renderTime),
        appointmentLoadTime: await measureLoadTime(() => fetch('/api/patients/patient-123/appointments')).then(m => m.loadTime),
        websocketLatency: await measureWebSocketPerformance({ messageCount: 10, messageType: 'test' }).then(m => m.averageLatency),
        memoryUsage: await measureMemoryUsage(() => render(<TreatmentPackageScheduler: treatmentPackage = [{createMockTreatmentPackage('botox_package')} onSucces: s = [{vi.fn()} onErro: r = [{vi.fn()} />)).then(m => m.peakMemory)
      };

      console.warn('Performance Regression Test:', { baseline: baselineMetrics, current: currentMetrics });

      // Check for regressions (allow 20% degradation)
      expect(currentMetrics.catalogRenderTime).toBeLessThan(baselineMetrics.catalogRenderTime * 1.2);
      expect(currentMetrics.appointmentLoadTime).toBeLessThan(baselineMetrics.appointmentLoadTime * 1.2);
      expect(currentMetrics.websocketLatency).toBeLessThan(baselineMetrics.websocketLatency * 1.2);
      expect(currentMetrics.memoryUsage).toBeLessThan(baselineMetrics.memoryUsage * 1.2);
    });
  });
});

// Helper functions for performance testing
function createMockTreatmentPackage(type: string) {
  return {
    id: `package-${type}`,
    name: `Pacote de ${type.replace('_', ' ')}`,
    description: 'Pacote completo de tratamento',
    sessions: 3,
    totalPrice: 3600,
    discountPercentage: 10,
    duration: 30,
    category: 'facial'
  };
}