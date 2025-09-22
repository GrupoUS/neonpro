import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthcareMetricsService, HealthcareMetricType } from '../../services/metrics';

describe('HealthcareMetricsService',() => {
  let metricsService: HealthcareMetricsService;

  beforeEach(() => {
    metricsService = new HealthcareMetricsService(

  describe('Constructor',() => {
    it('should initialize with default KPIs',() => {
      // This test will fail initially because we need to check if KPIs are properly initialized
      const service = new HealthcareMetricsService(

      // Access private method to check KPIs initialization
      const kpis = (service as any).kpis;

      expect(kpis.size).toBeGreaterThan(0
      expect(kpis.has('lgpd_compliance_rate')).toBe(true);
      expect(kpis.has('cfm_validation_success')).toBe(true);
      expect(kpis.has('anvisa_compliance_rate')).toBe(true);

    it('should initialize Supabase client',() => {
      const service = new HealthcareMetricsService(

      // Check if Supabase client is initialized
      expect((service as any).supabase).toBeDefined(

  describe('recordMetric',() => {
    it('should successfully record a metric',async () => {
      // Mock successful database insertion
      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        insert: () => ({
          select: () => ({
            single: () => ({
              data: { id: 'test-metric-id' },
              error: null,
            }),
          }),
        }),
      };

      const result = await metricsService.recordMetric(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        95,
        { test: 'metadata' },
        { clinicId: 'test-clinic', _userId: 'test-user' },
      

      expect(result.success).toBe(true);
      expect(result.metricId).toBe('test-metric-id')

    it('should handle database errors gracefully',async () => {
      // Mock database error
      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        insert: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      };

      const result = await metricsService.recordMetric(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        95,
      

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(

    it('should log metric to console when database fails',async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {  }

      // Mock database error
      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        insert: () => ({
          select: () => ({
            single: () => ({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      };

      await metricsService.recordMetric(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        95,
      

      expect(consoleSpy).toHaveBeenCalled(
      consoleSpy.mockRestore(

    it('should include default compliance flags when not provided',async () => {
      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        insert: () => ({
          select: () => ({
            single: () => ({
              data: { id: 'test-metric-id' },
              error: null,
            }),
          }),
        }),
      };

      await metricsService.recordMetric(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        95,
      

      const insertCall = insertSpy.mock.calls[0][0];
      expect(insertCall.compliance_flags).toEqual({
        lgpd_compliant: true,
        cfm_validated: true,
        anvisa_compliant: true,
        rls_enforced: true,

  describe('getKPIStatus',() => {
    it('should return error for non-existent KPI',async () => {
      const result = await metricsService.getKPIStatus('non-existent-kpi')

      expect(result.success).toBe(false);
      expect(result.error).toBe('KPI not found')

    it('should return KPI status with compliance evaluation',async () => {
      // Mock successful metric aggregation
      const mockAggregation = {
        success: true,
        data: {
          avg: 96,
          count: 10,
        },
      };

      vi.spyOn(metricsService, 'getMetricAggregation' as any).mockResolvedValue(
        mockAggregation,
      

      const result = await metricsService.getKPIStatus('lgpd_compliance_rate')

      expect(result.success).toBe(true);
      expect(result.kpi).toBeDefined(
      expect(result.currentValue).toBe(96
      expect(result.complianceStatus).toBe('compliant')

    it('should handle metric aggregation errors',async () => {
      vi.spyOn(metricsService, 'getMetricAggregation' as any).mockResolvedValue(
        {
          success: false,
          error: 'Aggregation failed',
        },
      

      const result = await metricsService.getKPIStatus('lgpd_compliance_rate')

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get metric aggregation')

  describe('getMetricAggregation',() => {
    it('should return empty aggregation when no data exists',async () => {
      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        select: () => ({
          eq: () => ({
            gte: () => ({
              lt: () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await metricsService.getMetricAggregation(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        'day',
      

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data!.count).toBe(0
      expect(result.data!.avg).toBe(0

    it('should calculate aggregation correctly from data',async () => {
      const mockData = [
        {
          value: 90,
          compliance_flags: {
            lgpd_compliant: true,
            cfm_validated: true,
            anvisa_compliant: true,
          },
        },
        {
          value: 95,
          compliance_flags: {
            lgpd_compliant: true,
            cfm_validated: true,
            anvisa_compliant: true,
          },
        },
        {
          value: 85,
          compliance_flags: {
            lgpd_compliant: false,
            cfm_validated: true,
            anvisa_compliant: true,
          },
        },
      ];

      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        select: () => ({
          eq: () => ({
            gte: () => ({
              lt: () => ({
                data: mockData,
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await metricsService.getMetricAggregation(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        'day',
      

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data!.count).toBe(3
      expect(result.data!.avg).toBe(90); // (90 + 95 + 85) / 3
      expect(result.data!.min).toBe(85
      expect(result.data!.max).toBe(95
      expect(result.data!.complianceRate).toBe(66.67); // 2 out of 3 compliant

    it('should handle database query errors',async () => {
      const insertSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const selectionSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      const singleSpy = vi
        .spyOn(metricsService as any, 'db')
        .mockImplementation(
      metricsService.db = {
        select: () => ({
          eq: () => ({
            gte: () => ({
              lt: () => ({
                data: null,
                error: { message: 'Query error' },
              }),
            }),
          }),
        }),
      };

      const result = await metricsService.getMetricAggregation(
        HealthcareMetricType.LGPD_COMPLIANCE_SCORE,
        'day',
      

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to query metrics')

  describe('getComplianceDashboard',() => {
    it('should generate dashboard with KPI statuses',async () => {
      // Mock getKPIStatus to return successful responses
      vi.spyOn(metricsService, 'getKPIStatus' as any).mockImplementation(
        (_kpiId: string) => {
          return Promise.resolve({
            success: true,
            currentValue: 95,
            complianceStatus: 'compliant',
            trend: 'stable',
        },
      

      // Mock getRecentAlerts
      vi.spyOn(metricsService, 'getRecentAlerts' as any).mockResolvedValue({
        success: true,
        alerts: [],

      const result = await metricsService.getComplianceDashboard(

      expect(result.success).toBe(true);
      expect(result.dashboard).toBeDefined(
      expect(result.dashboard!.kpis.length).toBeGreaterThan(0
      expect(result.dashboard!.overallScore).toBeGreaterThan(0

    it('should handle errors in dashboard generation',async () => {
      vi.spyOn(metricsService, 'getKPIStatus' as any).mockRejectedValue(
        new Error('KPI error'),
      

      const result = await metricsService.getComplianceDashboard(

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(

  describe('Legacy compatibility methods',() => {
    it('should start and end timer correctly',() => {
      const timer = metricsService.startTimer(
      expect(timer).toBeDefined(
      expect(timer.start).toBeDefined(

      // Add small delay to ensure timer has measurable value
      const start = Date.now(
      while (Date.now() - start < 1) {
        // Wait at least 1ms
      }

      const duration = metricsService.endTimerMs(timer
      expect(duration).toBeGreaterThanOrEqual(0

    it('should log metric without throwing errors',() => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {  }

      expect(() => {
        metricsService.logMetric({ test: 'metric'   }
      }).not.toThrow(

      expect(consoleSpy).toHaveBeenCalled(
      consoleSpy.mockRestore(
