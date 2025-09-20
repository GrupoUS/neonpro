/**
 * Database Performance Service Tests
 * T080 - Database Performance Tuning
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import DatabasePerformanceService, {
  HEALTHCARE_QUERY_PATTERNS,
  HEALTHCARE_RECOMMENDED_INDEXES,
} from '../database-performance';

describe('DatabasePerformanceService', () => {
  let service: DatabasePerformanceService;

  beforeEach(() => {
    service = new DatabasePerformanceService();
  });

  describe('analyzePerformance', () => {
    it('should analyze database performance metrics', async () => {
      const metrics = await service.analyzePerformance();

      expect(metrics).toHaveProperty('connectionPool');
      expect(metrics).toHaveProperty('queryPerformance');
      expect(metrics).toHaveProperty('indexUsage');
      expect(metrics).toHaveProperty('healthcareCompliance');

      // Connection pool metrics
      expect(metrics.connectionPool).toHaveProperty('active');
      expect(metrics.connectionPool).toHaveProperty('idle');
      expect(metrics.connectionPool).toHaveProperty('waiting');
      expect(metrics.connectionPool).toHaveProperty('total');
      expect(metrics.connectionPool).toHaveProperty('utilization');

      // Query performance metrics
      expect(metrics.queryPerformance).toHaveProperty('averageResponseTime');
      expect(metrics.queryPerformance).toHaveProperty('slowQueries');
      expect(metrics.queryPerformance).toHaveProperty('totalQueries');
      expect(metrics.queryPerformance).toHaveProperty('errorRate');

      // Index usage metrics
      expect(metrics.indexUsage).toHaveProperty('totalIndexes');
      expect(metrics.indexUsage).toHaveProperty('unusedIndexes');
      expect(metrics.indexUsage).toHaveProperty('missingIndexes');
      expect(metrics.indexUsage).toHaveProperty('indexEfficiency');

      // Healthcare compliance metrics
      expect(metrics.healthcareCompliance).toHaveProperty('patientDataQueries');
      expect(metrics.healthcareCompliance).toHaveProperty(
        'avgPatientQueryTime',
      );
      expect(metrics.healthcareCompliance).toHaveProperty(
        'lgpdCompliantQueries',
      );
      expect(metrics.healthcareCompliance).toHaveProperty('auditTrailQueries');
    });

    it('should provide realistic connection pool metrics', async () => {
      const metrics = await service.analyzePerformance();
      const pool = metrics.connectionPool;

      expect(pool.active).toBeGreaterThanOrEqual(0);
      expect(pool.idle).toBeGreaterThanOrEqual(0);
      expect(pool.waiting).toBeGreaterThanOrEqual(0);
      expect(pool.total).toBe(pool.active + pool.idle);
      expect(pool.utilization).toBe((pool.active / pool.total) * 100);
      expect(pool.utilization).toBeGreaterThanOrEqual(0);
      expect(pool.utilization).toBeLessThanOrEqual(100);
    });

    it('should provide healthcare-specific compliance metrics', async () => {
      const metrics = await service.analyzePerformance();
      const compliance = metrics.healthcareCompliance;

      expect(compliance.patientDataQueries).toBeGreaterThan(0);
      expect(compliance.avgPatientQueryTime).toBeGreaterThan(0);
      expect(compliance.lgpdCompliantQueries).toBeGreaterThan(0);
      expect(compliance.auditTrailQueries).toBeGreaterThanOrEqual(0);

      // Patient queries should be a significant portion
      expect(compliance.patientDataQueries).toBeGreaterThan(
        compliance.auditTrailQueries,
      );

      // LGPD compliance should be high
      expect(compliance.lgpdCompliantQueries).toBeGreaterThanOrEqual(
        compliance.patientDataQueries * 0.8,
      );
    });
  });

  describe('generateIndexRecommendations', () => {
    it('should generate healthcare-specific index recommendations', () => {
      const recommendations = service.generateIndexRecommendations();

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('table');
        expect(rec).toHaveProperty('columns');
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('estimatedImprovement');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('healthcareRelevant');

        // All recommendations should be healthcare relevant
        expect(rec.healthcareRelevant).toBe(true);

        // Estimated improvement should be reasonable
        expect(rec.estimatedImprovement).toBeGreaterThan(0);
        expect(rec.estimatedImprovement).toBeLessThanOrEqual(100);

        // Priority should be valid
        expect(['low', 'medium', 'high', 'critical']).toContain(rec.priority);

        // Type should be valid
        expect(['btree', 'gin', 'gist', 'hash']).toContain(rec.type);
      });
    });

    it('should prioritize critical healthcare indexes', () => {
      const recommendations = service.generateIndexRecommendations();
      const criticalRecs = recommendations.filter(
        rec => rec.priority === 'critical',
      );
      const highRecs = recommendations.filter(rec => rec.priority === 'high');

      expect(criticalRecs.length).toBeGreaterThan(0);
      expect(highRecs.length).toBeGreaterThan(0);

      // Critical indexes should have higher estimated improvements
      const avgCriticalImprovement =
        criticalRecs.reduce((sum, rec) => sum + rec.estimatedImprovement, 0)
        / criticalRecs.length;
      const avgHighImprovement = highRecs.reduce((sum, rec) => sum + rec.estimatedImprovement, 0)
        / highRecs.length;

      expect(avgCriticalImprovement).toBeGreaterThan(avgHighImprovement);
    });

    it('should include patient and appointment table indexes', () => {
      const recommendations = service.generateIndexRecommendations();
      const patientIndexes = recommendations.filter(
        rec => rec.table === 'patients',
      );
      const appointmentIndexes = recommendations.filter(
        rec => rec.table === 'appointments',
      );

      expect(patientIndexes.length).toBeGreaterThan(0);
      expect(appointmentIndexes.length).toBeGreaterThan(0);

      // Should include CPF index for patients (critical for Brazilian healthcare)
      const cpfIndex = patientIndexes.find(rec => rec.columns.includes('cpf'));
      expect(cpfIndex).toBeDefined();
      expect(cpfIndex?.priority).toBe('critical');

      // Should include professional schedule index for appointments
      const scheduleIndex = appointmentIndexes.find(
        rec =>
          rec.columns.includes('professional_id')
          && rec.columns.includes('start_time'),
      );
      expect(scheduleIndex).toBeDefined();
      expect(scheduleIndex?.priority).toBe('critical');
    });
  });

  describe('performHealthCheck', () => {
    it('should perform comprehensive database health check', async () => {
      const health = await service.performHealthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('score');
      expect(health).toHaveProperty('issues');
      expect(health).toHaveProperty('recommendations');
      expect(health).toHaveProperty('lastChecked');

      // Status should be valid
      expect(['healthy', 'warning', 'critical']).toContain(health.status);

      // Score should be 0-100
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);

      // Should have arrays for issues and recommendations
      expect(health.issues).toBeInstanceOf(Array);
      expect(health.recommendations).toBeInstanceOf(Array);

      // Last checked should be recent
      expect(health.lastChecked).toBeInstanceOf(Date);
      expect(Date.now() - health.lastChecked.getTime()).toBeLessThan(5000); // Within 5 seconds
    });

    it('should identify performance issues and provide recommendations', async () => {
      // Mock poor performance metrics
      const mockQueryMonitor = {
        getStats: () => ({
          averageDuration: 150, // Slow queries
          slowQueries: 10,
          totalQueries: 100,
        }),
      };

      service['queryMonitor'] = mockQueryMonitor as any;

      const health = await service.performHealthCheck();

      // Should detect slow queries
      expect(health.issues.length).toBeGreaterThan(0);
      expect(health.recommendations.length).toBeGreaterThan(0);
      expect(health.score).toBeLessThan(100);

      // Should provide healthcare-specific recommendations or general optimization recommendations
      const hasHealthcareRecommendation = health.recommendations.some(
        rec =>
          rec.toLowerCase().includes('patient')
          || rec.toLowerCase().includes('healthcare')
          || rec.toLowerCase().includes('lgpd')
          || rec.toLowerCase().includes('index')
          || rec.toLowerCase().includes('optimize'),
      );
      expect(hasHealthcareRecommendation).toBe(true);
    });

    it('should score healthy systems appropriately', async () => {
      // Mock good performance metrics
      const mockQueryMonitor = {
        getStats: () => ({
          averageDuration: 25, // Fast queries
          slowQueries: 1,
          totalQueries: 100,
        }),
      };

      service['queryMonitor'] = mockQueryMonitor as any;

      const health = await service.performHealthCheck();

      expect(health.status).toBe('healthy');
      expect(health.score).toBeGreaterThanOrEqual(80);
      expect(health.issues.length).toBe(0);
    });
  });

  describe('startHealthMonitoring', () => {
    it('should start health monitoring with interval', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.startHealthMonitoring(100); // 100ms interval for testing

      // Should not throw
      expect(() => service.startHealthMonitoring(100)).not.toThrow();

      service.stopHealthMonitoring();

      consoleSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should stop health monitoring', () => {
      service.startHealthMonitoring(100);

      expect(() => service.stopHealthMonitoring()).not.toThrow();

      // Should be able to stop multiple times
      expect(() => service.stopHealthMonitoring()).not.toThrow();
    });
  });

  describe('getQueryMonitor', () => {
    it('should return query monitor instance', () => {
      const monitor = service.getQueryMonitor();

      expect(monitor).toBeDefined();
      expect(monitor).toHaveProperty('recordQuery');
      expect(monitor).toHaveProperty('getStats');
      expect(typeof monitor.recordQuery).toBe('function');
      expect(typeof monitor.getStats).toBe('function');
    });
  });

  describe('Healthcare Query Patterns', () => {
    it('should define comprehensive healthcare query patterns', () => {
      expect(HEALTHCARE_QUERY_PATTERNS).toHaveProperty('patientSearch');
      expect(HEALTHCARE_QUERY_PATTERNS).toHaveProperty('appointmentScheduling');
      expect(HEALTHCARE_QUERY_PATTERNS).toHaveProperty('patientHistory');
      expect(HEALTHCARE_QUERY_PATTERNS).toHaveProperty('lgpdCompliance');

      Object.values(HEALTHCARE_QUERY_PATTERNS).forEach(pattern => {
        expect(pattern).toHaveProperty('tables');
        expect(pattern).toHaveProperty('commonFilters');
        expect(pattern).toHaveProperty('expectedResponseTime');

        expect(pattern.tables).toBeInstanceOf(Array);
        expect(pattern.commonFilters).toBeInstanceOf(Array);
        expect(pattern.expectedResponseTime).toBeGreaterThan(0);
        expect(pattern.expectedResponseTime).toBeLessThan(1000); // Should be sub-second
      });
    });

    it('should have appropriate response time expectations', () => {
      // LGPD compliance queries should be fastest (critical for compliance)
      expect(
        HEALTHCARE_QUERY_PATTERNS.lgpdCompliance.expectedResponseTime,
      ).toBeLessThan(
        HEALTHCARE_QUERY_PATTERNS.patientSearch.expectedResponseTime,
      );

      // Patient search should be faster than complex history queries
      expect(
        HEALTHCARE_QUERY_PATTERNS.patientSearch.expectedResponseTime,
      ).toBeLessThan(
        HEALTHCARE_QUERY_PATTERNS.patientHistory.expectedResponseTime,
      );

      // All should be sub-100ms for critical healthcare operations
      Object.values(HEALTHCARE_QUERY_PATTERNS).forEach(pattern => {
        expect(pattern.expectedResponseTime).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Healthcare Recommended Indexes', () => {
    it('should define comprehensive healthcare indexes', () => {
      expect(HEALTHCARE_RECOMMENDED_INDEXES).toBeInstanceOf(Array);
      expect(HEALTHCARE_RECOMMENDED_INDEXES.length).toBeGreaterThan(5);

      HEALTHCARE_RECOMMENDED_INDEXES.forEach(index => {
        expect(index).toHaveProperty('table');
        expect(index).toHaveProperty('columns');
        expect(index).toHaveProperty('type');
        expect(index).toHaveProperty('reason');
        expect(index).toHaveProperty('priority');

        expect(index.columns).toBeInstanceOf(Array);
        expect(index.columns.length).toBeGreaterThan(0);
        expect(['btree', 'gin', 'gist', 'hash']).toContain(index.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(index.priority);
      });
    });

    it('should prioritize critical healthcare operations', () => {
      const criticalIndexes = HEALTHCARE_RECOMMENDED_INDEXES.filter(
        idx => idx.priority === 'critical',
      );

      expect(criticalIndexes.length).toBeGreaterThan(0);

      // Should include patient CPF lookup (critical for Brazilian healthcare)
      const cpfIndex = criticalIndexes.find(
        idx => idx.table === 'patients' && idx.columns.includes('cpf'),
      );
      expect(cpfIndex).toBeDefined();

      // Should include professional scheduling (critical for appointments)
      const scheduleIndex = criticalIndexes.find(
        idx =>
          idx.table === 'appointments'
          && idx.columns.includes('professional_id')
          && idx.columns.includes('start_time'),
      );
      expect(scheduleIndex).toBeDefined();

      // Should include LGPD consent tracking (critical for compliance)
      const consentIndex = criticalIndexes.find(
        idx =>
          idx.table === 'consent_records'
          && idx.columns.includes('consent_type'),
      );
      expect(consentIndex).toBeDefined();
    });

    it('should include full-text search indexes for patient data', () => {
      const ginIndexes = HEALTHCARE_RECOMMENDED_INDEXES.filter(
        idx => idx.type === 'gin',
      );

      expect(ginIndexes.length).toBeGreaterThan(0);

      // Should include patient full-text search
      const patientSearchIndex = ginIndexes.find(
        idx =>
          idx.table === 'patients'
          && (idx.columns.includes('full_name')
            || idx.columns.includes('phone_primary')
            || idx.columns.includes('email')),
      );
      expect(patientSearchIndex).toBeDefined();
      expect(patientSearchIndex?.reason).toContain('search');
    });
  });
});
