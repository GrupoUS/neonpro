// RETENTION CAMPAIGN ANALYTICS TESTS
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// Test suite for campaign analytics and A/B testing functionality
// =====================================================================================

import { createMocks } from 'node-mocks-http';
import { GET as getAnalytics, POST as getABResults } from '@/app/api/retention-analytics/campaigns/analytics/route';

// =====================================================================================
// ANALYTICS TESTS
// =====================================================================================

describe('/api/retention-analytics/campaigns/analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET - Campaign Analytics', () => {
    it('should return campaign analytics with performance metrics', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222',
      });

      await getAnalytics(req);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.analytics).toBeDefined();
      expect(responseData.data.summary).toBeDefined();
      expect(responseData.data.summary.totalCampaigns).toBeGreaterThan(0);
    });

    it('should filter analytics by campaign IDs', async () => {
      const campaignIds = '11111111-1111-1111-1111-111111111111,55555555-5555-5555-5555-555555555555';
      const { req, res } = createMocks({
        method: 'GET',
        url: `/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&campaign_ids=${campaignIds}`,
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.analytics).toHaveLength(2);
      expect(responseData.data.analytics.every(a => 
        campaignIds.includes(a.campaignId)
      )).toBe(true);
    });

    it('should group analytics by intervention type', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&group_by=intervention_type',
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.analytics[0].groupKey).toBeDefined();
      expect(responseData.data.analytics[0].aggregated).toBeDefined();
      expect(responseData.data.analytics[0].aggregated.totalCampaigns).toBeGreaterThan(0);
    });

    it('should include industry benchmarks when comparison is requested', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&include_comparison=true',
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.comparison).toBeDefined();
      expect(responseData.data.comparison.industryBenchmarks).toBeDefined();
      expect(responseData.data.comparison.clinicAverages).toBeDefined();
      expect(responseData.data.comparison.performanceVsBenchmark).toBeDefined();
    });

    it('should filter analytics by date range', async () => {
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';
      const { req, res } = createMocks({
        method: 'GET',
        url: `/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&start_date=${startDate}&end_date=${endDate}`,
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      expect(responseData.data.dateRange).toBeDefined();
      expect(responseData.data.dateRange.startDate).toBe(startDate);
      expect(responseData.data.dateRange.endDate).toBe(endDate);
    });

    it('should validate required clinic_id parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics',
      });

      await getAnalytics(req);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Invalid analytics query');
    });

    it('should calculate correct performance metrics', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222',
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      const analytics = responseData.data.analytics[0];
      
      // Validate performance calculations
      expect(analytics.performance.deliveryRate).toBeCloseTo(95.0, 1); // 950/1000 * 100
      expect(analytics.performance.openRate).toBeCloseTo(40.0, 1); // 380/950 * 100
      expect(analytics.performance.clickRate).toBeCloseTo(20.0, 1); // 76/380 * 100
      expect(analytics.performance.conversionRate).toBeCloseTo(4.5, 1); // 45/1000 * 100
      expect(analytics.performance.roi).toBeCloseTo(1775.0, 1); // ((22500-1200)/1200) * 100
    });
  });

  describe('POST - A/B Test Results', () => {
    it('should generate A/B test results for enabled campaigns', async () => {
      const abTestData = {
        campaignId: '11111111-1111-1111-1111-111111111111',
        testDurationDays: 30,
        confidenceLevel: 0.95
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: abTestData,
      });

      await getABResults(req);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.results.groupA).toBeDefined();
      expect(responseData.data.results.groupB).toBeDefined();
      expect(responseData.data.results.statisticalAnalysis).toBeDefined();
      expect(responseData.data.results.conclusion).toBeDefined();
    });

    it('should calculate statistical significance correctly', async () => {
      const abTestData = {
        campaignId: '11111111-1111-1111-1111-111111111111',
        testDurationDays: 30,
        confidenceLevel: 0.95
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: abTestData,
      });

      await getABResults(req);

      const responseData = JSON.parse(res._getData());
      const analysis = responseData.data.results.statisticalAnalysis;
      
      expect(analysis.zScore).toBeGreaterThan(0);
      expect(analysis.criticalValue).toBe(1.96); // For 95% confidence
      expect(analysis.confidenceLevel).toBe(95);
      expect(typeof analysis.isStatisticallySignificant).toBe('boolean');
    });

    it('should provide actionable recommendations', async () => {
      const abTestData = {
        campaignId: '11111111-1111-1111-1111-111111111111',
        testDurationDays: 60,
        confidenceLevel: 0.99
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: abTestData,
      });

      await getABResults(req);

      const responseData = JSON.parse(res._getData());
      const conclusion = responseData.data.results.conclusion;
      
      expect(conclusion.winner).toMatch(/^[AB]$/);
      expect(typeof conclusion.improvement).toBe('string');
      expect(conclusion.recommendation).toBeDefined();
      expect(conclusion.recommendation.length).toBeGreaterThan(0);
    });

    it('should handle campaigns without A/B testing enabled', async () => {
      // Mock campaign without A/B testing
      const mockSupabase = require('@/app/utils/supabase/server').createClient();
      mockSupabase.from().select().eq().single.mockReturnValueOnce({
        data: {
          ...mockCampaigns[1], // Second campaign has abtest_enabled: false
          measurement_criteria: {
            ...mockCampaigns[1].measurement_criteria,
            abtest_enabled: false
          }
        },
        error: null
      });

      const abTestData = {
        campaignId: '55555555-5555-5555-5555-555555555555',
        testDurationDays: 30,
        confidenceLevel: 0.95
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: abTestData,
      });

      await getABResults(req);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('A/B testing is not enabled for this campaign');
    });

    it('should validate campaign existence', async () => {
      // Mock non-existent campaign
      const mockSupabase = require('@/app/utils/supabase/server').createClient();
      mockSupabase.from().select().eq().single.mockReturnValueOnce({
        data: null,
        error: { message: 'Campaign not found' }
      });

      const abTestData = {
        campaignId: '99999999-9999-9999-9999-999999999999',
        testDurationDays: 30,
        confidenceLevel: 0.95
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: abTestData,
      });

      await getABResults(req);

      expect(res._getStatusCode()).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Campaign not found');
    });

    it('should validate input parameters', async () => {
      const invalidData = {
        campaignId: 'invalid-uuid',
        testDurationDays: 0,
        confidenceLevel: 1.5
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidData,
      });

      await getABResults(req);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Invalid A/B test query');
    });
  });

  describe('Analytics Edge Cases', () => {
    it('should handle campaigns with zero metrics gracefully', async () => {
      // Mock campaign with zero metrics
      const mockSupabase = require('@/app/utils/supabase/server').createClient();
      mockSupabase.from().select().eq().order.mockReturnValueOnce({
        data: [{
          ...mockCampaigns[0],
          campaign_metrics: [{
            sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0, revenue: 0, costs: 0
          }],
          executions: []
        }],
        error: null
      });

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222',
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      const analytics = responseData.data.analytics[0];
      
      expect(analytics.performance.deliveryRate).toBe(0);
      expect(analytics.performance.openRate).toBe(0);
      expect(analytics.performance.clickRate).toBe(0);
      expect(analytics.performance.conversionRate).toBe(0);
      expect(analytics.performance.roi).toBe(0);
    });

    it('should calculate aggregated metrics correctly for grouped analytics', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222&group_by=campaign',
      });

      await getAnalytics(req);

      const responseData = JSON.parse(res._getData());
      const groupedAnalytics = responseData.data.analytics[0];
      
      expect(groupedAnalytics.aggregated.totalCampaigns).toBeGreaterThan(0);
      expect(groupedAnalytics.aggregated.aggregatedMetrics.sent).toBeGreaterThanOrEqual(0);
      expect(groupedAnalytics.aggregated.averagePerformance).toBeDefined();
    });

    it('should handle missing campaign metrics', async () => {
      // Mock campaign without metrics
      const mockSupabase = require('@/app/utils/supabase/server').createClient();
      mockSupabase.from().select().eq().order.mockReturnValueOnce({
        data: [{
          ...mockCampaigns[0],
          campaign_metrics: [], // No metrics
          executions: []
        }],
        error: null
      });

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/retention-analytics/campaigns/analytics?clinic_id=22222222-2222-2222-2222-222222222222',
      });

      await getAnalytics(req);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.analytics).toHaveLength(1);
      expect(responseData.data.analytics[0].metrics.sent).toBe(0);
    });
  });
});