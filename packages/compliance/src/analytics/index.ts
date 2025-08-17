/**
 * @fileoverview Compliance Analytics Module for NeonPro Healthcare
 * Constitutional Brazilian Healthcare Compliance Analytics
 *
 * Quality Standard: ≥9.9/10
 */

// Export analytics service
export { ComplianceAnalyticsService } from './analytics-service';

// Export types
export * from './types';

// Export utilities
export * from './utils';

/**
 * Create compliance analytics services
 */
export function createAnalyticsServices(supabaseClient: any) {
  return {
    analytics: new ComplianceAnalyticsService(supabaseClient),
  };
}

/**
 * Validate analytics compliance
 */
export async function validateAnalyticsCompliance(
  tenantId: string,
  supabaseClient: any
): Promise<{
  isCompliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  try {
    const analyticsService = new ComplianceAnalyticsService(supabaseClient);

    // Get compliance metrics
    const metricsResult = await analyticsService.getComplianceMetrics(tenantId);

    if (!(metricsResult.success && metricsResult.metrics)) {
      return {
        isCompliant: false,
        score: 0,
        issues: ['Failed to retrieve compliance metrics'],
        recommendations: ['Fix analytics system', 'Ensure proper data collection'],
      };
    }

    const metrics = metricsResult.metrics;
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 10;

    // Check compliance score threshold
    if (metrics.overallScore < 9.0) {
      issues.push(`Overall compliance score (${metrics.overallScore}) below threshold (9.0)`);
      recommendations.push('Improve compliance processes to meet minimum standards');
      score -= 2;
    }

    // Check data quality
    if (metrics.dataQualityScore < 8.5) {
      issues.push(`Data quality score (${metrics.dataQualityScore}) below threshold (8.5)`);
      recommendations.push('Implement data quality improvement measures');
      score -= 1;
    }

    // Check audit frequency
    if (metrics.auditFrequency < 4) {
      // Quarterly minimum
      issues.push(`Audit frequency (${metrics.auditFrequency}/year) below minimum (4/year)`);
      recommendations.push('Increase audit frequency to quarterly minimum');
      score -= 1;
    }

    const isCompliant = issues.length === 0 && score >= 9.0;

    return {
      isCompliant,
      score: Math.max(0, score),
      issues,
      recommendations: [
        ...recommendations,
        'Regular compliance monitoring',
        'Automated compliance reporting',
        'Staff training on compliance requirements',
      ],
    };
  } catch (error) {
    console.error('Analytics compliance validation failed:', error);
    return {
      isCompliant: false,
      score: 0,
      issues: ['Analytics compliance validation system error'],
      recommendations: ['Fix analytics compliance validation system'],
    };
  }
}
