/**
 * 🛡️ NEONPRO COMPLIANCE METRICS API
 * RESTful endpoint for comprehensive compliance monitoring and metrics
 * Supporting LGPD + ANVISA + CFM compliance dashboard
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth/verify-auth';
import { getCurrentComplianceMetrics } from '@/lib/compliance/metrics';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// REQUEST VALIDATION SCHEMAS
// =====================================================

const MetricsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  category: z
    .enum(['all', 'lgpd', 'anvisa', 'data_retention', 'audit_trail'])
    .optional()
    .default('all'),
  detailed: z.boolean().optional().default(false),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

// =====================================================
// GET COMPLIANCE METRICS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // 🔒 Authentication & Authorization
    const authResult = await verifyAuth(request, [
      'admin',
      'compliance_officer',
      'clinic_manager',
    ]);
    if (!(authResult.success && authResult.user)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unauthorized access - compliance metrics require elevated permissions',
          required_roles: ['admin', 'compliance_officer', 'clinic_manager'],
        },
        { status: 401 }
      );
    }

    // 📊 Parse query parameters
    const url = new URL(request.url);
    const rawParams = {
      period: url.searchParams.get('period'),
      category: url.searchParams.get('category'),
      detailed: url.searchParams.get('detailed') === 'true',
      format: url.searchParams.get('format'),
    };

    const validationResult = MetricsQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // 🎯 Get compliance metrics
    console.log(
      `📊 Calculating compliance metrics for user ${authResult.user.email}`
    );
    const metrics = await getCurrentComplianceMetrics();

    // 🔍 Filter by category if specified
    let filteredMetrics = metrics;
    if (params.category !== 'all') {
      filteredMetrics = {
        ...metrics,
        // Keep only requested category in detailed view
        lgpd_compliance:
          params.category === 'lgpd' ? metrics.lgpd_compliance : (null as any),
        anvisa_compliance:
          params.category === 'anvisa'
            ? metrics.anvisa_compliance
            : (null as any),
        data_retention:
          params.category === 'data_retention'
            ? metrics.data_retention
            : (null as any),
        audit_trail:
          params.category === 'audit_trail'
            ? metrics.audit_trail
            : (null as any),
      };
    }

    // 📈 Calculate trend data based on period
    const trendData = await calculateComplianceTrends(
      params.period,
      authResult.user.id
    );

    // 🎨 Format response
    const response = {
      success: true,
      data: {
        metrics: filteredMetrics,
        trends: trendData,
        metadata: {
          calculated_at: metrics.last_updated,
          period: params.period,
          category: params.category,
          user_id: authResult.user.id,
          clinic_timezone: 'America/Sao_Paulo',
        },
      },
      // Add performance metrics
      performance: {
        calculation_time_ms: Date.now() - Date.parse(metrics.last_updated),
        cache_status: 'fresh', // TODO: Implement caching
        data_freshness: 'real-time',
      },
    };

    // 📄 Handle CSV export format
    if (params.format === 'csv') {
      const csvData = convertMetricsToCSV(metrics);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-metrics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // 📝 Log successful metrics retrieval
    await logComplianceAccess(
      authResult.user.id,
      'metrics_view',
      params.category
    );

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // 5-minute cache
        'X-Compliance-Version': '1.0',
        'X-Data-Classification': 'confidential',
      },
    });
  } catch (error) {
    console.error('❌ Compliance metrics API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error calculating compliance metrics',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate compliance trends over specified period
 */
async function calculateComplianceTrends(period: string, _userId: string) {
  try {
    const days =
      period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Mock trend data - In production, query historical metrics
    const trendPoints = [];
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trendPoints.push({
        date: date.toISOString().split('T')[0],
        overall_score: Math.round(85 + Math.random() * 10 - 5), // Simulate trend around 85%
        lgpd_score: Math.round(90 + Math.random() * 8 - 4),
        anvisa_score: Math.round(80 + Math.random() * 12 - 6),
        data_retention_score: Math.round(95 + Math.random() * 5 - 2),
      });
    }

    return {
      period,
      data_points: trendPoints.length,
      trends: trendPoints,
    };
  } catch (error) {
    console.error('Error calculating trends:', error);
    return {
      period,
      data_points: 0,
      trends: [],
      error: 'Trend calculation failed',
    };
  }
}

/**
 * Convert metrics to CSV format
 */
function convertMetricsToCSV(metrics: any): string {
  const headers = [
    'Metric Category',
    'Metric Name',
    'Value',
    'Score',
    'Status',
    'Last Updated',
  ];

  const rows = [
    [
      'Overall',
      'Compliance Score',
      metrics.overall_score,
      metrics.overall_score,
      getScoreStatus(metrics.overall_score),
      metrics.last_updated,
    ],
    [
      'LGPD',
      'Consent Rate',
      metrics.lgpd_compliance.consent_rate,
      metrics.lgpd_compliance.compliance_score,
      getScoreStatus(metrics.lgpd_compliance.compliance_score),
      metrics.last_updated,
    ],
    [
      'ANVISA',
      'Product Registrations',
      metrics.anvisa_compliance.product_registrations,
      metrics.anvisa_compliance.compliance_score,
      getScoreStatus(metrics.anvisa_compliance.compliance_score),
      metrics.last_updated,
    ],
    [
      'Data Retention',
      'Compliance Percentage',
      metrics.data_retention.compliance_percentage,
      metrics.data_retention.compliance_percentage,
      getScoreStatus(metrics.data_retention.compliance_percentage),
      metrics.last_updated,
    ],
    [
      'Audit Trail',
      'System Integrity Score',
      metrics.audit_trail.system_integrity_score,
      metrics.audit_trail.system_integrity_score,
      getScoreStatus(metrics.audit_trail.system_integrity_score),
      metrics.last_updated,
    ],
  ];

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Get status based on score
 */
function getScoreStatus(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Acceptable';
  return 'Needs Improvement';
}

/**
 * Log compliance access for audit trail
 */
async function logComplianceAccess(
  userId: string,
  action: string,
  category: string
) {
  try {
    const supabase = createClient();

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action_type: `compliance_${action}`,
      resource_type: 'compliance_metrics',
      resource_id: category,
      metadata: {
        category,
        action,
        timestamp: new Date().toISOString(),
        ip_address: 'api-server',
        user_agent: 'compliance-api',
      },
      severity: action.includes('admin') ? 'high' : 'medium',
    });
  } catch (error) {
    console.error('Failed to log compliance access:', error);
    // Don't throw - logging failure shouldn't break the API
  }
}
