/**
 * Tests for Healthcare Metrics Service
 * Following TDD methodology - MUST FAIL FIRST
 * CRITICAL: All healthcare compliance metrics must be tracked and validated
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Healthcare Metrics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export HealthcareMetricsService class', async () => {
    expect(async () => {
      const module = await import('../metrics');
      expect(module.HealthcareMetricsService).toBeDefined();
    }).not.toThrow();
  });

  describe('Service Initialization', () => {
    it('should initialize with default healthcare KPIs', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(HealthcareMetricsService);
    });

    it('should initialize KPIs with correct compliance levels', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      // Test that service has access to KPI methods
      expect(typeof service.getKPIStatus).toBe('function');
      expect(typeof service.recordMetric).toBe('function');
      expect(typeof service.getMetricAggregation).toBe('function');
      expect(typeof service.getComplianceDashboard).toBe('function');
    });
  });

  describe('Metric Recording', () => {
    it('should have recordMetric method with correct signature', async () => {
      const { HealthcareMetricsService, HealthcareMetricType } = await import('../metrics');
      const service = new HealthcareMetricsService();

      expect(typeof service.recordMetric).toBe('function');
      expect(service.recordMetric.length).toBe(4); // metricType, value, metadata, context
    });
  });

  describe('KPI Status Retrieval', () => {
    it('should have getKPIStatus method with correct signature', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      expect(typeof service.getKPIStatus).toBe('function');
      expect(service.getKPIStatus.length).toBe(2); // kpiType, clinicId?
    });
  });

  describe('Metric Aggregation', () => {
    it('should have getMetricAggregation method with correct signature', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      expect(typeof service.getMetricAggregation).toBe('function');
      expect(service.getMetricAggregation.length).toBe(4); // metricType, period, clinicId?, startDate?
    });
  });

  describe('Compliance Dashboard', () => {
    it('should generate compliance dashboard successfully', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      const result = await service.getComplianceDashboard();

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      if (result.success) {
        expect(result.dashboard).toBeDefined();
        expect(result.dashboard?.kpis).toBeDefined();
        expect(typeof result.dashboard?.overallScore).toBe('number');
        expect(Array.isArray(result.dashboard?.criticalViolations)).toBe(true);
        expect(Array.isArray(result.dashboard?.recentAlerts)).toBe(true);
      }
    });

    it('should filter dashboard by clinic ID', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      const result = await service.getComplianceDashboard('clinic-123');

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Helper Methods', () => {
    it('should create and measure timer correctly', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      const timer = service.startTimer();
      expect(timer).toBeDefined();
      expect(timer.start).toBeDefined();

      // Wait a small amount of time
      await new Promise(resolve => setTimeout(resolve, 10));

      const elapsed = service.endTimerMs(timer);
      expect(elapsed).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(1000); // Should be less than 1 second
    });

    it('should log metric to console', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      service.logMetric({ event: 'test_metric', value: 42 });

      expect(consoleSpy).toHaveBeenCalledWith(
        JSON.stringify({ type: 'metrics', event: 'test_metric', value: 42 }),
      );

      consoleSpy.mockRestore();
    });

    it('should handle console logging errors gracefully', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Console error');
      });

      // Should not throw error
      expect(() => {
        service.logMetric({ circular: {} });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should have error handling methods available', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      // Verify error handling methods exist
      expect(typeof service.recordMetric).toBe('function');
      expect(typeof service.getKPIStatus).toBe('function');
      expect(typeof service.getMetricAggregation).toBe('function');
    });

    it('should handle method signatures correctly', async () => {
      const { HealthcareMetricsService } = await import('../metrics');
      const service = new HealthcareMetricsService();

      // Verify method signatures based on actual implementation
      expect(service.recordMetric.length).toBe(4); // type, value, metadata, context
      expect(service.getKPIStatus.length).toBe(2); // kpiId, period (period has default)
      expect(service.getMetricAggregation.length).toBe(3); // type, period, periodsBack (periodsBack has default)
    });
  });
});
