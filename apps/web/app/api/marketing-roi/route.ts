/**
 * Marketing ROI Analysis Main API Routes
 * Entry point for marketing ROI management
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/marketing-roi
 * API health check and available endpoints
 */
export async function GET() {
  return NextResponse.json({
    service: 'Marketing ROI Analysis API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      campaigns: '/api/marketing-roi/campaigns',
      treatmentProfitability: '/api/marketing-roi/treatment-profitability',
      cacLtvAnalysis: '/api/marketing-roi/cac-ltv-analysis',
      alerts: '/api/marketing-roi/alerts',
      optimizationRecommendations:
        '/api/marketing-roi/optimization-recommendations',
      dashboardMetrics: '/api/marketing-roi/dashboard-metrics',
      forecasts: '/api/marketing-roi/forecasts',
      insights: '/api/marketing-roi/insights',
    },
  });
}
