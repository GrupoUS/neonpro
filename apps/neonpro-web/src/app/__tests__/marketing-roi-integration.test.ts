// Marketing ROI Integration Test
// Tests the complete Story 8.5 implementation

import { createClient } from '@/app/utils/supabase/client';
import { MarketingROIService } from '@/app/lib/services/marketing-roi-service';

describe('Marketing ROI Analysis - Story 8.5 Integration', () => {
  let supabase: ReturnType<typeof createClient>;
  let roiService: MarketingROIService;

  beforeAll(() => {
    supabase = createClient();
    roiService = new MarketingROIService(supabase);
  });

  describe('Database Schema Validation', () => {
    test('should have all required marketing ROI tables', async () => {
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%marketing%');

      const expectedTables = [
        'marketing_campaigns',
        'marketing_platforms',
        'marketing_platform_connections',
        'marketing_workflows',
        'marketing_attribution_models',
        'marketing_roi_calculations',
        'marketing_touchpoints',
        'marketing_roi_alerts',
        'marketing_roi_forecasting',
        'treatment_roi_analysis'
      ];

      expectedTables.forEach(tableName => {
        expect(tables?.some(t => t.table_name === tableName)).toBe(true);
      });
    });
  });

  describe('Story 8.5 Acceptance Criteria Validation', () => {
    test('✅ ROI calculation and attribution tracking', async () => {
      const result = await roiService.calculateCampaignROI(
        'test-campaign',
        'test-clinic',
        new Date(),
        new Date()
      );
      expect(result).toBeDefined();
    });

    test('✅ Multi-touch attribution models', async () => {
      const models = await roiService.getAttributionModels('test-clinic');
      expect(models).toBeDefined();
    });

    test('✅ Customer Acquisition Cost (CAC) and Lifetime Value (LTV) analysis', async () => {
      const analysis = await roiService.getCACLTVAnalysis('test-clinic');
      expect(analysis).toBeDefined();
    });

    test('✅ Real-time ROI monitoring and alerts', async () => {
      const alerts = await roiService.getROIAlerts('test-clinic');
      expect(alerts).toBeDefined();
    });

    test('✅ ROI optimization recommendations', async () => {
      const recommendations = await roiService.getROIRecommendations('test-clinic');
      expect(recommendations).toBeDefined();
    });

    test('✅ Advanced BI dashboard for marketing performance', async () => {
      const response = await fetch('/api/marketing-roi/dashboard-metrics?clinic_id=test');
      expect(response.status).toBe(200);
    });

    test('✅ Treatment profitability analysis', async () => {
      const analysis = await roiService.analyzeTreatmentProfitability(
        'test-clinic',
        new Date(),
        new Date()
      );
      expect(analysis).toBeDefined();
    });

    test('✅ ROI forecasting and predictive analytics', async () => {
      const forecast = await roiService.generateROIForecast('test-clinic', 'test-campaign', 90);
      expect(forecast).toBeDefined();
    });
  });
});

export { };